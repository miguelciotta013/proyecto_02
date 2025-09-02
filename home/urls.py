from django.urls import path
from home import views


urlpatterns = [
    path("", views.home, name = "home"),
    path("api/turnos/", views.turnos_json, name="turnos_json"),
]