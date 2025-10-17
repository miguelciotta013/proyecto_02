from django import forms
from datetime import time
from home.models import Turnos, Pacientes

class TurnoForm(forms.ModelForm):
    class Meta:
        model = Turnos
        fields = ["id_paciente", "fecha_turno", "hora_turno", "asunto", "comentario_turno"]
        widgets = {
            "id_paciente": forms.Select(attrs={"class": "form-control"}),
            "fecha_turno": forms.DateInput(attrs={"type": "date", "class": "form-control"}),
            "hora_turno": forms.TimeInput(attrs={"type": "time", "class": "form-control", "min":"14:00","max":"21:00"}),
            "asunto": forms.TextInput(attrs={"class": "form-control"}),
            "comentario_turno": forms.Textarea(attrs={"class": "form-control", "rows":3}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        qs = Pacientes.objects.exclude(eliminado=1).order_by("apellido_paciente","nombre_paciente")
        self.fields["id_paciente"].queryset = qs
        self.fields["id_paciente"].label_from_instance = lambda obj: f"{obj.apellido_paciente}, {obj.nombre_paciente} ({obj.dni_paciente})"

    def clean(self):
        cleaned_data = super().clean()
        fecha = cleaned_data.get("fecha_turno")
        hora = cleaned_data.get("hora_turno")
        turno_id = self.instance.pk if self.instance and self.instance.pk else None

        if hora and (hora < time(14,0) or hora > time(21,0)):
            self.add_error("hora_turno", "El horario debe estar entre 14:00 y 21:00.")

        if fecha and hora:
            qs = Turnos.objects.filter(fecha_turno=fecha, hora_turno=hora).exclude(pk=turno_id).exclude(eliminado=1)
            if qs.exists():
                self.add_error("hora_turno", "Ya existe un turno para esta fecha y hora.")
        return cleaned_data
