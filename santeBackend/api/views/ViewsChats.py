from django.shortcuts import get_object_or_404
from django.http import Http404, HttpResponseForbidden, JsonResponse, HttpResponseBadRequest, HttpResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from api.models import Chat, ChatMessage
from ..utilities import log_to_db

User = get_user_model()

class UserChatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user

        chats = Chat.objects.filter(user1=user) | Chat.objects.filter(user2=user)
        chat_data = [
            {
                "id": chat.id,
                "user1": {
                    "id": chat.user1.id,
                    "email": chat.user1.email,
                    "first_name": chat.user1.first_name,
                    "last_name": chat.user1.last_name,
                    "profile_image": chat.user1.profile_image.url if chat.user1.profile_image else None,
                    "role" : chat.user1.role,
                },
                "user2": {
                    "id": chat.user2.id,
                    "email": chat.user2.email,
                    "first_name": chat.user2.first_name,
                    "last_name": chat.user2.last_name,
                    "profile_image": chat.user2.profile_image.url if chat.user2.profile_image else None,
                    "role" : chat.user2.role,
                },
                "created_date": chat.created_date,
                "last_updated_date": chat.last_updated_date,
            }
            for chat in chats
        ]
        return JsonResponse({"chats": chat_data}, safe=False)

    
    def post(self, request):
        user1 = request.user
        if not user1.is_authenticated:
            return JsonResponse({"error": "Unauthorized"}, status=401)
        
        user2_id = request.data.get('user2_id')
        if not user2_id:
            return JsonResponse({"error": "Missing user2_id"}, status=400)
        
        if user1.id == user2_id:
            return JsonResponse({"error": "Cannot create a chat with yourself"}, status=400)
        
        try:
            user2 = get_object_or_404(User, id=user2_id)
        except Http404:
            return JsonResponse({"error": "User2 not found"}, status=400)

        chat = Chat.objects.create(user1=user1, user2=user2)
        return JsonResponse({
            "id": str(chat.id),
            "user1": chat.user1.email,
            "user2": chat.user2.email,
            "created_date": chat.created_date,
            "last_updated_date": chat.last_updated_date,
        })
    # def delete(self, request, user_id):

class ChatMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, chat_id):
        # Ensure the user is authenticated
        user = request.user
        if not user.is_authenticated:
            return HttpResponse("Unauthorized", status=401)

        # Get the chat
        chat = get_object_or_404(Chat, id=chat_id)

        # Check if the user is either user1 or user2 in the chat
        if chat.user1 != user and chat.user2 != user:
            return HttpResponseForbidden("You do not have permission to view these messages")

        # Get all messages in the chat
        messages = ChatMessage.objects.filter(chat=chat).order_by('timestamp')
        message_data = [
            {
                "id": message.id,
                "sender":{
                    "id": message.sender.id,
                    "email": message.sender.email,
                    "first_name": message.sender.first_name,
                    "last_name": message.sender.last_name,
                    "profile_image": message.sender.profile_image.url if message.sender.profile_image else None,
                    "role" : message.sender.role,
                },
                "timestamp": message.timestamp,
                "message_text": message.message_text,
                "is_read": message.is_read,
            }
            for message in messages
        ]
        return JsonResponse({"messages": message_data}, safe=False)

    def post(self, request, chat_id):
        # Ensure the user is authenticated
        user = request.user
        if not user.is_authenticated:
            return HttpResponse("Unauthorized", status=401)

        # Get the chat
        chat = get_object_or_404(Chat, id=chat_id)

        # Get the message data from the request
        data = request.POST
        message_text = data.get('message_text')
        if not message_text:
            return HttpResponseBadRequest("Missing message_text")

        # Create a new chat message
        message = ChatMessage.objects.create(
            chat=chat,
            sender=user,
            message_text=message_text
        )

        return JsonResponse({
            "id": message.id,
            "sender": message.sender.email,
            "timestamp": message.timestamp,
            "message_text": message.message_text,
            "is_read": message.is_read,
        })