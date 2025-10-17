from django.urls import path
from .views import (
    ListaPacientesFicha, 
    PacientesConObraSocial, 
    CatalogosOdontologicos,
    FichasMedicasListView,
    FichaPatologicaView,
    CobroUpdateView
)

urlpatterns = [
    path('', ListaPacientesFicha.as_view(), name='lista_pacientes_ficha'),
    path('fichas/', FichasMedicasListView.as_view(), name='lista-fichas'),
    path('pacientes-os/', PacientesConObraSocial.as_view(), name='pacientes-obra-social'),
    path('catalogos/', CatalogosOdontologicos.as_view(), name='catalogos-odontologicos'),
    
    # Fichas patológicas
    path('patologia/', FichaPatologicaView.as_view(), name='ficha-patologica'),
    
    # Cobros
    path('cobros/<int:id_cobro>/', CobroUpdateView.as_view(), name='cobro-update'),
]
