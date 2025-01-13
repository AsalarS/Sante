import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Q, DateField
from django.utils import timezone
from datetime import timedelta
from django.db.models.functions import Cast
from ..serializers import AppointmentLimitedSerializer, AppointmentSerializer, PatientAppointmentSerializer
from ..models import Appointment, CarePlan, Diagnosis, Employee, Prescription

logger = logging.getLogger(__name__)


class AdminDashboardStatsView(APIView):
    def get(self, request):

        if request.user.role != 'admin':
            return Response({
                'error': 'Unauthorized'
            }, status=status.HTTP_401_UNAUTHORIZED)

        today = timezone.now().date()
        week_start = today - timedelta(days=7)

        # Get counts for today
        todays_appointments = Appointment.objects.filter(
            appointment_date=today
        ).count()

        completed_appointments = Appointment.objects.filter(
            appointment_date=today,
            status='Completed'
        ).count()

        # Get new vs returning patients for today
        todays_patients = Appointment.objects.filter(
            appointment_date=today
        ).values('patient').distinct()

        # Count patients with their first appointment today
        new_patients = 0
        returning_patients = 0

        for patient in todays_patients:
            first_appointment = Appointment.objects.filter(
                patient=patient['patient']
            ).order_by('appointment_date').first()

            if first_appointment and first_appointment.appointment_date == today:
                new_patients += 1
            else:
                returning_patients += 1

        # Calculate average daily appointments for the past week
        past_week_appointments = Appointment.objects.filter(
            appointment_date__range=[week_start, today]
        ).values('appointment_date').annotate(
            count=Count('id')
        )

        total_appointments = sum(day['count']
                                 for day in past_week_appointments)
        avg_daily_appointments = round(
            total_appointments / 7, 1)  # Round to 1 decimal place

        return Response({
            'todays_appointments': todays_appointments,
            'completed_appointments': completed_appointments,
            'new_patients': new_patients,
            'returning_patients': returning_patients,
            'avg_daily_appointments': avg_daily_appointments
        })


