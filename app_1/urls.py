from django.urls import path
from app_1 import views
urlpatterns = [
    path("",views.index, name="pantalla de inicio"),
    path("odontogramas/", views.odontogramas, name="odontogramas"),
    path("odontogramas/<int:pk>/modificar/", views.modificar, name="modificar"),
]