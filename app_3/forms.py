from django import forms
from app_3.models import *

class TurnoForm(forms.ModelForm):
    class Meta:
        model = Turnos
        fields= "__all__"
        widgets = {
            "fecha_turno": forms.DateInput(attrs={'type': 'date'}),
            "hora_turno": forms.TimeInput(attrs={'type': 'time'}),
            "estado_turno": forms.Select(choices=[('activo', 'Activo'), ('desactivo', 'Desactivo')], attrs={'class': 'form-select'}),
        }


