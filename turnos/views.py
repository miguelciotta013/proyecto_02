<<<<<<< HEAD
import json
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from home.models import Turnos, EstadosTurno, Pacientes
from .forms import TurnoForm


# =====================
# VISTAS HTML
# =====================
def vista_turno(request):
    return render(request, "vista_turno.html")


def registrar_turno(request):
    if request.method == "POST":
        form = TurnoForm(request.POST)
        if form.is_valid():
            turno = form.save(commit=False)
            estado_obj = EstadosTurno.objects.filter(estado_turno__iexact="Pendiente").first()
            if not estado_obj:
                estado_obj = EstadosTurno.objects.create(estado_turno="Pendiente", eliminado=0)
            turno.id_turno_estado = estado_obj
            turno.eliminado = 0
            turno.fecha_eliminacion = None
            turno.save()
            return redirect("turnos:vista_turno")
    else:
        form = TurnoForm()
    return render(request, "registrar_turno.html", {"form": form})


def modificar_turno(request, pk):
    turno = get_object_or_404(Turnos, pk=pk)
    if request.method == "POST":
        form = TurnoForm(request.POST, instance=turno)
        if form.is_valid():
            form.save()
            return redirect("turnos:vista_turno")
    else:
        form = TurnoForm(instance=turno)
    return render(request, "modificar_turno.html", {"form": form, "turno": turno})
