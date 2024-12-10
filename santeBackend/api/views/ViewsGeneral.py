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
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

logger = logging.getLogger(__name__)

# Create your views here.

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
