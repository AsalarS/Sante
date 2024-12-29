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
from ..utilities import log_to_db
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from ..serializers import AppointmentSerializer

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

# @api_view(['PATCH'])
# def add_appointment(request):
#     """
#     Add or update an appointment with flexible field updates

#     Required fields:
#     - patient_id: ID of the patient
#     - doctor_id: ID of the doctor
#     - appointment_date: Date of the appointment
#     - appointment_time: Time of the appointment
#     """
#     try:
#         # Extract required fields
#         patient_id = request.data.get('patient_id')
#         doctor_id = request.data.get('doctor_id')
#         appointment_date = request.data.get('appointment_date')
#         appointment_time = request.data.get('appointment_time')
#         appointment_id = request.data.get('appointment_id')

#         # Validate required fields
#         if not all([patient_id, doctor_id, appointment_date, appointment_time]):
#             return Response({
#                 'success': False,
#                 'message': 'Patient ID, Doctor ID, Date, and Time are required'
#             }, status=status.HTTP_400_BAD_REQUEST)

#         # Retrieve patient and doctor
#         patient = get_object_or_404(Patient, pk=patient_id)
#         doctor = get_object_or_404(Employee, pk=doctor_id)

#         # Validate date and time
#         try:
#             parsed_date = timezone.datetime.strptime(appointment_date, '%Y-%m-%d').date()
#             parsed_time = timezone.datetime.strptime(appointment_time, '%H:%M').time()
#         except ValueError:
#             return Response({
#                 'success': False,
#                 'message': 'Invalid date or time format. Use YYYY-MM-DD and HH:MM'
#             }, status=status.HTTP_400_BAD_REQUEST)

#         # Check for conflicting appointments, excluding the current appointment if updating
#         existing_appointment = Appointment.objects.filter(
#             doctor=doctor,
#             appointment_date=parsed_date,
#             appointment_time=parsed_time
#         ).exclude(id=appointment_id).first()

#         print(f"Appointment ID: {appointment_id}, Doctor: {doctor_id}, Date: {appointment_date}, Time: {appointment_time}")
#         print(f"Existing appointment check: {existing_appointment}")

#         if existing_appointment:
#             return Response({
#                 'success': False,
#                 'message': 'An appointment already exists at this time'
#             }, status=status.HTTP_409_CONFLICT)

#         # Create or update appointment
#         if appointment_id:
#             appointment = get_object_or_404(Appointment, pk=appointment_id)
#             appointment.patient = patient
#             appointment.doctor = doctor
#             appointment.appointment_date = parsed_date
#             appointment.appointment_time = parsed_time
#         else:
#             appointment = Appointment.objects.create(
#                 patient=patient,
#                 doctor=doctor,
#                 appointment_date=parsed_date,
#                 appointment_time=parsed_time,
#                 status='Scheduled',
#             )

#         # Update optional fields if provided
#         optional_fields = [
#             'notes',
#             'follow_up_required',
#             'heart_rate',
#             'blood_pressure',
#             'temperature',
#             'o2_sat',
#             'resp_rate',
#             'status'
#         ]

#         for field in optional_fields:
#             if field in request.data:
#                 setattr(appointment, field, request.data.get(field))

#         appointment.save()

#         # Log successful appointment creation
#         log_to_db(request, "Appointment created/updated successfully", f"Appointment ID: {appointment.id}")

#         return Response({
#             'success': True,
#             'message': 'Appointment updated successfully',
#             'appointment_id': str(appointment.id)
#         }, status=status.HTTP_200_OK)

#     except Exception as e:
#         logger.error(f"Appointment creation error: {str(e)}")
#         return Response({
#             'success': False,
#             'message': 'An error occurred while creating the appointment'
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#         # Get all the patients data

# # Appointment from appointment id
# class AppointmentDetailView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, appointment_id):
#         user = request.user

#         # Check if the logged-in user has the appropriate role
#         if user.role not in ['doctor', 'admin', 'nurse']:
#             return Response({"error": "You do not have permission to view this appointment."}, status=status.HTTP_403_FORBIDDEN)

#         try:
#             appointment = Appointment.objects.get(id=appointment_id)
#         except Appointment.DoesNotExist:
#             return Response({"error": "Appointment not found."}, status=status.HTTP_404_NOT_FOUND)

#         serializer = AppointmentSerializer(appointment)
#         return Response(serializer.data, status=status.HTTP_200_OK)

#     def patch(self, request, appointment_id):
#         user = request.user

#         # Check if the logged-in user has the appropriate role
#         if user.role not in ['doctor', 'admin', 'nurse']:
#             return Response({"error": "You do not have permission to edit this appointment."}, status=status.HTTP_403_FORBIDDEN)

#         try:
#             appointment = Appointment.objects.get(id=appointment_id)
#         except Appointment.DoesNotExist:
#             return Response({"error": "Appointment not found."}, status=status.HTTP_404_NOT_FOUND)

#         serializer = AppointmentSerializer(appointment, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AppointmentView(APIView):
    def get(self, request, appointment_id=None):
        """
        Retrieve one or more appointments.
        If `appointment_id` is provided, fetch details of a single appointment.
        Otherwise, return a list of all appointments.
        """
        if appointment_id:
            # Fetch a single appointment
            try:
                appointment = get_object_or_404(Appointment, pk=appointment_id)
                serializer = AppointmentSerializer(appointment)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({
                    'success': False,
                    'message': f'An error occurred: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            # Fetch all appointments
            try:
                appointments = Appointment.objects.all()
                serializer = AppointmentSerializer(appointments, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({
                    'success': False,
                    'message': f'An error occurred: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        """
        Create a new appointment.
        """
        # Same implementation as before
        patient_id = request.data.get('patient_id')
        doctor_id = request.data.get('doctor_id')
        appointment_date = request.data.get('appointment_date')
        appointment_time = request.data.get('appointment_time')

        if not all([patient_id, doctor_id, appointment_date, appointment_time]):
            return Response({
                'success': False,
                'message': 'Patient ID, Doctor ID, Date, and Time are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            parsed_date = timezone.datetime.strptime(
                appointment_date, '%Y-%m-%d').date()
            parsed_time = timezone.datetime.strptime(
                appointment_time, '%H:%M').time()
            patient = get_object_or_404(Patient, pk=patient_id)
            doctor = get_object_or_404(Employee, pk=doctor_id)

            appointment = Appointment.objects.create(
                patient=patient,
                doctor=doctor,
                appointment_date=parsed_date,
                appointment_time=parsed_time,
                status='Scheduled',
            )

            return Response({
                'success': True,
                'message': 'Appointment created successfully',
                'appointment_id': str(appointment.id)
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'success': False,
                'message': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request, appointment_id=None):
        """
        Update an existing appointment.
        """
        if not appointment_id:
            return Response({
                'success': False,
                'message': 'Appointment ID is required for updating'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            appointment = get_object_or_404(Appointment, pk=appointment_id)
            serializer = AppointmentSerializer(
                appointment, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'message': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
