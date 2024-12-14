from django.http import JsonResponse
from datetime import datetime, time, timedelta
from django.db.models import Q
from ..models import Employee, Appointment, UserProfile

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