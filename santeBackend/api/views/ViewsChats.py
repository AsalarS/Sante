from django.shortcuts import get_object_or_404
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from api.models import Chat
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
                "user1": chat.user1.email,
                "user2": chat.user2.email,
                "created_date": chat.created_date,
                "last_updated_date": chat.last_updated_date,
            }
            for chat in chats
        ]
        return JsonResponse({"chats": chat_data}, safe=False)

    def post(self, request):
        user1 = request.user
        if not user1.is_authenticated:
            return HttpResponse("Unauthorized", status=401)
        
        data = request.POST
        user2_id = data.get('user2_id')
        if not user2_id:
            return HttpResponseBadRequest("Missing user2_id")
        
        user2 = get_object_or_404(User, id=user2_id)
        chat = Chat.objects.create(user1=user1, user2=user2)
        return JsonResponse({
            "id": str(chat.id),
            "user1": chat.user1.email,
            "user2": chat.user2.email,
            "created_date": chat.created_date,
            "last_updated_date": chat.last_updated_date,
        })

    # def delete(self, request, user_id):
        