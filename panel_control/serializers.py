from rest_framework import serializers
from django.contrib.auth.models import User
from home.models import (
    Empleados,
    ObrasSociales,
    MetodosCobro,
    Tratamientos,
    CoberturasOs
)


# ---------- UTILIDADES ----------
class FlexibleEliminadoSerializer(serializers.ModelSerializer):
    eliminado = serializers.BooleanField()

    def to_internal_value(self, data):
        if 'eliminado' in data:
            val = data['eliminado']
            if val in [0, '0', False, 'False', 'false']:
                data['eliminado'] = False
            else:
                data['eliminado'] = True
        return super().to_internal_value(data)


# ---------- USUARIOS ----------
class AuthUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'password', 'is_active']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

    def update(self, instance, validated_data):
       
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)

    
        if 'is_active' in validated_data:
            instance.is_active = validated_data['is_active']

   
        if 'password' in validated_data and validated_data['password']:
            instance.set_password(validated_data['password'])

        instance.save()
        return instance
# ---------- EMPLEADOS ----------
class EmpleadosSerializer(serializers.ModelSerializer):
    user_info = serializers.SerializerMethodField()

    class Meta:
        model = Empleados
        fields = ['id_empleado', 'user', 'rol', 'user_info']

    def get_user_info(self, obj):
        if obj.user:
            return {
                "id": obj.user.id,
                "username": obj.user.username,
                "first_name": obj.user.first_name,
                "last_name": obj.user.last_name,
            }
        return None

    def create(self, validated_data):
        user = validated_data.pop('user', None)
        if isinstance(user, int):
            user = User.objects.get(pk=user)
        empleado = Empleados.objects.create(user=user, **validated_data)
        return empleado

    def update(self, instance, validated_data):
        instance.rol = validated_data.get('rol', instance.rol)
        instance.save()
        return instance


# ---------- OBRAS SOCIALES ----------
class ObrasSocialesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObrasSociales
        fields = '__all__'


# ---------- MÉTODOS DE COBRO ----------
class MetodosCobroSerializer(serializers.ModelSerializer):
    class Meta:
        model = MetodosCobro
        fields = '__all__'

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['eliminado'] = bool(instance.eliminado)
        return ret

    def to_internal_value(self, data):
        if 'eliminado' in data:
            data['eliminado'] = 1 if data['eliminado'] in [True, 'true', '1', 1] else 0
        return super().to_internal_value(data)


# ---------- TRATAMIENTOS ----------
class TratamientosSerializer(FlexibleEliminadoSerializer):
    class Meta:
        model = Tratamientos
        fields = ['id_tratamiento', 'nombre_tratamiento', 'codigo', 'importe', 'eliminado']


# ---------- COBERTURAS ----------
class CoberturasOsSerializer(serializers.ModelSerializer):
    obra_social_nombre = serializers.CharField(source='id_obra_social.nombre_os', read_only=True)
    tratamiento_nombre = serializers.CharField(source='id_tratamiento.nombre_tratamiento', read_only=True)

    class Meta:
        model = CoberturasOs
        fields = [
            'id_cobertura',
            'id_obra_social',
            'obra_social_nombre',
            'id_tratamiento',
            'tratamiento_nombre',
            'porcentaje'
        ]
