"""
URL configuration for santeBackend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from api.views.ViewsGeneral import * 
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from api.views.ViewsUsers import RegisterUserView, TestingRegisterView

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/user/register/", TestingRegisterView.as_view(), name="register"), #register any user for testing
    path("api/user/register/admin", RegisterUserView.as_view(), name="registerUser"), #register any user for admin
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),  #login refresh, keeps the user logged in
    path("api-auth/", include("rest_framework.urls")), #login url
    path("api/", include("api.urls")),
]
 