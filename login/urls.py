# login/urls.py
from django.urls import path
from .views import LoginView, LogoutView, VerifyTokenView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('verify/', VerifyTokenView.as_view(), name='verify-token'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]