class AdminAppointmentsChartView(APIView):
    def get(self, request):

        if request.user.role != 'admin':
            return Response({
                'error': 'Unauthorized'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Get data for the last 6 months
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=180)

        appointments = Appointment.objects.filter(
            appointment_date__range=[start_date, end_date]
        ).annotate(
            date=Cast('appointment_date', DateField())
        ).values('date').annotate(
            count=Count('id')
        ).order_by('date')

        # Format data for the chart
        chart_data = [
            {
                'date': appointment['date'].isoformat(),
                'appointments': appointment['count']
            }
            for appointment in appointments
        ]

        return Response(chart_data)


class AdminAppointmentStatusPie(APIView):
    def get(self, request):
        if request.user.role != 'admin':
            return Response({
                'error': 'Unauthorized'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Get data for the last 6 months
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=180)

        # Get appointments within date range and count by status
        appointments = Appointment.objects.filter(
            appointment_date__range=[start_date, end_date]
        ).values('status').annotate(
            count=Count('status')
        )

        # Format data in the same structure as doctor performance
        chart_data = [
            {
                # Using 'browser' to match existing format
                'appointments': status['status'],
                # Using 'visitors' to match existing format
                'count': status['count']
            }
            for status in appointments
        ]

        # Calculate total appointments
        total_appointments = sum(item['count'] for item in chart_data)

        response_data = {
            'chart_data': chart_data,
            'total_appointments': total_appointments,
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            }
        }

        return Response(response_data)


class AdminDoctorPerformanceView(APIView):
    def get(self, request):
        if request.user.role != 'admin':
            return Response({
                'error': 'Unauthorized'
            }, status=status.HTTP_401_UNAUTHORIZED)

        doctors = Employee.objects.filter(user__role='doctor')
        performance_data = []

        for doctor in doctors:
            # Get appointment statistics for each doctor
            appointments = Appointment.objects.filter(doctor=doctor)
            status_counts = appointments.values('status').annotate(
                count=Count('status')
            )

            # Convert to the format needed for the pie chart
            chart_data = []
            for status in status_counts:
                chart_data.append({
                    'browser': status['status'],
                    'visitors': status['count']
                })

            performance_data.append({
                'doctor_name': f"{doctor.user.first_name} {doctor.user.last_name}",
                'specialization': doctor.specialization,
                'office_number': doctor.office_number,
                'total_appointments': appointments.count(),
                'chart_data': chart_data
            })

        return Response(performance_data)


class AdminPastWeekAppointmentsView(APIView):
    def get(self, request):

        if request.user.role != 'admin':
            return Response({
                'error': 'Unauthorized'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Get search parameter
        search_query = request.query_params.get('search', '').strip()

        # Calculate date range for past week
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=7)

        # Base query
        appointments = Appointment.objects.filter(
            appointment_date__range=[start_date, end_date]
        )

        # Apply search if provided
        if search_query:
            appointments = appointments.filter(
                Q(patient__user__first_name__icontains=search_query) |
                Q(patient__user__last_name__icontains=search_query) |
                Q(patient__medical_record_id__icontains=search_query)
            )

        # Get all appointment data with patient information
        serializer = PatientAppointmentSerializer(appointments, many=True)

        return Response(serializer.data)

# Doctor


class DoctorDashboardStatsView(APIView):
    def get(self, request):
        if request.user.role != 'doctor':
            return Response({
                'error': 'Unauthorized'
            }, status=status.HTTP_401_UNAUTHORIZED)

        doctor_id = request.user.id
        today = timezone.now().date()

        # Get today's appointment count
        todays_appointments = Appointment.objects.filter(
            doctor_id=doctor_id,
            appointment_date=today
        ).count()

        # Get completed appointments for today
        completed_appointments = Appointment.objects.filter(
            doctor_id=doctor_id,
            appointment_date=today,
            status='Completed'
        ).count()

        # Get total patients seen this week
        week_start = today - timedelta(days=7)
        patients_this_week = Appointment.objects.filter(
            doctor_id=doctor_id,
            appointment_date__range=[week_start, today],
            status='Completed'
        ).values('patient').distinct().count()

        # Get follow-up rate (appointments marked as follow_up_required)
        recent_appointments = Appointment.objects.filter(
            doctor_id=doctor_id,
            appointment_date__range=[week_start, today],
            status='Completed'
        )
        total_recent = recent_appointments.count()
        follow_ups = recent_appointments.filter(
            follow_up_required=True).count()
        follow_up_rate = round(
            (follow_ups / total_recent * 100) if total_recent > 0 else 0, 1)

        return Response({
            'todays_appointments': todays_appointments,
            'completed_today': completed_appointments,
            'patients_this_week': patients_this_week,
            'follow_up_rate': follow_up_rate
        })


class DoctorNextAppointmentsView(APIView):
    def get(self, request):
        if request.user.role != 'doctor':
            return Response({
                'error': 'Unauthorized'
            }, status=status.HTTP_401_UNAUTHORIZED)

        doctor_id = request.user.id
        today = timezone.now().date()
        current_time = timezone.now().time()

        # Get the latest upcoming appointment
        latest_appointment = Appointment.objects.filter(
            doctor_id=doctor_id,
            appointment_date__gte=today,
            status='Scheduled'
        ).select_related('patient__user').order_by('appointment_date', 'appointment_time').first()

        # If it's today, ensure the appointment is in the future
        if latest_appointment and latest_appointment.appointment_date == today and latest_appointment.appointment_time <= current_time:
            latest_appointment = None

        # Prepare response data
        if latest_appointment:
            appointment_data = {
                'appointment_id': latest_appointment.id,
                'patient_name': f"{latest_appointment.patient.user.first_name} {latest_appointment.patient.user.last_name}",
                'patient_dob': latest_appointment.patient.user.date_of_birth,
                'patient_gender': latest_appointment.patient.user.gender,
                'patient_blood_type': latest_appointment.patient.blood_type,
                'appointment_date': latest_appointment.appointment_date,
                'appointment_time': latest_appointment.appointment_time
            }
            return Response(appointment_data)
        else:
            return Response({
                'message': 'No upcoming appointments found'
            }, status=status.HTTP_204_NO_CONTENT)


class DoctorAppointmentsChartView(APIView):
    def get(self, request):
        if request.user.role != 'doctor':
            return Response({
                'error': 'Unauthorized'
            }, status=status.HTTP_401_UNAUTHORIZED)

        doctor_id = request.user.id

        # Get data for the last 6 months
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=180)

        appointments = Appointment.objects.filter(
            doctor_id=doctor_id,
            appointment_date__range=[start_date, end_date]
        ).annotate(
            date=Cast('appointment_date', DateField())
        ).values('date').annotate(
            count=Count('id')
        ).order_by('date')

        # Format data for the chart
        chart_data = [
            {
                'date': appointment['date'].isoformat(),
                'appointments': appointment['count']
            }
            for appointment in appointments
        ]

        return Response(chart_data)


class DoctorAppointmentStatusPieView(APIView):
    def get(self, request):
        if request.user.role != 'doctor':
            return Response({
                'error': 'Unauthorized'
            }, status=status.HTTP_401_UNAUTHORIZED)

        doctor_id = request.user.id

        # Get data for the last 6 months
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=180)

        # Get appointments within date range and count by status
        appointments = Appointment.objects.filter(
            doctor_id=doctor_id,
            appointment_date__range=[start_date, end_date]
        ).values('status').annotate(
            count=Count('status')
        )

        # Format data for the pie chart
        chart_data = [
            {
                'appointments': status['status'],
                'count': status['count']
            }
            for status in appointments
        ]

        # Calculate total appointments
        total_appointments = sum(item['count'] for item in chart_data)

        response_data = {
            'chart_data': chart_data,
            'total_appointments': total_appointments,
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            }
        }

        return Response(response_data)


