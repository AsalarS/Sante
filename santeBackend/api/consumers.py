import datetime
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Chat, ChatMessage, Notification
import logging

logging.basicConfig(level=logging.DEBUG)

User = get_user_model()

# Utility function to send chat messages to a specific group (chat room)
def send_chat_message(chat_id, message_data):
    # Get the channel layer
    channel_layer = get_channel_layer()

    # We assume the chat_id is the room name and we will send the message to that room
    group_name = f"chat_{chat_id}"

    # Send the message to the group (this will push the message to all consumers in this group)
    async_to_sync(channel_layer.group_send)(
        group_name,  # Group name (chat room)
        {
            "type": "chat_message",  # This corresponds to the `chat_message` method in the consumer
            "message": message_data,  # The actual message data
        }
    )

# Utility function to send notifications to a user
def send_notification(user_id, notification_data):
    # Get the channel layer
    channel_layer = get_channel_layer()

    # We use the user_id as the group name for the user-specific notifications
    group_name = f"user_{user_id}_notifications"

    # Send the notification to the group (this will push the message to the specific user)
    async_to_sync(channel_layer.group_send)(
        group_name,  # Group name (user's notification group)
        {
            "type": "notification",  # This corresponds to the `notification` method in the consumer
            "notification": notification_data,  # The actual notification data
        }
    )

# Chat Consumer (handles the chat functionality)
class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get chat_id from URL and user_id from the scope
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.chat_group_name = f"chat_{self.chat_id}"
        
        # Access the user from the scope
        self.user = self.scope.get('user', None)  # Get user from the scope
        if not self.user or not self.user.is_authenticated:
            logging.error("User is not authenticated")
            await self.close()  # Close the connection if the user is not authenticated
            return

        # Save user_id for later use
        self.user_id = self.user.id

        # Join the chat group
        await self.channel_layer.group_add(
            self.chat_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave the chat group
        await self.channel_layer.group_discard(
            self.chat_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            
            # Extract message text from the complete message object
            message_text = text_data_json.get('message')
            
            # Create the message data structure for broadcasting
            message_data = {
                'type': 'chat_message',
                'id': text_data_json.get('id'),
                'sender': {
                    'id': self.user.id,
                    'email': self.user.email,
                    'first_name': self.user.first_name,
                    'last_name': self.user.last_name,
                    'profile_image': self.user.profile_image.url if hasattr(self.user, 'profile_image') and self.user.profile_image else None,
                    'role': self.user.role if hasattr(self.user, 'role') else None,
                },
                'timestamp': text_data_json.get('timestamp') or str(datetime.datetime.now()),
                'message_text': message_text,
                'is_read': False
            }

            # Broadcast the message to the chat group
            await self.channel_layer.group_send(
                self.chat_group_name,
                message_data
            )
        except Exception as e:
            logging.error(f"Error processing message: {e}")
            return
    
    async def chat_message(self, event):
        # Send the message to the WebSocket client
        await self.send(text_data=json.dumps({
            'id': event['id'],
            'sender': event['sender'],
            'message_text': event['message_text'],
            'timestamp': event['timestamp'],
            'is_read': event['is_read']
        }))

    async def get_user_by_id(self, user_id):
        # Fetch user by ID asynchronously
        return await database_sync_to_async(User.objects.get)(id=user_id)

    def get_other_user(self, sender):
        # Get the other user in the chat (the one not sending the message)
        chat = Chat.objects.get(id=self.chat_id)
        if chat.user1 != sender:
            return chat.user1
        return chat.user2

# Notification Consumer (handles notifications for the user)
class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.group_name = f"user_{self.user_id}_notifications"

        # Join the notification group for this user
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        # Accept the WebSocket connection
        await self.accept()

    async def disconnect(self, close_code):
        # Leave the notification group when the WebSocket connection is closed
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def notification(self, event):
        # This method handles the notifications sent to the user (from `send_notification`)

        notification = event['notification']

        # Send the notification to the WebSocket
        await self.send(text_data=json.dumps({
            'notification': notification
        }))
