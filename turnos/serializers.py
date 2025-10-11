# turnos/serializers.py
from rest_framework import serializers
from home.models import Turnos, EstadosTurno, Pacientes
from django.utils import timezone
from django.db.models import Q

class EstadoTurnoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadosTurno
        fields = ['id_estado_turno', 'estado_turno']

class TurnoListSerializer(serializers.ModelSerializer):
    """Para listar turnos en tabla/calendario"""
    paciente_nombre = serializers.CharField(source='id_paciente.nombre_paciente', read_only=True)
    paciente_apellido = serializers.CharField(source='id_paciente.apellido_paciente', read_only=True)
    estado = serializers.CharField(source='id_turno_estado.estado_turno', read_only=True)
    
    class Meta:
        model = Turnos
        fields = [
            'id_turno',
            'fecha_turno',
            'hora_turno',
            'paciente_nombre',
            'paciente_apellido',
            'asunto',
            'estado'
        ]

class TurnoDetailSerializer(serializers.ModelSerializer):
    """Para ver detalle completo del turno"""
    paciente_nombre = serializers.CharField(source='id_paciente.nombre_paciente', read_only=True)
    paciente_apellido = serializers.CharField(source='id_paciente.apellido_paciente', read_only=True)
    paciente_dni = serializers.IntegerField(source='id_paciente.dni_paciente', read_only=True)
    paciente_telefono = serializers.CharField(source='id_paciente.telefono', read_only=True)
    estado = serializers.CharField(source='id_turno_estado.estado_turno', read_only=True)
    
    class Meta:
        model = Turnos
        fields = [
            'id_turno',
            'id_paciente',
            'paciente_nombre',
            'paciente_apellido',
            'paciente_dni',
            'paciente_telefono',
            'fecha_turno',
            'hora_turno',
            'asunto',
            'comentario_turno',
            'id_turno_estado',
            'estado'
        ]

class TurnoCreateUpdateSerializer(serializers.ModelSerializer):
    """Para crear y actualizar turnos"""
    
    class Meta:
        model = Turnos
        fields = [
            'id_paciente',
            'fecha_turno',
            'hora_turno',
            'asunto',
            'comentario_turno',
            'id_turno_estado'
        ]
    
    # turnos/serializers.py - Modificar método validate

def validate(self, data):
    """Validar que no haya conflictos de horarios"""
    # Obtener fecha y hora (de data o de la instancia existente)
    if self.instance:
        fecha = data.get('fecha_turno', self.instance.fecha_turno)
        hora = data.get('hora_turno', self.instance.hora_turno)
    else:
        fecha = data.get('fecha_turno')
        hora = data.get('hora_turno')
    
    instance_id = self.instance.id_turno if self.instance else None
    
    # Verificar conflictos solo si tenemos fecha y hora
    if fecha and hora:
        conflicto = Turnos.objects.filter(
            Q(fecha_turno=fecha) &
            Q(hora_turno=hora) &
            (Q(eliminado__isnull=True) | Q(eliminado=0))
        )
        
        if instance_id:
            conflicto = conflicto.exclude(id_turno=instance_id)
        
        if conflicto.exists():
            raise serializers.ValidationError(
                "Ya existe un turno programado para esa fecha y hora"
            )
    
    # Validar que la fecha no sea pasada (solo si se está creando o cambiando fecha)
    if fecha and not self.instance:  # Solo al crear
        if fecha < timezone.now().date():
            raise serializers.ValidationError(
                "No se pueden crear turnos en fechas pasadas"
            )
    
    # Si se está actualizando la fecha, también validar
    if self.instance and 'fecha_turno' in data:
        if data['fecha_turno'] < timezone.now().date():
            raise serializers.ValidationError(
                "No se pueden mover turnos a fechas pasadas"
            )
    
    return data