from rest_framework import generics
from .serializers import UserSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.http import JsonResponse
from rest_framework import generics
from .models import UserProfile
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView

# Create your views here.

class CreateUserView(generics.CreateAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

def get_users(request):  # List users
    if not request.user.is_authenticated:
        return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
    
    users = UserProfile.objects.all().values(
        'id', 'email', 'first_name', 'last_name', 'role', 'profile_image')
    serializedData = UserSerializer(users, many=True)
    return JsonResponse(serializedData.data, safe=False)

class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # The request.user will contain the logged-in user's data
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)