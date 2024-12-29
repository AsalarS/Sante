import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Chat, ChatMessage, Notification

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
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.group_name = f"chat_{self.chat_id}"

        # Join the WebSocket group (this is what links all users in the same chat room)
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        # Accept the WebSocket connection
        await self.accept()

    async def disconnect(self, close_code):
        # Leave the group when the WebSocket connection is closed
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        # Parse the incoming message
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        sender_id = text_data_json['sender']

        # Get the sender user object
        sender = await self.get_user_by_id(sender_id)

        # Save the message to the database
        chat_message = ChatMessage.objects.create(
            chat_id=self.chat_id,
            sender=sender,
            message_text=message
        )

        # Send the message to the group (broadcast to all users in the chat)
        send_chat_message(self.chat_id, {
            'message': message,
            'sender': sender.email,
            'timestamp': chat_message.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        })

        # Optionally send a notification to the other user in the chat
        other_user = self.get_other_user(sender)
        send_notification(other_user.id, {
            'message': f"New message from {sender.email}",
            'timestamp': chat_message.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        })

    async def chat_message(self, event):
        # This method handles the messages sent to the group (from `send_chat_message`)

        message = event['message']
        sender = event['sender']
        timestamp = event['timestamp']

        # Send the message to the WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'sender': sender,
            'timestamp': timestamp
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
