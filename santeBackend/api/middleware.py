from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from django.db import close_old_connections
from rest_framework_simplejwt.tokens import AccessToken
from asgiref.sync import sync_to_async
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

class SimpleJWTAuthMiddleware(BaseMiddleware):
    """
    Custom WebSocket middleware for Simple JWT authentication.
    """
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        """
        Called when a WebSocket connection is made.
        """
        try:
            # Extract the token from the query string (e.g., ws://localhost:8001/ws/chat/3/?token=<your_token>)
            token = None
            query_string = scope.get('query_string', b'').decode('utf-8')  # Get the query string
            if query_string:
                parsed_qs = parse_qs(query_string)  # Parse the query string
                token = parsed_qs.get('token', [None])[0]  # Extract the token value

            if not token:
                raise AuthenticationFailed("Token query parameter missing.")

            # Run the synchronous JWT authentication in an async-compatible way
            user = await sync_to_async(self.authenticate_user)(token)

            # Add the user to the scope
            scope["user"] = user

            # Proceed with the next middleware/consumer
            await super().__call__(scope, receive, send)

        except AuthenticationFailed as e:
            # Handle authentication failure (e.g., close WebSocket if the token is invalid)
            await send({
                "type": "websocket.close",
                "code": 4000  # This can vary depending on the WebSocket protocol
            })
            return
        except Exception as e:
            # Handle other errors (log and close the WebSocket)
            await send({
                "type": "websocket.close",
                "code": 4000
            })
            print("Error during WebSocket authentication:", str(e))
            return
        
    def _get_token(self, headers, query_string):
        """
        Extract the token from headers or query string.
        """
        # Check for Authorization header
        auth_header = headers.get("authorization", "")
        if auth_header.startswith("Bearer "):
            return auth_header[7:]

        # Check for token in query string (e.g., ws://.../?token=...)
        query_params = dict(param.split('=') for param in query_string.split('&') if '=' in param)
        return query_params.get("token")

    def authenticate_user(self, token):
        """
        Validate the JWT token and return the user.
        """
        if not token:
            return AnonymousUser()

        try:
            # Validate the token
            validated_token = JWTAuthentication().get_validated_token(token)
            user = JWTAuthentication().get_user(validated_token)
            return user
        except Exception as e:
            raise AuthenticationFailed("Invalid token or user.")
