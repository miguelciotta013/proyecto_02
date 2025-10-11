# turnos/urls.py
from django.urls import path
from .views import (
    TurnoListCreateView,
    TurnoDetailView,
    TurnoEstadoUpdateView,
    EstadosTurnoListView,
    HorariosDisponiblesView
)

urlpatterns = [
    # Lista y creación
    path('', TurnoListCreateView.as_view(), name='turno-list-create'),
    
    # Detalle individual
    path('<int:id_turno>/', TurnoDetailView.as_view(), name='turno-detail'),
    
    # Cambiar estado
    path('<int:id_turno>/estado/', TurnoEstadoUpdateView.as_view(), name='turno-estado'),
    
    # Listas auxiliares
    path('estados/', EstadosTurnoListView.as_view(), name='estados-turno'),
    path('horarios-disponibles/', HorariosDisponiblesView.as_view(), name='horarios-disponibles'),
]