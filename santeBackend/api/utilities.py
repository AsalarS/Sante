from datetime import timedelta
from django.utils import timezone
from .models import Appointment, CarePlan, Employee, Log, Patient, Prescription, UserProfile
from channels.layers import get_channel_layer
from django.template.loader import render_to_string
from django.templatetags.static import static
from django.db.models import Count
from weasyprint import HTML, CSS
import tempfile

def log_to_db(request, action, description=""):
    """
    Logs an activity for the current user.

    Args:
        request (HttpRequest): The HTTP request object.
        action (str): A brief description of the action performed.
        description (str): Optional detailed description of the activity.
    """
    if request.user.is_authenticated:
        ip_address = get_client_ip(request)
        Log.objects.create(
            user=request.user,
            action=action,
            ip_address=ip_address,
            description=description,
        )

def get_client_ip(request):
    """
    Retrieves the client's IP address from the request.

    Args:
        request (HttpRequest): The HTTP request object.

    Returns:
        str: The client's IP address.
    """
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0]
    else:
        ip = request.META.get("REMOTE_ADDR")
    return ip

def send_notification(user, message):
    """
    Sends a notification to a specific user via WebSockets.
    The user should be authenticated and have an active WebSocket connection.
    """
    channel_layer = get_channel_layer()
    # Send the notification to the user's notification group
    channel_layer.group_send(
        f'notification_{user.id}',  # Notification group for the user
        {
            'type': 'send_notification',
            'notification': message,  # The message to send
        }
    )
    
class AdminSystemReportGenerator:
    @staticmethod
    def generate_system_stats():
        today = timezone.now()
        thirty_days_ago = today - timedelta(days=30)
        
        # User Statistics
        total_users = UserProfile.objects.count()
        users_by_role = dict(UserProfile.objects.values_list('role').annotate(count=Count('id')))
        
        # Patient Statistics
        patients = Patient.objects.all()
        total_patients = patients.count()
        patients_by_blood_type = dict(patients.exclude(blood_type__isnull=True)
                                    .values_list('blood_type').annotate(count=Count('user_id')))
        
        # Employee Statistics
        employees = Employee.objects.all()
        total_employees = employees.count()
        doctors = employees.filter(user__role='doctor').count()
        nurses = employees.filter(user__role='nurse').count()
        
        # Appointment Statistics
        appointments = Appointment.objects.all()
        total_appointments = appointments.count()
        appointments_last_30_days = appointments.filter(appointment_date__gte=thirty_days_ago).count()
        appointments_by_status = dict(appointments.values_list('status').annotate(count=Count('id')))
        
        # Prescription Statistics
        total_prescriptions = Prescription.objects.count()
        prescriptions_last_30_days = Prescription.objects.filter(
            appointment__appointment_date__gte=thirty_days_ago
        ).count()
        
        # Care Plan Statistics
        care_plans = CarePlan.objects.all()
        total_care_plans = care_plans.count()
        care_plans_by_type = dict(care_plans.values_list('care_plan_type').annotate(count=Count('id')))
        
        # System Activity
        total_logs = Log.objects.count()
        logs_last_30_days = Log.objects.filter(timestamp__gte=thirty_days_ago).count()
        
        return {
            'generated_at': today,
            'user_stats': {
                'total_users': total_users,
                'users_by_role': users_by_role,
            },
            'patient_stats': {
                'total_patients': total_patients,
                'patients_by_blood_type': patients_by_blood_type,
            },
            'employee_stats': {
                'total_employees': total_employees,
                'doctors': doctors,
                'nurses': nurses,
            },
            'appointment_stats': {
                'total_appointments': total_appointments,
                'appointments_last_30_days': appointments_last_30_days,
                'appointments_by_status': appointments_by_status,
            },
            'prescription_stats': {
                'total_prescriptions': total_prescriptions,
                'prescriptions_last_30_days': prescriptions_last_30_days,
            },
            'care_plan_stats': {
                'total_care_plans': total_care_plans,
                'care_plans_by_type': care_plans_by_type,
            },
            'system_activity': {
                'total_logs': total_logs,
                'logs_last_30_days': logs_last_30_days,
            }
        }

    @staticmethod
    def generate_pdf_report():
        stats = AdminSystemReportGenerator.generate_system_stats()
        banner_path = static('assets/banner.png')
        html_string = render_to_string('admin_system_report.html', {'stats': stats, 'banner_path': f"http://sante.alialfardan.com/assets/banner.png"})
        
        html = HTML(string=html_string)
        return html.write_pdf(stylesheets=[
            CSS(string='''
                @page { 
                    size: letter; 
                    margin: 2.5cm;
                    @top-right {
                        content: "Page " counter(page) " of " counter(pages);
                    }
                }
                body { font-family: Arial, sans-serif; }
                .header { text-align: center; margin-bottom: 30px; }
                .section { margin-bottom: 25px; }
                .stats-grid { 
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }
                .stat-box {
                    border: 1px solid #ddd;
                    padding: 15px;
                    border-radius: 5px;
                }
                .chart-container { margin: 20px 0; }
                table { 
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                th { background-color: #f5f5f5; }
            ''')
        ])