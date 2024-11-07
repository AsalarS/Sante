import json
from .models import Chat, Message
from channels.generic.websocket import WebsocketConsumer
from channels.layers import async_to_sync

class TextRoomConsumer(WebsocketConsumer):
    def connect(self):
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.chat = Chat.objects.get(id=self.chat_id)

        # Only allow connection if the user is a participant
        if self.scope['user'] not in self.chat.participants.all():
            self.close()
            return

        self.room_group_name = f"chat_{self.chat_id}"

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept()

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        text = text_data_json['text']
        sender_id = text_data_json['sender']
        
        # Save message to the database
        message = Message.objects.create(
            chat=self.chat,
            sender_id=sender_id,
            content=text
        )

        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message.content,
                'sender': message.sender.email,
                'timestamp': message.timestamp.isoformat()
            }
        )

    def chat_message(self, event):
        # Receive message from room group
        text = event['message']
        sender = event['sender']
        timestamp = event['timestamp']

        # Send message to WebSocket
        self.send(text_data=json.dumps({
            'text': text,
            'sender': sender,
            'timestamp': timestamp
        }))
