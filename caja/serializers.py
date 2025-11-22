from rest_framework import serializers
from home.models import (
    Cajas, Empleados, Ingresos, Egresos, 
    CobrosConsulta, MetodosCobro, EstadosPago
)
from django.utils import timezone
from django.db.models import Q, Sum

class CajaListSerializer(serializers.ModelSerializer):
    """Para listar cajas"""
    empleado_nombre = serializers.SerializerMethodField()
    estado = serializers.SerializerMethodField()
    
    class Meta:
        model = Cajas
        fields = [
            'id_caja',
            'empleado_nombre',
            'fecha_hora_apertura',
            'monto_apertura',
            'fecha_hora_cierre',
            'monto_cierre',
            'estado'
        ]
    
    def get_empleado_nombre(self, obj):
        user = obj.id_empleado.user
        return f"{user.first_name} {user.last_name}"
    
    def get_estado(self, obj):
        return "Abierta" if obj.estado_caja == 1 else "Cerrada"

class CajaDetailSerializer(serializers.ModelSerializer):
    """Detalle completo de la caja con movimientos"""
    empleado_nombre = serializers.SerializerMethodField()
    ingresos = serializers.SerializerMethodField()
    egresos = serializers.SerializerMethodField()
    cobros = serializers.SerializerMethodField()
    resumen = serializers.SerializerMethodField()
    
    class Meta:
        model = Cajas
        fields = [
            'id_caja',
            'id_empleado',
            'empleado_nombre',
            'fecha_hora_apertura',
            'monto_apertura',
            'fecha_hora_cierre',
            'monto_cierre',
            'estado_caja',
            'ingresos',
            'egresos',
            'cobros',
            'resumen'
        ]
    
    def get_empleado_nombre(self, obj):
        user = obj.id_empleado.user
        return f"{user.first_name} {user.last_name}"
    
    def get_ingresos(self, obj):
        ingresos = Ingresos.objects.filter(id_caja=obj)
        return [{
            'id_ingreso': i.id_ingreso,
            'fecha_hora': i.fecha_hora_ingreso,
            'descripcion': i.descripcion_ingreso,
            'monto': str(i.monto_ingreso)
        } for i in ingresos]
    
    def get_egresos(self, obj):
        egresos = Egresos.objects.filter(id_caja=obj)
        return [{
            'id_egreso': e.id_egreso,
            'fecha_hora': e.fecha_hora_egreso,
            'descripcion': e.descripcion_egreso,
            'monto': str(e.monto_egreso)
        } for e in egresos]
    
    def get_cobros(self, obj):
        cobros = CobrosConsulta.objects.filter(
            Q(id_caja=obj) &
            (Q(eliminado__isnull=True) | Q(eliminado=0))
        )
        
        data = []
        for c in cobros:
            # Obtener método de cobro
            metodo_nombre = None
            if c.id_metodo_cobro:
                try:
                    metodo = MetodosCobro.objects.get(id_metodo_cobro=c.id_metodo_cobro)
                    metodo_nombre = metodo.tipo_cobro
                except MetodosCobro.DoesNotExist:
                    pass
            
            data.append({
                'id_cobro': c.id_cobro_consulta,
                'fecha_hora': c.fecha_hora_cobro,
                'monto_total': str(c.monto_total),
                'monto_pagado': str(c.monto_pagado),
                'metodo_cobro': metodo_nombre,
                'estado': c.id_estado_pago.nombre_estado
            })
    
        return data
    
    def get_resumen(self, obj):
        from django.db.models import Sum
        
        # Total ingresos
        total_ingresos = Ingresos.objects.filter(
            id_caja=obj
        ).aggregate(Sum('monto_ingreso'))['monto_ingreso__sum'] or 0
        
        # Total egresos
        total_egresos = Egresos.objects.filter(
            id_caja=obj
        ).aggregate(Sum('monto_egreso'))['monto_egreso__sum'] or 0
        
        # Total cobros
        total_cobros = CobrosConsulta.objects.filter(
            Q(id_caja=obj) &
            (Q(eliminado__isnull=True) | Q(eliminado=0))
        ).aggregate(Sum('monto_pagado'))['monto_pagado__sum'] or 0
        
        # Calcular total esperado
        total_esperado = float(obj.monto_apertura) + float(total_ingresos) + float(total_cobros) - float(total_egresos)
        
        return {
            'monto_apertura': str(obj.monto_apertura),
            'total_ingresos': str(total_ingresos),
            'total_egresos': str(total_egresos),
            'total_cobros': str(total_cobros),
            'total_esperado': str(total_esperado),
            'monto_cierre': str(obj.monto_cierre) if obj.monto_cierre else None,
            'diferencia': str(float(obj.monto_cierre) - total_esperado) if obj.monto_cierre else None
        }

class IngresoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingresos
        fields = ['descripcion_ingreso', 'monto_ingreso']

class EgresoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Egresos
        fields = ['descripcion_egreso', 'monto_egreso']
    
    def validate_monto_egreso(self, value):
        """
        Valida que el monto del egreso no supere el saldo disponible en la caja.
        El saldo se calcula como: monto_apertura + ingresos + cobros - egresos_existentes
        """
        caja = self.context.get('caja')
        if not caja:
            return value
        
        # Calcular saldo disponible
        total_ingresos = Ingresos.objects.filter(
            id_caja=caja
        ).aggregate(Sum('monto_ingreso'))['monto_ingreso__sum'] or 0
        
        total_egresos_existentes = Egresos.objects.filter(
            id_caja=caja
        ).aggregate(Sum('monto_egreso'))['monto_egreso__sum'] or 0
        
        total_cobros = CobrosConsulta.objects.filter(
            Q(id_caja=caja) &
            (Q(eliminado__isnull=True) | Q(eliminado=0))
        ).aggregate(Sum('monto_pagado'))['monto_pagado__sum'] or 0
        
        # Saldo disponible = apertura + ingresos + cobros - egresos ya realizados
        saldo_disponible = float(caja.monto_apertura) + float(total_ingresos) + float(total_cobros) - float(total_egresos_existentes)
        
        if float(value) > saldo_disponible:
            raise serializers.ValidationError(
                f'El monto del egreso ({value}) supera el saldo disponible en la caja ({saldo_disponible:.2f})'
            )
        
        return value

class MetodoCobroSerializer(serializers.ModelSerializer):
    class Meta:
        model = MetodosCobro
        fields = ['id_metodo_cobro', 'tipo_cobro']