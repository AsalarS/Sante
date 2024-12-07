from rest_framework import serializers
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from .models import *

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "password",
            "role",
            "first_name",
            "last_name",
            "profile_image",
            "gender",
            "date_of_birth",
            "phone_number",
            "address",
        ]
        extra_kwargs = {
            "password": {"write_only": True},
            "role": {"required": True},
            "profile_image": {"required": False},
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


# EMPLOYEE SERIALIZERS


class EmployeeSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)  # Make user read-only

    class Meta:
        model = Employee
        fields = "__all__"


class RegisterEmployeeSerializer(serializers.ModelSerializer):
    specialization = serializers.CharField(required=False, allow_null=True)
    available_days = serializers.JSONField(required=False, default=list)
    shift_start = serializers.TimeField(required=False, allow_null=True)
    shift_end = serializers.TimeField(required=False, allow_null=True)
    office_number = serializers.CharField(required=False, allow_null=True)

    class Meta:
        model = UserProfile
        fields = [
            "email",
            "first_name",
            "last_name",
            "password",
            "gender",
            "date_of_birth",
            "phone_number",
            "address",
            "role",
            "specialization",
            "available_days",
            "shift_start",
            "shift_end",
            "office_number",
        ]

    def create(self, validated_data):
        role = validated_data["role"]

        # Ensure role is valid for an employee
        if role not in ["doctor", "nurse", "receptionist", "admin"]:
            raise serializers.ValidationError(
                {
                    "role": "Role must be one of 'doctor', 'nurse', 'receptionist', 'admin'."
                }
            )

        # Create user profile
        user = UserProfile.objects.create_user(
            email=validated_data["email"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            password=make_password(validated_data["password"]),
            gender=validated_data.get("gender", "Other"),
            date_of_birth=validated_data.get("date_of_birth"),
            phone_number=validated_data.get("phone_number"),
            address=validated_data.get("address"),
            role=role,
        )

        # Create employee record
        employee_data = {
            "user": user,
            "specialization": validated_data.get("specialization"),
            "available_days": validated_data.get("available_days", []),
            "shift_start": validated_data.get("shift_start"),
            "shift_end": validated_data.get("shift_end"),
            "office_number": validated_data.get("office_number"),
        }
        Employee.objects.create(**employee_data)

        return user


# PATIENT SERIALIZERS


class PatientSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)  # Make user read-only

    class Meta:
        model = Patient
        fields = "__all__"


class RegisterPatientSerializer(serializers.ModelSerializer):
    medical_record_id = serializers.CharField(required=False, allow_null=True)
    emergency_contact_name = serializers.CharField(required=False, allow_null=True)
    emergency_contact_phone = serializers.CharField(required=False, allow_null=True)
    blood_type = serializers.CharField(required=False, allow_null=True)
    family_history = serializers.CharField(required=False, allow_null=True)
    CPR_number = serializers.CharField(required=False, allow_null=True)
    place_of_birth = serializers.CharField(required=False, allow_null=True)
    religion = serializers.CharField(required=False, allow_null=True)
    allergies = serializers.JSONField(required=False, default=dict)
    past_surgeries = serializers.JSONField(required=False, default=dict)
    chronic_conditions = serializers.CharField(required=False, allow_null=True)

    class Meta:
        model = UserProfile
        fields = [
            "email",
            "first_name",
            "last_name",
            "password",
            "gender",
            "date_of_birth",
            "phone_number",
            "address",
            "role",
            "medical_record_id",
            "emergency_contact_name",
            "emergency_contact_phone",
            "blood_type",
            "family_history",
            "CPR_number",
            "place_of_birth",
            "religion",
            "allergies",
            "past_surgeries",
            "chronic_conditions",
        ]

    def create(self, validated_data):
        role = validated_data["role"]

        # Ensure role is valid for a patient
        if role != "patient":
            raise serializers.ValidationError({"role": "Role must be 'patient'."})

        # Create user profile
        user = UserProfile.objects.create_user(
            email=validated_data["email"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            password=make_password(validated_data["password"]),
            gender=validated_data.get("gender", "Other"),
            date_of_birth=validated_data.get("date_of_birth"),
            phone_number=validated_data.get("phone_number"),
            address=validated_data.get("address"),
            role=role,
        )

        # Create patient record
        patient_data = {
            "user": user,
            "medical_record_id": validated_data.get("medical_record_id"),
            "emergency_contact_name": validated_data.get("emergency_contact_name"),
            "emergency_contact_phone": validated_data.get("emergency_contact_phone"),
            "blood_type": validated_data.get("blood_type"),
            "family_history": validated_data.get("family_history"),
            "CPR_number": validated_data.get("CPR_number"),
            "place_of_birth": validated_data.get("place_of_birth"),
            "religion": validated_data.get("religion"),
            "allergies": validated_data.get("allergies", {}),
            "past_surgeries": validated_data.get("past_surgeries", {}),
            "chronic_conditions": validated_data.get("chronic_conditions"),
        }
        Patient.objects.create(**patient_data)

        return user


# LOGS SERIALIZER


class LogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Log
        fields = "__all__"


# # Serializer to handle input and update logic
# class UserProfileSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ['email', 'first_name', 'last_name']

#     def update(self, instance, validated_data):
#         # Update the instance with new data
#         instance.email = validated_data.get('email', instance.email)
#         instance.first_name = validated_data.get('first_name', instance.first_name)
#         instance.last_name = validated_data.get('last_name', instance.last_name)

#         # Save changes to the database
#         instance.save()
#         return instance

#     def create(self, validated_data):
#         password = validated_data.pop('password', None)
#         user = UserProfile(**validated_data)
#         if password:
#             user.set_password(password)  # Hash the password
#         user.save()
#         return user
