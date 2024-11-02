from rest_framework import generics
from .serializers import UserProfileSerializer
from rest_framework.permissions import AllowAny
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponseForbidden
from rest_framework import generics
from .models import UserProfile
from django.http import JsonResponse

# Create your views here.

class CreateUserView(generics.CreateAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [AllowAny]


@login_required
def user_dashboard(request):
    role = request.user.role
    # Pass user role to the frontend to route pages accordingly
    return JsonResponse({'role': role})


@login_required
def doctor_dashboard(request):
    if request.user.role == 'doctor':
        # Serve JSON response
        return JsonResponse({'message': 'Welcome to the doctor dashboard'})
    else:
        return HttpResponseForbidden("You do not have permission to view this page.")


@login_required
def admin_dashboard(request):
    if request.user.role == 'admin':
        # Handle admin-specific logic
        return JsonResponse({'message': 'Welcome to the admin dashboard'})
    else:
        return HttpResponseForbidden("You do not have permission to view this page.")

@login_required
def user_info(request):
    user = request.user
    return JsonResponse({
        'id': user.id,
        'email': user.email,
        'role': user.role,
        'first_name': user.first_name,
        'last_name': user.last_name
    })
