# home/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Q, Count, Sum
from datetime import datetime, timedelta
from home.models import Turnos, Cajas, CobrosConsulta, FichasMedicas
from .serializers import TurnoDelDiaSerializer, EstadisticasHomeSerializer

class HomeView(APIView):
    """Vista principal con turnos del día y estadísticas"""
    
    def get(self, request):
        try:
            user_id = request.query_params.get('user_id')
            hoy = timezone.now().date()
            
            # Obtener turnos del día
            turnos_hoy = Turnos.objects.filter(
                Q(fecha_turno=hoy) &
                (Q(eliminado__isnull=True) | Q(eliminado=0))
            ).order_by('hora_turno')
            
            turnos_serializer = TurnoDelDiaSerializer(turnos_hoy, many=True)
            
            # Calcular estadísticas
            estadisticas = self._calcular_estadisticas(hoy)
            
            return Response({
                'success': True,
                'data': {
                    'fecha': hoy,
                    'turnos': turnos_serializer.data,
                    'estadisticas': estadisticas
                }
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _calcular_estadisticas(self, hoy):
        """Calcular estadísticas para el dashboard"""
        
        # Turnos de hoy
        turnos_hoy = Turnos.objects.filter(
            Q(fecha_turno=hoy) &
            (Q(eliminado__isnull=True) | Q(eliminado=0))
        )
        
        # Turnos por estado
        turnos_pendientes = turnos_hoy.filter(
            id_turno_estado__estado_turno='pendiente'
        ).count()
        
        turnos_atendidos = turnos_hoy.filter(
            id_turno_estado__estado_turno='atendido'
        ).count()
        
        # Pacientes atendidos este mes
        inicio_mes = hoy.replace(day=1)
        pacientes_mes = FichasMedicas.objects.filter(
            Q(fecha_creacion__gte=inicio_mes) &
            Q(fecha_creacion__lte=hoy) &
            (Q(eliminado__isnull=True) | Q(eliminado=0))
        ).values('id_paciente_os').distinct().count()
        
        # Ingresos del mes
        ingresos_mes = CobrosConsulta.objects.filter(
            Q(fecha_hora_cobro__gte=inicio_mes) &
            Q(fecha_hora_cobro__lte=timezone.now()) &
            (Q(eliminado__isnull=True) | Q(eliminado=0))
        ).aggregate(Sum('monto_pagado'))['monto_pagado__sum'] or 0
        
        # Estado de la caja
        caja_abierta = Cajas.objects.filter(estado_caja=1).exists()
        caja_estado = 'Abierta' if caja_abierta else 'Cerrada'
        
        return {
            'turnos_hoy': turnos_hoy.count(),
            'turnos_pendientes': turnos_pendientes,
            'turnos_atendidos': turnos_atendidos,
            'pacientes_atendidos_mes': pacientes_mes,
            'ingresos_mes': str(ingresos_mes),
            'caja_estado': caja_estado
        }

class MensajeBienvenidaView(APIView):
    """Mensaje de bienvenida personalizado"""
    
    def get(self, request):
        try:
            user_id = request.query_params.get('user_id')
            
            if not user_id:
                return Response({
                    'success': False,
                    'error': 'user_id es requerido'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            from home.models import AuthUser, Empleados
            
            user = AuthUser.objects.get(id=user_id)
            
            # Obtener rol
            try:
                empleado = Empleados.objects.get(user=user)
                rol = empleado.rol
            except Empleados.DoesNotExist:
                rol = 'usuario'
            
            # Saludo según hora del día
            hora_actual = timezone.now().hour
            
            if hora_actual < 12:
                saludo = "Buenos días"
            elif hora_actual < 19:
                saludo = "Buenas tardes"
            else:
                saludo = "Buenas noches"
            
            nombre = user.first_name or user.username
            
            return Response({
                'success': True,
                'data': {
                    'mensaje': f"{saludo}, {nombre}",
                    'rol': rol,
                    'fecha': timezone.now().date()
                }
            })
            
        except AuthUser.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Usuario no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)