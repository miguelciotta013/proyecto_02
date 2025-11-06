# login/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from home.models import AuthUser, Empleados
from .serializers import LoginSerializer, UsuarioAuthSerializer
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.core.cache import cache
from django.shortcuts import render, redirect
from django.views import View
from django.contrib.auth import login as django_login, logout as django_logout
import random
import string
from datetime import timedelta

# ============================================
# VISTAS API (para React)
# ============================================

class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                "success": True,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "username": user.username,
                "is_staff": user.is_staff,
                "id": user.id
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                "success": False,
                "error": "Credenciales inválidas"
            }, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    """Cerrar sesión"""
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response({
                'success': True,
                'message': 'Sesión cerrada correctamente'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyTokenView(APIView):
    """Verificar si el token es válido"""
    
    def post(self, request):
        try:
            token = request.data.get('token')
            
            if not token:
                return Response({
                    'success': False,
                    'error': 'Token no proporcionado'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            from rest_framework_simplejwt.tokens import AccessToken
            
            try:
                access_token = AccessToken(token)
                user_id = access_token['user_id']
                
                user = AuthUser.objects.get(id=user_id)
                user_serializer = UsuarioAuthSerializer(user)
                
                return Response({
                    'success': True,
                    'valid': True,
                    'user': user_serializer.data
                })
            except Exception:
                return Response({
                    'success': True,
                    'valid': False
                })
                
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RecuperarContrasenaView(APIView):
    """Envía código de recuperación por email"""
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({
                'success': False,
                'error': 'El correo electrónico es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        User = get_user_model()
        
        try:
            user = User.objects.get(email=email)
            
            # Verificar límite de intentos (máximo 3 códigos por hora)
            cache_key_attempts = f'recovery_attempts_{email}'
            attempts = cache.get(cache_key_attempts, 0)
            
            if attempts >= 3:
                return Response({
                    'success': False,
                    'error': 'Demasiados intentos. Por favor espere 1 hora.'
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)
            
            # Generar código de 6 dígitos
            codigo = ''.join(random.choices(string.digits, k=6))
            
            # Guardar código en caché con expiración de 15 minutos
            cache_key = f'recovery_code_{email}'
            cache.set(cache_key, codigo, timeout=900)  # 15 minutos
            
            # Incrementar intentos
            cache.set(cache_key_attempts, attempts + 1, timeout=3600)  # 1 hora
            
            # Enviar email
            try:
                send_mail(
                    subject='Recuperación de contraseña - Consultorio Odontológico GF',
                    message=f'''Hola {user.first_name or user.username},

Has solicitado recuperar tu contraseña.

Tu código de recuperación es: {codigo}

Este código expirará en 15 minutos.

Si no solicitaste este cambio, ignora este mensaje.

Saludos,
Consultorio Odontológico GF''',
                    from_email='no-reply@consultorio.com',
                    recipient_list=[email],
                    fail_silently=False,
                )
                
                return Response({
                    'success': True,
                    'message': 'Código enviado a tu correo electrónico'
                }, status=status.HTTP_200_OK)
                
            except Exception as mail_error:
                return Response({
                    'success': False,
                    'error': 'Error al enviar el correo. Por favor contacte al administrador.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except User.DoesNotExist:
            # Por seguridad, no revelar si el email existe o no
            return Response({
                'success': True,
                'message': 'Si el correo existe, recibirás un código de recuperación'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': 'Error interno del servidor'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ValidarCodigoView(APIView):
    """Valida el código sin cambiar la contraseña aún"""
    
    def post(self, request):
        email = request.data.get('email')
        codigo = request.data.get('codigo')
        
        if not email or not codigo:
            return Response({
                'success': False,
                'error': 'Email y código son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Obtener código del caché
        cache_key = f'recovery_code_{email}'
        codigo_guardado = cache.get(cache_key)
        
        if not codigo_guardado:
            return Response({
                'success': False,
                'error': 'Código expirado o inválido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if codigo != codigo_guardado:
            return Response({
                'success': False,
                'error': 'Código incorrecto'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': True,
            'message': 'Código válido'
        }, status=status.HTTP_200_OK)


class CambiarContrasenaView(APIView):
    """Cambia la contraseña usando el código validado"""
    
    def post(self, request):
        email = request.data.get('email')
        codigo = request.data.get('codigo')
        nueva_contrasena = request.data.get('nuevaContrasena')
        
        if not email or not codigo or not nueva_contrasena:
            return Response({
                'success': False,
                'error': 'Todos los campos son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar longitud mínima de contraseña
        if len(nueva_contrasena) < 8:
            return Response({
                'success': False,
                'error': 'La contraseña debe tener al menos 8 caracteres'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        User = get_user_model()
        
        try:
            user = User.objects.get(email=email)
            
            # Verificar código
            cache_key = f'recovery_code_{email}'
            codigo_guardado = cache.get(cache_key)
            
            if not codigo_guardado:
                return Response({
                    'success': False,
                    'error': 'Código expirado. Solicita uno nuevo.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if codigo != codigo_guardado:
                return Response({
                    'success': False,
                    'error': 'Código incorrecto'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Cambiar contraseña
            user.password = make_password(nueva_contrasena)
            user.save()
            
            # Eliminar código usado
            cache.delete(cache_key)
            
            # Limpiar intentos
            cache_key_attempts = f'recovery_attempts_{email}'
            cache.delete(cache_key_attempts)
            
            return Response({
                'success': True,
                'message': 'Contraseña cambiada exitosamente'
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Usuario no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': 'Error al cambiar la contraseña'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================
# VISTAS BASADAS EN TEMPLATES (para Django)
# ============================================

class LoginTemplateView(View):
    """Vista basada en templates para el formulario de inicio de sesión (session auth)."""
    template_name = 'login/login.html'

    def get(self, request):
        if request.user.is_authenticated:
            return redirect('/')
        return render(request, self.template_name, {})

    def post(self, request):
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            django_login(request, user)
            return redirect('/')
        else:
            context = {'error': 'Credenciales inválidas', 'username': username}
            return render(request, self.template_name, context)


class LogoutTemplateView(View):
    """Cerrar sesión por sesión y redirigir al login"""
    def post(self, request):
        django_logout(request)
        return redirect('/login/')

    def get(self, request):
        django_logout(request)
        return redirect('/login/')