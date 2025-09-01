# caja/urls.py
from django.urls import path
from . import views

app_name = 'caja'

urlpatterns = [
    # Lista principal de cajas
    path('', views.lista_cajas, name='lista_cajas'),
    path('lista_cajas/', views.lista_cajas, name='lista_cajas'),
    
    # Gestión de caja
    path('apertura_caja/', views.apertura_caja, name='apertura_caja'),
    path('cierre_caja/', views.cierre_caja, name='cierre_caja'),
    
    # Servicios
    path('cobrar_servicio/', views.cobrar_servicio, name='cobrar_servicio'),
    
    # AJAX/API
    path('detalle_caja/<int:caja_id>/', views.detalle_caja, name='detalle_caja'),
    
    # Reportes (opcional para implementar después)
    path('reporte_caja/', views.reporte_caja, name='reporte_caja'),
]