=======
# turnos/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Q
from datetime import datetime, timedelta
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
            # Filtros opcionales
            fecha = request.query_params.get('fecha')  # YYYY-MM-DD
            id_paciente = request.query_params.get('id_paciente')
            id_estado = request.query_params.get('id_estado')
            fecha_desde = request.query_params.get('fecha_desde')
            fecha_hasta = request.query_params.get('fecha_hasta')
            
            turnos = Turnos.objects.filter(
            Q(eliminado__isnull=True) | Q(eliminado=0)
        )
            
            # Aplicar filtros
            if fecha:
                turnos = turnos.filter(fecha_turno=fecha)
            
            if id_paciente:
                turnos = turnos.filter(id_paciente=id_paciente)
            
            if id_estado:
                turnos = turnos.filter(id_turno_estado=id_estado)
            
            if fecha_desde:
                turnos = turnos.filter(fecha_turno__gte=fecha_desde)
            
            if fecha_hasta:
                turnos = turnos.filter(fecha_turno__lte=fecha_hasta)
            
            # Si no hay filtros, mostrar próximos 30 días
            if not any([fecha, fecha_desde, fecha_hasta]):
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
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Crear nuevo turno"""
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
                return Response({
                    'success': False,
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TurnoDetailView(APIView):
    """Detalle, actualizar y eliminar turno"""
    
    def get(self, request, id_turno):
        """Obtener detalle del turno"""
        try:
            turno = Turnos.objects.get(
                Q(id_turno=id_turno) &
                (Q(eliminado__isnull=True) | Q(eliminado=0))
        )
            serializer = TurnoDetailSerializer(turno)
            return Response({
                'success': True,
                'data': serializer.data
            })
        except Turnos.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Turno no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, id_turno):
        """Actualizar turno"""
        try:
            turno = Turnos.objects.get(
                Q(id_turno=id_turno) &
                (Q(eliminado__isnull=True) | Q(eliminado=0))
            )
            
            serializer = TurnoCreateUpdateSerializer(
                turno,
                data=request.data,
                partial=True
            )
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'message': 'Turno actualizado correctamente'
                })
            else:
                return Response({
                    'success': False,
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Turnos.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Turno no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, id_turno):
        """Cancelar turno (borrado lógico)"""
        try:
            turno = Turnos.objects.get(
                Q(id_turno=id_turno) &
                (Q(eliminado__isnull=True) | Q(eliminado=0))
            )
            
            turno.eliminado = 1
            turno.fecha_eliminacion = timezone.now()
            turno.save()
            
            return Response({
                'success': True,
                'message': 'Turno cancelado correctamente'
            })
            
        except Turnos.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Turno no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TurnoEstadoUpdateView(APIView):
    """Cambiar estado del turno"""
    
    def patch(self, request, id_turno):
        try:
            turno = Turnos.objects.get(
                Q(id_turno=id_turno) &
                (Q(eliminado__isnull=True) | Q(eliminado=0))
            )
>>>>>>> 9511589aa06bbbfd348877546c8854df78765fc7

            id_estado = request.data.get('id_turno_estado')
            
            if not id_estado:
                return Response({
                    'success': False,
                    'error': 'id_turno_estado es requerido'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            turno.id_turno_estado_id = id_estado
            turno.save()
            
            return Response({
                'success': True,
                'message': 'Estado del turno actualizado'
            })
            
        except Turnos.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Turno no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

<<<<<<< HEAD
# =====================
# API JSON
# =====================
@csrf_exempt
@require_http_methods(["GET"])
def api_turnos(request):
    turnos = (
        Turnos.objects
        .select_related("id_paciente", "id_turno_estado")
        .exclude(eliminado=1)
        .order_by("-fecha_turno", "-hora_turno")
    )
    data = []
    for t in turnos:
        paciente = t.id_paciente
        nombre = getattr(paciente, "nombre_paciente", "") or getattr(paciente, "nombre", "")
        apellido = getattr(paciente, "apellido_paciente", "") or getattr(paciente, "apellido", "")
        estado_obj = getattr(t, "id_turno_estado", None)
        estado_text = estado_obj.estado_turno if estado_obj else ""
        data.append({
            "id": t.id_turno,
            "paciente": f"{nombre} {apellido}".strip(),
            "apellido": apellido,
            "fecha": t.fecha_turno.strftime("%d/%m/%Y") if t.fecha_turno else "",
            "hora": t.hora_turno.strftime("%H:%M") if t.hora_turno else "",
            "asunto": t.asunto or "",
            "comentario": t.comentario_turno or "",
            "estado": estado_text,
            "estado_id": getattr(estado_obj, "id_estado_turno", None) if estado_obj else None,
        })
    return JsonResponse({"data": data})


@csrf_exempt
@require_http_methods(["POST"])
def api_eliminar_turno(request, pk):
    turno = get_object_or_404(Turnos, pk=pk)
    turno.eliminado = 1
    turno.fecha_eliminacion = timezone.now()
    turno.save()
    return JsonResponse({"success": True, "message": "Turno eliminado correctamente."})


@csrf_exempt
@require_http_methods(["POST"])
def api_set_estado(request, pk):
    turno = get_object_or_404(Turnos, pk=pk)
    if turno.eliminado == 1:
        return JsonResponse({"success": False, "message": "No se puede cambiar el estado de un turno eliminado."}, status=400)

    estado = None
    if request.content_type and request.content_type.startswith("application/json"):
        try:
            data = json.loads(request.body.decode("utf-8"))
            estado = data.get("estado")
        except Exception:
            return JsonResponse({"success": False, "message": "Error en el formato JSON."}, status=400)
    else:
        estado = request.POST.get("estado")

    if not estado:
        return JsonResponse({"success": False, "message": "Falta parámetro 'estado'."}, status=400)

    estado_obj = EstadosTurno.objects.filter(estado_turno__iexact=estado).first()
    if not estado_obj:
        estado_obj = EstadosTurno.objects.create(estado_turno=estado, eliminado=0)

    turno.id_turno_estado = estado_obj
    turno.save()
    return JsonResponse({"success": True, "message": "Estado actualizado.", "estado": estado_obj.estado_turno})
=======
class EstadosTurnoListView(APIView):
    """Listar estados de turno disponibles"""
    
    def get(self, request):
        try:
            estados = EstadosTurno.objects.filter(
                Q(eliminado__isnull=True) | Q(eliminado=0)
            )
            serializer = EstadoTurnoSerializer(estados, many=True)
            return Response({
                'success': True,
                'data': serializer.data
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class HorariosDisponiblesView(APIView):
    """Obtener horarios disponibles para una fecha"""
    
    def get(self, request):
        try:
            fecha = request.query_params.get('fecha')
            
            if not fecha:
                return Response({
                    'success': False,
                    'error': 'Parámetro fecha es requerido (YYYY-MM-DD)'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Horarios de trabajo (14:00 a 21:00, cada 30 min)
            horarios_totales = []
            for hora in range(14, 21):
                horarios_totales.append(f"{hora:02d}:00:00")
                horarios_totales.append(f"{hora:02d}:30:00")
            
            # Obtener turnos ya ocupados
            turnos_ocupados = Turnos.objects.filter(
                Q(fecha_turno=fecha) &
                (Q(eliminado__isnull=True) | Q(eliminado=0))
            ).values_list('hora_turno', flat=True)
            
            # Convertir a strings para comparar
            ocupados_str = [str(h) for h in turnos_ocupados]
            
            # Filtrar disponibles
            horarios_disponibles = [
                h for h in horarios_totales if h not in ocupados_str
            ]
            
            return Response({
                'success': True,
                'fecha': fecha,
                'horarios_disponibles': horarios_disponibles,
                'total_disponibles': len(horarios_disponibles)
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
>>>>>>> 9511589aa06bbbfd348877546c8854df78765fc7
