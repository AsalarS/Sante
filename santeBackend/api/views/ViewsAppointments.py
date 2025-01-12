from django.http import JsonResponse
from datetime import datetime, time, timedelta
from django.db.models import Q

from .ViewsGeneral import AdminPagination
from ..models import Employee, Appointment, Patient, UserProfile
from rest_framework.decorators import api_view, authentication_classes
from rest_framework.response import Response
import logging
from django.utils import timezone
from rest_framework import status
from django.shortcuts import get_object_or_404
from ..utilities import log_to_db
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from ..serializers import AppointmentLimitedSerializer, AppointmentSchedulerSerializer, AppointmentSerializer, AppointmentWithUserSerializer
from rest_framework.pagination import PageNumberPagination

logger = logging.getLogger(__name__)

class AdminPagination(PageNumberPagination):
    page_size = 10  # Number of appointments per page
    page_size_query_param = "page_size"

@api_view(["GET"])
def get_schedule(request):
    """
    View to fetch doctors' schedules for a given day.
    Shows all available doctors and their appointments if any.
    Expects a 'date' parameter in the GET request (YYYY-MM-DD format).
    """
    date_str = request.GET.get('date')
    if not date_str:
        return JsonResponse({'success': False, 'message': 'Date parameter is required.'}, status=400)
   
    try:
        selected_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        day_name = selected_date.strftime('%A').lower()
    except ValueError:
        return JsonResponse({'success': False, 'message': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)

    # Filter doctors based on available days
    doctors = Employee.objects.filter(
        user__role='doctor',
        available_days__icontains=day_name
    ).select_related('user')

    schedule = []
    for doctor in doctors:
        # Get appointments for the doctor on the selected date, excluding "No Show" and "Cancelled"
        appointments = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=selected_date
        ).exclude(
            status__in=["No Show", "Cancelled"]
        ).select_related('patient', 'patient__user')

        # Include doctor in schedule regardless of appointments
        doctor_schedule = {
            'doctor': {
                'id': doctor.user.id,
                'name': f"{doctor.user.first_name} {doctor.user.last_name}",
                'specialization': doctor.specialization,
                'office_number': doctor.office_number,
                'available_days': doctor.available_days,
                'shift_start': doctor.shift_start.strftime('%H:%M'),
                'shift_end': doctor.shift_end.strftime('%H:%M'),
            },
            'appointments': [
                {
                    'date': appointment.appointment_date.strftime('%Y-%m-%d'),
                    'time': appointment.appointment_time.strftime('%H:%M'),
                    'id': appointment.id,
                    'patient_id': appointment.patient.user.id,
                    'patient_first_name': appointment.patient.user.first_name,
                    'patient_last_name': appointment.patient.user.last_name,
                    'patient_cpr': appointment.patient.CPR_number,
                    'patient_email': appointment.patient.user.email,
                    'status': appointment.status,
                }
                for appointment in appointments.order_by('appointment_time')
            ]
        }
        schedule.append(doctor_schedule)

    return JsonResponse({
        'success': True,
        'date': date_str,
        'schedule': schedule
    })

class AppointmentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, appointment_id=None):
        serializer = None
        if not request.user.is_authenticated:
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        if request.user.role not in ["admin", "doctor", "nurse", "receptionist"]:
            return Response(
                {"error": "Forbidden: Only admins, doctors, nurses, and receptionists can access this resource."},
                status=status.HTTP_403_FORBIDDEN,
            )
        
        if appointment_id:
            try:
                appointment = Appointment.objects.select_related('patient', 'doctor').get(id=appointment_id)
                if request.user.role == "receptionist":
                    serializer = AppointmentLimitedSerializer(appointment)
                else:
                    serializer = AppointmentWithUserSerializer(appointment)
                return Response(serializer.data)
            except Appointment.DoesNotExist:
                return Response({"error": "Appointment not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Get search query from request parameters
        search_query = request.query_params.get('search', '').strip()
        
        # Start with base queryset
        appointments = Appointment.objects.select_related('patient', 'doctor').order_by('appointment_date', 'appointment_time').all()

        # Apply search if query exists
        if search_query:
            appointments = appointments.filter(
                Q(patient__user__email__icontains=search_query) |
                Q(doctor__user__email__icontains=search_query) |
                Q(status__icontains=search_query)
            )
        
        paginator = AdminPagination()
        result_page = paginator.paginate_queryset(appointments, request)
        if request.user.role == "receptionist":
            serializer = AppointmentLimitedSerializer(result_page, many=True)
        else:
            serializer = AppointmentWithUserSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = AppointmentSerializer(data=request.data)
        if serializer.is_valid():
            appointment = serializer.save()
            log_to_db(request, "CREATE: Appointment", f"Created appointment {appointment.id} by {request.user.email}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, appointment_id):
        if not appointment_id:
            return Response({"error": "Appointment ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        if not request.user.is_authenticated:
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        if request.user.role not in ["receptionist", "doctor", "admin", "nurse"]:
            return Response(
                {"error": "Forbidden: Only employees can access this resource."},
                status=status.HTTP_403_FORBIDDEN,
            )

        appointment = get_object_or_404(Appointment, id=appointment_id)
        data = request.data.copy()
        # Remove nested fields from the data
        data.pop('patient', None)
        data.pop('doctor', None)
        
        serializer = AppointmentSerializer(appointment, data=data, partial=True)
        if serializer.is_valid():
            appointment = serializer.save()
            log_to_db(request, "UPDATE: Appointment", f"Updated appointment {appointment.id} by {request.user.email}")
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PatientAppointmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, patient_id):
        user = request.user

        # Check if the logged-in user is the patient or has a role of receptionist, doctor, or nurse
        if user.role not in ['patient', 'receptionist', 'doctor', 'nurse'] and user.id != patient_id:
            return Response({"error": "You do not have permission to view these appointments."}, 
                          status=status.HTTP_403_FORBIDDEN)

        try:
            patient = Patient.objects.get(user__id=patient_id)
        except Patient.DoesNotExist:
            return Response({"error": "Patient not found."}, 
                          status=status.HTTP_404_NOT_FOUND)

        # Get query parameters
        search_query = request.query_params.get('search', '').strip()
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')

        # Start with base queryset
        appointments = Appointment.objects.filter(patient=patient)

        # Apply search if query exists
        if search_query:
            appointments = appointments.filter(
                Q(doctor__user__first_name__icontains=search_query) |
                Q(doctor__user__last_name__icontains=search_query) |
                Q(doctor__user__email__icontains=search_query) |
                Q(status__icontains=search_query)
            )

        # Apply date filtering
        try:
            if date_from:
                appointments = appointments.filter(appointment_date__gte=date_from)
            if date_to:
                appointments = appointments.filter(appointment_date__lte=date_to)
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, 
                          status=status.HTTP_400_BAD_REQUEST)

        serializer = AppointmentWithUserSerializer(appointments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class DoctorAppointmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id=None):
        user = request.user

        # Ensure the user is a doctor or an admin
        if user.role not in ['doctor', 'admin', 'receptionist']:
            return Response(
                {"error": "Only doctors, receptionists or, admins can view the schedule."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # If user_id is provided, fetch appointments for that specific doctor
        if user_id:
            try:
                doctor_user = UserProfile.objects.get(id=user_id, role='doctor')
            except UserProfile.DoesNotExist:
                return Response({"error": "Doctor not found."}, status=status.HTTP_404_NOT_FOUND)
        else:
            # If no user_id is provided, fetch appointments for the logged-in doctor
            doctor_user = user

        # Fetch appointments assigned to the doctor
        appointments = Appointment.objects.filter(doctor__user=doctor_user)

        # Serialize and return the data
        serializer = AppointmentSchedulerSerializer(appointments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)