class DoctorPastWeekAppointmentsView(APIView):
    def get(self, request):
        if request.user.role != 'doctor':
            return Response({
                'error': 'Unauthorized'
            }, status=status.HTTP_401_UNAUTHORIZED)

        doctor_id = request.user.id

        # Get search parameter
        search_query = request.query_params.get('search', '').strip()

        # Calculate date range for past week
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=7)

        # Base query
        appointments = Appointment.objects.filter(
            doctor_id=doctor_id,
            appointment_date__range=[start_date, end_date]
        )

        # Apply search if provided
        if search_query:
            appointments = appointments.filter(
                Q(patient__user__first_name__icontains=search_query) |
                Q(patient__user__last_name__icontains=search_query) |
                Q(patient__medical_record_id__icontains=search_query)
            )

        # Get all appointment data with patient information
        serializer = PatientAppointmentSerializer(appointments, many=True)

        return Response(serializer.data)

    # Patient


class PatientStatsView(APIView):
    def get(self, request):
        if request.user.role != 'patient':
            return Response({
                'error': 'Unauthorized'
            }, status=status.HTTP_401_UNAUTHORIZED)

        patient_id = request.user.id

        total_appointments = Appointment.objects.filter(
            patient_id=patient_id).count()
        completed_appointments = Appointment.objects.filter(
            patient_id=patient_id, status='Completed').count()
        canceled_appointments = Appointment.objects.filter(
            patient_id=patient_id, status='Cancelled').count()

        stats = {
            'total_appointments': total_appointments,
            'completed_appointments': completed_appointments,
            'canceled_appointments': canceled_appointments,
        }

        return Response(stats, status=status.HTTP_200_OK)


class PatientNextAppointmentView(APIView):
    def get(self, request):
        if request.user.role != 'patient':
            return Response({
                'error': 'Unauthorized'
            }, status=status.HTTP_401_UNAUTHORIZED)

        patient_id = request.user.id
        today = timezone.now().date()
        current_time = timezone.now().time()

        next_appointment = Appointment.objects.filter(
            patient_id=patient_id,
            appointment_date__gte=today,
            status='Scheduled'
        ).order_by('appointment_date', 'appointment_time').first()

        if next_appointment and next_appointment.appointment_date == today and next_appointment.appointment_time <= current_time:
            next_appointment = None

        if next_appointment:
            appointment_data = {
                'appointment_id': next_appointment.id,
                'doctor_name': f"{next_appointment.doctor.user.first_name} {next_appointment.doctor.user.last_name}",
                'appointment_date': next_appointment.appointment_date,
                'appointment_time': next_appointment.appointment_time,
                'office_number': next_appointment.doctor.office_number,
                'specialization': next_appointment.doctor.specialization
            }
            return Response(appointment_data, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'No upcoming appointments found'}, status=status.HTTP_204_NO_CONTENT)


