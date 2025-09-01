# caja/forms.py
from django import forms
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from home.models import Caja, ServiciosParticulares, DetalleServicio, Pacientes
from datetime import datetime, date, time

class AperturaCajaForm(forms.ModelForm):
    class Meta:
        model = Caja
        fields = ['monto_apertura']
        widgets = {
            'monto_apertura': forms.NumberInput(attrs={
                'class': 'form-control form-control-lg',
                'placeholder': 'Monto inicial en caja',
                'min': '0',
                'step': '0.01'
            }),
        }
        labels = {
            'monto_apertura': 'Monto de Apertura ($)',
        }
    
    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
    
    def clean_monto_apertura(self):
        monto = self.cleaned_data['monto_apertura']
        if monto < 0:
            raise ValidationError("El monto de apertura no puede ser negativo.")
        return monto
    
    def clean(self):
        cleaned_data = super().clean()
        
        # Verificar que no haya otra caja abierta
        cajas_abiertas = Caja.objects.filter(
            fecha_cierre__isnull=True,
            hora_cierre__isnull=True
        ).exists()
        
        if cajas_abiertas:
            raise ValidationError("Ya existe una caja abierta. Debe cerrarla antes de abrir una nueva.")
        
        return cleaned_data
    
    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.id_usuario = self.user
        instance.fecha_apertura = date.today()
        instance.hora_apertura = datetime.now().time()
        instance.estado_cierre = 'abierta'  # Ajustar según tus valores
        instance.created_at = datetime.now()
        
        if commit:
            instance.save()
        return instance


class CierreCajaForm(forms.ModelForm):
    class Meta:
        model = Caja
        fields = ['monto_cierre']
        widgets = {
            'monto_cierre': forms.NumberInput(attrs={
                'class': 'form-control form-control-lg',
                'placeholder': 'Monto final en caja',
                'min': '0',
                'step': '0.01'
            }),
        }
        labels = {
            'monto_cierre': 'Monto de Cierre ($)',
        }
    
    def clean_monto_cierre(self):
        monto = self.cleaned_data['monto_cierre']
        if monto < 0:
            raise ValidationError("El monto de cierre no puede ser negativo.")
        return monto
    
    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.fecha_cierre = date.today()
        instance.hora_cierre = datetime.now().time()
        instance.estado_cierre = 'cerrada'  # Ajustar según tus valores
        instance.updated_at = datetime.now()
        
        if commit:
            instance.save()
        return instance


class CobrarServicioForm(forms.ModelForm):
    class Meta:
        model = ServiciosParticulares
        fields = ['id_paciente', 'metodo_pago', 'total']
        widgets = {
            'id_paciente': forms.Select(attrs={
                'class': 'form-select',
                'required': True
            }),
            'metodo_pago': forms.Select(attrs={
                'class': 'form-select'
            }),
            'total': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Monto total del servicio',
                'min': '0',
                'step': '0.01',
                'readonly': True  # Se calculará automáticamente
            }),
        }
        labels = {
            'id_paciente': 'Paciente',
            'metodo_pago': 'Método de Pago',
            'total': 'Total ($)',
        }
    
    def __init__(self, *args, **kwargs):
        self.caja_abierta = kwargs.pop('caja_abierta', None)
        super().__init__(*args, **kwargs)
        
        # Cargar pacientes
        self.fields['id_paciente'].queryset = Pacientes.objects.all().order_by('apellido', 'nombre')
        
        # Opciones de método de pago (ajustar según tus valores)
        METODOS_PAGO = [
            ('efectivo', 'Efectivo'),
            ('tarjeta', 'Tarjeta'),
            ('transferencia', 'Transferencia'),
        ]
        self.fields['metodo_pago'].choices = METODOS_PAGO
    
    def clean_total(self):
        total = self.cleaned_data['total']
        if total <= 0:
            raise ValidationError("El total debe ser mayor a 0.")
        return total
    
    def clean(self):
        cleaned_data = super().clean()
        
        # Verificar que hay una caja abierta
        if not self.caja_abierta:
            raise ValidationError("No hay una caja abierta. Debe abrir una caja antes de cobrar servicios.")
        
        return cleaned_data
    
    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.id_caja = self.caja_abierta
        instance.fecha_realizacion = date.today()
        instance.estado_pago = 'pagado'  # Ajustar según tus valores
        instance.created_at = datetime.now()
        
        if commit:
            instance.save()
        return instance


class DetalleServicioForm(forms.ModelForm):
    class Meta:
        model = DetalleServicio
        fields = ['nro_diente', 'tratamiento', 'importe']
        widgets = {
            'nro_diente': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Número del diente (1-32)',
                'min': '1',
                'max': '32'
            }),
            'tratamiento': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Descripción del tratamiento'
            }),
            'importe': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Importe del tratamiento',
                'min': '0',
                'step': '0.01'
            }),
        }
        labels = {
            'nro_diente': 'Número de Diente',
            'tratamiento': 'Tratamiento',
            'importe': 'Importe ($)',
        }
    
    def clean_importe(self):
        importe = self.cleaned_data['importe']
        if importe <= 0:
            raise ValidationError("El importe debe ser mayor a 0.")
        return importe
    
    def clean_nro_diente(self):
        nro_diente = self.cleaned_data.get('nro_diente')
        if nro_diente and (nro_diente < 1 or nro_diente > 32):
            raise ValidationError("El número de diente debe estar entre 1 y 32.")
        return nro_diente


# Formset para manejar múltiples detalles de servicio
DetalleServicioFormSet = forms.inlineformset_factory(
    ServiciosParticulares,
    DetalleServicio,
    form=DetalleServicioForm,
    fields=['nro_diente', 'tratamiento', 'importe'],
    extra=1,  # Formularios extra vacíos
    can_delete=True,
    widgets={
        'nro_diente': forms.NumberInput(attrs={'class': 'form-control', 'min': '1', 'max': '32'}),
        'tratamiento': forms.TextInput(attrs={'class': 'form-control'}),
        'importe': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
    }
)