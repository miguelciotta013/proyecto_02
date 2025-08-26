from django.urls import path
from ficha_medica.views import *

urlpatterns = [
    path("lista_pacientes/", mostrar_pacientes, name = "listar_pacientes"),
    path('crear-ficha/<int:pk>/', crear_ficha, name='crear_ficha'),
    path('historial/<int:pk>/', historial_paciente, name='historial_paciente'),
    path('nueva-consulta/<int:pk>/', nueva_consulta, name='nueva_consulta'),

]