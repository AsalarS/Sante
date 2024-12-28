from .models import Log

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