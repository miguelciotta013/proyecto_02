from django.contrib import admin

# Register your models here.
from .models import Odontogramas, Pacientes

admin.site.register(Pacientes)
admin.site.register(Odontogramas)