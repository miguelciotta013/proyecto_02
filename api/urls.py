# api/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),
    path('citas/por-mes/', views.citas_por_mes, name='citas-por-mes'),
    path('pacientes/por-edad/', views.pacientes_por_edad, name='pacientes-edad'),
    path('tratamientos/populares/', views.tratamientos_populares, name='tratamientos'),
    path('movimientos/caja/', views.movimientos_caja, name='movimientos-caja'),
    path('citas/filtradas/', views.citas_filtradas, name='citas-filtradas'),
    path('movimientos/caja/', views.movimientos_caja, name='movimientos_caja'),
   
]