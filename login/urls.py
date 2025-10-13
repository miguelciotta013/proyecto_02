# login/urls.py
from django.urls import path
from .views import LoginView, LogoutView, VerifyTokenView

urlpatterns = [
    path('', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('verify/', VerifyTokenView.as_view(), name='verify-token'),
]