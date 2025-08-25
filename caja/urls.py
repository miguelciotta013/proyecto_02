
from django.urls import path
from . import views

urlpatterns = [
    path('', views.caja_home, name='caja_home'),
    path('abrir/', views.abrir_caja, name='abrir_caja'),
    path('abrir/ajax/', views.abrir_caja_ajax, name='abrir_caja_ajax'),
    path('cerrar/', views.cerrar_caja, name='cerrar_caja'),
    path('cerrar/ajax/', views.cerrar_caja_ajax, name='cerrar_caja_ajax'),
    path('cobrar/', views.cobrar_servicio, name='cobrar_servicio'),
    path('cobrar/ajax/', views.cobrar_servicio_ajax, name='cobrar_servicio_ajax'),
]

