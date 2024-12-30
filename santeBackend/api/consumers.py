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
# Utility function to send chat messages to a specific group (chat room)
def send_chat_message(chat_id, message_data):
    channel_layer = get_channel_layer()
    group_name = f"chat_{chat_id}"
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "chat_message",
            "message": message_data,
        }
    )

# Utility function to send notifications to a user
def send_notification(user_id, notification_data):
    # Get the channel layer
    channel_layer = get_channel_layer()

    # Using the user_id as the group name for the user-specific notifications
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
    @database_sync_to_async
    def create_message_notification(self, message, recipient):
        return Notification.objects.create(
            recipient=recipient,
            chat_id=self.chat_id,
            message=message,
            notification_type='NEW_MESSAGE'
        )
        
    async def connect(self):
        try:
            self.chat_id = self.scope['url_route']['kwargs']['chat_id']
            self.chat_group_name = f"chat_{self.chat_id}"
            
            # Get user from scope
            self.user = self.scope.get('user', None)
            if not self.user or not self.user.is_authenticated:
                logging.error("User is not authenticated")
                await self.close()
                return

            # Get chat instance
            self.chat = await self.get_chat(self.chat_id)
            if not self.chat:
                logging.error(f"Chat {self.chat_id} does not exist")
                await self.close()
                return

            # Check access
            can_access = await self.can_access_chat(self.chat, self.user)
            if not can_access:
                logging.error(f"User {self.user.id} does not have access to chat {self.chat_id}")
                await self.close()
                return

            self.user_id = self.user.id
            self.other_user = await database_sync_to_async(lambda: self.chat.user2 if self.chat.user1 == self.user else self.chat.user1)()

            # Add to group
            await self.channel_layer.group_add(
                self.chat_group_name,
                self.channel_name
            )
            
            await self.accept()
            
        except Exception as e:
            logging.error(f"Error in connect: {str(e)}")
            await self.close()
            return

    @database_sync_to_async
    def get_chat(self, chat_id):
        try:
            return Chat.objects.get(id=chat_id)
        except Chat.DoesNotExist:
            return None

    @database_sync_to_async
    def can_access_chat(self, chat, user):
        return chat.user1 == user or chat.user2 == user

    async def disconnect(self, close_code):
        # Send stopped typing status when user disconnects
        await self.channel_layer.group_send(
            self.chat_group_name,
            {
                'type': 'typing_status',
                'user_id': self.user_id,
                'is_typing': False
            }
        )
        
        await self.channel_layer.group_discard(
            self.chat_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            if message_type == 'typing_status':
                await self.channel_layer.group_send(
                    self.chat_group_name,
                    {
                        'type': 'typing_status',
                        'user_id': self.user_id,
                        'is_typing': data.get('is_typing', False)
                    }
                )
                return

            message_text = data.get('message')
            
            message_data = {
                'type': 'chat_message',
                'id': data.get('id'),
                'sender': {
                    'id': self.user.id,
                    'email': self.user.email,
                    'first_name': self.user.first_name,
                    'last_name': self.user.last_name,
                    'profile_image': self.user.profile_image.url if hasattr(self.user, 'profile_image') and self.user.profile_image else None,
                    'role': self.user.role if hasattr(self.user, 'role') else None,
                },
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

            # Save message and create notification
            message = await database_sync_to_async(ChatMessage.objects.create)(
                chat_id=self.chat_id,
                sender=self.user,
                message_text=message_text
            )

            # Create notification for the other user
            notification = await self.create_message_notification(message, self.other_user)
            
            # Send notification to the other user
            send_notification(self.other_user.id, {
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
        await self.send(text_data=json.dumps({
            'id': event['id'],
            'sender': event['sender'],
            'message_text': event['message_text'],
            'timestamp': event['timestamp'],
            'is_read': event['is_read']
        }))

    async def typing_status(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing_status',
            'user_id': event['user_id'],
            'is_typing': event['is_typing']
        }))

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
