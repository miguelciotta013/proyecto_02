from django import forms
from home.models import Turnos
from datetime import time

class TurnoForm(forms.ModelForm):
    class Meta:
        model = Turnos
        fields = [
            "id_turno",
            "id_paciente",
            "fecha_turno",
            "hora_turno",
            "asunto",
            "comentario_turno",
        ]
        widgets = {
            "fecha_turno": forms.DateInput(
                attrs={
                    "type": "date",
                    "class": "form-control"
                }
            ),
            "hora_turno": forms.TimeInput(
                attrs={
                    "type": "time",
                    "class": "form-control",
                    "min": "14:00",
                    "max": "21:00"
                }
            ),
            "id_turno": forms.TextInput(attrs={"class": "form-control"}),
            "id_paciente": forms.Select(attrs={"class": "form-control"}),
            "asunto": forms.TextInput(attrs={"class": "form-control"}),
            "comentario_turno": forms.Textarea(attrs={"class": "form-control", "rows": 3}),
        }
        labels = {
            "id_turno": "ID del Turno",
            "id_paciente": "Paciente",
            "fecha_turno": "Fecha del Turno",
            "hora_turno": "Hora del Turno",
            "asunto": "Asunto",
            "comentario_turno": "Comentario",
        }

    def clean(self):
        cleaned_data = super().clean()
        fecha = cleaned_data.get("fecha_turno")
        hora = cleaned_data.get("hora_turno")
        turno_id = self.instance.pk if self.instance else None   # 🔑

        # Validación de rango de horario
        if hora and (hora < time(14, 0) or hora > time(21, 0)):
            self.add_error("hora_turno", "El horario debe estar entre 14:00 y 21:00.")

        # Validación de duplicados
        if fecha and hora:
            existe = Turnos.objects.filter(
                fecha_turno=fecha,
                hora_turno=hora
            ).exclude(pk=turno_id).exists()   # 🔑

            if existe:
                self.add_error("hora_turno", "Ya existe un turno para esta fecha y hora.")

        return cleaned_data
