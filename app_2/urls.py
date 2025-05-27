from django.urls import path
from app_2 import views
urlpatterns = [
    path("listas/", views.lista, name="lista"),
    path("datospaciente/", views.datospaciente, name="datospaciente"),
]