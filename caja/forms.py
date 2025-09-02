from django import forms
from django.core.exceptions import ValidationError
# Importar modelos desde la app home
from home.models import Caja, ServiciosParticulares, DetalleServicio, Pacientes

class ServicioForm(forms.ModelForm):
    estado_pago = forms.CharField(
        max_length=50,
        label="Estado de Pago",
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    metodo_pago = forms.CharField(
        max_length=50,
        label="Método de Pago",
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )

    class Meta:
        model = ServiciosParticulares
        fields = ['id_paciente', 'total', 'estado_pago', 'metodo_pago']

class AperturaCajaForm(forms.ModelForm):
    class Meta:
        model = Caja
        fields = ['monto_apertura']
        widgets = {
            'monto_apertura': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ingrese monto de apertura',
                'min': '0'
            })
        }
        labels = {
            'monto_apertura': 'Monto de Apertura'
        }

    def clean_monto_apertura(self):
        monto = self.cleaned_data['monto_apertura']
        if monto < 0:
            raise ValidationError('El monto no puede ser negativo')
        return monto

class CierreCajaForm(forms.ModelForm):
    class Meta:
        model = Caja
        fields = ['monto_cierre']
        widgets = {
            'monto_cierre': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ingrese monto de cierre',
                'min': '0'
            })
        }
        labels = {
            'monto_cierre': 'Monto de Cierre'
        }

    def clean_monto_cierre(self):
        monto = self.cleaned_data['monto_cierre']
        if monto < 0:
            raise ValidationError('El monto no puede ser negativo')
        return monto

class ServicioParticularForm(forms.ModelForm):
    class Meta:
        model = ServiciosParticulares
        fields = ['id_paciente', 'total', 'estado_pago', 'metodo_pago']
        widgets = {
            'id_paciente': forms.Select(attrs={'class': 'form-control'}),
            'total': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Total del servicio',
                'min': '0'
            }),
            'estado_pago': forms.Select(attrs={'class': 'form-control'}),
            'metodo_pago': forms.Select(attrs={'class': 'form-control'})
        }
        labels = {
            'id_paciente': 'Paciente',
            'total': 'Total',
            'estado_pago': 'Estado de Pago',
            'metodo_pago': 'Método de Pago'
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['id_paciente'].queryset = Pacientes.objects.all()
        self.fields['estado_pago'].choices = [
            ('pendiente', 'Pendiente'),
            ('pagado', 'Pagado'),
            ('cancelado', 'Cancelado')
        ]
        self.fields['metodo_pago'].choices = [
            ('efectivo', 'Efectivo'),
            ('tarjeta', 'Tarjeta'),
            ('transferencia', 'Transferencia')
        ]

class DetalleServicioForm(forms.ModelForm):
    class Meta:
        model = DetalleServicio
        fields = ['nro_diente', 'tratamiento', 'importe']
        widgets = {
            'nro_diente': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Número de diente (opcional)',
                'min': '1',
                'max': '48'
            }),
            'tratamiento': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Descripción del tratamiento'
            }),
            'importe': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Importe del tratamiento',
                'min': '0'
            })
        }
        labels = {
            'nro_diente': 'Número de Diente',
            'tratamiento': 'Tratamiento',
            'importe': 'Importe'
        }

    def clean_importe(self):
        importe = self.cleaned_data['importe']
        if importe < 0:
            raise ValidationError('El importe no puede ser negativo')
        return importe
    
    
    