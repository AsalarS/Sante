from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
import json
import logging

# Configure logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

class TextRoomConsumer(WebsocketConsumer):
    def connect(self):
        try:
            self.sender = self.scope['url_route']['kwargs'].get('sender')
            self.receiver = self.scope['url_route']['kwargs'].get('receiver')

            logger.debug(f"Connection attempt: sender={self.sender}, receiver={self.receiver}")

            self.room_group_name = f'chat_{min(self.sender, self.receiver)}_{max(self.sender, self.receiver)}'

            # Join the room group
            async_to_sync(self.channel_layer.group_add)(
                self.room_group_name,
                self.channel_name
            )
            self.accept()
            logger.debug(f"WebSocket connection accepted for room: {self.room_group_name}")
        except Exception as e:
            logger.error(f"Error during connection: {e}")
            self.close()

    def disconnect(self, close_code):
        logger.debug(f"Disconnected: sender={self.sender}, receiver={self.receiver}")
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    def receive(self, text_data):
        try:
            logger.debug(f"Received data: {text_data}")
            text_data_json = json.loads(text_data)

            message_type = text_data_json.get('type')
            if message_type is None:
                logger.error(f"'type' key is missing in the data: {text_data_json}")
                return

            if message_type == 'typing':
                is_typing = text_data_json.get('isTyping', False)
                sender = text_data_json.get('sender')

                if sender is None:
                    logger.error(f"'sender' key is missing in typing event: {text_data_json}")
                    return

                logger.debug(f"Typing event from {sender}: {is_typing}")

                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {
                        'type': 'typing_event',
                        'isTyping': is_typing,
                        'sender': sender,
                    }
                )
            elif message_type == 'message':
                message = text_data_json.get('message')
                sender = text_data_json.get('sender')

                if message is None:
                    logger.error(f"'message' key is missing in the data: {text_data_json}")
                    return

                if sender is None:
                    logger.error(f"'sender' key is missing in the data: {text_data_json}")
                    return

                logger.debug(f"Chat message from {sender}: {message}")

                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message,
                        'sender': sender,
                    }
                )
            else:
                logger.warning(f"Unknown message type: {message_type}")
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e} - Data: {text_data}")
        except Exception as e:
            logger.error(f"Error during message handling: {e}")

    def chat_message(self, event):
        logger.debug(f"Sending chat message to WebSocket: {event}")
        message = event.get('message')
        sender = event.get('sender')
        if message is None or sender is None:
            logger.error(f"chat_message event missing 'message' or 'sender': {event}")
            return
        self.send(text_data=json.dumps({
            'type': 'message',
            'message': message,
            'sender': sender,
        }))

    def typing_event(self, event):
        logger.debug(f"Sending typing event to WebSocket: {event}")
        is_typing = event.get('isTyping')
        sender = event.get('sender')
        if is_typing is None or sender is None:
            logger.error(f"typing_event missing 'isTyping' or 'sender': {event}")
            return
        self.send(text_data=json.dumps({
            'type': 'typing',
            'isTyping': is_typing,
            'sender': sender,
        }))
