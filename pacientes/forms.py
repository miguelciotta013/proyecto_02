from django import forms
from .models import Paciente

class PacienteForm(forms.ModelForm):
    class Meta:
        model = Paciente
        fields = ["nombre", "apellido", "dni", "fecha_nacimiento", "domicilio", "telefono"]
