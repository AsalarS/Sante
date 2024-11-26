from rest_framework import generics
from rest_framework.decorators import api_view
from .serializers import *
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.http import JsonResponse
from rest_framework import generics
from .models import *
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
import logging

logger = logging.getLogger(__name__)

# Create your views here.

class CreateUserView(generics.CreateAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


@api_view(['GET'])
def get_users(request):  # List users
    if not request.user.is_authenticated:
        return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

    users = UserProfile.objects.all().values(
        'id', 'email', 'first_name', 'last_name', 'role', 'profile_image')
    serializedData = UserSerializer(users, many=True)
    return JsonResponse(serializedData.data, safe=False)

# To Get all user information. ONLY FOR ADMIN
@api_view(['GET'])
def get_users_admin(request):
    if not request.user.is_authenticated:
        return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

    if request.user.role != 'admin':
        return Response({"error": "Forbidden: Only admins can access this resource."}, status=status.HTTP_403_FORBIDDEN)

    # Fetch all user fields for all users
    users = UserProfile.objects.all().values(
        'id', 'email', 'first_name', 'last_name', 'role', 'profile_image',
        'gender', 'date_of_birth', 'phone_number', 'address'
    )
    serializedData = UserSerializer(users, many=True)
    return JsonResponse(serializedData.data, safe=False)

@api_view(['GET'])
def get_patients(request):
    if not request.user.is_authenticated:
        return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

    patients = Patient.objects.all().values(
        'user__id', 'user__email', 'user__first_name', 'user__last_name', 'user__role', 'user__profile_image',
        'medical_record_id', 'emergency_contact_name', 'emergency_contact_phone', 'blood_type',
        'chronic_conditions', 'family_history'
    )
    serializedData = PatientSerializer(patients, many=True)
    return JsonResponse(serializedData.data, safe=False)

@api_view(['GET'])
def get_logs_admin(request):
    if not request.user.is_authenticated:
        return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

    if request.user.role != 'admin':
        return Response({"error": "Forbidden: Only admins can access this resource."}, status=status.HTTP_403_FORBIDDEN)

    logs = Log.objects.all().values(
        'id', 'user', 'action', 'timestamp', 'ip_address', 'description'
    )
    serializedData = LogSerializer(logs, many=True)
    return JsonResponse(serializedData.data, safe=False)


@api_view(['DELETE'])
def delete_user_admin(request, user_id):
    try:
        user = UserProfile.objects.get(id=user_id)
        user.delete()
        logger.info(f"Admin {request.user.id} deleted user {user_id}.")
        return JsonResponse({"message": "User deleted successfully."}, status=status.HTTP_200_OK)
    except UserProfile.DoesNotExist:
        logger.warning(f"Admin {request.user.id} attempted to delete non-existent user {user_id}.")
        return JsonResponse({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error deleting user {user_id} by admin {request.user.id}: {e}")
        return JsonResponse({"error": "An error occurred while deleting the user."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # The request.user will contain the logged-in user's data
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        # partial=True allows partial updates to certain fields
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
