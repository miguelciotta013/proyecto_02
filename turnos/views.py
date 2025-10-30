from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Q
from datetime import timedelta

from home.models import Turnos, EstadosTurno, Pacientes
from .serializers import (
    TurnoListSerializer,
    TurnoDetailSerializer,
    TurnoCreateUpdateSerializer,
    EstadoTurnoSerializer
)


class TurnoListCreateView(APIView):
    """Listar y crear turnos"""
    def get(self, request):
        try:
            fecha = request.query_params.get('fecha')  # YYYY-MM-DD
            id_paciente = request.query_params.get('id_paciente')
            id_estado = request.query_params.get('id_estado')
            fecha_desde = request.query_params.get('fecha_desde')
            fecha_hasta = request.query_params.get('fecha_hasta')
            proximos = request.query_params.get('proximos')  # "1" si quieren solo próximos

            # base: no eliminados
            turnos = Turnos.objects.filter(
                Q(eliminado__isnull=True) | Q(eliminado=0)
            )

            # filtros
            if fecha:
                turnos = turnos.filter(fecha_turno=fecha)

            if id_paciente:
                turnos = turnos.filter(id_paciente__id_paciente=id_paciente)

            if id_estado:
                turnos = turnos.filter(id_turno_estado__id_estado_turno=id_estado)

            if fecha_desde:
                turnos = turnos.filter(fecha_turno__gte=fecha_desde)

            if fecha_hasta:
                turnos = turnos.filter(fecha_turno__lte=fecha_hasta)

            if proximos == "1" and not any([fecha, fecha_desde, fecha_hasta]):
                hoy = timezone.now().date()
                fecha_limite = hoy + timedelta(days=30)
                turnos = turnos.filter(
                    fecha_turno__gte=hoy,
                    fecha_turno__lte=fecha_limite
                )

            turnos = turnos.order_by('fecha_turno', 'hora_turno')
            serializer = TurnoListSerializer(turnos, many=True)
            return Response({
                'success': True,
                'data': serializer.data,
                'total': turnos.count()
            })
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            serializer = TurnoCreateUpdateSerializer(data=request.data)
            if serializer.is_valid():
                turno = serializer.save()
                detail_serializer = TurnoDetailSerializer(turno)
                return Response({
                    'success': True,
                    'message': 'Turno creado correctamente',
                    'data': detail_serializer.data
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TurnoDetailView(APIView):
    """Detalle, actualizar y eliminar turno"""
    def get_object(self, id_turno):
        return Turnos.objects.get(
            Q(id_turno=id_turno) &
            (Q(eliminado__isnull=True) | Q(eliminado=0))
        )

    def get(self, request, id_turno):
        try:
            turno = self.get_object(id_turno)
            serializer = TurnoDetailSerializer(turno)
            return Response({'success': True, 'data': serializer.data})
        except Turnos.DoesNotExist:
            return Response({'success': False, 'error': 'Turno no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, id_turno):
        try:
            turno = self.get_object(id_turno)
            serializer = TurnoCreateUpdateSerializer(turno, data=request.data, partial=True)
            if serializer.is_valid():
                turno = serializer.save()
                return Response({
                    'success': True,
                    'message': 'Turno actualizado correctamente',
                    'data': TurnoDetailSerializer(turno).data
                })
            else:
                return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Turnos.DoesNotExist:
            return Response({'success': False, 'error': 'Turno no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, id_turno):
        try:
            turno = self.get_object(id_turno)
            turno.eliminado = 1
            turno.fecha_eliminacion = timezone.now()
            turno.save()
            return Response({'success': True, 'message': 'Turno cancelado correctamente'})
        except Turnos.DoesNotExist:
            return Response({'success': False, 'error': 'Turno no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TurnoEstadoUpdateView(APIView):
    """Cambiar estado del turno"""
    def patch(self, request, id_turno):
        try:
            turno = Turnos.objects.get(
                Q(id_turno=id_turno) &
                (Q(eliminado__isnull=True) | Q(eliminado=0))
            )
            id_estado = request.data.get('id_turno_estado')
            if not id_estado:
                return Response({'success': False, 'error': 'id_turno_estado es requerido'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                estado = EstadosTurno.objects.get(id_estado_turno=id_estado)
            except EstadosTurno.DoesNotExist:
                return Response({'success': False, 'error': 'Estado no encontrado'}, status=status.HTTP_400_BAD_REQUEST)

            turno.id_turno_estado = estado
            turno.save()
            return Response({'success': True, 'message': 'Estado del turno actualizado'})
        except Turnos.DoesNotExist:
            return Response({'success': False, 'error': 'Turno no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EstadosTurnoListView(APIView):
    """Listar estados de turno disponibles"""
    def get(self, request):
        try:
            estados = EstadosTurno.objects.filter(Q(eliminado__isnull=True) | Q(eliminado=0))
            serializer = EstadoTurnoSerializer(estados, many=True)
            return Response({'success': True, 'data': serializer.data})
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class HorariosDisponiblesView(APIView):
    """Obtener horarios disponibles para una fecha"""
    def get(self, request):
        try:
            fecha = request.query_params.get('fecha')
            if not fecha:
                return Response({'success': False, 'error': 'Parámetro fecha es requerido (YYYY-MM-DD)'}, status=status.HTTP_400_BAD_REQUEST)

            horarios_totales = []
            for hora in range(14, 21):
                horarios_totales.append(f"{hora:02d}:00:00")
                horarios_totales.append(f"{hora:02d}:30:00")

            turnos_ocupados = Turnos.objects.filter(
                Q(fecha_turno=fecha) &
                (Q(eliminado__isnull=True) | Q(eliminado=0))
            ).values_list('hora_turno', flat=True)

            ocupados_str = [str(h) for h in turnos_ocupados]
            horarios_disponibles = [h for h in horarios_totales if h not in ocupados_str]

            return Response({
                'success': True,
                'fecha': fecha,
                'horarios_disponibles': horarios_disponibles,
                'total_disponibles': len(horarios_disponibles)
            })
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
