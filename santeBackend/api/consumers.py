from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
import json

class TextRoomConsumer(WebsocketConsumer):
    def connect(self):
        try:
            self.sender = self.scope['url_route']['kwargs'].get('sender')
            self.receiver = self.scope['url_route']['kwargs'].get('receiver')

            print(f"Connection attempt: sender={self.sender}, receiver={self.receiver}")

            self.room_group_name = f'chat_{min(self.sender, self.receiver)}_{max(self.sender, self.receiver)}'

            # Join the room group
            async_to_sync(self.channel_layer.group_add)(
                self.room_group_name,
                self.channel_name
            )
            self.accept()
            print(f"Connection accepted: {self.sender} -> {self.receiver}")
        except Exception as e:
            print(f"Error during connection: {e}")
            self.close()

    def disconnect(self, close_code):
        print(f"Disconnected: sender={self.sender}, receiver={self.receiver}")
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json['message']
            sender = text_data_json['sender']

            # Send message to room group
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'sender': sender,
                }
            )
        except Exception as e:
            print(f"Error during message handling: {e}")

    def chat_message(self, event):
        # Send message to WebSocket
        self.send(text_data=json.dumps({
            'message': event['message'],
            'sender': event['sender'],
        }))
