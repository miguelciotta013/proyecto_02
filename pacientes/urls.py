from django.urls import path
from pacientes.views import *  # Importa views de la app actual


urlpatterns = [
    path('lista/', lista_pacientes, name='lista'),  # Vista principal de pacientes
    
]

