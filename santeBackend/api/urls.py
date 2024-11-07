from django.urls import path
from . import views

urlpatterns = [
    path('chats/<int:user_id>/', views.get_or_create_chat, name='get_or_create_chat'),  # Retrieve or create chat with another user
    path('chats/<int:chat_id>/messages/', views.get_chat_messages, name='get_chat_messages'),  # Fetch messages for a chat
]
