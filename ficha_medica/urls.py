from django.urls import path
from . import views


urlpatterns = [
    # Lista principal de pacientes
    path('lista_pacientes/', views.lista_pacientes, name='lista_pacientes'),
    
    # Gestión de fichas médicas y consultas
    path('agregar-ficha/<int:paciente_id>/', views.agregar_ficha, name='agregar_ficha'),
    path('agregar-detalles/<int:ficha_id>/<int:consulta_id>/', views.agregar_detalles, name='agregar_detalles'),
    
    # Gestión de detalles de consulta
    path('agregar-detalle/<int:ficha_id>/<int:consulta_id>/', views.agregar_detalle, name='agregar_detalle'),
    path('editar-detalle/<int:detalle_id>/', views.editar_detalle, name='editar_detalle'),
    path('eliminar-detalle/<int:detalle_id>/', views.eliminar_detalle, name='eliminar_detalle'),
    
    # Historial de pacientes
    path('historial-paciente/<int:paciente_id>/', views.historial_paciente, name='historial_paciente'),
]