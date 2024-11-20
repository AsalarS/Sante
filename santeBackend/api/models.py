from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import BaseUserManager

# Create your models here.

class UserProfileManager(BaseUserManager): #User manager override to make an admin account with a custom user model
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

class UserProfile(AbstractUser):
    ROLE_CHOICES = [
        ('doctor', 'Doctor'),
        ('patient', 'Patient'),
        ('admin', 'Admin'),
        ('nurse', 'Nurse'),
        ('receptionist', 'Receptionist')
    ]
    
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]
    
    username = None  # remove the inherited username field
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='Other')
    date_of_birth = models.DateField(null=True, blank=True)
    role = models.CharField(max_length=15, choices=ROLE_CHOICES)
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    profile_image = models.URLField(max_length=200, blank=True, null=True)

    objects = UserProfileManager()
    USERNAME_FIELD = 'email'  # Set the email to the username field to make it unique
    REQUIRED_FIELDS = [] 

    def __str__(self):
        return f"({self.role}) {self.email} {self.role}"

class Patient(models.Model):
    user = models.OneToOneField(UserProfile, on_delete=models.CASCADE, primary_key=True)
    medical_record_id = models.IntegerField()
    emergency_contact_name = models.CharField(max_length=100)
    emergency_contact_phone = models.CharField(max_length=15)
    blood_type = models.CharField(max_length=3)
    chronic_conditions = models.TextField()
    family_history = models.TextField() 

    def __str__(self):
        return f"Patient: {self.user}"

class Doctor(models.Model):
    user = models.OneToOneField(UserProfile, on_delete=models.CASCADE, primary_key=True)
    specialization = models.CharField(max_length=100)
    license_number = models.CharField(max_length=50)
    available_days = models.CharField(max_length=50)
    office_number = models.CharField(max_length=10)

    def __str__(self):
        return f"Doctor: {self.user}"

class Receptionist(models.Model):
    user = models.OneToOneField(UserProfile, on_delete=models.CASCADE, primary_key=True)
    shift_start = models.TimeField()
    shift_end = models.TimeField()

    def __str__(self):
        return f"Receptionist: {self.user}"

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('Scheduled', 'Scheduled'),
        ('Completed', 'Completed'),
        ('Canceled', 'Canceled'),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES)
    reason_for_visit = models.TextField()
    treatment_notes = models.TextField(null=True, blank=True)
    prescription = models.TextField(null=True, blank=True)
    follow_up_required = models.BooleanField(default=False)

    def __str__(self):
        return f"Appointment: {self.appointment_date} - {self.patient}"

class MedicalRecord(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    created_date = models.DateTimeField(auto_now_add=True)
    last_updated_date = models.DateTimeField(auto_now=True)
    record_details = models.JSONField()
    allergies = models.TextField()
    medications = models.TextField()
    past_surgeries = models.TextField()
    chronic_conditions = models.TextField()

    def __str__(self):
        return f"MedicalRecord: {self.patient}"

class Chat(models.Model):
    user1 = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='chat_user1')
    user2 = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='chat_user2')
    created_date = models.DateTimeField(auto_now_add=True)
    last_updated_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Chat between {self.user1} and {self.user2}"

class ChatMessage(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    sender = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    message_text = models.TextField()
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Message from {self.sender} in chat {self.chat}"

class Log(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    action = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.CharField(max_length=45)
    description = models.TextField()

    def __str__(self):
        return f"Log: {self.action} by {self.user}"

class Prescription(models.Model):
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='prescriptions')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    medication_name = models.CharField(max_length=100)
    dosage = models.CharField(max_length=50)
    duration = models.IntegerField()
    special_instructions = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Prescription: {self.medication_name} for {self.appointment}"

class Treatment(models.Model):
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE)
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    treatment_details = models.TextField()
    treatment_date = models.DateField()

    def __str__(self):
        return f"Treatment for {self.medical_record.patient} on {self.treatment_date}"


# class Notification(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     notification_text = models.TextField()
#     created_date = models.DateTimeField(auto_now_add=True)
#     is_read = models.BooleanField(default=False)

#     def __str__(self):
#         return f"Notification for {self.user}"
