# login/serializers.py
from rest_framework import serializers
from home.models import AuthUser, Empleados

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class UsuarioAuthSerializer(serializers.ModelSerializer):
    """Información del usuario autenticado"""
    rol = serializers.SerializerMethodField()
    nombre_completo = serializers.SerializerMethodField()
    
    class Meta:
        model = AuthUser
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'nombre_completo',
            'rol',
            'is_superuser'
        ]
    
    def get_rol(self, obj):
        try:
            empleado = Empleados.objects.get(user=obj)
            return empleado.rol
        except Empleados.DoesNotExist:
            return None
    
    def get_nombre_completo(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username