# home/serializers.py
from rest_framework import serializers
from home.models import Turnos, Pacientes
from django.utils import timezone

class TurnoDelDiaSerializer(serializers.ModelSerializer):
    """Turnos del día para el home"""
    paciente_nombre = serializers.CharField(source='id_paciente.nombre_paciente', read_only=True)
    paciente_apellido = serializers.CharField(source='id_paciente.apellido_paciente', read_only=True)
    paciente_telefono = serializers.CharField(source='id_paciente.telefono', read_only=True)
    estado = serializers.CharField(source='id_turno_estado.estado_turno', read_only=True)
    estado_color = serializers.SerializerMethodField()
    
    class Meta:
        model = Turnos
        fields = [
            'id_turno',
            'fecha_turno',
            'hora_turno',
            'paciente_nombre',
            'paciente_apellido',
            'paciente_telefono',
            'asunto',
            'estado',
            'estado_color'
        ]
    
    def get_estado_color(self, obj):
        """Colores para el frontend"""
        estado = obj.id_turno_estado.estado_turno.lower()
        colores = {
            'pendiente': 'warning',
            'confirmado': 'info',
            'atendido': 'success',
            'cancelado': 'danger'
        }
        return colores.get(estado, 'secondary')

class EstadisticasHomeSerializer(serializers.Serializer):
    """Estadísticas para el dashboard"""
    turnos_hoy = serializers.IntegerField()
    turnos_pendientes = serializers.IntegerField()
    turnos_atendidos = serializers.IntegerField()
    pacientes_atendidos_mes = serializers.IntegerField()
    ingresos_mes = serializers.DecimalField(max_digits=10, decimal_places=2)
    caja_estado = serializers.CharField()