from django.urls import path
from .views import ListaPacientesFicha, PacientesConObraSocial, CatalogosOdontologicos, FichasMedicasListView

urlpatterns = [
    path('', ListaPacientesFicha.as_view(), name='lista_pacientes_ficha'),
    path('fichas/', FichasMedicasListView.as_view(), name='lista-fichas'),  # Nuevo
    path('pacientes-os/', PacientesConObraSocial.as_view(), name='pacientes-obra-social'),
    path('catalogos/', CatalogosOdontologicos.as_view(), name='catalogos-odontologicos'),
]