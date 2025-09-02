from django import forms
from home.models import FichaMedica, Consultas, DetalleConsulta


class FichaMedicaForm(forms.ModelForm):
    class Meta:
        model = FichaMedica
        fields = ['fecha_creacion', 'observaciones']
        widgets = {
            'fecha_creacion': forms.DateInput(
                attrs={
                    'type': 'date',
                    'class': 'form-control'
                }
            ),
            'observaciones': forms.Textarea(
                attrs={
                    'class': 'form-control',
                    'rows': 3,
                    'placeholder': 'Observaciones de la ficha médica...'
                }
            ),
        }
        labels = {
            'fecha_creacion': 'Fecha de Creación',
            'observaciones': 'Observaciones',
        }


class ConsultaForm(forms.ModelForm):
    class Meta:
        model = Consultas
        fields = ['motivo_consulta', 'fecha_consulta', 'observaciones', 'total_consulta']
        widgets = {
            'motivo_consulta': forms.TextInput(
                attrs={
                    'class': 'form-control',
                    'placeholder': 'Motivo de la consulta...'
                }
            ),
            'fecha_consulta': forms.DateInput(
                attrs={
                    'type': 'date',
                    'class': 'form-control'
                }
            ),
            'observaciones': forms.Textarea(
                attrs={
                    'class': 'form-control',
                    'rows': 3,
                    'placeholder': 'Observaciones de la consulta...'
                }
            ),
            'total_consulta': forms.NumberInput(
                attrs={
                    'class': 'form-control',
                    'min': '0',
                    'step': '1'
                }
            ),
        }
        labels = {
            'motivo_consulta': 'Motivo de Consulta',
            'fecha_consulta': 'Fecha de Consulta',
            'observaciones': 'Observaciones',
            'total_consulta': 'Total de Consulta ($)',
        }


class DetalleConsultaForm(forms.ModelForm):
    CARAS_CHOICES = [
        ('', 'Seleccionar cara...'),
        ('vestibular', 'Vestibular'),
        ('mesial', 'Mesial'),
        ('distal', 'Distal'),
        ('oclusal', 'Oclusal'),
        ('incisal', 'Incisal'),
        ('cervical', 'Cervical'),
        ('apical', 'Apical'),
        ('palatina', 'Palatina'),
        ('bucal', 'Bucal'),
        ('labial', 'Labial'),
        ('marginal', 'Marginal'),
        ('pulpar', 'Pulpar'),
    ]

    cara_diente = forms.ChoiceField(
        choices=CARAS_CHOICES,
        required=False,
        widget=forms.Select(attrs={'class': 'form-control'})
    )

    class Meta:
        model = DetalleConsulta
        fields = ['nro_diente', 'cara_diente', 'codigo', 'importe']
        widgets = {
            'nro_diente': forms.NumberInput(
                attrs={
                    'class': 'form-control',
                    'min': '18',
                    'max': '85',
                    'placeholder': 'Número de diente (18-85)'
                }
            ),
            'codigo': forms.NumberInput(
                attrs={
                    'class': 'form-control',
                    'min': '0',
                    'step': '1',
                    'placeholder': 'Código del tratamiento'
                }
            ),
            'importe': forms.NumberInput(
                attrs={
                    'class': 'form-control',
                    'min': '0',
                    'step': '1',
                    'placeholder': 'Importe ($)'
                }
            ),
        }
        labels = {
            'nro_diente': 'Número de Diente',
            'cara_diente': 'Cara del Diente',
            'codigo': 'Código',
            'importe': 'Importe ($)',
        }

    def clean_nro_diente(self):
        nro_diente = self.cleaned_data.get('nro_diente')
        if nro_diente is not None and (nro_diente < 18 or nro_diente > 85):
            raise forms.ValidationError('El número de diente debe estar entre 18 y 85.')
        return nro_diente