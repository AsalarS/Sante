# consumers.py

import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import UserProfile, Chat, ChatMessage

logger = logging.getLogger(__name__)

class TextRoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            # Retrieve sender and receiver IDs from the URL route
            self.sender_id = self.scope['url_route']['kwargs'].get('sender_id')
            self.receiver_id = self.scope['url_route']['kwargs'].get('receiver_id')

            if not self.sender_id or not self.receiver_id:
                logger.error("Missing sender_id or receiver_id in URL kwargs")
                await self.close()
                return

            # Convert IDs to integers
            self.sender_id = int(self.sender_id)
            self.receiver_id = int(self.sender_id)

            # Retrieve users using IDs
            self.sender = await self.get_user_profile(self.sender_id)
            self.receiver = await self.get_user_profile(self.receiver_id)

            # Define the room group name based on user IDs
            self.room_group_name = f'chat_{min(self.sender_id, self.receiver_id)}_{max(self.sender_id, self.receiver_id)}'

            # Join the WebSocket room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()
            logger.debug(f"WebSocket connected to group {self.room_group_name}")
        except UserProfile.DoesNotExist as e:
            logger.error(f"User does not exist: {e}")
            await self.close()
        except Exception as e:
            logger.error(f"Error during connection: {e}")
            await self.close()

    @database_sync_to_async
    def get_user_profile(self, user_id):
        return UserProfile.objects.get(id=user_id)

    async def disconnect(self, close_code):
        try:
            if self.room_group_name:
                await self.channel_layer.group_discard(
                    self.room_group_name,
                    self.channel_name
                )
            logger.debug(f"WebSocket disconnected from group {self.room_group_name}")
        except Exception as e:
            logger.error(f"Error during disconnection: {e}")

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message')
        sender_id = data.get('sender_id')

        if not message or not sender_id:
            logger.error("Invalid message format: 'message' or 'sender_id' missing")
            return

        # Ensure sender_id matches the connected user
        if int(sender_id) != self.sender_id:
            logger.error("Sender ID mismatch")
            return

        # Get or create Chat instance
        chat = await self.get_or_create_chat(self.sender_id, self.receiver_id)

        # Save the message to the database
        chat_message = await self.create_chat_message(chat.id, self.sender_id, message)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': chat_message.message_text,
                'sender_id': chat_message.sender.id,
                'timestamp': chat_message.timestamp.isoformat(),
            }
        )

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message'],
            'sender_id': event['sender_id'],
        }))

    @database_sync_to_async
    def get_or_create_chat(self, sender_id, receiver_id):
        """
        Retrieves an existing Chat between two users or creates a new one if it doesn't exist.
        Ensures that user1's ID is always less than user2's ID to maintain consistency.
        """
        user1_id = min(sender_id, receiver_id)
        user2_id = max(sender_id, receiver_id)
        chat, created = Chat.objects.get_or_create(
            user1=user1_id,
            user2=user2_id,
        )
        if created:
            logger.debug(f"Created new Chat between User {user1_id} and User {user2_id}")
        else:
            logger.debug(f"Retrieved existing Chat between User {user1_id} and User {user2_id}")
        return chat

    @database_sync_to_async
    def create_chat_message(self, chat_id, sender_id, message_text):
        """
        Creates a new ChatMessage instance.
        """
        sender = UserProfile.objects.get(id=sender_id)
        chat = Chat.objects.get(id=chat_id)
        chat_message = ChatMessage.objects.create(
            chat=chat,
            sender=sender,
            message_text=message_text,
            is_read=False
        )
        logger.debug(f"Saved ChatMessage {chat_message.id} in Chat {chat_id}")
        return chat_message

class InboxConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            # Retrieve user ID from the URL route
            self.user_id = self.scope['url_route']['kwargs'].get('user_id')

            if not self.user_id:
                logger.error("Missing user_id in URL kwargs")
                await self.close()
                return

            # Convert ID to integer
            self.user_id = int(self.user_id)

            # Retrieve user profile
            self.user_profile = await self.get_user_profile(self.user_id)

            # Join the WebSocket room group
            await self.channel_layer.group_add(
                f'inbox_{self.user_id}',
                self.channel_name
            )
            await self.accept()
            logger.debug(f"WebSocket connected to inbox for user {self.user_id}")
        except UserProfile.DoesNotExist as e:
            logger.error(f"User does not exist: {e}")
            await self.close()
        except Exception as e:
            logger.error(f"Error during connection: {e}")
            await self.close()

    @database_sync_to_async
    def get_user_profile(self, user_id):
        return UserProfile.objects.get(id=user_id)

    async def disconnect(self, close_code):
        try:
            if self.user_profile:
                await self.channel_layer.group_discard(
                    f'inbox_{self.user_id}',
                    self.channel_name
                )
            logger.debug(f"WebSocket disconnected from inbox for user {self.user_id}")
        except Exception as e:
            logger.error(f"Error during disconnection: {e}")

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_id = data.get('message_id')

        if not message_id:
            logger.error("Invalid message format: 'message_id' missing")
            return

        # Fetch and mark the message as read
        chat_message = await self.mark_message_as_read(message_id)

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'inbox_update',
            'message_id': chat_message.id,
            'sender_id': chat_message.sender.id,
            'message_text': chat_message.message_text,
            'timestamp': chat_message.timestamp.isoformat(),
        }))

    async def inbox_update(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'inbox_update',
            **event,
        }))

    @database_sync_to_async
    def mark_message_as_read(self, message_id):
        chat_message = ChatMessage.objects.get(id=message_id)
        chat_message.is_read = True
        chat_message.save()
        return chat_message
