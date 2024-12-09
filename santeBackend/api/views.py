from datetime import datetime
import sys
from sqlite3 import IntegrityError
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import JsonResponse
from .models import UserProfile, Patient, Employee
from django.db import transaction
from rest_framework.decorators import authentication_classes, permission_classes
from .serializers import *
import logging
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

logger = logging.getLogger(__name__)

# Create your views here.


# ----------------- Registration Views -----------------
class RegisterPatientView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = RegisterPatientSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            # Return success response with user data
            return Response(
                {
                    "user": {
                        "email": user.email,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                    }
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterEmployeeView(APIView):
    # permission_classes = [AllowAny] //TODO: change this to app admin only

    def post(self, request):
        serializer = RegisterEmployeeSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            # Return success response with user data
            return Response(
                {
                    "user": {
                        "email": user.email,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                    }
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
                return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

            # Check if email already exists
            if UserProfile.objects.filter(email=data["email"]).exists():
                return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)

            # Create user
            user_serializer = UserSerializer(data=request.data)
            if not user_serializer.is_valid():
                return Response({"error": f"User creation failed: {user_serializer.errors}"}, status=status.HTTP_400_BAD_REQUEST)

            user = user_serializer.save()

            try:
                # Determine whether to create Patient or Employee
                if data["role"] == "patient":
                    patient_serializer = PatientSerializer(data=request.data)
                    if not patient_serializer.is_valid():
                        user.delete()
                        return Response({"error": f"Patient creation failed: {patient_serializer.errors}"}, status=status.HTTP_400_BAD_REQUEST)
                    patient = patient_serializer.save(user=user)

                elif data["role"] in ["doctor", "nurse", "receptionist", "admin"]:
                    employee_serializer = EmployeeSerializer(data=request.data)
                    if not employee_serializer.is_valid():
                        user.delete()
                        return Response({"error": f"Employee creation failed: {employee_serializer.errors}"}, status=status.HTTP_400_BAD_REQUEST)
                    employee = employee_serializer.save(user=user)
                else:
                    user.delete()
                    return Response({"error": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)
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
            return Response({"error": "An error occurred during registration"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
    users = UserProfile.objects.all().values(
        "id",
        "email",
        "first_name",
        "last_name",
        "role",
        "profile_image",
        "gender",
        "date_of_birth",
        "phone_number",
        "address",
    )

    paginator = PageNumberPagination()
    paginator.page_size = page_size
    result_page = paginator.paginate_queryset(users, request)
    serializedData = UserSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializedData.data)


@api_view(["GET"])
def get_patients(request):
    if not request.user.is_authenticated:
        return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

    patients = Patient.objects.all().values(
        "user__id",
        "user__email",
        "user__first_name",
        "user__last_name",
        "user__role",
        "user__profile_image",
        "medical_record_id",
        "emergency_contact_name",
        "emergency_contact_phone",
        "blood_type",
        "chronic_conditions",
        "family_history",
    )
    serializedData = PatientSerializer(patients, many=True)
    return JsonResponse(serializedData.data, safe=False)


@api_view(["GET"])
def get_logs_admin(request):
    if not request.user.is_authenticated:
        return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

    if request.user.role != "admin":
        return Response(
            {"error": "Forbidden: Only admins can access this resource."},
            status=status.HTTP_403_FORBIDDEN,
        )

    logs = Log.objects.all().values(
        "id", "user", "action", "timestamp", "ip_address", "description"
    )
    serializedData = LogSerializer(logs, many=True)
    return JsonResponse(serializedData.data, safe=False)


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

    #  Appointment Views


class AppointmentPagination(PageNumberPagination):
    page_size = 28  # Number of appointments per page
    page_size_query_param = "page_size"


class AppointmentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        appointments = Appointment.objects.all()
        paginator = AppointmentPagination()
        result_page = paginator.paginate_queryset(appointments, request)
        serializer = AppointmentSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = AppointmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AppointmentsByDateView(APIView):
    """
    View to return all appointments booked on a specific date.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        appointment_date = request.data.get("appointment_date")

        # Validate input
        if not appointment_date:
            return Response(
                {"error": "'appointment_date' is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            appointment_date_parsed = datetime.strptime(
                appointment_date, "%Y-%m-%d"
            ).date()
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use 'YYYY-MM-DD'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Query for appointments on the given date
        appointments = Appointment.objects.filter(
            appointment_date=appointment_date_parsed
        )

        # Serialize and return data
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # Doctors views


class AvailableDoctorsView(APIView):
    """
    View to return all doctors available on a specific date and time.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        appointment_date = request.data.get("appointment_date")

        # Validate input
        if not appointment_date:
            return Response(
                {"error": "'appointment_date' and is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            appointment_date_parsed = datetime.strptime(
                appointment_date, "%Y-%m-%d"
            ).date()
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use 'YYYY-MM-DD' for date."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Query for available doctors
        available_doctors = Employee.objects.filter(
            user__role="doctor",  # Access `role` via the related `UserProfile` model
            available_days__icontains=appointment_date_parsed.weekday(),  # Check availability for the day
        ).exclude(
            doctor_appointments__appointment_date=appointment_date_parsed,  # Exclude doctors with conflicting appointments
        )

        # Serialize and return data
        serializer = EmployeeSerializer(available_doctors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
