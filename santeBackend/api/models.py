# api/models.py

from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.conf import settings
import uuid


# --- Field Choices ---

ROLE_CHOICES = [
    ('doctor', 'Doctor'),
    ('patient', 'Patient'),
    ('admin', 'Admin'),
    ('nurse', 'Nurse'),
    ('receptionist', 'Receptionist'),
]

GENDER_CHOICES = [
    ('Male', 'Male'),
    ('Female', 'Female'),
    ('Other', 'Other'),
]

BLOOD_TYPE_CHOICES = [
    ('A+', 'A+'),
    ('A-', 'A-'),
    ('B+', 'B+'),
    ('B-', 'B-'),
    ('AB+', 'AB+'),
    ('AB-', 'AB-'),
    ('O+', 'O+'),
    ('O-', 'O-'),
]

APPOINTMENT_STATUS_CHOICES = [
    ('Scheduled', 'Scheduled'),
    ('Completed', 'Completed'),
    ('Cancelled', 'Cancelled'),
    ('No Show', 'No Show'),
]

DIAGNOSIS_TYPE_CHOICES = [
    ('Primary', 'Primary'),
    ('Secondary', 'Secondary'),
]

CARE_PLAN_TYPE_CHOICES = [
    ('Immediate', 'Immediate'),
    ('Long-term', 'Long-term'),
]

# User profile manager
class UserProfileManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

# --- Custom User Model ---

class UserProfile(AbstractUser):
    username = None  # Remove the inherited username field
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    password = models.CharField(max_length=255)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='Other')
    date_of_birth = models.DateField(null=True, blank=True)
    role = models.CharField(max_length=15, choices=ROLE_CHOICES)
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    profile_image = models.URLField(max_length=200, blank=True, null=True)

    objects = UserProfileManager()

    USERNAME_FIELD = 'email'  # Use email as the unique identifier
    REQUIRED_FIELDS = []

    def _str_(self):
        return f"({self.get_role_display()}) {self.email}"


# --- Related Models ---

class Patient(models.Model):
    user = models.OneToOneField(UserProfile, on_delete=models.CASCADE, primary_key=True)  # Use `user` as the primary key
    medical_record_id = models.CharField(max_length=100, unique=True, blank=True, null=True)
    emergency_contact_name = models.CharField(max_length=255, null=True)
    emergency_contact_phone = models.CharField(max_length=15, null=True)
    blood_type = models.CharField(max_length=10, null=True)
    family_history = models.TextField(null=True)
    CPR_number = models.CharField(max_length=50, blank=True, null=True)
    place_of_birth = models.CharField(max_length=255, blank=True, null=True)
    religion = models.CharField(max_length=50, blank=True, null=True)
    allergies = models.JSONField(default=dict, blank=True, null=True)
    past_surgeries = models.JSONField(default=dict, blank=True, null=True)
    chronic_conditions = models.TextField(blank=True, null=True)
    patient_notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}"



class Employee(models.Model):
    user = models.OneToOneField(UserProfile, on_delete=models.CASCADE, primary_key=True)  # Use `user` as the primary key
    specialization = models.CharField(max_length=255, null=True)
    available_days = models.JSONField(default=list, null=True)
    shift_start = models.TimeField(null=True)
    shift_end = models.TimeField(null=True)
    office_number = models.CharField(max_length=50, null=True)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - {self.specialization}"


class Appointment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='appointments'
    )
    doctor = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'doctor'},
        related_name='doctor_appointments'
    )
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    status = models.CharField(max_length=20, choices=APPOINTMENT_STATUS_CHOICES)
    heart_rate = models.IntegerField(null=True, blank=True)
    blood_pressure = models.CharField(max_length=20, null=True, blank=True)
    temperature = models.FloatField(null=True, blank=True)
    o2_sat = models.IntegerField(null=True, blank=True)
    resp_rate = models.IntegerField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    follow_up_required = models.BooleanField(default=False)

    def _str_(self):
        return f"Appointment {self.id} on {self.appointment_date} at {self.appointment_time}"


class Chat(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user1 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chats_user1'
    )
    user2 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chats_user2'
    )
    created_date = models.DateTimeField(auto_now_add=True)
    last_updated_date = models.DateTimeField(auto_now=True)

    def _str_(self):
        return f"Chat between {self.user1.email} and {self.user2.email}"


class ChatMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    chat = models.ForeignKey(
        Chat,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    message_text = models.TextField()
    is_read = models.BooleanField(default=False)

    def _str_(self):
        return f"Message from {self.sender.email} at {self.timestamp}"


class Log(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='logs'
    )
    action = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    description = models.TextField()

    def _str_(self):
        return f"Log {self.id} by {self.user.email} at {self.timestamp}"


class Prescription(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.CASCADE,
        related_name='prescriptions'
    )
    medication_name = models.CharField(max_length=100)
    dosage = models.CharField(max_length=50)
    duration = models.IntegerField(help_text="Duration in days")
    special_instructions = models.TextField(null=True, blank=True)

    def _str_(self):
        return f"Prescription {self.id} for Appointment {self.appointment.id}"


class Diagnosis(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.CASCADE,
        related_name='diagnoses'
    )
    diagnosis_name = models.CharField(max_length=100)
    diagnosis_type = models.CharField(max_length=50, choices=DIAGNOSIS_TYPE_CHOICES)

    def _str_(self):
        return f"Diagnosis: {self.diagnosis_name} ({self.diagnosis_type}) for Appointment {self.appointment.id}"


class CarePlan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.CASCADE,
        related_name='care_plans'
    )
    care_plan_title = models.CharField(max_length=100)
    care_plan_type = models.CharField(max_length=50, choices=CARE_PLAN_TYPE_CHOICES)
    date_of_issue = models.DateField()
    date_of_completion = models.DateField(null=True, blank=True)
    done_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        related_name='care_plans_completed'
    )
    additional_instructions = models.TextField(null=True, blank=True)

    def _str_(self):
        return f"Care Plan: {self.care_plan_title} for Appointment {self.appointment.id}"