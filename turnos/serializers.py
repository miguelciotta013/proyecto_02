# app/turnos/serializers.py
from rest_framework import serializers
from django.utils import timezone
from django.db.models import Q
from datetime import datetime, time, timedelta
import re

from home.models import Turnos, EstadosTurno, Pacientes


class EstadoTurnoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadosTurno
        fields = ['id_estado_turno', 'estado_turno']


class TurnoListSerializer(serializers.ModelSerializer):
    # Datos del paciente (para mostrar rápido en la lista)
    paciente_nombre = serializers.CharField(
        source='id_paciente.nombre_paciente',
        read_only=True
    )
    paciente_apellido = serializers.CharField(
        source='id_paciente.apellido_paciente',
        read_only=True
    )

    # IDs para emparejar en frontend
    id_paciente = serializers.IntegerField(
        source='id_paciente.id_paciente',
        read_only=True
    )
    id_turno_estado = serializers.IntegerField(
        source='id_turno_estado.id_estado_turno',
        read_only=True
    )

    # Texto del estado
    estado = serializers.CharField(
        source='id_turno_estado.estado_turno',
        read_only=True
    )

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
    paciente_nombre = serializers.CharField(
        source='id_paciente.nombre_paciente',
        read_only=True
    )
    paciente_apellido = serializers.CharField(
        source='id_paciente.apellido_paciente',
        read_only=True
    )
    paciente_dni = serializers.IntegerField(
        source='id_paciente.dni_paciente',
        read_only=True
    )
    paciente_telefono = serializers.CharField(
        source='id_paciente.telefono',
        read_only=True
    )
    estado = serializers.CharField(
        source='id_turno_estado.estado_turno',
        read_only=True
    )

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

    - El frontend puede enviar id_paciente (pk) o bien
      paciente_nombre + paciente_apellido.
    """
    paciente_nombre = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )
    paciente_apellido = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )

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

    # --------------------- helpers ---------------------

    def _normalize_estado(self, nombre):
        """Normaliza texto de estado para aplicar reglas de negocio."""
        if not nombre:
            return None
        n = nombre.strip().lower()
        if n.startswith('pend'):
            return 'pendiente'
        if n.startswith('confirm'):
            return 'confirmado'
        if n.startswith('atend'):
            return 'atendido'
        if n.startswith('cancel'):
            return 'cancelado'
        return None

    # --------------------- validate ---------------------

    def validate(self, data):
        # 1) Normalizar strings vacíos a None
        for k, v in list(data.items()):
            if isinstance(v, str) and v.strip() == '':
                data[k] = None

        # 2) Obtener fecha/hora efectivas (nuevo valor o valor actual)
        if self.instance:
            fecha = data.get('fecha_turno', self.instance.fecha_turno)
            hora = data.get('hora_turno', self.instance.hora_turno)
            estado_actual = (
                self.instance.id_turno_estado.estado_turno
                if self.instance.id_turno_estado else None
            )
        else:
            fecha = data.get('fecha_turno')
            hora = data.get('hora_turno')
            estado_actual = None

        # 3) No permitir cambiar fecha/hora si el turno ya está Atendido o Cancelado
        estado_actual_norm = self._normalize_estado(estado_actual)
        if self.instance and estado_actual_norm in ('atendido', 'cancelado'):
            if 'fecha_turno' in data or 'hora_turno' in data:
                raise serializers.ValidationError(
                    "No se puede modificar la fecha u hora de un turno que ya está Atendido o Cancelado."
                )

        # 4) Parseo robusto de fecha/hora a objetos date/time
        fecha_obj = None
        if fecha:
            if isinstance(fecha, str):
                try:
                    fecha_obj = datetime.strptime(fecha, "%Y-%m-%d").date()
                except ValueError:
                    raise serializers.ValidationError(
                        "Formato de fecha inválido. Use YYYY-MM-DD."
                    )
            else:
                fecha_obj = fecha

        hora_obj = None
        if hora:
            if isinstance(hora, str):
                try:
                    if len(hora) == 5:
                        # HH:MM
                        hora_obj = datetime.strptime(hora, "%H:%M").time()
                    else:
                        # HH:MM:SS
                        hora_obj = datetime.strptime(hora, "%H:%M:%S").time()
                except ValueError:
                    raise serializers.ValidationError(
                        "Formato de hora inválido. Use HH:MM o HH:MM:SS."
                    )
            else:
                hora_obj = hora

        hoy = timezone.localtime().date()
        ahora = timezone.localtime()

        # 5) Reglas de FECHA
        if fecha_obj:
            # 5.1 No turnos en fines de semana
            if fecha_obj.weekday() >= 5:  # 5 = sábado, 6 = domingo
                raise serializers.ValidationError(
                    "No se pueden agendar turnos los fines de semana."
                )

            # 5.2 No turnos demasiado lejos en el futuro (ej: más de 90 días)
            MAX_DIAS_ANTICIPACION = 90
            limite_futuro = hoy + timedelta(days=MAX_DIAS_ANTICIPACION)
            if fecha_obj > limite_futuro:
                raise serializers.ValidationError(
                    "No se pueden agendar turnos con tanta anticipación."
                )

            # 5.3 No turnos en fechas pasadas
            if fecha_obj < hoy:
                raise serializers.ValidationError(
                    "No se pueden agendar turnos en fechas pasadas."
                )

        # 6) Reglas de HORA: horario de atención y slots
        if hora_obj:
            inicio = time(14, 0)
            fin = time(20, 30)
            if not (inicio <= hora_obj <= fin):
                raise serializers.ValidationError(
                    "La hora del turno debe estar dentro del horario de atención (14:00 a 20:30)."
                )
            if hora_obj.minute not in (0, 30):
                raise serializers.ValidationError(
                    "La hora del turno debe respetar intervalos de 30 minutos "
                    "(por ejemplo: 14:00, 14:30, 15:00...)."
                )

        # 7) No turnos en el pasado (fecha + hora)
        if fecha_obj and hora_obj:
            dt_turno = datetime.combine(fecha_obj, hora_obj)
            try:
                dt_turno_aware = timezone.make_aware(
                    dt_turno,
                    timezone.get_current_timezone()
                )
            except Exception:
                dt_turno_aware = dt_turno

            if dt_turno_aware < ahora:
                raise serializers.ValidationError(
                    "No se pueden agendar turnos en un horario que ya pasó."
                )

            # 7.1 Extra: al editar, no mover la fecha/hora a algo demasiado cercano
            if self.instance:
                original_dt = datetime.combine(
                    self.instance.fecha_turno,
                    self.instance.hora_turno
                )
                try:
                    original_dt_aware = timezone.make_aware(
                        original_dt,
                        timezone.get_current_timezone()
                    )
                except Exception:
                    original_dt_aware = original_dt

                if (self.instance.fecha_turno != fecha_obj or
                        self.instance.hora_turno != hora_obj):
                    margen = ahora + timedelta(minutes=5)
                    if dt_turno_aware <= margen:
                        raise serializers.ValidationError(
                            "No se puede modificar la fecha/hora de un turno tan cerca "
                            "del horario actual."
                        )

        # 8) Validación de conflicto de horario (mismo consultorio/agenda)
        instance_id = getattr(self.instance, 'id_turno', None)
        if fecha_obj and hora_obj:
            conflicto = (
                Turnos.objects
                .filter(fecha_turno=fecha_obj, hora_turno=hora_obj)
                .filter(Q(eliminado__isnull=True) | Q(eliminado=0))
                .exclude(id_turno_estado__estado_turno__icontains='cancel')
            )
            if instance_id:
                conflicto = conflicto.exclude(id_turno=instance_id)

            if conflicto.exists():
                raise serializers.ValidationError(
                    "Ya existe un turno programado para esa fecha y hora."
                )

        # 9) Validaciones de texto: asunto y comentario
        #    - Solo letras, espacios y . , -
        patron_texto = re.compile(r"^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s.,-]*$")

        asunto = data.get('asunto', self.instance.asunto if self.instance else None)
        comentario = data.get(
            'comentario_turno',
            self.instance.comentario_turno if self.instance else None
        )

        if asunto and len(asunto) > 150:
            raise serializers.ValidationError(
                "El asunto no puede superar los 150 caracteres."
            )

        if comentario and len(comentario) > 500:
            raise serializers.ValidationError(
                "El comentario no puede superar los 500 caracteres."
            )

        # Solo validamos el patrón si el campo viene en el payload
        if 'asunto' in data and asunto and not patron_texto.match(asunto):
            raise serializers.ValidationError(
                "El asunto solo puede contener letras, espacios y los caracteres . , -"
            )

        if 'comentario_turno' in data and comentario and not patron_texto.match(comentario):
            raise serializers.ValidationError(
                "El comentario solo puede contener letras, espacios y los caracteres . , -"
            )

        # 10) Paciente: id o nombre+apellido
        id_paciente = data.get('id_paciente') or (
            self.instance and self.instance.id_paciente
        )
        nombre = data.get('paciente_nombre')
        apellido = data.get('paciente_apellido')

        nombre = nombre.strip() if isinstance(nombre, str) else nombre
        apellido = apellido.strip() if isinstance(apellido, str) else apellido

        if not id_paciente and not (nombre and apellido):
            raise serializers.ValidationError(
                "Se requiere id_paciente o paciente_nombre y paciente_apellido "
                "para asignar paciente."
            )

        return data

    # --------------------- helper paciente ---------------------

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

    # --------------------- create / update ---------------------

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
        """
        En edición **NO** cambiamos de paciente usando nombre/apellido.
        Solo se cambia el paciente si viene un id_paciente explícito.
        """
        # Sacamos estos del payload para que no los toque el update base
        validated_data.pop('paciente_nombre', None)
        validated_data.pop('paciente_apellido', None)

        id_paciente = validated_data.pop('id_paciente', None)
        if id_paciente is not None:
            instance.id_paciente = id_paciente

        instance = super().update(instance, validated_data)
        return instance
