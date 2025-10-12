from django.urls import path
from .views import (
    # Usuarios
    UsuarioListCreateView,
    UsuarioDetailView,
    
    # Dientes
    DienteListView,
    
    # Tratamientos
    TratamientoListCreateView,
    TratamientoDetailView,
    
    # Obras Sociales
    ObraSocialListCreateView,
    ObraSocialDetailView,
    
    # Coberturas
    CoberturaListCreateView,
    CoberturaDetailView,
    
    # Métodos de Cobro
    MetodoCobroListCreateView,
    MetodoCobroDetailView
)

urlpatterns = [
    # ===== USUARIOS =====
    path('usuarios/', UsuarioListCreateView.as_view(), name='usuarios-list-create'),
    path('usuarios/<int:user_id>/', UsuarioDetailView.as_view(), name='usuarios-detail'),
    
    # ===== DIENTES =====
    path('dientes/', DienteListView.as_view(), name='dientes-list'),
    path('dientes/<int:id_diente>/', DienteListView.as_view(), name='dientes-update'),
    
    # ===== TRATAMIENTOS =====
    path('tratamientos/', TratamientoListCreateView.as_view(), name='tratamientos-list-create'),
    path('tratamientos/<int:id_tratamiento>/', TratamientoDetailView.as_view(), name='tratamientos-detail'),
    
    # ===== OBRAS SOCIALES =====
    path('obras-sociales/', ObraSocialListCreateView.as_view(), name='obras-sociales-list-create'),
    path('obras-sociales/<int:id_obra_social>/', ObraSocialDetailView.as_view(), name='obras-sociales-detail'),
    
    # ===== COBERTURAS =====
    path('coberturas/', CoberturaListCreateView.as_view(), name='coberturas-list-create'),
    path('coberturas/<int:id_cobertura>/', CoberturaDetailView.as_view(), name='coberturas-detail'),
    
    # ===== MÉTODOS DE COBRO =====
    path('metodos-cobro/', MetodoCobroListCreateView.as_view(), name='metodos-cobro-list-create'),
    path('metodos-cobro/<int:id_metodo_cobro>/', MetodoCobroDetailView.as_view(), name='metodos-cobro-detail'),
]