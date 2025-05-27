from django.contrib import admin
from .models import Pacientes, Turnos

admin.site.register(Pacientes)
admin.site.register(Turnos)