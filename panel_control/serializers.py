from rest_framework import serializers
from home.models import (
    AuthUser,  # ✅ CAMBIAR: Usar AuthUser
    Empleados, Dientes, Tratamientos, ObrasSociales,
    CoberturasOs, MetodosCobro, PacientesXOs
)
from django.db.models import Q

# ===== USUARIOS Y PERMISOS =====

class UsuarioListSerializer(serializers.ModelSerializer):
    """Lista de usuarios con información básica"""
    nombre_completo = serializers.SerializerMethodField()
    rol = serializers.CharField(source='empleados.rol', read_only=True)
    fecha_creacion = serializers.DateTimeField(source='empleados.fecha_creacion', read_only=True)
    estado = serializers.SerializerMethodField()
    
    class Meta:
        model = AuthUser  # ✅ CAMBIAR
        fields = [
            'id',
            'username',
            'nombre_completo',
            'email',
            'rol',
            'is_active',
            'estado',
            'fecha_creacion'
        ]
    
    def get_nombre_completo(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username
    
    def get_estado(self, obj):
        return "Activo" if obj.is_active else "Inactivo"

class UsuarioDetailSerializer(serializers.ModelSerializer):
    """Detalle completo del usuario"""
    rol = serializers.CharField(source='empleados.rol', read_only=True)
    permisos = serializers.SerializerMethodField()
    
    class Meta:
        model = AuthUser  # ✅ CAMBIAR
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'rol',
            'is_active',
            'permisos'
        ]
    
    def get_permisos(self, obj):
        """Retorna permisos del usuario"""
        return {
            'puede_caja': True if obj.is_superuser else False,
            'puede_turnos': True if obj.is_superuser else False,
            'puede_pacientes': True if obj.is_superuser else False,
            'puede_fichas': True if obj.is_superuser else False,
            'es_admin': True if obj.is_superuser else False
        }

class UsuarioCreateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    rol = serializers.ChoiceField(choices=[
        ('admin', 'Administrador'),
        ('odontologo', 'Odontólogo'),
        ('recepcionista', 'Recepcionista'),
        ('cajero', 'Cajero')
    ])
    permisos = serializers.DictField(required=False)

class UsuarioUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150, required=False)
    last_name = serializers.CharField(max_length=150, required=False)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, min_length=6)
    rol = serializers.ChoiceField(
        choices=[
            ('admin', 'Administrador'),
            ('odontologo', 'Odontólogo'),
            ('recepcionista', 'Recepcionista'),
            ('cajero', 'Cajero')
        ],
        required=False
    )
    is_active = serializers.BooleanField(required=False)
    permisos = serializers.DictField(required=False)


# ===== DIENTES =====

class DienteSerializer(serializers.ModelSerializer):
    estado = serializers.SerializerMethodField()
    
    class Meta:
        model = Dientes
        fields = [
            'id_diente',
            'nombre_diente',
            'eliminado',
            'estado'
        ]
    
    def get_estado(self, obj):
        return "Activo" if not obj.eliminado else "Eliminado"

# ===== TRATAMIENTOS =====

class TratamientoSerializer(serializers.ModelSerializer):
    estado = serializers.SerializerMethodField()
    
    class Meta:
        model = Tratamientos
        fields = [
            'id_tratamiento',
            'nombre_tratamiento',
            'codigo',
            'importe',
            'eliminado',
            'estado'
        ]
    
    def get_estado(self, obj):
        if obj.eliminado == 1:
            return "Eliminado"
        return "Activo"

class TratamientoCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tratamientos
        fields = [
            'nombre_tratamiento',
            'codigo',
            'importe'
        ]

# ===== OBRAS SOCIALES =====

class ObraSocialSerializer(serializers.ModelSerializer):
    estado = serializers.SerializerMethodField()
    cantidad_pacientes = serializers.SerializerMethodField()
    
    class Meta:
        model = ObrasSociales
        fields = [
            'id_obra_social',
            'nombre_os',
            'eliminado',
            'estado',
            'cantidad_pacientes'
        ]
    
    def get_estado(self, obj):
        if obj.eliminado == 1:
            return "Eliminado"
        return "Activo"
    
    def get_cantidad_pacientes(self, obj):
   
        return PacientesXOs.objects.filter(
        Q(id_obra_social=obj) &
        (Q(eliminado__isnull=True) | Q(eliminado=0))
    ).count()

class ObraSocialCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObrasSociales
        fields = ['nombre_os']

# ===== COBERTURAS =====

class CoberturaSerializer(serializers.ModelSerializer):
    obra_social_nombre = serializers.CharField(source='id_obra_social.nombre_os', read_only=True)
    tratamiento_nombre = serializers.CharField(source='id_tratamiento.nombre_tratamiento', read_only=True)
    tratamiento_codigo = serializers.CharField(source='id_tratamiento.codigo', read_only=True)
    
    class Meta:
        model = CoberturasOs
        fields = [
            'id_cobertura',
            'id_obra_social',
            'obra_social_nombre',
            'id_tratamiento',
            'tratamiento_nombre',
            'tratamiento_codigo',
            'porcentaje'
        ]

class CoberturaCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoberturasOs
        fields = [
            'id_obra_social',
            'id_tratamiento',
            'porcentaje'
        ]
    
    def validate_porcentaje(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("El porcentaje debe estar entre 0 y 100")
        return value

# ===== MÉTODOS DE COBRO =====

class MetodoCobroSerializer(serializers.ModelSerializer):
    estado = serializers.SerializerMethodField()
    
    class Meta:
        model = MetodosCobro
        fields = [
            'id_metodo_cobro',
            'tipo_cobro',
            'eliminado',
            'estado'
        ]
    
    def get_estado(self, obj):
        if obj.eliminado == 1:
            return "Eliminado"
        return "Activo"

class MetodoCobroCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MetodosCobro
        fields = ['tipo_cobro']