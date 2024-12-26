from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from .models import UserProfile, Patient, Employee, Appointment, Chat, ChatMessage, Log, Prescription, Diagnosis, CarePlan

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
    
    def update(self, instance, validated_data):
        # Extract user data if present
        user_data = validated_data.pop('user', {})
        
        # Update user first if data exists
        if user_data:
            user_serializer = UserSerializer(instance.user, data=user_data, partial=True)
            if user_serializer.is_valid():
                user_serializer.save()
        
        # Then update patient instance
        return super().update(instance, validated_data)


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
        role = validated_data.get("role")

        # Ensure role is valid for an employee
        if role not in ["doctor", "nurse", "receptionist", "admin"]:
            raise serializers.ValidationError(
                {"role": "Role must be one of 'doctor', 'nurse', 'receptionist', 'admin'."}
            )

        # Create user with the create_user method
        user = UserProfile.objects.create_user(
            email=validated_data["email"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            password=validated_data["password"],
            gender=validated_data.get("gender"),
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
    CPR_number = serializers.CharField(required=True)
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
        role = validated_data.get("role")

        # Ensure role is valid for a patient
        if role != "patient":
            raise serializers.ValidationError({"role": "Role must be 'patient'."})

        # Create user with the create_user method
        user = UserProfile.objects.create_user(
            email=validated_data["email"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            password=validated_data["password"],
            gender=validated_data.get("gender"),
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
            "CPR_number": validated_data["CPR_number"],
            "place_of_birth": validated_data.get("place_of_birth"),
            "religion": validated_data.get("religion"),
            "allergies": validated_data.get("allergies", {}),
            "past_surgeries": validated_data.get("past_surgeries", {}),
            "chronic_conditions": validated_data.get("chronic_conditions"),
        }
        Patient.objects.create(**patient_data)

        return user

# APPOINTMENT SERIALIZER

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = "__all__"

# LOGS SERIALIZER

class LogSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = Log
        fields = "__all__"


class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = '__all__'

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = '__all__'

class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = '__all__'

class DiagnosisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diagnosis
        fields = '__all__'

class CarePlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarePlan
        fields = '__all__'
