from django.urls import path
from pacientes.views import *

app_name = 'pacientes'

urlpatterns = [
    # Página principal - lista de pacientes
    path('lista/',lista_pacientes, name='lista'),
    
    # Gestión de pacientes
    path('agregar/', agregar_paciente, name='agregar_paciente'),
    path('<int:paciente_id>/', informacion_paciente, name='informacion_paciente'),
    path('<int:paciente_id>/editar/', editar_paciente, name='editar_paciente'),
    path('<int:paciente_id>/eliminar/', eliminar_paciente, name='eliminar_paciente'),
    
    # Gestión de obras sociales
    path('<int:paciente_id>/agregar-obra/', agregar_obra, name='agregar_obra'),
    path('<int:paciente_id>/obra/<int:obra_id>/editar/', editar_obra, name='editar_obra'),
    path('<int:paciente_id>/obra/<int:obra_id>/eliminar/', eliminar_obra_social, name='eliminar_obra_social'),
]
