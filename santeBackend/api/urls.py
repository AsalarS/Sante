from django.urls import path
from .views import *
urlpatterns = [
    path('users/', get_users, name='get_users'),
    path('users/admin/', get_users_admin, name='get_users_admin'),
    path('logs/admin/', get_logs_admin, name='get_logs_admin'),
    path('users/patients/', get_patients, name='get_patients'),
]