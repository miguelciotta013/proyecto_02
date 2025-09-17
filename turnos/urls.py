from django.urls import path
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
