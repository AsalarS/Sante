from rest_framework import generics
from .serializers import UserProfileSerializer
from rest_framework.permissions import AllowAny
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.http import JsonResponse, HttpResponseForbidden
from django.shortcuts import get_object_or_404
from rest_framework import generics
from .models import UserProfile, Chat
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import myTokenObtainPairSerializer

User = get_user_model()

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

class myTokenObtainPairView(TokenObtainPairView):
    serializer_class = myTokenObtainPairSerializer
    
def get_or_create_chat(request, user_id):
    current_user = request.user
    other_user = get_object_or_404(User, id=user_id)

    # Retrieve or create chat with these two users
    chat, created = Chat.objects.get_or_create(
        participants__in=[current_user, other_user],
        defaults={'participants': [current_user, other_user]}
    )

    return JsonResponse({'chat_id': chat.id})

def get_chat_messages(request, chat_id):
    chat = get_object_or_404(Chat, id=chat_id)

    # Ensure the requesting user is a participant
    if request.user not in chat.participants.all():
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    messages = chat.messages.order_by('timestamp').values('sender', 'content', 'timestamp')
    return JsonResponse({'messages': list(messages)})