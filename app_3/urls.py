from django.urls import path
from app_3 import views
urlpatterns = [
    path("ar/",views.ar,name="ar"),
    path("listar_turnos/", views.listar_turnos, name="listar_turnos"),
    path("registrar_turno/", views.registrar_turno, name="registrar_turno"),
    path("editar_turno/<int:pk>/", views.editar_turno, name="editar_turno"),
    path("eliminar_turno/<int:pk>/", views.eliminar_turno, name="eliminar_turno"),
]
