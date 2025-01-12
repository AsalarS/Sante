from django.shortcuts import get_object_or_404
from django.http import Http404, HttpResponseForbidden, JsonResponse, HttpResponseBadRequest, HttpResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from api.models import Chat, ChatMessage
from ..serializers import ChatMessageSerializer, ChatSerializer
from .ViewsGeneral import AdminPagination
from ..utilities import log_to_db
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q

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
        log_to_db(request, "CREATE: Chat", f"Chat created between {user1.email} and {user2.email}")
        return JsonResponse({
            "id": str(chat.id),
            "user1": chat.user1.email,
            "user2": chat.user2.email,
            "created_date": chat.created_date,
            "last_updated_date": chat.last_updated_date,
        })

class ChatMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, chat_id):
        # Ensure the user is authenticated
        user = request.user
        if not user.is_authenticated:
            return HttpResponse("Unauthorized", status=401)

        # Get the chat
        chat = get_object_or_404(Chat, id=chat_id)

        # Check if the user is either user1, user2, or an admin
        if chat.user1 != user and chat.user2 != user and user.role != "admin":
            return HttpResponseForbidden("You do not have permission to view these messages")

        # Get all messages in the chat
        messages = ChatMessage.objects.filter(chat=chat).order_by('timestamp')

        # Mark all messages not from the current user as read
        unread_messages = messages.exclude(sender=user).filter(is_read=False)
        unread_messages.update(is_read=True)

        message_data = [
            {
                "id": message.id,
                "sender_id": message.sender.id,
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

@authentication_classes([IsAuthenticated])
@api_view(["GET"])
def get_chats_admin(request):
    if not request.user.is_authenticated:
        return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

    if request.user.role != "admin":
        return Response(
            {"error": "Forbidden: Only admins can access this resource."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Get search query from request parameters
    search_query = request.query_params.get('search', '').strip()
    
    # Start with base queryset
    chats = Chat.objects.select_related('user1', 'user2').order_by('-created_date')
    
    # Apply search if query exists
    if search_query:
        chats = chats.filter(
            Q(user1__email__icontains=search_query) |
            Q(user2__email__icontains=search_query)
        )
    
    # Paginate the filtered results
    paginator = AdminPagination()
    result_page = paginator.paginate_queryset(chats, request)
    
    # Serialize the data
    serialized_data = ChatSerializer(result_page, many=True)
    return paginator.get_paginated_response(serialized_data.data)

@api_view(["GET"])
def get_chat_messages_admin(request, chat_id):
    if not request.user.is_authenticated:
        return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

    if request.user.role != "admin":
        return Response(
            {"error": "Forbidden: Only admins can access this resource."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Retrieve the chat
    chat = get_object_or_404(Chat, id=chat_id)

    # Get search query from request parameters
    search_query = request.query_params.get('search', '').strip()

    # Retrieve all messages for the chat
    messages = ChatMessage.objects.select_related('sender').filter(chat=chat).order_by('timestamp')

    # Apply search if query exists
    if search_query:
        messages = messages.filter(
            Q(sender__email__icontains=search_query) |
            Q(message_text__icontains=search_query)
        )

    paginator = AdminPagination()
    result_page = paginator.paginate_queryset(messages, request)
    serialized_data = ChatMessageSerializer(result_page, many=True)
    return paginator.get_paginated_response(serialized_data.data)