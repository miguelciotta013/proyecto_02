from django.urls import path
from .views import (
    TurnoListCreateView,
    TurnoDetailView,
    TurnoEstadoUpdateView,
    EstadosTurnoListView,
    HorariosDisponiblesView
)

urlpatterns = [
    path('', TurnoListCreateView.as_view(), name='turno-list-create'),
    path('<int:id_turno>/', TurnoDetailView.as_view(), name='turno-detail'),
    path('<int:id_turno>/estado/', TurnoEstadoUpdateView.as_view(), name='turno-estado'),
    path('estados/', EstadosTurnoListView.as_view(), name='estados-turno'),
    path('horarios-disponibles/', HorariosDisponiblesView.as_view(), name='horarios-disponibles'),
]

