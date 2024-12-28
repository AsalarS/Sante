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
from ..utilities import log_to_db

logger = logging.getLogger(__name__)

# Pagination Variables in class
class AdminPagination(PageNumberPagination):
    page_size = 10  # Number of appointments per page WAS 28 
    page_size_query_param = "page_size"
    
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

    logs = Log.objects.select_related('user').order_by('-timestamp')
    paginator = AdminPagination()
    result_page = paginator.paginate_queryset(logs, request)
    serialized_data = LogSerializer(result_page, many=True)
    return paginator.get_paginated_response(serialized_data.data)


    #  Appointment Views


class AppointmentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        appointments = Appointment.objects.all()
        paginator = AdminPagination()
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
        
# Care Plan Views

class CarePlansByUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = request.user

        # Check if the logged-in user has the appropriate role
        if user.role not in ['receptionist', 'admin', 'nurse', 'doctor']:
            return Response({"error": "You do not have permission to view these care plans."}, status=status.HTTP_403_FORBIDDEN)

        try:
            patient = Patient.objects.get(user__id=user_id)
        except Patient.DoesNotExist:
            return Response({"error": "Patient not found."}, status=status.HTTP_404_NOT_FOUND)

        care_plans = CarePlan.objects.filter(appointment__patient=patient)
        serializer = CarePlanSerializer(care_plans, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CarePlanByAppointmentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, appointment_id):
        user = request.user

        # Check if the logged-in user has the appropriate role
        if user.role not in ['receptionist', 'admin', 'nurse', 'doctor']:
            return Response({"error": "You do not have permission to view these care plans."}, status=status.HTTP_403_FORBIDDEN)

        try:
            appointment = Appointment.objects.get(id=appointment_id)
        except Appointment.DoesNotExist:
            return Response({"error": "Appointment not found."}, status=status.HTTP_404_NOT_FOUND)

        care_plans = CarePlan.objects.filter(appointment=appointment)
        serializer = CarePlanSerializer(care_plans, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def patch(self, request, appointment_id):
        user = request.user

        # Check if the logged-in user has the appropriate role
        if user.role not in ['receptionist', 'admin', 'nurse', 'doctor']:
            return Response({"error": "You do not have permission to create or update care plans."}, status=status.HTTP_403_FORBIDDEN)

        try:
            appointment = Appointment.objects.get(id=appointment_id)
        except Appointment.DoesNotExist:
            return Response({"error": "Appointment not found."}, status=status.HTTP_404_NOT_FOUND)

        # Get the care plan ID from the request data (if exists)
        care_plan_id = request.data.get('id', None)

        if care_plan_id:
            # If care_plan_id exists, try to find the existing care plan
            try:
                care_plan = CarePlan.objects.get(id=care_plan_id, appointment=appointment)
            except CarePlan.DoesNotExist:
                return Response({"error": "Care plan not found for this appointment."}, status=status.HTTP_404_NOT_FOUND)

            # Update the care plan
            serializer = CarePlanSerializer(care_plan, data=request.data, partial=True)  # Partial=True allows partial updates
        else:
            # If no care_plan_id exists, create a new care plan
            request.data['appointment'] = appointment.id  # Ensure the care plan is linked to the appointment
            serializer = CarePlanSerializer(data=request.data)

        # Validate and save the care plan
        if serializer.is_valid():
            care_plan = serializer.save()
            return Response(CarePlanSerializer(care_plan).data, status=status.HTTP_200_OK if care_plan_id else status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, appointment_id):
        user = request.user

        # Check if the logged-in user has the appropriate role
        if user.role not in ['receptionist', 'admin', 'nurse', 'doctor']:
            return Response({"error": "You do not have permission to delete care plans."}, status=status.HTTP_403_FORBIDDEN)

        try:
            appointment = Appointment.objects.get(id=appointment_id)
        except Appointment.DoesNotExist:
            return Response({"error": "Appointment not found."}, status=status.HTTP_404_NOT_FOUND)

        # Get the care plan ID from the request data
        care_plan_id = request.data.get('id', None)

        if not care_plan_id:
            return Response({"error": "Care plan ID is required to delete."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            care_plan = CarePlan.objects.get(id=care_plan_id, appointment=appointment)
        except CarePlan.DoesNotExist:
            return Response({"error": "Care plan not found for this appointment."}, status=status.HTTP_404_NOT_FOUND)

        # Log
        log_to_db(
            request,
            "DELETE: Care Plan",
            f"Care Plan ID: {care_plan.id}, "
            f"Appointment ID: {appointment.id}, "
            f"Title: {care_plan.care_plan_title}, "
            f"Type: {care_plan.care_plan_type}, "
            f"Date of Completion: {care_plan.date_of_completion}, "
            f"Done By: {care_plan.done_by}, "
            f"Additional Instructions: {care_plan.additional_instructions}"
        )
        # Delete the care plan
        care_plan.delete()
        return Response({"message": "Care plan deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
    
# Diagnoses Views
class DiagnosesByUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = request.user

        # Check if the logged-in user has the appropriate role
        if user.role not in ['receptionist', 'admin', 'nurse', 'doctor']:
            return Response({"error": "You do not have permission to view these diagnoses."}, status=status.HTTP_403_FORBIDDEN)

        try:
            patient = Patient.objects.get(user__id=user_id)
        except Patient.DoesNotExist:
            return Response({"error": "Patient not found."}, status=status.HTTP_404_NOT_FOUND)

        diagnoses = Diagnosis.objects.filter(appointment__patient=patient)
        serializer = DiagnosisSerializer(diagnoses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class DiagnosisByAppointmentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, appointment_id):
        user = request.user

        # Check if the logged-in user has the appropriate role
        if user.role not in ['receptionist', 'admin', 'nurse', 'doctor']:
            return Response({"error": "You do not have permission to view these diagnoses."}, status=status.HTTP_403_FORBIDDEN)

        try:
            appointment = Appointment.objects.get(id=appointment_id)
        except Appointment.DoesNotExist:
            return Response({"error": "Appointment not found."}, status=status.HTTP_404_NOT_FOUND)

        diagnoses = Diagnosis.objects.filter(appointment=appointment)
        serializer = DiagnosisSerializer(diagnoses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def patch(self, request, appointment_id):
        user = request.user

        # Check if the logged-in user has the appropriate role
        if user.role not in ['receptionist', 'admin', 'nurse', 'doctor']:
            return Response({"error": "You do not have permission to create or update diagnoses."}, status=status.HTTP_403_FORBIDDEN)

        try:
            appointment = Appointment.objects.get(id=appointment_id)
        except Appointment.DoesNotExist:
            return Response({"error": "Appointment not found."}, status=status.HTTP_404_NOT_FOUND)

        # Get the diagnosis ID from the request data (if exists)
        diagnosis_id = request.data.get('id', None)

        if diagnosis_id:
            # If diagnosis_id exists, try to find the existing diagnosis
            try:
                diagnosis = Diagnosis.objects.get(id=diagnosis_id, appointment=appointment)
            except Diagnosis.DoesNotExist:
                return Response({"error": "Diagnosis not found for this appointment."}, status=status.HTTP_404_NOT_FOUND)

            # Update the diagnosis
            serializer = DiagnosisSerializer(diagnosis, data=request.data, partial=True)  # Partial=True allows partial updates
        else:
            # If no diagnosis_id exists, create a new diagnosis
            request.data['appointment'] = appointment.id  # Ensure the diagnosis is linked to the appointment
            serializer = DiagnosisSerializer(data=request.data)

        # Validate and save the diagnosis
        if serializer.is_valid():
            diagnosis = serializer.save()
            return Response(DiagnosisSerializer(diagnosis).data, status=status.HTTP_200_OK if diagnosis_id else status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, appointment_id, diagnosis_id):
        user = request.user

        # Check if the logged-in user has the appropriate role
        if user.role not in ['receptionist', 'admin', 'nurse', 'doctor']:
            return Response({"error": "You do not have permission to delete diagnoses."}, status=status.HTTP_403_FORBIDDEN)

        try:
            appointment = Appointment.objects.get(id=appointment_id)
        except Appointment.DoesNotExist:
            return Response({"error": "Appointment not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            diagnosis = Diagnosis.objects.get(id=diagnosis_id, appointment=appointment)
        except Diagnosis.DoesNotExist:
            return Response({"error": "Diagnosis not found for this appointment."}, status=status.HTTP_404_NOT_FOUND)

        # Log the deletion (optional, for audit purposes)
        log_to_db(request, "DELETE: Diagnosis", f"Diagnosis ID: {diagnosis.id}, Diagnosis Name: {diagnosis.diagnosis_name}, Diagnosis Type: {diagnosis.diagnosis_type} Appointment ID: {appointment.id}")

        # Delete the diagnosis
        diagnosis.delete()
        return Response({"message": "Diagnosis deleted successfully."}, status=status.HTTP_204_NO_CONTENT)