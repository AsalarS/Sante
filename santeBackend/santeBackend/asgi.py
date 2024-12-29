"""
ASGI config for santeBackend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""
import os
import django
# These need to be before import to avoid loding issues when running the daphne server
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'santeBackend.settings')
django.setup()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
import api.routing 

# 2. Initialize Django's ASGI application
django_asgi_app = get_asgi_application()

# 3. Define the ProtocolTypeRouter
application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            api.routing.websocket_urlpatterns
        )
    ),
})