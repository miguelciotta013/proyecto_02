from django.urls import path
from pacientes import views


urlpatterns = [
    path("", views.vista_pacientes, name = "vista_pacientes"),
]