from django.urls import re_path
from .consumers import TextRoomConsumer, InboxConsumer

websocket_urlpatterns = [
    # WebSocket route for chat between sender and receiver using user IDs
    re_path(r'^ws/chat/(?P<sender_id>\d+)/(?P<receiver_id>\d+)/$', TextRoomConsumer.as_asgi()),

    # WebSocket route for inbox updates for a specific user by user ID
    re_path(r'^ws/inbox/(?P<user_id>\d+)/$', InboxConsumer.as_asgi()),
]