class PatientPreviousDoctorsView(APIView):
    def get(self, request):
        if request.user.role != 'patient':
            return Response({
                'error': 'Unauthorized'
            }, status=status.HTTP_401_UNAUTHORIZED)

        patient_id = request.user.id

        previous_doctors = Appointment.objects.filter(patient_id=patient_id).values(
            'doctor__user__first_name',
            'doctor__user__last_name',
            'doctor__specialization',
            'doctor__office_number'
        ).distinct()

        doctor_list = [
            {
                'first_name': doctor['doctor__user__first_name'],
                'last_name': doctor['doctor__user__last_name'],
                'specialization': doctor['doctor__specialization'],
                'office_number': doctor['doctor__office_number']
            }
            for doctor in previous_doctors
        ]

        return Response(doctor_list, status=status.HTTP_200_OK)


class PatientAppointmentsPieChartView(APIView):
    def get(self, request):
        if request.user.role != 'patient':
            return Response({
                'error': 'Unauthorized'
            }, status=status.HTTP_401_UNAUTHORIZED)

        patient_id = request.user.id

        appointment_data = Appointment.objects.filter(
            patient_id=patient_id).values('status').annotate(count=Count('status'))

        pie_chart_data = [
            {
                'status': data['status'],
                'count': data['count']
            }
            for data in appointment_data
        ]
        
        reponse_data = {
            'chart_data': pie_chart_data,
            'total_appointments': sum(item['count'] for item in pie_chart_data)
        }

        return Response(reponse_data, status=status.HTTP_200_OK)
    
class PatientCarePlansView(APIView):
    def get(self, request):
        if request.user.role != 'patient':
            return Response({
                'error': 'Unauthorized'
            }, status=status.HTTP_401_UNAUTHORIZED)

        patient_id = request.user.id

        # Retrieve care plans for appointments related to the patient
        care_plans = CarePlan.objects.filter(appointment__patient_id=patient_id).select_related('done_by', 'done_by__user').values(
            'care_plan_title',
            'care_plan_type',
            'date_of_completion',
            'done_by__user__first_name',
            'done_by__user__last_name',
            'additional_instructions'
        )

        care_plan_list = [
            {
                'care_plan_title': plan['care_plan_title'],
                'care_plan_type': plan['care_plan_type'],
                'date_of_completion': plan['date_of_completion'],
                'done_by': f"{plan['done_by__user__first_name']} {plan['done_by__user__last_name']}",
                'additional_instructions': plan['additional_instructions']
            }
            for plan in care_plans
        ]

        return Response(care_plan_list, status=status.HTTP_200_OK)

class PatientDiagnosesView(APIView):
    def get(self, request):
        if request.user.role != 'patient':
            return Response({
                'error': 'Unauthorized'
            }, status=status.HTTP_401_UNAUTHORIZED)

        patient_id = request.user.id

        # Retrieve diagnoses for appointments related to the patient
        diagnoses = Diagnosis.objects.filter(appointment__patient_id=patient_id).values(
            'diagnosis_name',
            'diagnosis_type',
        )

        diagnosis_list = [
            {
                'diagnosis_name': diag['diagnosis_name'],
                'diagnosis_type': diag['diagnosis_type'],
            }
            for diag in diagnoses
        ]

        return Response(diagnosis_list, status=status.HTTP_200_OK)

class PatientPrescriptionsView(APIView):
    def get(self, request):
        if request.user.role != 'patient':
            return Response({
                'error': 'Unauthorized'
            }, status=status.HTTP_401_UNAUTHORIZED)

        patient_id = request.user.id

        # Retrieve prescriptions for appointments related to the patient
        prescriptions = Prescription.objects.filter(appointment__patient_id=patient_id).values(
            'medication_name',
            'dosage',
            'duration',
            'special_instructions',
            'appointment__appointment_date',
            'appointment__appointment_time'
        )

        prescription_list = [
            {
                'medication_name': pres['medication_name'],
                'dosage': pres['dosage'],
                'duration': pres['duration'],
                'special_instructions': pres['special_instructions'],
                'appointment_date': pres['appointment__appointment_date'],
                'appointment_time': pres['appointment__appointment_time']
            }
            for pres in prescriptions
        ]

        return Response(prescription_list, status=status.HTTP_200_OK)
