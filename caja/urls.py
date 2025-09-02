from django.urls import path
from . import views

app_name = "caja"

urlpatterns = [
    path("lista_cajas/", views.lista_cajas, name="lista_cajas"),
    path("apertura/", views.apertura_caja, name="apertura_caja"),
    path("cierre/", views.cierre_caja, name="cierre_caja"),
    path("cobrar-servicio/", views.cobrar_servicio, name="cobrar_servicio"),
]
