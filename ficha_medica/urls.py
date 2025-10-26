from django.urls import path
from .views import (
    ListaPacientesFicha, 
    PacientesConObraSocial, 
    CatalogosOdontologicos,
    FichasMedicasListView,
    FichaPatologicaView,
    CobroUpdateView, 
    PacienteDetalleView,
    CajaEstadoView,
    ObrasSocialesPacienteView,
    TratamientosConCoberturaView,
    FichaMedicaDetailView,
    FichaMedicaPDFView,
    OdontogramaView,
    MetodosCobroView,
    EstadosPagoView,
)

urlpatterns = [
    # ============================================
    # PACIENTES
    # ============================================
    # Lista de pacientes con búsqueda y crear ficha médica
    path('', ListaPacientesFicha.as_view(), name='lista_pacientes_ficha'),
    
    # Detalle de un paciente específico
    path('paciente/<int:id_paciente>/', PacienteDetalleView.as_view(), name='paciente-detalle'),
    
    # Obras sociales de un paciente específico
    path('paciente/<int:id_paciente>/obras-sociales/', ObrasSocialesPacienteView.as_view(), name='obras-sociales-paciente'),
    
    
    # ============================================
    # FICHAS MÉDICAS
    # ============================================
    # Listar fichas médicas con filtros
    path('fichas/', FichasMedicasListView.as_view(), name='lista-fichas'),
    
    # Operaciones sobre ficha médica específica (GET, PUT, DELETE)
    path('ficha/<int:id_ficha>/', FichaMedicaDetailView.as_view(), name='ficha-detail'),
    
    # Descargar PDF de ficha médica
    path('ficha/<int:id_ficha>/pdf/', FichaMedicaPDFView.as_view(), name='ficha-pdf'),
    
    # Ver odontograma de una ficha médica
    path('ficha/<int:id_ficha>/odontograma/', OdontogramaView.as_view(), name='odontograma'),
    
    
    # ============================================
    # FICHAS PATOLÓGICAS
    # ============================================
    # Crear, verificar y actualizar fichas patológicas
    path('patologia/', FichaPatologicaView.as_view(), name='ficha-patologica'),
    
    
    # ============================================
    # COBROS
    # ============================================
    # Actualizar información de cobro
    path('cobros/<int:id_cobro>/', CobroUpdateView.as_view(), name='cobro-update'),
    
    
    # ============================================
    # CATÁLOGOS Y OBRAS SOCIALES
    # ============================================
    # Todos los catálogos odontológicos (dientes, caras, tratamientos, parentescos)
    path('catalogos/', CatalogosOdontologicos.as_view(), name='catalogos-odontologicos'),
    
    # Todas las relaciones paciente-obra social
    path('pacientes-os/', PacientesConObraSocial.as_view(), name='pacientes-obra-social'),
    
    # Tratamientos con cobertura según obra social
    path('tratamientos/', TratamientosConCoberturaView.as_view(), name='tratamientos-cobertura'),
    
    # Métodos de cobro disponibles
    path('metodos-cobro/', MetodosCobroView.as_view(), name='metodos-cobro'),
    
    # Estados de pago disponibles
    path('estados-pago/', EstadosPagoView.as_view(), name='estados-pago'),
    
    
    # ============================================
    # CAJA
    # ============================================
    # Verificar si hay caja abierta
    path('caja/estado/', CajaEstadoView.as_view(), name='caja-estado'),
]