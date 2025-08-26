from django import forms
from django.forms import formset_factory
from home.models import FichaMedica, Consultas, DetalleConsulta

class FormularioFichaMedica(forms.ModelForm):
    class Meta:
        model = FichaMedica
        fields = ['fecha_creacion', 'observaciones']
        
        widgets = {
            'fecha_creacion': forms.DateInput(attrs={
                'type': 'date', 
                'class': 'form-control'
            }),
            'observaciones': forms.Textarea(attrs={
                'rows': 3, 
                'class': 'form-control',
                'placeholder': 'Observaciones generales de la ficha médica...'
            })
        }
        
        labels = {
            'fecha_creacion': 'Fecha de Creación',
            'observaciones': 'Observaciones'
        }

# Formulario 2: Consulta
class FormularioConsulta(forms.ModelForm):
    class Meta:
        model = Consultas
        fields = ['fecha_consulta', 'total_consulta', 'observaciones']
        
        widgets = {
            'fecha_consulta': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'total_consulta': forms.NumberInput(attrs={'class': 'form-control', 'min': 0, 'placeholder': '0'}),
            'observaciones': forms.Textarea(attrs={'rows': 2, 'class': 'form-control'})
        }
        
        labels = {
            'fecha_consulta': 'Fecha de Consulta',
            'total_consulta': 'Total Consulta ($)',
            'observaciones': 'Observaciones'
        }

# Formulario 3: Detalle de tratamiento - CORREGIDO
class FormularioDetalleConsulta(forms.ModelForm):
    class Meta:
        model = DetalleConsulta
        # ❌ REMOVIDO: 'id_consulta','id_ficha_medica' - se asignan en la vista
        fields = ['nro_diente', 'cara_diente', 'codigo', 'importe']
        
        widgets = {
            'nro_diente': forms.NumberInput(attrs={
                'class': 'form-control form-control-sm', 
                'min': 1, 
                'max': 48,
                'placeholder': 'Ej: 11'
            }),
            'cara_diente': forms.Select(attrs={
                'class': 'form-control form-control-sm'
            }, choices=[
                ('', 'Seleccionar cara'),
                ('mesial', 'Mesial'),
                ('distal', 'Distal'),
                ('vestibular', 'Vestibular'),
                ('lingual', 'Lingual'),
                ('oclusal', 'Oclusal'),
                ('incisal', 'Incisal'),
            ]),
            'codigo': forms.NumberInput(attrs={
                'class': 'form-control form-control-sm',
                'placeholder': 'Código'
            }),
            'importe': forms.NumberInput(attrs={
                'class': 'form-control form-control-sm',
                'min': 0,
                'placeholder': 'Monto'
            })
        }
        
        labels = {
            'nro_diente': 'Nº Diente',
            'cara_diente': 'Cara del Diente',
            'codigo': 'Código Tratamiento',
            'importe': 'Importe ($)'
        }

# Formulario adicional para mejorar UX - agregar tratamiento individual
class FormularioTratamientoSimple(forms.Form):
    nro_diente = forms.IntegerField(
        label='Nº Diente',
        min_value=1,
        max_value=48,
        widget=forms.NumberInput(attrs={
            'class': 'form-control form-control-sm',
            'placeholder': 'Ej: 11'
        })
    )
    cara_diente = forms.ChoiceField(
        label='Cara del Diente',
        choices=[
            ('', 'Seleccionar cara'),
            ('mesial', 'Mesial'),
            ('distal', 'Distal'),
            ('vestibular', 'Vestibular'),
            ('lingual', 'Lingual'),
            ('oclusal', 'Oclusal'),
            ('incisal', 'Incisal'),
        ],
        widget=forms.Select(attrs={'class': 'form-control form-control-sm'})
    )
    codigo = forms.IntegerField(
        label='Código',
        widget=forms.NumberInput(attrs={
            'class': 'form-control form-control-sm',
            'placeholder': 'Código'
        })
    )
    importe = forms.DecimalField(
        label='Importe ($)',
        min_value=0,
        decimal_places=2,
        widget=forms.NumberInput(attrs={
            'class': 'form-control form-control-sm',
            'placeholder': 'Monto'
        })
    )