from django.urls import path
from turnos import views

urlpatterns = [
    path("", views.vista_turnos, name="vista_turnos"),
    path("registrar_turno/", views.registrar_turno, name="registrar_turno"),
    path("modificar_turno/<int:pk>", views.modificar_turno, name="modificar_turno"),
    path("eliminar_turno/<int:pk>", views.eliminar_turno, name="eliminar_turno"),
]
