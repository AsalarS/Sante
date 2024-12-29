from .models import Log
from channels.layers import get_channel_layer

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