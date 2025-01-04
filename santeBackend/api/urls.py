from django.urls import path, re_path
from .views.ViewsGeneral import *
from .views.ViewsUsers import *
from .views.ViewsAppointments import *
from .views.ViewsChats import *
from .views.ViewsDashboard import *
from .views.ViewsMeta import *
urlpatterns = [
    path('users/', get_users, name='get_users'),
    
    # Admin views
    path('admin/users/', get_users_admin, name='get_users_admin'),
    path('admin/users/<int:user_id>/', update_user_admin, name='get_users_admin'),
    path('logs/admin/', get_logs_admin, name='get_logs_admin'),
    
    # path('users/patients/', get_patients, name='get_patients'),
    path('available-doctors/', AvailableDoctorsView.as_view(), name='available-doctors'),
    path('appointments-by-date/', AppointmentsByDateView.as_view(), name='appointments-by-date'),
    
    # Schedule & Appointments
    path('schedule/', get_schedule, name='get_schedule'),
    path('user/schedule/', DoctorAppointmentsView.as_view(), name='get_schedule'),
    
    path('patient/appointments/<int:patient_id>/', PatientAppointmentsView.as_view(), name='patient_appointments'),
    
    # path('appointment/<uuid:appointment_id>/', AppointmentDetailView.as_view(), name='appointment_detail'),``
    path('appointments/', AppointmentView.as_view(), name='appointment_view'),
    path('appointments/<uuid:appointment_id>/', AppointmentView.as_view(), name='appointment-update'),
    
    # Careplans
    path('careplans/user/<int:user_id>/', CarePlansByUserView.as_view(), name='careplans_by_user'),
    path('appointments/careplans/<uuid:appointment_id>/', CarePlanByAppointmentView.as_view(), name='careplan_by_appointment'),

    # Diagnoses
    path('diagnoses/user/<int:user_id>/', DiagnosesByUserView.as_view(), name='diagnoses_by_user'),
    path('appointments/diagnoses/<uuid:appointment_id>/', DiagnosisByAppointmentView.as_view(), name='diagnosis_by_appointment'),
    
    # Prescriptions
    path('prescriptions/user/<int:user_id>/', PrescriptionsByUserView.as_view(), name='prescriptions_by_user'),
    path('appointments/prescriptions/<uuid:appointment_id>/', PrescriptionByAppointmentView.as_view(), name='prescription_by_appointment'),
    
    # Search
    path('search/patients/', search_patients, name='search_patients'),
    
    #User info views
    path('user-info/', UserInfoView.as_view(), name='user_info'), #to show current logged in user info
    path('user/<int:user_id>/', DetailedUserView.as_view(), name='user_info_specific'), #to show a users info
    path('users/<int:user_id>/basic', BasicUserInfo.as_view(), name='user_info_basic'), #to show a users basic info
    path('users/patients/', get_patients, name='get_patients'),
    
    # Chats
    path('chats/', UserChatsView.as_view(), name='chats-view'),
    path('chats/users/', get_users_chat, name='get_users'),
    path('chats/<int:user_id>/', UserChatsView.as_view(), name='chats-view'),
    path('chats/<uuid:chat_id>/messages/', ChatMessagesView.as_view(), name='chat_messages'),
    path('admin/chats/', get_chats_admin, name='chats-admin-view'),
    path('admin/chat/<uuid:chat_id>/messages/', get_chat_messages_admin, name='chat-messages-admin-view'),
    
]