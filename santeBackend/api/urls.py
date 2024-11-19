from django.urls import path
from .views import get_logs_admin, get_users, get_users_admin
urlpatterns = [
    path('users/', get_users, name='get_users'),
    path('users/admin/', get_users_admin, name='get_users_admin'),
    path('logs/admin/', get_logs_admin, name='get_logs_admin')
]