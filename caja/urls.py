# caja/urls.py
from django.urls import path
from .views import (
    CajaListView,
    CajaAperturaView,
    CajaCierreView,
    CajaDetailView,
    CajaIngresoView,
    CajaEgresoView,
    MetodosCobroListView
)

urlpatterns = [
    # Lista de cajas
    path('', CajaListView.as_view(), name='caja-list'),
    
    # Apertura y cierre
    path('apertura/', CajaAperturaView.as_view(), name='caja-apertura'),
    path('<int:id_caja>/cierre/', CajaCierreView.as_view(), name='caja-cierre'),
    
    # Detalle
    path('<int:id_caja>/', CajaDetailView.as_view(), name='caja-detail'),
    
    # Ingresos y egresos
    path('<int:id_caja>/ingresos/', CajaIngresoView.as_view(), name='caja-ingreso'),
    path('<int:id_caja>/egresos/', CajaEgresoView.as_view(), name='caja-egreso'),
    
    # Métodos de cobro
    path('metodos-cobro/', MetodosCobroListView.as_view(), name='metodos-cobro'),
]