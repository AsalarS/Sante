from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", 'email', "password", "role"]
        extra_kwargs = {"password": {"write_only": True}, 
                        "role": {"required": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

from rest_framework import serializers
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["id", "email", "password", "role"]
        extra_kwargs = {
            "password": {"write_only": True},
            "role": {"required": True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = UserProfile(**validated_data)
        if password:
            user.set_password(password)  # Hash the password
        user.save()
        return user
 
class myTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['role'] = user.role
        return token
