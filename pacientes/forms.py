from django import forms
from home.models import Pacientes, ObraSocial, PacientesXOs


class PacienteForm(forms.ModelForm):
    class Meta:
        model = Pacientes
        fields = [
            'dni_paciente', 
            'fecha_nacimiento', 
            'apellido', 
            'nombre', 
            'domicilio', 
            'localidad', 
            'telefono'
        ]
        widgets = {
            'dni_paciente': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ingrese DNI sin puntos'
            }),
            'fecha_nacimiento': forms.DateInput(attrs={
                'class': 'form-control',
                'type': 'date'
            }),
            'apellido': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ingrese apellido'
            }),
            'nombre': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ingrese nombre'
            }),
            'domicilio': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ingrese domicilio'
            }),
            'localidad': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ingrese localidad'
            }),
            'telefono': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ingrese teléfono'
            })
        }
        labels = {
            'dni_paciente': 'DNI',
            'fecha_nacimiento': 'Fecha de Nacimiento',
            'apellido': 'Apellido',
            'nombre': 'Nombre',
            'domicilio': 'Domicilio',
            'localidad': 'Localidad',
            'telefono': 'Teléfono'
        }


class ObraSocialForm(forms.ModelForm):
    class Meta:
        model = ObraSocial
        fields = ['nombre_os', 'codigo_os']
        widgets = {
            'nombre_os': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Nombre de la obra social'
            }),
            'codigo_os': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Código de obra social'
            })
        }
        labels = {
            'nombre_os': 'Nombre de Obra Social',
            'codigo_os': 'Código'
        }


class PacienteObraSocialForm(forms.ModelForm):
    class Meta:
        model = PacientesXOs
        fields = [
            'id_obra_social', 
            'nombre_titular', 
            'parentezco', 
            'credencial'
        ]
        widgets = {
            'id_obra_social': forms.Select(attrs={
                'class': 'form-control'
            }),
            'nombre_titular': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Nombre del titular'
            }),
            'parentezco': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ej: Titular, Cónyuge, Hijo/a'
            }),
            'credencial': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Número de credencial'
            })
        }
        labels = {
            'id_obra_social': 'Obra Social',
            'nombre_titular': 'Nombre del Titular',
            'parentezco': 'Parentezco',
            'credencial': 'Número de Credencial'
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Cargar todas las obras sociales disponibles
        self.fields['id_obra_social'].queryset = ObraSocial.objects.all()
        self.fields['id_obra_social'].empty_label = "Seleccione una obra social"

'''
class PacienteConObraForm(forms.Form):
    # Campos del paciente
    dni_paciente = forms.IntegerField(
        label='DNI',
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'placeholder': 'Ingrese DNI sin puntos'
        })
    )
    fecha_nacimiento = forms.DateField(
        label='Fecha de Nacimiento',
        widget=forms.DateInput(attrs={
            'class': 'form-control',
            'type': 'date'
        })
    )
    apellido = forms.CharField(
        max_length=50,
        label='Apellido',
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Ingrese apellido'
        })
    )
    nombre = forms.CharField(
        max_length=50,
        label='Nombre',
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Ingrese nombre'
        })
    )
    domicilio = forms.CharField(
        max_length=50,
        required=False,
        label='Domicilio',
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Ingrese domicilio'
        })
    )
    localidad = forms.CharField(
        max_length=50,
        required=False,
        label='Localidad',
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Ingrese localidad'
        })
    )
    telefono = forms.CharField(
        max_length=20,
        required=False,
        label='Teléfono',
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Ingrese teléfono'
        })
    )
    
    # Campos de obra social (opcionales)
    id_obra_social = forms.ModelChoiceField(
        queryset=ObraSocial.objects.all(),
        required=False,
        label='Obra Social',
        empty_label="Sin obra social",
        widget=forms.Select(attrs={
            'class': 'form-control'
        })
    )
    nombre_titular = forms.CharField(
        max_length=50,
        required=False,
        label='Nombre del Titular',
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Nombre del titular'
        })
    )
    parentezco = forms.CharField(
        max_length=50,
        required=False,
        label='Parentezco',
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Ej: Titular, Cónyuge, Hijo/a'
        })
    )
    credencial = forms.IntegerField(
        required=False,
        label='Número de Credencial',
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'placeholder': 'Número de credencial'
        })
    )

'''
