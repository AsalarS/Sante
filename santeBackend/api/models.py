from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

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
