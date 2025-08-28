from django.urls import path
from . import views  # Importa views de la app actual

app_name = "pacientes"


urlpatterns = [
    path('', views.lista_pacientes, name='lista'),  # Vista principal de pacientes
    path('agregar/', views.agregar_paciente, name='agregar'),  # Agregar paciente
    path('modificar/<int:id>/', views.modificar_paciente, name='modificar'),  # Modificar paciente
    path('ficha/<int:id>/', views.ficha_medica, name='ficha'),  # Ficha médica
    path('odontograma/<int:id>/', views.odontograma, name='odontograma'),  # Odontograma
]

