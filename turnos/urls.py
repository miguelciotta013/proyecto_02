# turnos/urls.py
from django.urls import path
<<<<<<< HEAD
from . import views

app_name = "turnos"

urlpatterns = [
    path("", views.vista_turno, name="vista_turno"),
    path("registrar_turno/", views.registrar_turno, name="registrar_turno"),
    path("modificar_turno/<int:pk>/", views.modificar_turno, name="modificar_turno"),
    

    # Endpoints AJAX
    path("api/turnos/", views.api_turnos, name="api_turnos"),
    path("api/turnos/<int:pk>/delete/", views.api_eliminar_turno, name="api_eliminar_turno"),
    path("api/turnos/<int:pk>/set_estado/", views.api_set_estado, name="api_set_estado"),
]
=======
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
>>>>>>> 9511589aa06bbbfd348877546c8854df78765fc7
