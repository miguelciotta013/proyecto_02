from django.urls import path
from . import views

app_name = 'caja'

urlpatterns = [
    path('lista_cajas/', views.lista_cajas, name='lista_cajas'),
   
]