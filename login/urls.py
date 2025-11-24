# login/urls.py
from django.urls import path
from .views import (
    LoginView, 
    LogoutView, 
    VerifyTokenView, 
    RecuperarContrasenaView, 
    ValidarCodigoView,
    CambiarContrasenaView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('verify/', VerifyTokenView.as_view(), name='verify-token'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('recuperar-contrasena/', RecuperarContrasenaView.as_view(), name='recuperar-contrasena'),
    path('validar-codigo/', ValidarCodigoView.as_view(), name='validar-codigo'),
    path('cambiar-contrasena/', CambiarContrasenaView.as_view(), name='cambiar-contrasena'),
    # Ruta adicional por compatibilidad con frontend antiguo que llama "/auth/cambiar/"
    path('cambiar/', CambiarContrasenaView.as_view(), name='cambiar'),
]