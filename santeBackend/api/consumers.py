import datetime
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Chat, ChatMessage, Notification
import logging

# Set up logging for debugging purposes
logging.basicConfig(level=logging.DEBUG)

User = get_user_model()

# Utility function to send chat messages to a specific group (chat room)
# This is now an async function to properly work with the async consumer
async def send_chat_message(chat_id, message_data):
    """
    Sends a chat message to all members of a specific chat room.
    
    Args:
        chat_id: The unique identifier for the chat room
        message_data: Dictionary containing the message information
    """
    channel_layer = get_channel_layer()
    group_name = f"chat_{chat_id}"
    await channel_layer.group_send(
        group_name,
        {
            "type": "chat_message",  # This maps to the chat_message handler in the consumer
            "message": message_data,
        }
    )

# Utility function to send notifications to a specific user
# Also converted to async to maintain consistency with the async consumer
async def send_notification(user_id, notification_data):
    """
    Sends a notification to a specific user through their personal notification channel.
    
    Args:
        user_id: The ID of the user to receive the notification
        notification_data: Dictionary containing the notification information
    """
    channel_layer = get_channel_layer()
    # Using the user_id as the group name for user-specific notifications
    group_name = f"user_{user_id}_notifications"
    
    await channel_layer.group_send(
        group_name,
        {
            "type": "notification",  # Maps to the notification handler in NotificationConsumer
            "notification": notification_data,
        }
    )

class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for handling real-time chat functionality.
    Manages connections, message sending/receiving, and typing status updates.
    """
    
    @database_sync_to_async
    def create_message_notification(self, message, recipient):
        """
        Creates a new notification for a chat message.
        Must be sync_to_async as it performs database operations.
        """
        return Notification.objects.create(
            recipient=recipient,
            chat_id=self.chat_id,
            message=message,
            notification_type='NEW_MESSAGE'
        )
        
    async def connect(self):
        """
        Handles WebSocket connection initialization.
        Performs authentication, chat access verification, and group subscription.
        """
        try:
            # Get chat ID from the URL route and set up the group name
            self.chat_id = self.scope['url_route']['kwargs']['chat_id']
            self.chat_group_name = f"chat_{self.chat_id}"
            
            # Verify user authentication
            self.user = self.scope.get('user', None)
            if not self.user or not self.user.is_authenticated:
                logging.error("User is not authenticated")
                await self.close()
                return

            # Verify chat exists
            self.chat = await self.get_chat(self.chat_id)
            if not self.chat:
                logging.error(f"Chat {self.chat_id} does not exist")
                await self.close()
                return

            # Verify user has access to this chat
            can_access = await self.can_access_chat(self.chat, self.user)
            if not can_access:
                logging.error(f"User {self.user.id} does not have access to chat {self.chat_id}")
                await self.close()
                return

            # Set up user information and get the other participant
            self.user_id = self.user.id
            self.other_user = await database_sync_to_async(lambda: self.chat.user2 if self.chat.user1 == self.user else self.chat.user1)()

            # Add user to the chat group
            await self.channel_layer.group_add(
                self.chat_group_name,
                self.channel_name
            )
            
            await self.accept()
            
            logging.debug(f"Connected to chat group: {self.chat_group_name}")
            
        except Exception as e:
            logging.error(f"Error in connect: {str(e)}")
            await self.close()
            return

    @database_sync_to_async
    def get_chat(self, chat_id):
        """
        Retrieves chat instance from database.
        Wrapped in database_sync_to_async as it performs database operations.
        """
        try:
            return Chat.objects.get(id=chat_id)
        except Chat.DoesNotExist:
            return None

    @database_sync_to_async
    def can_access_chat(self, chat, user):
        """
        Verifies if a user has access to a specific chat.
        Returns True if user is either user1 or user2 in the chat.
        """
        return chat.user1 == user or chat.user2 == user

    async def disconnect(self, close_code):
        """
        Handles WebSocket disconnection.
        Sends typing status update and removes user from the chat group.
        """
        if hasattr(self, 'chat_group_name'):
            # Send stopped typing status when user disconnects
            await self.channel_layer.group_send(
                self.chat_group_name,
                {
                    'type': 'typing_status',
                    'user_id': self.user_id,
                    'is_typing': False
                }
            )
            # Remove user from chat group
            await self.channel_layer.group_discard(
                self.chat_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        """
        Handles incoming WebSocket messages.
        Processes both chat messages and typing status updates.
        """
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            # Handle typing status updates
            if message_type == 'typing_status':
                await self.channel_layer.group_send(
                    self.chat_group_name,
                    {
                        'type': 'typing_status',
                        'sender_id': str(self.user.id),
                        'is_typing': data.get('is_typing', False)
                    }
                )
                return

            # Handle chat messages
            message_text = data.get('message')
            
            message_data = {
                'type': 'chat_message',
                'id': data.get('id'),
                'sender_id': self.user.id,
                'timestamp': data.get('timestamp') or str(datetime.datetime.now()),
                'message_text': message_text,
                'is_read': False
            }

            # Send "stopped typing" status when a message is sent
            await self.channel_layer.group_send(
                self.chat_group_name,
                {
                    'type': 'typing_status',
                    'user_id': self.user_id,
                    'is_typing': False
                }
            )

            # Save message to database
            chat_instance = await database_sync_to_async(Chat.objects.get)(id=self.chat_id)
            message = await database_sync_to_async(ChatMessage.objects.create)(
                chat=chat_instance,
                sender=self.user,
                message_text=message_text
            )

            # Update the chat's last_updated_date
            await database_sync_to_async(chat_instance.save)()

            # Create and send notification to the other user
            notification = await self.create_message_notification(message, self.other_user)
            
            await send_notification(self.other_user.id, {
                'id': str(notification.id),
                'type': 'NEW_MESSAGE',
                'chat_id': str(self.chat_id),
                'message': message_text,
                'sender_name': f"{self.user.first_name} {self.user.last_name}"
            })

            # Broadcast the message to the chat group
            await self.channel_layer.group_send(
                self.chat_group_name,
                message_data
            )

        except Exception as e:
            logging.error(f"Error processing message: {e}")
            return
    
    async def chat_message(self, event):
        """
        Sends chat message to WebSocket.
        This handler is called when a message is received through the channel layer.
        """
        await self.send(text_data=json.dumps({
            'id': event['id'],
            'sender_id': event['sender_id'],
            'message_text': event['message_text'],
            'timestamp': event['timestamp'],
            'is_read': event['is_read']
        }))

    async def typing_status(self, event):
        """
        Sends typing status update to WebSocket.
        This handler is called when a typing status update is received through the channel layer.
        """
        sender_id = event.get('sender_id', None)
        if sender_id is not None:
            await self.send(text_data=json.dumps({
                'type': 'typing_status',
                'sender_id': sender_id,
                'is_typing': event.get('is_typing', False)
            }))

class NotificationConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for handling real-time notifications.
    Manages user-specific notification channels.
    """
    
    async def connect(self):
        """
        Handles WebSocket connection for notifications.
        Sets up user-specific notification group.
        """
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.group_name = f"user_{self.user_id}_notifications"

        # Join user's notification group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        """
        Handles WebSocket disconnection.
        Removes user from their notification group.
        """
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def notification(self, event):
        """
        Sends notification to WebSocket.
        This handler is called when a notification is received through the channel layer.
        """
        await self.send(text_data=json.dumps({
            'notification': event['notification']
        }))