from django import forms
from home.models import Turnos

class TurnoForm(forms.ModelForm):
    class Meta:
        model = Turnos
        fields = ["id_turno", "id_paciente", "fecha_turno", "hora_turno", "asunto", "comentario_turno"]