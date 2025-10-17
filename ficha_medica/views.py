from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from home.models import *
from .serializers import *

class ListaPacientesFicha(APIView):
    def get(self, request):
        try:
            pacientes = Pacientes.objects.filter(eliminado__isnull=True)
            serializer = PacienteFichaSerializer(pacientes, many=True)
            return Response({
                'success': True,
                'data': serializer.data,
                'total': pacientes.count()
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        try:
            data = request.data.copy()
            data['fecha_creacion'] = timezone.now().date()
            
            serializer = FichaMedicaCreateSerializer(data=data)
            if serializer.is_valid():
                ficha = serializer.save()
                detail_serializer = FichaMedicaDetailSerializer(ficha)
                
                return Response({
                    'success': True,
                    'message': 'Ficha médica creada correctamente',
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

class CatalogosOdontologicos(APIView):
    def get(self, request):
        try:
            return Response({
                'success': True,
                'data': {
                    'dientes': DientesSerializer(
                        Dientes.objects.filter(eliminado__isnull=True), 
                        many=True
                    ).data,
                    'caras': CarasDienteSerializer(
                        CarasDiente.objects.all(), 
                        many=True
                    ).data,
                    'parentescos': ParentescoSerializer(
                        Parentesco.objects.filter(eliminado__isnull=True), 
                        many=True
                    ).data,
                    'tratamientos': TratamientosSerializer(
                        Tratamientos.objects.filter(eliminado__isnull=True), 
                        many=True
                    ).data
                }
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PacientesConObraSocial(APIView):
    def get(self, request):
        try:
            pacientes_os = PacientesXOs.objects.filter(
                eliminado__isnull=True
            ).select_related('id_paciente', 'id_obra_social')
            
            data = []
            for pac_os in pacientes_os:
                data.append({
                    'id_paciente_os': pac_os.id_paciente_os,
                    'id_paciente': pac_os.id_paciente.id_paciente,
                    'nombre_completo': f"{pac_os.id_paciente.nombre_paciente} {pac_os.id_paciente.apellido_paciente}",
                    'dni': pac_os.id_paciente.dni_paciente,
                    'obra_social': pac_os.id_obra_social.nombre_os,
                    'credencial': pac_os.credencial_paciente
                })
            
            return Response({
                'success': True,
                'data': data,
                'total': len(data)
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)    

class FichaPatologicaView(APIView):
    def post(self, request):
        try:
            serializer = FichaPatologicaSerializer(data=request.data)
            if serializer.is_valid():
                ficha_patologica = serializer.save()
                return Response({
                    'success': True,
                    'message': 'Ficha patológica creada',
                    'data': {
                        'id_ficha_patologica': ficha_patologica.id_ficha_patologica
                    }
                })
            else:
                return Response({
                    'success': False,
                    'errors': serializer.errors
                }, status=400)
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=500)

class FichasMedicasListView(APIView):
    def get(self, request):
        try:
            fichas = FichasMedicas.objects.filter(eliminado__isnull=True)
            serializer = FichaMedicaDetailSerializer(fichas, many=True)
            return Response({
                'success': True,
                'data': serializer.data,
                'total': fichas.count()
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ficha_medica/views.py - Agregar

class FichaPatologicaView(APIView):
    def get(self, request):
        """Obtener ficha patológica de un paciente-OS"""
        id_paciente_os = request.query_params.get('id_paciente_os')
        
        if not id_paciente_os:
            return Response({
                'success': False,
                'error': 'id_paciente_os es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            ficha = FichasPatologicas.objects.get(id_paciente_os=id_paciente_os)
            serializer = FichaPatologicaSerializer(ficha)
            return Response({
                'success': True,
                'exists': True,
                'data': serializer.data
            })
        except FichasPatologicas.DoesNotExist:
            return Response({
                'success': True,
                'exists': False,
                'message': 'No existe ficha patológica para este paciente'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Crear nueva ficha patológica"""
        try:
            # Verificar si ya existe
            id_paciente_os = request.data.get('id_paciente_os')
            if FichasPatologicas.objects.filter(id_paciente_os=id_paciente_os).exists():
                return Response({
                    'success': False,
                    'error': 'Ya existe una ficha patológica para este paciente'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = FichaPatologicaCreateUpdateSerializer(data=request.data)
            if serializer.is_valid():
                ficha = serializer.save()
                return Response({
                    'success': True,
                    'message': 'Ficha patológica creada',
                    'data': {
                        'id_ficha_patologica': ficha.id_ficha_patologica
                    }
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
    
    def put(self, request):
        """Actualizar ficha patológica existente"""
        try:
            id_ficha_patologica = request.data.get('id_ficha_patologica')
            ficha = FichasPatologicas.objects.get(id_ficha_patologica=id_ficha_patologica)
            
            serializer = FichaPatologicaCreateUpdateSerializer(
                ficha, 
                data=request.data, 
                partial=True
            )
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'message': 'Ficha patológica actualizada'
                })
            else:
                return Response({
                    'success': False,
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except FichasPatologicas.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Ficha patológica no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ficha_medica/views.py - Modificar FichasMedicasListView

class FichasMedicasListView(APIView):
    def get(self, request):
        try:
            # Filtros opcionales
            id_paciente = request.query_params.get('id_paciente')
            fecha_desde = request.query_params.get('fecha_desde')
            fecha_hasta = request.query_params.get('fecha_hasta')
            
            fichas = FichasMedicas.objects.filter(eliminado__isnull=True)
            
            # Filtrar por paciente si se especifica
            if id_paciente:
                fichas = fichas.filter(id_paciente_os__id_paciente=id_paciente)
            
            # Filtrar por rango de fechas
            if fecha_desde:
                fichas = fichas.filter(fecha_creacion__gte=fecha_desde)
            if fecha_hasta:
                fichas = fichas.filter(fecha_creacion__lte=fecha_hasta)
            
            fichas = fichas.order_by('-fecha_creacion')
            
            serializer = FichaMedicaConCobroSerializer(fichas, many=True)
            return Response({
                'success': True,
                'data': serializer.data,
                'total': fichas.count()
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# caja/views.py (o ficha_medica/views.py)

class CobroUpdateView(APIView):
    def patch(self, request, id_cobro):
        try:
            cobro = CobrosConsulta.objects.get(id_cobro_consulta=id_cobro)
            
            # Actualizar campos permitidos
            if 'id_metodo_cobro' in request.data:
                cobro.id_metodo_cobro = request.data['id_metodo_cobro']
            
            if 'monto_pagado' in request.data:
                cobro.monto_pagado = request.data['monto_pagado']
            
            if 'id_estado_pago' in request.data:
                estado = EstadosPago.objects.get(id_estado_pago=request.data['id_estado_pago'])
                cobro.id_estado_pago = estado
            
            # Actualizar fecha de cobro si se marca como pagado
            if cobro.id_estado_pago.nombre_estado.lower() == 'pagado':
                cobro.fecha_hora_cobro = timezone.now()
            
            cobro.save()
            
            return Response({
                'success': True,
                'message': 'Cobro actualizado correctamente',
                'data': CobroDetailSerializer(cobro).data
            })
            
        except CobrosConsulta.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Cobro no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

'''
class MiVista(APIView):
    def get(self, request):
        try:
            # Tu lógica aquí
            return Response({'success': True})
        except Exception as e:
            # Siempre manejar errores
            return Response({'error': str(e)}, status=500)

'''