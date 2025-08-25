from django.urls import path
from caja import views



urlpatterns = [
    path('', views.vista_cajas, name='vista_cajas'),
]