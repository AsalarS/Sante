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
from django.db.models import Q, F, Value
from django.db.models.functions import Concat
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

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

    logs = Log.objects.select_related('user').all()
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
    
    # ---------------------------- Search Views ----------------------------

@api_view(["GET"])
def search_patients(request):
    """
    Search for patients by first name, last name, email, and CPR number across UserProfile and Patient tables.
    Query Parameters:
    - query: Search term (optional)
    Returns:
    - JSON response with patient search results
    """
    # Extract and sanitize search query
    query = request.GET.get('query', '').strip()
    try:
        # Start with a base queryset for patients only
        patients_qs = UserProfile.objects.filter(role='patient')
        
        if query:
            search_query = Q()
            
            # Search by first name or last name
            name_parts = query.split()
            if len(name_parts) > 1:
                search_query |= Q(first_name__icontains=name_parts[0], last_name__icontains=name_parts[-1])
            else:
                search_query |= Q(first_name__icontains=query) | Q(last_name__icontains=query)
            
            # Comprehensive email search
            search_query |= (
                Q(email__icontains=query) |  # Partial email match
                Q(email__startswith=query) |  # Starts with the search term
                Q(email__iexact=query)  # Exact match
            )
            
            # Search by CPR number
            search_query |= Q(patient__CPR_number__icontains=query)
            
            # Apply the filter to the queryset
            patients_qs = patients_qs.filter(search_query)
        
        # Serialize results with related Patient information
        patients = patients_qs.select_related('patient').values(
            'id',
            'first_name', 
            'last_name', 
            'email',
            'patient__CPR_number'
        )
        
        # Convert to list and format the results
        patients_list = [
            {
                'id': patient['id'],
                'first_name': patient['first_name'],
                'last_name': patient['last_name'],
                'email': patient['email'],
                'CPR_number': patient['patient__CPR_number']
            } for patient in patients
        ]
        
        return JsonResponse({
            'success': True,
            'patients': patients_list,
            'total_count': len(patients_list)
        })
    
    except Exception as e:
        logger.error(f"Patient search error: {str(e)}")
        return JsonResponse({
            'success': False,
            'message': 'An error occurred during the search.'
        }, status=500)