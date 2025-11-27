# app/turnos/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Q
from datetime import timedelta, datetime, time

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
            return Response(
                {'success': False, 'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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
                return Response(
                    {'success': False, 'errors': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return Response(
                {'success': False, 'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


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
            return Response(
                {'success': False, 'error': 'Turno no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'success': False, 'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def put(self, request, id_turno):
        try:
            turno = self.get_object(id_turno)
            serializer = TurnoCreateUpdateSerializer(
                turno, data=request.data, partial=True
            )
            if serializer.is_valid():
                turno = serializer.save()
                return Response({
                    'success': True,
                    'message': 'Turno actualizado correctamente',
                    'data': TurnoDetailSerializer(turno).data
                })
            else:
                return Response(
                    {'success': False, 'errors': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Turnos.DoesNotExist:
            return Response(
                {'success': False, 'error': 'Turno no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'success': False, 'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, id_turno):
        """
        Solo permite eliminar definitivamente turnos que ya están en estado 'Cancelado'.
        """
        try:
            turno = self.get_object(id_turno)

            # Nombre del estado actual
            estado_nombre = getattr(turno.id_turno_estado, 'estado_turno', '')
            estado_norm = (estado_nombre or '').strip().lower()

            # Solo si está cancelado dejamos eliminar
            if not estado_norm.startswith('cancel'):
                return Response(
                    {
                        'success': False,
                        'error': (
                            'Solo se pueden eliminar definitivamente los turnos '
                            'que ya están en estado Cancelado.'
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            turno.eliminado = 1
            turno.fecha_eliminacion = timezone.now()
            turno.save()
            return Response({
                'success': True,
                'message': 'Turno eliminado correctamente'
            })
        except Turnos.DoesNotExist:
            return Response(
                {'success': False, 'error': 'Turno no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'success': False, 'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TurnoEstadoUpdateView(APIView):
    """
    Cambiar estado del turno.

    Reglas:
    - Matriz de transición de estados (Pendiente, Confirmado, Atendido, Cancelado).
    - Si se intenta pasar a un estado ACTIVO (no 'Cancelado') y ya existe
      otro turno activo en la misma fecha/hora, se rechaza el cambio.
    """

    def _normalize_estado(self, nombre):
        if not nombre:
            return None
        n = nombre.strip().lower()
        if n.startswith('pend'):
            return 'pendiente'
        if n.startswith('confirm'):
            return 'confirmado'
        if n.startswith('atend'):
            return 'atendido'
        if n.startswith('cancel'):
            return 'cancelado'
        return None

    def patch(self, request, id_turno):
        try:
            turno = Turnos.objects.get(
                Q(id_turno=id_turno) &
                (Q(eliminado__isnull=True) | Q(eliminado=0))
            )

            id_estado = request.data.get('id_turno_estado')
            if not id_estado:
                return Response(
                    {'success': False, 'error': 'id_turno_estado es requerido'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                estado = EstadosTurno.objects.get(id_estado_turno=id_estado)
            except EstadosTurno.DoesNotExist:
                return Response(
                    {'success': False, 'error': 'Estado no encontrado'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            estado_actual_nombre = (
                turno.id_turno_estado.estado_turno
                if turno.id_turno_estado else None
            )
            actual_norm = self._normalize_estado(estado_actual_nombre)
            nuevo_norm = self._normalize_estado(estado.estado_turno)

            # Matriz de transición de estados
            transiciones = {
                'pendiente': {'confirmado', 'cancelado'},
                'confirmado': {'atendido', 'cancelado'},
                'atendido': set(),   # estado final
                'cancelado': set(),  # estado final
            }

            # Si ambos estados son conocidos, aplicar matriz
            if actual_norm and nuevo_norm:
                permitidos = transiciones.get(actual_norm, set())
                if nuevo_norm not in permitidos:
                    return Response(
                        {
                            'success': False,
                            'error': (
                                f"Transición de estado no permitida: no se puede pasar "
                                f"de '{estado_actual_nombre}' a '{estado.estado_turno}'."
                            )
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

            nuevo_nombre = (estado.estado_turno or '').strip().lower()

            # Si el nuevo estado NO es "cancelado", validar conflictos
            if not nuevo_nombre.startswith('cancel'):
                conflicto = (
                    Turnos.objects
                    .filter(
                        fecha_turno=turno.fecha_turno,
                        hora_turno=turno.hora_turno,
                    )
                    .filter(Q(eliminado__isnull=True) | Q(eliminado=0))
                    .exclude(id_turno=turno.id_turno)
                    .exclude(id_turno_estado__estado_turno__icontains='cancel')
                )

                if conflicto.exists():
                    return Response(
                        {
                            'success': False,
                            'error': (
                                'No se puede confirmar este turno: '
                                'ya existe otro turno activo reservado en '
                                'esa fecha y horario.'
                            )
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

            # Guardar nuevo estado
            turno.id_turno_estado = estado
            turno.save()

            return Response({
                'success': True,
                'message': 'Estado del turno actualizado'
            })

        except Turnos.DoesNotExist:
            return Response(
                {'success': False, 'error': 'Turno no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'success': False, 'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class EstadosTurnoListView(APIView):
    """Listar estados de turno disponibles"""

    def get(self, request):
        try:
            estados = EstadosTurno.objects.filter(
                Q(eliminado__isnull=True) | Q(eliminado=0)
            )
            serializer = EstadoTurnoSerializer(estados, many=True)
            return Response({'success': True, 'data': serializer.data})
        except Exception as e:
            return Response(
                {'success': False, 'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class HorariosDisponiblesView(APIView):
    """Obtener horarios disponibles para una fecha"""

    def get(self, request):
        try:
            fecha = request.query_params.get('fecha')
            if not fecha:
                return Response(
                    {
                        'success': False,
                        'error': 'Parámetro fecha es requerido (YYYY-MM-DD)'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Parsear fecha a objeto date
            try:
                fecha_date = datetime.strptime(fecha, "%Y-%m-%d").date()
            except ValueError:
                return Response(
                    {
                        'success': False,
                        'error': 'Formato de fecha inválido. Use YYYY-MM-DD.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            hoy = timezone.localtime().date()

            # ❌ No ofrecer horarios para fechas pasadas
            if fecha_date < hoy:
                return Response(
                    {
                        'success': False,
                        'error': 'No se pueden obtener horarios para fechas pasadas.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # ❌ No ofrecer horarios para fechas demasiado futuras (ej: más de 90 días)
            MAX_DIAS_ANTICIPACION = 90
            limite_futuro = hoy + timedelta(days=MAX_DIAS_ANTICIPACION)
            if fecha_date > limite_futuro:
                return Response(
                    {
                        'success': False,
                        'error': 'No se pueden obtener horarios con tanta anticipación.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Si es fin de semana, no hay horarios
            if fecha_date.weekday() >= 5:  # sábado/domingo
                return Response({
                    'success': True,
                    'fecha': fecha,
                    'horarios_disponibles': [],
                    'total_disponibles': 0
                })

            # Generar todos los horarios entre 14:00 y 20:30 cada 30 minutos
            horarios_totales = []
            for h in range(14, 21):
                horarios_totales.append(f"{h:02d}:00:00")
                horarios_totales.append(f"{h:02d}:30:00")

            # Solo turnos NO eliminados y NO cancelados
            turnos_ocupados = (
                Turnos.objects
                .filter(fecha_turno=fecha)
                .filter(Q(eliminado__isnull=True) | Q(eliminado=0))
                .exclude(id_turno_estado__estado_turno__icontains='cancel')
                .values_list('hora_turno', flat=True)
            )

            ocupados_str = [str(h) for h in turnos_ocupados]

            ahora = timezone.localtime()
            horarios_disponibles = []

            for hstr in horarios_totales:
                if hstr in ocupados_str:
                    continue

                # No devolver horarios que ya pasaron en la fecha actual
                if fecha_date == hoy:
                    try:
                        hh, mm, ss = map(int, hstr.split(':'))
                        dt_slot = datetime.combine(fecha_date, time(hh, mm, ss))
                        try:
                            dt_slot_aware = timezone.make_aware(
                                dt_slot,
                                timezone.get_current_timezone()
                            )
                        except Exception:
                            dt_slot_aware = dt_slot
                        if dt_slot_aware <= ahora:
                            continue
                    except ValueError:
                        # Si por algún motivo el formato es raro, lo omitimos
                        continue

                horarios_disponibles.append(hstr)

            return Response({
                'success': True,
                'fecha': fecha,
                'horarios_disponibles': horarios_disponibles,
                'total_disponibles': len(horarios_disponibles)
            })
        except Exception as e:
            return Response(
                {'success': False, 'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
