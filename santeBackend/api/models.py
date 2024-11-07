from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser

# Create your models here.

#USER
class UserProfile(AbstractUser): 
    ROLE_CHOICES = [
        ('doctor', 'Doctor'),
        ('patient', 'Patient'),
        ('admin', 'Admin'),
        ('nurse', 'Nurse'),
        ('receptionist', 'Receptionist')
    ]
    username = None  # remove the inherited username field
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    USERNAME_FIELD = 'email'  # Set the email to the username field to make it unique
    REQUIRED_FIELDS = [] 

    def __str__(self):
        return f"{self.email} - {self.role}"
    
#CHAT
class Chat(models.Model):
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chat between {[user.email for user in self.participants.all()]}"
# MESSAGES
class Message(models.Model):
    chat = models.ForeignKey(Chat, related_name="messages", on_delete=models.CASCADE)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.email}: {self.content[:50]}"