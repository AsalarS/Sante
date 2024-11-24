import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import UserProfile

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
            self.receiver_id = int(self.receiver_id)

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
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')

            if message_type == 'message':
                message = text_data_json.get('message')
                sender_id = text_data_json.get('sender_id')

                # Validate the data
                if not message or not sender_id:
                    logger.error("Invalid message payload.")
                    return

                # Broadcast the message to the room
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message,
                        'sender_id': sender_id,
                    }
                )
            else:
                logger.warning(f"Unhandled message type: {message_type}")
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e} - Data: {text_data}")
        except Exception as e:
            logger.error(f"Error during message handling: {e}")

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message'],
            'sender_id': event['sender_id'],
        }))
