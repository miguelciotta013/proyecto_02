# caja/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Q, Sum
from home.models import (
    Cajas, Empleados, Ingresos, Egresos,
    CobrosConsulta, MetodosCobro
)
from .serializers import (
    CajaListSerializer,
    CajaDetailSerializer,
    IngresoSerializer,
    EgresoSerializer,
    MetodoCobroSerializer
)

class CajaListView(APIView):
    """Listar cajas (abiertas y cerradas)"""
    
    def get(self, request):
        try:
            estado = request.query_params.get('estado')
            id_empleado = request.query_params.get('id_empleado')
            
            cajas = Cajas.objects.all()
            
            if estado == 'abierta':
                cajas = cajas.filter(estado_caja=1)
            elif estado == 'cerrada':
                cajas = cajas.filter(Q(estado_caja=0) | Q(estado_caja__isnull=True))
            
            if id_empleado:
                cajas = cajas.filter(id_empleado=id_empleado)
            
            cajas = cajas.order_by('-fecha_hora_apertura')
            
            serializer = CajaListSerializer(cajas, many=True)
            return Response({
                'success': True,
                'data': serializer.data,
                'total': cajas.count()
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CajaAperturaView(APIView):
    """Abrir caja"""
    
    def post(self, request):
        try:
            # Verificar que no haya una caja abierta
            caja_abierta = Cajas.objects.filter(estado_caja=1).first()
            
            if caja_abierta:
                return Response({
                    'success': False,
                    'error': 'Ya existe una caja abierta. Debe cerrarla antes de abrir una nueva.',
                    'caja_abierta': {
                        'id_caja': caja_abierta.id_caja,
                        'fecha_apertura': caja_abierta.fecha_hora_apertura
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Crear nueva caja
            caja = Cajas.objects.create(
                id_empleado_id=request.data.get('id_empleado'),
                fecha_hora_apertura=timezone.now(),
                monto_apertura=request.data.get('monto_apertura', 0),
                estado_caja=1
            )
            
            return Response({
                'success': True,
                'message': 'Caja abierta correctamente',
                'data': {
                    'id_caja': caja.id_caja,
                    'fecha_hora_apertura': caja.fecha_hora_apertura,
                    'monto_apertura': str(caja.monto_apertura)
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CajaCierreView(APIView):
    """Cerrar caja con arqueo"""
    def post(self, request, id_caja):
        try:
            caja = Cajas.objects.get(id_caja=id_caja, estado_caja=1)
            
            # Calcular total esperado
            total_ingresos = Ingresos.objects.filter(
                id_caja=caja
            ).aggregate(Sum('monto_ingreso'))['monto_ingreso__sum'] or 0
            
            total_egresos = Egresos.objects.filter(
                id_caja=caja
            ).aggregate(Sum('monto_egreso'))['monto_egreso__sum'] or 0
            
            total_cobros = CobrosConsulta.objects.filter(
                Q(id_caja=caja) &
                (Q(eliminado__isnull=True) | Q(eliminado=0))
            ).aggregate(Sum('monto_pagado'))['monto_pagado__sum'] or 0
            
            total_esperado = float(caja.monto_apertura) + float(total_ingresos) + float(total_cobros) - float(total_egresos)
            
            # Obtener monto real contado
            monto_cierre = request.data.get('monto_cierre')
            
            if monto_cierre is None:
                return Response({
                    'success': False,
                    'error': 'monto_cierre es requerido'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Cerrar caja
            caja.fecha_hora_cierre = timezone.now()
            caja.monto_cierre = monto_cierre
            caja.estado_caja = 0
            caja.save()
            
            diferencia = float(monto_cierre) - total_esperado
            
            return Response({
                'success': True,
                'message': 'Caja cerrada correctamente',
                'data': {
                    'id_caja': caja.id_caja,
                    'fecha_hora_cierre': caja.fecha_hora_cierre,
                    'monto_apertura': str(caja.monto_apertura),
                    'monto_cierre': str(caja.monto_cierre),
                    'total_esperado': str(total_esperado),
                    'diferencia': str(diferencia),
                    'estado': 'Sobrante' if diferencia > 0 else 'Faltante' if diferencia < 0 else 'Exacto'
                }
            })
            
        except Cajas.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Caja no encontrada o ya está cerrada'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CajaDetailView(APIView):
    """Ver detalle completo de una caja"""
    
    def get(self, request, id_caja):
        try:
            caja = Cajas.objects.get(id_caja=id_caja)
            serializer = CajaDetailSerializer(caja)
            return Response({
                'success': True,
                'data': serializer.data
            })
        except Cajas.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Caja no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CajaIngresoView(APIView):
    """Registrar ingreso adicional"""
    
    def post(self, request, id_caja):
        try:
            caja = Cajas.objects.get(id_caja=id_caja, estado_caja=1)
            
            serializer = IngresoSerializer(data=request.data)
            if serializer.is_valid():
                ingreso = Ingresos.objects.create(
                    id_caja=caja,
                    fecha_hora_ingreso=timezone.now(),
                    descripcion_ingreso=serializer.validated_data['descripcion_ingreso'],
                    monto_ingreso=serializer.validated_data['monto_ingreso']
                )
                
                return Response({
                    'success': True,
                    'message': 'Ingreso registrado correctamente',
                    'data': {
                        'id_ingreso': ingreso.id_ingreso,
                        'monto': str(ingreso.monto_ingreso)
                    }
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'success': False,
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Cajas.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Caja no encontrada o está cerrada'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CajaEgresoView(APIView):
    """Registrar egreso"""
    
    def post(self, request, id_caja):
        try:
            caja = Cajas.objects.get(id_caja=id_caja, estado_caja=1)
            
            serializer = EgresoSerializer(data=request.data)
            if serializer.is_valid():
                egreso = Egresos.objects.create(
                    id_caja=caja,
                    fecha_hora_egreso=timezone.now(),
                    descripcion_egreso=serializer.validated_data['descripcion_egreso'],
                    monto_egreso=serializer.validated_data['monto_egreso']
                )
                
                return Response({
                    'success': True,
                    'message': 'Egreso registrado correctamente',
                    'data': {
                        'id_egreso': egreso.id_egreso,
                        'monto': str(egreso.monto_egreso)
                    }
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'success': False,
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Cajas.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Caja no encontrada o está cerrada'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MetodosCobroListView(APIView):
    """Listar métodos de cobro disponibles"""
    
    def get(self, request):
        try:
            metodos = MetodosCobro.objects.filter(
                Q(eliminado__isnull=True) | Q(eliminado=0)
            )
            serializer = MetodoCobroSerializer(metodos, many=True)
            return Response({
                'success': True,
                'data': serializer.data
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
