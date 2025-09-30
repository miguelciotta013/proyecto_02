from django.urls import path
from .views import ListaPacientesFicha, PacientesConObraSocial, CatalogosOdontologicos

urlpatterns = [
    path('', ListaPacientesFicha.as_view(), name='lista_pacientes_ficha'),
    path('pacientes-os/', PacientesConObraSocial.as_view(), name='pacientes-obra-social'),
    path('catalogos/', CatalogosOdontologicos.as_view(), name='catalogos-odontologicos'),
]