# login/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login as django_login, logout as django_logout
from django.shortcuts import render, redirect
from django.views import View
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from home.models import AuthUser, Empleados
from .serializers import LoginSerializer, UsuarioAuthSerializer


class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        # Usa el sistema de autenticación de Django
        user = authenticate(username=username, password=password)

        if user is not None:
            # Si las credenciales son correctas, generar tokens JWT
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


class LoginTemplateView(View):
    """Vista basada en templates para el formulario de inicio de sesión (session auth).

    Método GET: Renderiza el formulario.
    Método POST: Autentica con django.contrib.auth.authenticate y realiza login por sesión.
    """
    template_name = 'login/login.html'

    def get(self, request):
        # Si ya está autenticado, redirigir al index
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
        # permitir logout via GET por simplicidad (redirige luego)
        django_logout(request)
        return redirect('/login/')

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
            
            # Verificar token
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