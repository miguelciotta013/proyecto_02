from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from home.models import Empleados, ObrasSociales, MetodosCobro, Tratamientos
from .serializers import (
    AuthUserSerializer,
    EmpleadosSerializer,
    ObrasSocialesSerializer,
    MetodosCobroSerializer,
    TratamientosSerializer
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
    queryset = MetodosCobro.objects.all()
    serializer_class = MetodosCobroSerializer
    permission_classes = [AllowAny]

# ---------- TRATAMIENTOS ----------
class TratamientosViewSet(viewsets.ModelViewSet):
    queryset = Tratamientos.objects.all()
    serializer_class = TratamientosSerializer
    permission_classes = [AllowAny]
