from django import forms
from home.models import Pacientes

class PacienteForm(forms.ModelForm):
    class Meta:
        model = Pacientes
        fields = ['nombre', 'apellido', 'dni_paciente', 'fecha_nacimiento', 'telefono', 'localidad']
        widgets = {
            'fecha_nacimiento': forms.DateInput(attrs={'type': 'date'}),
        }
