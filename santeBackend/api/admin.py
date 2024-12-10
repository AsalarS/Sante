from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    UserProfile, Patient, Employee, Appointment, Chat, ChatMessage, Log, Prescription, Diagnosis, CarePlan
)

class UserProfileAdmin(UserAdmin):
    model = UserProfile
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_staff')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'gender', 'date_of_birth', 'phone_number', 'address', 'profile_image')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'role')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2', 'role', 'is_staff', 'is_active')}
        ),
    )

class PatientAdmin(admin.ModelAdmin):
    list_display = ('user', 'medical_record_id', 'blood_type', 'CPR_number')
    search_fields = ('user__email', 'medical_record_id', 'CPR_number')

class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('user', 'specialization', 'office_number')
    search_fields = ('user__email', 'specialization', 'office_number')

class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'doctor', 'appointment_date', 'appointment_time', 'status')
    search_fields = ('patient__user__email', 'doctor__user__email', 'status')

class ChatAdmin(admin.ModelAdmin):
    list_display = ('id', 'user1', 'user2', 'created_date', 'last_updated_date')
    search_fields = ('user1__email', 'user2__email')

class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'chat', 'sender', 'timestamp', 'is_read')
    search_fields = ('chat__id', 'sender__email')

class LogAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'action', 'timestamp', 'ip_address')
    search_fields = ('user__email', 'action', 'ip_address')

class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'appointment', 'medication_name', 'dosage', 'duration')
    search_fields = ('appointment__id', 'medication_name')

class DiagnosisAdmin(admin.ModelAdmin):
    list_display = ('id', 'appointment', 'diagnosis_name', 'diagnosis_type')
    search_fields = ('appointment__id', 'diagnosis_name')

class CarePlanAdmin(admin.ModelAdmin):
    list_display = ('id', 'appointment', 'care_plan_title', 'care_plan_type', 'date_of_issue', 'date_of_completion')
    search_fields = ('appointment__id', 'care_plan_title')

admin.site.register(UserProfile, UserProfileAdmin)
admin.site.register(Patient, PatientAdmin)
admin.site.register(Employee, EmployeeAdmin)
admin.site.register(Appointment, AppointmentAdmin)
admin.site.register(Chat, ChatAdmin)
admin.site.register(ChatMessage, ChatMessageAdmin)
admin.site.register(Log, LogAdmin)
admin.site.register(Prescription, PrescriptionAdmin)
admin.site.register(Diagnosis, DiagnosisAdmin)
admin.site.register(CarePlan, CarePlanAdmin)
