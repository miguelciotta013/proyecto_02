# home/urls.py
from django.urls import path
from .views import HomeView, MensajeBienvenidaView

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('bienvenida/', MensajeBienvenidaView.as_view(), name='bienvenida'),
]