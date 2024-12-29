from django.urls import re_path
from .consumers import ChatConsumer, NotificationConsumer

websocket_urlpatterns = [
    # WebSocket for specific chat
    re_path(r"ws/chat/(?P<chat_id>\d+)/$", ChatConsumer.as_asgi()),

    # WebSocket for global notifications
    re_path(r"ws/notifications/$", NotificationConsumer.as_asgi()),
]
