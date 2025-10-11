# pacientes/urls.py
from django.urls import path
from .views import (
    PacienteListCreateView,
    PacienteDetailView,
    PacienteObraSocialView,
    ObrasSocialesListView,
    PacienteFichaPatologicaView  # ← AGREGAR
)

urlpatterns = [
    # Lista y creación
    path('', PacienteListCreateView.as_view(), name='paciente-list-create'),
    
    # Detalle individual
    path('<int:id_paciente>/', PacienteDetailView.as_view(), name='paciente-detail'),
    
    # Obras sociales del paciente
    path('<int:id_paciente>/obras-sociales/', PacienteObraSocialView.as_view(), name='paciente-obra-social'),
    path('<int:id_paciente>/obras-sociales/<int:id_paciente_os>/', PacienteObraSocialView.as_view(), name='paciente-obra-social-delete'),
    
    # Ficha patológica del paciente ← AGREGAR
    path('<int:id_paciente>/ficha-patologica/', PacienteFichaPatologicaView.as_view(), name='paciente-ficha-patologica'),
    
    # Lista de obras sociales disponibles
    path('obras-sociales/disponibles/', ObrasSocialesListView.as_view(), name='obras-sociales-list'),
]