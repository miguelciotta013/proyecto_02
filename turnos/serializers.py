from rest_framework import serializers
from django.utils import timezone
from django.db.models import Q

from home.models import Turnos, EstadosTurno, Pacientes


class EstadoTurnoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadosTurno
        fields = ['id_estado_turno', 'estado_turno']


class TurnoListSerializer(serializers.ModelSerializer):
    # Datos del paciente (para mostrar rápido en la lista)
    paciente_nombre = serializers.CharField(source='id_paciente.nombre_paciente', read_only=True)
    paciente_apellido = serializers.CharField(source='id_paciente.apellido_paciente', read_only=True)

    # Mandamos id_paciente e id_turno_estado para que el frontend pueda emparejar bien
    id_paciente = serializers.IntegerField(source='id_paciente.id_paciente', read_only=True)
    id_turno_estado = serializers.IntegerField(source='id_turno_estado.id_estado_turno', read_only=True)

    # Texto del estado
    estado = serializers.CharField(source='id_turno_estado.estado_turno', read_only=True)

    class Meta:
      model = Turnos
      fields = [
          'id_turno',
          'id_paciente',
          'fecha_turno',
          'hora_turno',
          'asunto',
          'estado',
          'id_turno_estado',
          'paciente_nombre',
          'paciente_apellido',
      ]


class TurnoDetailSerializer(serializers.ModelSerializer):
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
        read_only_fields = ['id_turno']


class TurnoCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Para crear y actualizar turnos.

    - El frontend puede enviar id_paciente (pk) o bien paciente_nombre + paciente_apellido.
    """
    paciente_nombre = serializers.CharField(write_only=True, required=False, allow_blank=True)
    paciente_apellido = serializers.CharField(write_only=True, required=False, allow_blank=True)

    id_paciente = serializers.PrimaryKeyRelatedField(
        queryset=Pacientes.objects.all(),
        required=False,
        allow_null=True
    )

    id_turno_estado = serializers.PrimaryKeyRelatedField(
        queryset=EstadosTurno.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Turnos
        fields = [
            'id_paciente',
            'paciente_nombre',
            'paciente_apellido',
            'fecha_turno',
            'hora_turno',
            'asunto',
            'comentario_turno',
            'id_turno_estado',
        ]

    def validate(self, data):
        # normalizar strings vacíos a None
        for k, v in list(data.items()):
            if isinstance(v, str) and v.strip() == '':
                data[k] = None

        # fecha/hora para validar conflictos
        if self.instance:
            fecha = data.get('fecha_turno', self.instance.fecha_turno)
            hora = data.get('hora_turno', self.instance.hora_turno)
        else:
            fecha = data.get('fecha_turno')
            hora = data.get('hora_turno')

        instance_id = getattr(self.instance, 'id_turno', None)

        
        if fecha and hora:
            conflicto = Turnos.objects.filter(
                Q(fecha_turno=fecha),
                Q(hora_turno=hora),
                (Q(eliminado__isnull=True) | Q(eliminado=0))
            )
            if instance_id:
                conflicto = conflicto.exclude(id_turno=instance_id)
            if conflicto.exists():
                raise serializers.ValidationError("Ya existe un turno programado para esa fecha y hora")

        # no permitir fechas pasadas
        hoy = timezone.now().date()
        if not self.instance:
            if fecha and fecha < hoy:
                raise serializers.ValidationError("No se pueden crear turnos en fechas pasadas")
        else:
            if 'fecha_turno' in data and data['fecha_turno'] < hoy:
                raise serializers.ValidationError("No se pueden mover turnos a fechas pasadas")

        
        id_paciente = data.get('id_paciente') or (self.instance and self.instance.id_paciente)
        nombre = data.get('paciente_nombre')
        apellido = data.get('paciente_apellido')

        nombre = nombre.strip() if isinstance(nombre, str) else nombre
        apellido = apellido.strip() if isinstance(apellido, str) else apellido

        if not id_paciente and not (nombre and apellido):
            raise serializers.ValidationError("Se requiere id_paciente o paciente_nombre y paciente_apellido para asignar paciente")

        return data

    def _get_or_create_paciente(self, nombre, apellido):
        nombre = (nombre or "").strip()
        apellido = (apellido or "").strip()
        paciente = Pacientes.objects.filter(
            nombre_paciente__iexact=nombre,
            apellido_paciente__iexact=apellido
        ).first()
        if paciente:
            return paciente

        
        paciente = Pacientes.objects.create(
            nombre_paciente=nombre,
            apellido_paciente=apellido,
            dni_paciente=0,
            fecha_nacimiento=timezone.now().date()
        )
        return paciente

    def create(self, validated_data):
        nombre = validated_data.pop('paciente_nombre', None)
        apellido = validated_data.pop('paciente_apellido', None)
        id_paciente = validated_data.pop('id_paciente', None)

        if id_paciente:
            validated_data['id_paciente'] = id_paciente
        elif nombre and apellido:
            paciente = self._get_or_create_paciente(nombre, apellido)
            validated_data['id_paciente'] = paciente

        turno = super().create(validated_data)
        return turno

    def update(self, instance, validated_data):
        nombre = validated_data.pop('paciente_nombre', None)
        apellido = validated_data.pop('paciente_apellido', None)
        id_paciente = validated_data.get('id_paciente', None)

        
        if nombre and apellido:
            paciente = self._get_or_create_paciente(nombre, apellido)
            validated_data['id_paciente'] = paciente
        elif id_paciente:
            validated_data['id_paciente'] = id_paciente

        return super().update(instance, validated_data)
