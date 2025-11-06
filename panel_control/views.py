from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db import models
from django.db.models import Q
from django.contrib.auth.models import User
from home.models import (
    Empleados,
    ObrasSociales,
    MetodosCobro,
    Tratamientos,
    CoberturasOs
)
from .serializers import (
    AuthUserSerializer,
    EmpleadosSerializer,
    ObrasSocialesSerializer,
    MetodosCobroSerializer,
    TratamientosSerializer,
    CoberturasOsSerializer
)


# ---------- USUARIOS ----------
class AuthUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = AuthUserSerializer
    permission_classes = [AllowAny]


# ---------- EMPLEADOS ----------
class EmpleadosViewSet(viewsets.ModelViewSet):
    queryset = Empleados.objects.all()
    serializer_class = EmpleadosSerializer
    permission_classes = [AllowAny]


# ---------- OBRAS SOCIALES ----------
class ObrasSocialesViewSet(viewsets.ModelViewSet):
    queryset = ObrasSociales.objects.all()
    serializer_class = ObrasSocialesSerializer
    permission_classes = [AllowAny]


# ---------- MÉTODOS DE COBRO ----------
class MetodosCobroViewSet(viewsets.ModelViewSet):
    serializer_class = MetodosCobroSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return MetodosCobro.objects.filter(Q(eliminado=0) | Q(eliminado__isnull=True))

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.eliminado = 1
        instance.save()
        return Response({"message": "Método eliminado correctamente"}, status=status.HTTP_200_OK)


# ---------- TRATAMIENTOS ----------
class TratamientosViewSet(viewsets.ModelViewSet):
    queryset = Tratamientos.objects.filter(eliminado=0)
    serializer_class = TratamientosSerializer
    permission_classes = [AllowAny]


# ---------- COBERTURAS ----------
class CoberturasOsViewSet(viewsets.ModelViewSet):
    queryset = CoberturasOs.objects.all()
    serializer_class = CoberturasOsSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        obra_social_id = self.request.query_params.get('obra_social_id')
        if obra_social_id:
            return CoberturasOs.objects.filter(id_obra_social=obra_social_id)
        return CoberturasOs.objects.all()

    def create(self, request, *args, **kwargs):
        """Evita duplicados (mismo id_obra_social + id_tratamiento)"""
        data = request.data
        existe = CoberturasOs.objects.filter(
            id_obra_social=data.get('id_obra_social'),
            id_tratamiento=data.get('id_tratamiento')
        ).exists()

        if existe:
            return Response(
                {"error": "Esta cobertura ya existe para esa obra social y tratamiento."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """Permite actualizar solo el porcentaje sin requerir todos los campos"""
        instance = self.get_object()
        data = request.data.copy()
        serializer = self.get_serializer(instance, data=data, partial=True)
        if not serializer.is_valid():
            print("❌ Errores del serializer:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)