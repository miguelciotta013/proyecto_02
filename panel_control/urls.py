from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AuthUserViewSet,
    EmpleadosViewSet,
    ObrasSocialesViewSet,
    MetodosCobroViewSet,
    TratamientosViewSet
)

router = DefaultRouter()
router.register(r'authuser', AuthUserViewSet, basename='authuser')
router.register(r'empleados', EmpleadosViewSet, basename='empleados')
router.register(r'obras_sociales', ObrasSocialesViewSet, basename='obras_sociales')
router.register(r'metodos_cobro', MetodosCobroViewSet, basename='metodos_cobro')
router.register(r'tratamientos', TratamientosViewSet, basename='tratamientos')

urlpatterns = [
    path('', include(router.urls)),
]
