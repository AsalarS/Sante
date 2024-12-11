from datetime import datetime
import sys
from sqlite3 import IntegrityError
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import JsonResponse
from ..models import UserProfile, Patient, Employee
from django.db import transaction
from rest_framework.decorators import authentication_classes, permission_classes
from ..serializers import *
import logging
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

logger = logging.getLogger(__name__)


# ----------------- Registration Views -----------------


class RegisterUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Extract role from request data
        role = request.data.get("role", None)

        # Handle Patient Registration
        if role == "patient":
            serializer = RegisterPatientSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.save()
                return Response(
                    {
                        "user": {
                            "email": user.email,
                            "first_name": user.first_name,
                            "last_name": user.last_name,
                            "role": "patient",
                        }
                    },
                    status=status.HTTP_201_CREATED,
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Handle Employee Registration
        elif role in ["doctor", "nurse", "receptionist", "admin"]:
            serializer = RegisterEmployeeSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.save()
                return Response(
                    {
                        "user": {
                            "email": user.email,
                            "first_name": user.first_name,
                            "last_name": user.last_name,
                            "role": role,
                        }
                    },
                    status=status.HTTP_201_CREATED,
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Handle General User Registration (when no role is specified)
        elif role is None:
            serializer = UserSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.save()
                return Response(
                    {
                        "user": {
                            "email": user.email,
                            "first_name": user.first_name,
                            "last_name": user.last_name,
                            "role": "user",
                        }
                    },
                    status=status.HTTP_201_CREATED,
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Invalid role specified
        else:
            return Response(
                {
                    "error": f"Invalid role: {role}. Allowed roles are 'patient', 'admin', 'receptionist', 'nurse', 'doctor', or leave blank for general user."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


class TestingRegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        try:
            data = request.data
            logger.debug("Received registration data: %s", data)

            # Basic validation
            required_fields = ["first_name", "last_name", "email", "password", "role"]
            if not all(field in data for field in required_fields):
                return Response(
                    {"error": "Missing required fields"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Check if email already exists
            if UserProfile.objects.filter(email=data["email"]).exists():
                return Response(
                    {"error": "Email already exists"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Create user
            user_serializer = UserSerializer(data=request.data)
            if not user_serializer.is_valid():
                return Response(
                    {"error": f"User creation failed: {user_serializer.errors}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user = user_serializer.save()

            try:
                # Determine whether to create Patient or Employee
                if data["role"] == "patient":
                    patient_serializer = PatientSerializer(data=request.data)
                    if not patient_serializer.is_valid():
                        user.delete()
                        return Response(
                            {
                                "error": f"Patient creation failed: {patient_serializer.errors}"
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    patient = patient_serializer.save(user=user)

                elif data["role"] in ["doctor", "nurse", "receptionist", "admin"]:
                    employee_serializer = EmployeeSerializer(data=request.data)
                    if not employee_serializer.is_valid():
                        user.delete()
                        return Response(
                            {
                                "error": f"Employee creation failed: {employee_serializer.errors}"
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    employee = employee_serializer.save(user=user)
                else:
                    user.delete()
                    return Response(
                        {"error": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST
                    )
            except Exception as inner_exception:
                # Delete the user if Patient or Employee creation fails
                logger.error(
                    "Error during Patient or Employee creation, deleting user: %s",
                    user.email,
                )
                user.delete()
                raise inner_exception

            logger.debug("Successfully registered user: %s", user.email)

            return Response(
                {"message": "User created successfully!"},
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            logger.error("Error during registration: %s", str(e))
            return Response(
                {"error": "An error occurred during registration"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# --------------- List Views ----------------
@api_view(["GET"])
def get_users(request):  # List users
    if not request.user.is_authenticated:
        return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

    users = UserProfile.objects.all().values(
        "id", "email", "first_name", "last_name", "role", "profile_image"
    )
    serializedData = UserSerializer(users, many=True)
    return JsonResponse(serializedData.data, safe=False)


# To Get all user information. ONLY FOR ADMIN


@api_view(["GET"])
def get_users_admin(request):
    if not request.user.is_authenticated:
        return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
    if request.user.role != "admin":
        return Response(
            {"error": "Forbidden: Only admins can access this resource."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Pagination settings
    page_size = 10

    # Fetch all user fields for all users
    users = UserProfile.objects.all()

    # Prepare response data with additional data based on user role
    user_data = []
    for user in users:
        user_info = {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
            "profile_image": user.profile_image,
            "gender": user.gender,
            "date_of_birth": user.date_of_birth,
            "phone_number": user.phone_number,
            "address": user.address,
        }

        # Add patient-specific data if the role is patient
        if user.role == "patient":
            try:
                patient = Patient.objects.get(user=user)
                user_info.update(
                    {
                        "medical_record_id": patient.medical_record_id,
                        "emergency_contact_name": patient.emergency_contact_name,
                        "emergency_contact_phone": patient.emergency_contact_phone,
                        "blood_type": patient.blood_type,
                        "family_history": patient.family_history,
                        "CPR_number": patient.CPR_number,
                        "place_of_birth": patient.place_of_birth,
                        "religion": patient.religion,
                        "allergies": patient.allergies,
                        "past_surgeries": patient.past_surgeries,
                        "chronic_conditions": patient.chronic_conditions,
                        "patient_notes": patient.patient_notes,
                    }
                )
            except Patient.DoesNotExist:
                user_info["patient_data"] = "No patient data available."
        # Add employee-specific data if the role is employee
        else:
            try:
                employee = Employee.objects.get(user=user)
                user_info.update(
                    {
                        "specialization": employee.specialization,
                        "available_days": employee.available_days,
                        "shift_start": employee.shift_start,
                        "shift_end": employee.shift_end,
                        "office_number": employee.office_number,
                    }
                )
            except Employee.DoesNotExist:
                user_info["employee_data"] = "No employee data available."

        user_data.append(user_info)

    # Apply pagination
    paginator = PageNumberPagination()
    paginator.page_size = page_size
    result_page = paginator.paginate_queryset(user_data, request)

    return paginator.get_paginated_response(result_page)


@api_view(["PATCH"])
def update_user_admin(request, user_id):
    patient_fields = []
    # 1. Authentication Check
    if not request.user.is_authenticated:
        return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

    # 2. Authorization Check
    if request.user.role != "admin":
        return Response(
            {"error": "Forbidden: Only admins can access this resource."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # 3. Fetch the UserProfile instance
    user = get_object_or_404(UserProfile, id=user_id)

    # 4. Update UserProfile fields
    # List of fields that belong to UserProfile
    user_fields = [
        "email",
        "first_name",
        "last_name",
        "role",
        "profile_image",
        "gender",
        "date_of_birth",
        "phone_number",
        "address",
        "password",  # Handle password separately
    ]

    # Update UserProfile fields from request.data
    for field in user_fields:
        if field in request.data:
            if field == "password":
                # Hash the password before saving
                setattr(user, field, make_password(request.data[field]))
            else:
                setattr(user, field, request.data[field])

    # After saving the user
    user.save()

    # Re-fetch the user from the database to get the latest data
    user.refresh_from_db()

    # Continue preparing the response
    response_data = {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role,
        "profile_image": user.profile_image,
        "gender": user.gender,
        "date_of_birth": user.date_of_birth,
        "phone_number": user.phone_number,
        "address": user.address,
    }

    # Explicitly handle Patient or Employee fields
    if user.role == "patient":
        try:
            patient = Patient.objects.get(user=user)
            patient_fields = [
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
                "patient_notes",
            ]

            for field in patient_fields:
                if field in request.data:
                    setattr(patient, field, request.data[field])
            patient.save()
        except Patient.DoesNotExist:
            # Optionally create a new Patient instance if it doesn't exist
            Patient.objects.create(
                user=user,
                **{k: v for k, v in request.data.items() if k in patient_fields},
            )

    elif user.role != "patient":
        try:
            employee = Employee.objects.get(user=user)
            employee_fields = [
                "specialization",
                "available_days",
                "shift_start",
                "shift_end",
                "office_number",
            ]

            for field in employee_fields:
                if field in request.data:
                    setattr(employee, field, request.data[field])
            employee.save()
        except Employee.DoesNotExist:
            # Optionally create a new Employee instance if it doesn't exist
            Employee.objects.create(
                user=user,
                **{k: v for k, v in request.data.items() if k in employee_fields},
            )

    return Response(
        {"message": "User information updated successfully!", "user": response_data},
        status=status.HTTP_200_OK,
    )


# ----------------- User Management Views -----------------


@api_view(["DELETE"])
def delete_user_admin(request, user_id):
    try:
        user = UserProfile.objects.get(id=user_id)
        user.delete()
        logger.info(f"Admin {request.user.id} deleted user {user_id}.")
        return JsonResponse(
            {"message": "User deleted successfully."}, status=status.HTTP_200_OK
        )
    except UserProfile.DoesNotExist:
        logger.warning(
            f"Admin {request.user.id} attempted to delete non-existent user {user_id}."
        )
        return JsonResponse(
            {"error": "User not found."}, status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error deleting user {user_id} by admin {request.user.id}: {e}")
        return JsonResponse(
            {"error": "An error occurred while deleting the user."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # The request.user will contain the logged-in user's data
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        # partial=True allows partial updates to certain fields
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class SpecificUserInfoView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        """
        Retrieve comprehensive user details including role-specific information.
        
        Args:
            request: The HTTP request object
            user_id: The ID of the user to retrieve
        
        Returns:
            Response with user data and role-specific details
        """
        # Retrieve the user
        user = get_object_or_404(UserProfile, id=user_id)
        
        # Serialize base user information
        user_serializer = UserSerializer(user)
        user_data = user_serializer.data
        
        # Extend user data based on role
        try:
            if user.role == 'patient':
                # Retrieve patient-specific information
                patient = Patient.objects.get(user=user)
                patient_serializer = PatientSerializer(patient)
                user_data.update(patient_serializer.data)
            elif user.role in ['doctor', 'nurse', 'admin', 'staff']:
                # Retrieve employee-specific information
                employee = Employee.objects.get(user=user)
                employee_serializer = EmployeeSerializer(employee)
                user_data.update(employee_serializer.data)
        except (Patient.DoesNotExist, Employee.DoesNotExist):
            # Handle cases where role-specific model doesn't exist
            return Response({
                'error': 'Detailed profile not found for this user',
                'user': user_data
            }, status=status.HTTP_404_NOT_FOUND)
        
        return Response(user_data)

