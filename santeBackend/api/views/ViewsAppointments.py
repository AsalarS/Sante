from django.http import JsonResponse
from datetime import datetime, time, timedelta
from django.db.models import Q

from .ViewsGeneral import AdminPagination
from ..models import Employee, Appointment, Patient, UserProfile
from rest_framework.decorators import api_view
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
from ..serializers import AppointmentSerializer, AppointmentWithUserSerializer

logger = logging.getLogger(__name__)


@api_view(["GET"])
def get_schedule(request):
    """
    View to fetch the schedule of doctors and their appointments for a given day.
    Expects a 'date' parameter in the GET request (YYYY-MM-DD format).
    Filters doctors based on their available days.
    """
    date_str = request.GET.get('date')
    if not date_str:
        return JsonResponse({'success': False, 'message': 'Date parameter is required.'}, status=400)

    try:
        selected_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        # Get the day name (e.g., 'Thursday')
        day_name = selected_date.strftime('%A').lower()
    except ValueError:
        return JsonResponse({'success': False, 'message': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)

    # Filter doctors based on available days
    doctors = Employee.objects.filter(
        user__role='doctor',
        available_days__icontains=day_name
    )

    # Prepare schedule data
    schedule = []
    for doctor in doctors:
        # Get doctor's shift hours
        shift_start = doctor.shift_start or time(9, 0)  # Default to 9:00 AM
        shift_end = doctor.shift_end or time(17, 0)  # Default to 5:00 PM

        available_hours = [
            (datetime.combine(selected_date, shift_start) +
             timedelta(minutes=30 * i)).time()
            for i in range(int((datetime.combine(selected_date, shift_end) - datetime.combine(selected_date, shift_start)).seconds / 1800))
        ]

        # Get appointments for the doctor on the selected date
        appointments = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=selected_date
        )
        booked_slots = {appt.appointment_time: appt for appt in appointments}

        # Build the doctor's schedule
        doctor_schedule = {
            'doctor': {
                'id': doctor.user.id,
                'name': f"{doctor.user.first_name} {doctor.user.last_name}",
                'specialization': doctor.specialization,
                'office_number': doctor.office_number,
            },
            'slots': [
                {
                    'time': hour.strftime('%H:%M'),
                    'status': booked_slots[hour].status if hour in booked_slots else 'Available',
                    'appointment': {
                        'id': booked_slots[hour].id,
                        'patient_id': booked_slots[hour].patient.user.id,
                        'patient_first_name': booked_slots[hour].patient.user.first_name,
                        'patient_last_name': booked_slots[hour].patient.user.last_name,
                        'patient_cpr': booked_slots[hour].patient.CPR_number,
                        'patient_email': booked_slots[hour].patient.user.email,
                        'status': booked_slots[hour].status,
                    } if hour in booked_slots else None,
                }
                for hour in available_hours
            ]
        }
        schedule.append(doctor_schedule)

    return JsonResponse({'success': True, 'schedule': schedule})


class AppointmentView(APIView):
    def get(self, request, appointment_id=None):
        if not request.user.is_authenticated:
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        if request.user.role != "admin":
            return Response(
                {"error": "Forbidden: Only admins can access this resource."},
                status=status.HTTP_403_FORBIDDEN,
            )
        
        if appointment_id:
            try:
                appointment = Appointment.objects.select_related('patient', 'doctor').get(id=appointment_id)
                serializer = AppointmentWithUserSerializer(appointment)
                return Response(serializer.data)
            except Appointment.DoesNotExist:
                return Response({"error": "Appointment not found"}, status=status.HTTP_404_NOT_FOUND)
        
        appointments = Appointment.objects.select_related('patient', 'doctor').order_by('appointment_date', 'appointment_time').all()
        paginator = AdminPagination()
        result_page = paginator.paginate_queryset(appointments, request)
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
            return Response({"error": "You do not have permission to view these appointments."}, status=status.HTTP_403_FORBIDDEN)

        try:
            patient = Patient.objects.get(user__id=patient_id)
        except Patient.DoesNotExist:
            return Response({"error": "Patient not found."}, status=status.HTTP_404_NOT_FOUND)

        appointments = Appointment.objects.filter(patient=patient)
        serializer = AppointmentWithUserSerializer(appointments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
