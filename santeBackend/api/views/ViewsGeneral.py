from datetime import datetime
import sys
import os
from sqlite3 import IntegrityError
from django.shortcuts import get_object_or_404
from django.http import FileResponse, HttpResponse
from rest_framework import generics, status
from rest_framework.decorators import api_view, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import JsonResponse
from ..models import UserProfile, Patient, Employee
from django.db import transaction
from ..serializers import *
import logging
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from django.db.models import Q
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from ..utilities import AdminSystemReportGenerator, get_client_ip, log_to_db

logger = logging.getLogger(__name__)

# Pagination Variables in class
class AdminPagination(PageNumberPagination):
    page_size = 10  # Number of appointments per page WAS 28 
    page_size_query_param = "page_size"
    
# Create your views here.

@authentication_classes([IsAuthenticated])
@api_view(["GET"])
def get_logs_admin(request):
    if not request.user.is_authenticated:
        return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

    if request.user.role != "admin":
        return Response(
            {"error": "Forbidden: Only admins can access this resource."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Get search query from request parameters
    search_query = request.query_params.get('search', '').strip()
    
    # Start with base queryset
    logs = Log.objects.select_related('user').order_by('-timestamp')
    
    # Apply search if query exists
    if search_query:
        logs = logs.filter(
            Q(user__email__icontains=search_query) |
            Q(action__icontains=search_query) |
            Q(action__icontains=search_query)
        )
    
    # Paginate the filtered results
    paginator = AdminPagination()
    result_page = paginator.paginate_queryset(logs, request)
    
    # Serialize the data
    serialized_data = LogSerializer(result_page, many=True)
    return paginator.get_paginated_response(serialized_data.data)


    #  Appointment Views
    
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
        
@api_view(["GET"])
def generate_admin_report(request):
    # Check if user is admin
    if not request.user.is_authenticated:
        return HttpResponse(status=401)  # 401 Unauthorized

    if request.user.role != 'admin':
        return HttpResponse(status=403)  # 403 Forbidden
    
    # Generate PDF
    pdf_file = AdminSystemReportGenerator.generate_pdf_report()
    
    # Create response
    response = HttpResponse(pdf_file, content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="system_report.pdf"'
    
    log_to_db(request, 'Generated system report', "Generated a system report")
    
    return response