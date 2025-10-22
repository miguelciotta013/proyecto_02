from rest_framework import serializers
from django.contrib.auth.models import User
from home.models import Empleados, ObrasSociales, MetodosCobro, AuthUser, Tratamientos

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
        password = validated_data.get('password', None)
        if password:
            instance.set_password(password)
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
                "username": getattr(obj.user, 'username', ''),
                "first_name": getattr(obj.user, 'first_name', ''),
                "last_name": getattr(obj.user, 'last_name', '')
            }
        return None

    def create(self, validated_data):
        user = validated_data.pop('user', None)
        if isinstance(user, int):
            user = AuthUser.objects.get(pk=user)
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

# ---------- TRATAMIENTOS ----------
class TratamientosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tratamientos
        fields = ['id_tratamiento', 'nombre_tratamiento', 'codigo', 'importe', 'eliminado']
