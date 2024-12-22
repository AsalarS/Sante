from django.urls import path
from .views.ViewsGeneral import *
from .views.ViewsUsers import *
from .views.ViewsAppointments import *
urlpatterns = [
    path('users/', get_users, name='get_users'),
    # Admin views
    path('admin/users/', get_users_admin, name='get_users_admin'),
    path('admin/users/<int:user_id>/', update_user_admin, name='get_users_admin'),
    path('logs/admin/', get_logs_admin, name='get_logs_admin'),
    # path('users/patients/', get_patients, name='get_patients'),
    path('appointments/', AppointmentView.as_view(), name='get_appointments'),
    path('available-doctors/', AvailableDoctorsView.as_view(), name='available-doctors'),
    path('appointments-by-date/', AppointmentsByDateView.as_view(), name='appointments-by-date'),
    # Schedule & Appointments
    path('schedule/', get_schedule, name='get_schedule'),
    path('appointments/add/', add_appointment, name='add_appointment'),
    # Search
    path('search/patients/', search_patients, name='search_patients'),
    #User info views
    path('user-info/', UserInfoView.as_view(), name='user_info'), #to show current logged in user info
    path('user-info/<int:user_id>/', SpecificUserInfoView.as_view(), name='user_info_specific'), #to show a users info
    path('users/patients/', get_patients, name='get_patients'),
]