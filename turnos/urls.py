from django.urls import path
from turnos import views


urlpatterns = [
    path("", views.vista_turnos, name = "vista_turnos"),
]