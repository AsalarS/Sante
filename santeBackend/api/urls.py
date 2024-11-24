from django.urls import path
from .views import *
urlpatterns = [
    path('users/', get_users, name='get_users'),
    path('users/admin/', get_users_admin, name='get_users_admin'),
    path('logs/admin/', get_logs_admin, name='get_logs_admin'),
    path('users/patients/', get_patients, name='get_patients'),
    path('chats/user/', UserChatsView.as_view(), name='user_chats'),
    path('chats/<int:chat_id>/history/', ChatMessagesView.as_view(), name='chat_history'),
]