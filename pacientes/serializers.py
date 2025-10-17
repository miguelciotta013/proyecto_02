# pacientes/serializers.py
from rest_framework import serializers
from home.models import (
    Pacientes, PacientesXOs, ObrasSociales, 
    FichasPatologicas, Parentesco
)

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

class ObraSocialSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObrasSociales
        fields = ['id_obra_social', 'nombre_os']

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

class FichaPatologicaDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = FichasPatologicas
        exclude = ['id_paciente_os']

class PacienteDetailSerializer(serializers.ModelSerializer):
    """Para la card detallada del paciente"""
    obras_sociales = serializers.SerializerMethodField()
    ficha_patologica = serializers.SerializerMethodField()
    cantidad_fichas_medicas = serializers.SerializerMethodField()
    
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
            'cantidad_fichas_medicas'
        ]
    
    def get_obras_sociales(self, obj):
        pacientes_os = PacientesXOs.objects.filter(
            id_paciente=obj,
            eliminado__isnull=True
        )
        return PacienteObraSocialSerializer(pacientes_os, many=True).data
    
    def get_ficha_patologica(self, obj):
        try:
            # Obtener la primera relación paciente-OS activa
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
        from home.models import FichasMedicas
        return FichasMedicas.objects.filter(
            id_paciente_os__id_paciente=obj,
            eliminado__isnull=True
        ).count()
    
# pacientes/serializers.py - Agregar al final si no lo tienes

class FichaPatologicaDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = FichasPatologicas
        exclude = ['id_paciente_os']