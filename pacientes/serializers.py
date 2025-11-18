from rest_framework import serializers
from home.models import (
    Pacientes, PacientesXOs, ObrasSociales, 
    FichasPatologicas, Parentesco, FichasMedicas
)

# --- LISTA PRINCIPAL ---
class PacienteListSerializer(serializers.ModelSerializer):
    """Para la tabla principal de pacientes"""
    class Meta:
        model = Pacientes
        fields = [
            'id_paciente',
            'dni_paciente',
            'nombre_paciente',
            'apellido_paciente',
            'fecha_nacimiento',
            'correo',
            'telefono'
        ]

# --- CREAR / EDITAR PACIENTE ---
class PacienteCreateUpdateSerializer(serializers.ModelSerializer):
    """Para crear/editar datos personales del paciente"""
    class Meta:
        model = Pacientes
        fields = [
            'dni_paciente',
            'nombre_paciente',
            'apellido_paciente',
            'fecha_nacimiento',
            'domicilio',
            'localidad',
            'telefono',
            'correo'
        ]

    def validate_dni_paciente(self, value):
        """
        Evita crear o actualizar un paciente con un DNI que ya exista
        (excluyendo los registros marcados como eliminados). Cuando se
        actualiza, se permite conservar el mismo DNI del propio registro.
        """
        if value is None:
            return value

        qs = Pacientes.objects.filter(dni_paciente=value, eliminado__isnull=True)
        # Si estamos en modo actualización, excluir la instancia actual
        if getattr(self, 'instance', None) is not None:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError('Ya existe un paciente con ese DNI')

        return value

# --- LISTADO DE OBRAS SOCIALES ---
class ObraSocialSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObrasSociales
        fields = ['id_obra_social', 'nombre_os']

# --- RELACIÓN PACIENTE - OBRA SOCIAL ---
class PacienteObraSocialSerializer(serializers.ModelSerializer):
    obra_social_nombre = serializers.CharField(source='id_obra_social.nombre_os', read_only=True)
    parentesco_tipo = serializers.CharField(source='id_parentesco.tipo_parentesco', read_only=True)

    class Meta:
        model = PacientesXOs
        fields = [
            'id_paciente_os',
            'id_obra_social',
            'obra_social_nombre',
            'credencial_paciente',
            'titular',
            'id_parentesco',
            'parentesco_tipo'
        ]

# --- FICHA PATOLOGICA DETALLE ---
class FichaPatologicaDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = FichasPatologicas
        exclude = ['id_paciente_os']

# --- DETALLE COMPLETO DE PACIENTE ---
class PacienteDetailSerializer(serializers.ModelSerializer):
    """Para la card detallada del paciente"""
    obras_sociales = serializers.SerializerMethodField()
    ficha_patologica = serializers.SerializerMethodField()
    cantidad_fichas_medicas = serializers.SerializerMethodField()
    puede_eliminar = serializers.SerializerMethodField()

    class Meta:
        model = Pacientes
        fields = [
            'id_paciente',
            'dni_paciente',
            'nombre_paciente',
            'apellido_paciente',
            'fecha_nacimiento',
            'domicilio',
            'localidad',
            'telefono',
            'correo',
            'obras_sociales',
            'ficha_patologica',
            'cantidad_fichas_medicas',
            'puede_eliminar'
        ]

    def get_obras_sociales(self, obj):
        pacientes_os = PacientesXOs.objects.filter(
            id_paciente=obj,
            eliminado__isnull=True
        )
        return PacienteObraSocialSerializer(pacientes_os, many=True).data

    def get_ficha_patologica(self, obj):
        try:
            pac_os = PacientesXOs.objects.filter(
                id_paciente=obj,
                eliminado__isnull=True
            ).first()
            
            if pac_os:
                ficha = FichasPatologicas.objects.get(id_paciente_os=pac_os)
                return {
                    'id_ficha_patologica': ficha.id_ficha_patologica,
                    'existe': True
                }
        except FichasPatologicas.DoesNotExist:
            pass
        
        return {'existe': False}

    def get_cantidad_fichas_medicas(self, obj):
        return FichasMedicas.objects.filter(
            id_paciente_os__id_paciente=obj,
            eliminado__isnull=True
        ).count()

    def get_puede_eliminar(self, obj):
        """
        Determina si el paciente se puede eliminar.
        Regla: solo se puede eliminar si no tiene fichas médicas ni deudas ni obras activas.
        """
        tiene_fichas = FichasMedicas.objects.filter(
            id_paciente_os__id_paciente=obj,
            eliminado__isnull=True
        ).exists()

        tiene_obras = PacientesXOs.objects.filter(
            id_paciente=obj,
            eliminado__isnull=True
        ).exists()

        # Aquí podrías agregar chequeo de deudas si tienes un modelo de pagos
        # ejemplo: tiene_deuda = Pagos.objects.filter(paciente=obj, estado='pendiente').exists()
        tiene_deuda = False  # <- cambiar según tu modelo de pagos

        return not (tiene_fichas or tiene_obras or tiene_deuda)
