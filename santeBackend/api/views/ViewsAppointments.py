from django.http import JsonResponse
from datetime import datetime, time, timedelta
from django.db.models import Q
from ..models import Employee, Appointment, Patient
from rest_framework.decorators import api_view
from rest_framework.response import Response
import logging
from django.utils import timezone
from rest_framework import status
from django.shortcuts import get_object_or_404

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
            (datetime.combine(selected_date, shift_start) + timedelta(minutes=30 * i)).time()
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
                    'status': 'Booked' if hour in booked_slots else 'Available',
                    'appointment': {
                        'id': booked_slots[hour].id,
                        'patient_name': f"{booked_slots[hour].patient.first_name} {booked_slots[hour].patient.last_name}",
                        'status': booked_slots[hour].status,
                    } if hour in booked_slots else None,
                }
                for hour in available_hours
            ]
        }
        schedule.append(doctor_schedule)
    
    return JsonResponse({'success': True, 'schedule': schedule})

@api_view(['PATCH'])
def add_appointment(request):
    """
    Add or update an appointment with flexible field updates
    
    Required fields:
    - patient_id: ID of the patient
    - doctor_id: ID of the doctor
    - appointment_date: Date of the appointment
    - appointment_time: Time of the appointment
    """
    try:
        # Extract required fields
        patient_id = request.data.get('patient_id')
        doctor_id = request.data.get('doctor_id')
        appointment_date = request.data.get('appointment_date')
        appointment_time = request.data.get('appointment_time')

        # Print the received data
        print(f"Received data: patient_id={patient_id}, doctor_id={doctor_id}, appointment_date={appointment_date}, appointment_time={appointment_time}")
        
        # Validate required fields
        if not all([patient_id, doctor_id, appointment_date, appointment_time]):
            return Response({
                'success': False, 
                'message': 'Patient ID, Doctor ID, Date, and Time are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Retrieve patient and doctor
        patient = get_object_or_404(Patient, pk=patient_id)
        doctor = get_object_or_404(Employee, pk=doctor_id)
        
        # Validate date and time
        try:
            parsed_date = timezone.datetime.strptime(appointment_date, '%Y-%m-%d').date()
            parsed_time = timezone.datetime.strptime(appointment_time, '%H:%M').time()
        except ValueError:
            return Response({
                'success': False, 
                'message': 'Invalid date or time format. Use YYYY-MM-DD and HH:MM'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check for conflicting appointments
        existing_appointment = Appointment.objects.filter(
            doctor=doctor, 
            appointment_date=parsed_date, 
            appointment_time=parsed_time
        ).first()
        
        if existing_appointment:
            return Response({
                'success': False, 
                'message': 'An appointment already exists at this time'
            }, status=status.HTTP_409_CONFLICT)
        
        # Create new appointment with 'Scheduled' status
        appointment = Appointment.objects.create(
            patient=patient,
            doctor=doctor,
            appointment_date=parsed_date,
            appointment_time=parsed_time,
            status='Scheduled'  # Explicitly set to 'Scheduled' as per your choices
        )
        
        # Update optional fields if provided
        optional_fields = [
            'notes', 
            'follow_up_required', 
            'heart_rate', 
            'blood_pressure', 
            'temperature', 
            'o2_sat', 
            'resp_rate'
        ]
        
        for field in optional_fields:
            if field in request.data:
                setattr(appointment, field, request.data.get(field))
        
        appointment.save()
        
        return Response({
            'success': True, 
            'message': 'Appointment created successfully',
            'appointment_id': str(appointment.id)
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        logger.error(f"Appointment creation error: {str(e)}")
        return Response({
            'success': False, 
            'message': 'An error occurred while creating the appointment'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)