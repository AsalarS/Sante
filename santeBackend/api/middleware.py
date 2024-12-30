import logging
from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from django.db import close_old_connections
from rest_framework_simplejwt.tokens import AccessToken
from asgiref.sync import sync_to_async
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

logger = logging.getLogger(__name__)

class SimpleJWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        try:
            # Close old database connections
            await sync_to_async(close_old_connections)()

            # Extract token from query string
            query_string = scope.get('query_string', b'').decode('utf-8')
            token = await self.extract_token(query_string)
            
            if not token:
                scope['user'] = AnonymousUser()
                return await self.inner(scope, receive, send)

            # Authenticate user
            user = await self.get_authenticated_user(token)
            
            if not user:
                scope['user'] = AnonymousUser()
                return await self.inner(scope, receive, send)

            # Add the authenticated user to the scope
            scope['user'] = user
            
            return await self.inner(scope, receive, send)

        except Exception as e:
            logging.error(f"Middleware error: {str(e)}")
            scope['user'] = AnonymousUser()
            return await self.inner(scope, receive, send)

    @staticmethod
    async def extract_token(query_string: str) -> str:
        if not query_string:
            return None
        
        try:
            parsed_qs = parse_qs(query_string)
            token = parsed_qs.get('token', [None])[0]
            return token
        except Exception as e:
            logging.error(f"Error extracting token: {str(e)}")
            return None

    @staticmethod
    @sync_to_async
    def get_authenticated_user(token: str):
        try:
            close_old_connections()
            jwt_auth = JWTAuthentication()
            validated_token = jwt_auth.get_validated_token(token)
            user = jwt_auth.get_user(validated_token)
            
            return user if user and user.is_active else None
            
        except Exception as e:
            logging.error(f"Error authenticating user: {str(e)}")
            return None