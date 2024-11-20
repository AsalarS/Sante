from rest_framework import serializers
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Log, Patient

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", 'email', "password", "role", 'first_name', 'last_name', 'profile_image', 'gender', 'date_of_birth', 'phone_number', 'address']
        extra_kwargs = {"password": {"write_only": True}, 
                        "role": {"required": True},
                        "profile_image": {"required": False}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class LogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Log
        fields = '__all__'
        
class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'
# # Serializer to handle input and update logic
# class UserProfileSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ['email', 'first_name', 'last_name']
        
#     def update(self, instance, validated_data):
#         # Update the instance with new data
#         instance.email = validated_data.get('email', instance.email)
#         instance.first_name = validated_data.get('first_name', instance.first_name)
#         instance.last_name = validated_data.get('last_name', instance.last_name)
        
#         # Save changes to the database
#         instance.save()
#         return instance

#     def create(self, validated_data):
#         password = validated_data.pop('password', None)
#         user = UserProfile(**validated_data)
#         if password:
#             user.set_password(password)  # Hash the password
#         user.save()
#         return user
