from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Q, Sum
from home.models import (
    Cajas, Empleados, Ingresos, Egresos,
    CobrosConsulta, MetodosCobro, AuthUser
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
            
            # Validar id_empleado: debe existir en la tabla Empleados
            id_empleado_input = request.data.get('id_empleado')
            empleado_obj = None

            if id_empleado_input:
                try:
                    empleado_obj = Empleados.objects.get(id_empleado=id_empleado_input)
                except Empleados.DoesNotExist:
                    return Response({
                        'success': False,
                        'error': 'Empleado no encontrado. Verifique id_empleado.'
                    }, status=status.HTTP_400_BAD_REQUEST)

            else:
                # Normalizar request.user -> obtener instancia AuthUser si es necesario
                user_obj = request.user
                try:
                    if not isinstance(user_obj, AuthUser):
                        # puede venir como username (str) o como objeto con atributo username
                        if isinstance(user_obj, str):
                            user_obj = AuthUser.objects.get(username=user_obj)
                        elif hasattr(user_obj, 'username') and getattr(user_obj, 'username'):
                            user_obj = AuthUser.objects.get(username=getattr(user_obj, 'username'))
                        else:
                            user_obj = None
                except AuthUser.DoesNotExist:
                    user_obj = None

                # Intentar obtener el empleado asociado al usuario autenticado (si tenemos user_obj)
                empleado_obj = None
                if user_obj:
                    try:
                        empleado_obj = Empleados.objects.get(user=user_obj)
                    except Empleados.DoesNotExist:
                        empleado_obj = None

                # Si el usuario autenticado es superuser, crear un Empleados automáticamente
                if empleado_obj is None and user_obj and getattr(user_obj, 'is_superuser', False):
                    empleado_obj = Empleados.objects.create(user=user_obj, rol='superuser')

            if not empleado_obj:
                return Response({
                    'success': False,
                    'error': 'No se proporcionó id_empleado válido y no se encontró empleado para el usuario autenticado.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Crear nueva caja usando la instancia de Empleados
            caja = Cajas.objects.create(
                id_empleado=empleado_obj,
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
            
            # Pasar la caja como contexto al serializer para validación
            serializer = EgresoSerializer(data=request.data, context={'caja': caja})
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


class CajaDashboardView(APIView):
    """Dashboard: resumen agregado de cajas con totales de ingresos, egresos y cobros"""
    
    def get(self, request):
        try:
            from django.db.models import Sum
            
            cajas = Cajas.objects.all().order_by('-fecha_hora_apertura')
            
            # Calcular totales globales
            total_ingresos = Ingresos.objects.aggregate(Sum('monto_ingreso'))['monto_ingreso__sum'] or 0
            total_egresos = Egresos.objects.aggregate(Sum('monto_egreso'))['monto_egreso__sum'] or 0
            total_cobros = CobrosConsulta.objects.filter(
                Q(eliminado__isnull=True) | Q(eliminado=0)
            ).aggregate(Sum('monto_pagado'))['monto_pagado__sum'] or 0
            
            # Por cada caja, calcular sus movimientos
            cajas_data = []
            for caja in cajas:
                caja_ingresos = Ingresos.objects.filter(
                    id_caja=caja
                ).aggregate(Sum('monto_ingreso'))['monto_ingreso__sum'] or 0
                
                caja_egresos = Egresos.objects.filter(
                    id_caja=caja
                ).aggregate(Sum('monto_egreso'))['monto_egreso__sum'] or 0
                
                caja_cobros = CobrosConsulta.objects.filter(
                    Q(id_caja=caja) &
                    (Q(eliminado__isnull=True) | Q(eliminado=0))
                ).aggregate(Sum('monto_pagado'))['monto_pagado__sum'] or 0
                
                empleado_nombre = ""
                if caja.id_empleado and caja.id_empleado.user:
                    user = caja.id_empleado.user
                    empleado_nombre = f"{user.first_name} {user.last_name}".strip() or user.username
                
                cajas_data.append({
                    'id_caja': caja.id_caja,
                    'empleado_nombre': empleado_nombre,
                    'fecha_hora_apertura': caja.fecha_hora_apertura,
                    'monto_apertura': str(caja.monto_apertura),
                    'fecha_hora_cierre': caja.fecha_hora_cierre,
                    'monto_cierre': str(caja.monto_cierre) if caja.monto_cierre else None,
                    'estado': 'Abierta' if caja.estado_caja == 1 else 'Cerrada',
                    'ingresos': str(caja_ingresos),
                    'egresos': str(caja_egresos),
                    'cobros': str(caja_cobros)
                })
            
            return Response({
                'success': True,
                'data': cajas_data,
                'resumen_total': {
                    'total_ingresos': str(total_ingresos),
                    'total_egresos': str(total_egresos),
                    'total_cobros': str(total_cobros)
                }
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EmpleadosListView(APIView):
    """Listar empleados activos"""
    def get(self, request):
        try:
            empleados = Empleados.objects.filter(
                Q(eliminado__isnull=True) | Q(eliminado=0)
            )
            data = []
            for e in empleados:
                user = e.user
                nombre = f"{user.first_name} {user.last_name}".strip() or user.username
                data.append({
                    'id_empleado': e.id_empleado,
                    'nombre': nombre
                })
            return Response({'success': True, 'data': data})
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
