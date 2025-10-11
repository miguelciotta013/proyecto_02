# pacientes/views.py
from rest_framework.views import APIView
from django.db.models import Q
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from home.models import Pacientes, PacientesXOs, ObrasSociales, FichasPatologicas, Parentesco
from pacientes.serializers import (
    PacienteListSerializer,
    PacienteCreateUpdateSerializer,
    PacienteDetailSerializer,
    PacienteObraSocialSerializer,
    ObraSocialSerializer,
    FichaPatologicaDetailSerializer
)

class PacienteListCreateView(APIView):
    """Listar todos los pacientes y crear nuevo"""
    
    def get(self, request):
        try:
            # Filtros opcionales
            search = request.query_params.get('search', '')
            
            pacientes = Pacientes.objects.filter(eliminado__isnull=True)
            
            # Búsqueda por DNI, nombre o apellido
            if search:
                pacientes = pacientes.filter(
                    Q(dni_paciente__icontains=search) |
                    Q(nombre_paciente__icontains=search) |
                    Q(apellido_paciente__icontains=search)
                )
            
            pacientes = pacientes.order_by('apellido_paciente', 'nombre_paciente')
            
            serializer = PacienteListSerializer(pacientes, many=True)
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
        """Crear nuevo paciente (solo datos personales)"""
        try:
            serializer = PacienteCreateUpdateSerializer(data=request.data)
            if serializer.is_valid():
                paciente = serializer.save()
                return Response({
                    'success': True,
                    'message': 'Paciente creado correctamente',
                    'data': {
                        'id_paciente': paciente.id_paciente,
                        'nombre_completo': f"{paciente.nombre_paciente} {paciente.apellido_paciente}"
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

class PacienteDetailView(APIView):
    """Detalle completo del paciente"""
    
    def get(self, request, id_paciente):
        try:
            paciente = Pacientes.objects.get(
                id_paciente=id_paciente,
                eliminado__isnull=True
            )
            serializer = PacienteDetailSerializer(paciente)
            return Response({
                'success': True,
                'data': serializer.data
            })
        except Pacientes.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Paciente no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, id_paciente):
        """Actualizar datos personales del paciente"""
        try:
            paciente = Pacientes.objects.get(
                id_paciente=id_paciente,
                eliminado__isnull=True
            )
            
            serializer = PacienteCreateUpdateSerializer(
                paciente,
                data=request.data,
                partial=True
            )
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'message': 'Paciente actualizado correctamente'
                })
            else:
                return Response({
                    'success': False,
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Pacientes.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Paciente no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, id_paciente):
        """Borrado lógico del paciente"""
        try:
            paciente = Pacientes.objects.get(
                id_paciente=id_paciente,
                eliminado__isnull=True
            )
            
            # Borrado lógico
            paciente.eliminado = 1
            paciente.fecha_eliminacion = timezone.now()
            paciente.save()
            
            # También marcar como eliminadas sus relaciones
            PacientesXOs.objects.filter(id_paciente=paciente).update(
                eliminado=1,
                fecha_eliminacion=timezone.now()
            )
            
            return Response({
                'success': True,
                'message': 'Paciente dado de baja correctamente'
            })
        except Pacientes.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Paciente no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PacienteObraSocialView(APIView):
    """Gestionar obras sociales del paciente"""
    
    def post(self, request, id_paciente):
        """Afiliar paciente a una obra social"""
        try:
            paciente = Pacientes.objects.get(id_paciente=id_paciente)
            
            # Verificar si ya tiene esa obra social
            existe = PacientesXOs.objects.filter(
                id_paciente=paciente,
                id_obra_social=request.data.get('id_obra_social'),
                eliminado__isnull=True
            ).exists()
            
            if existe:
                return Response({
                    'success': False,
                    'error': 'El paciente ya está afiliado a esta obra social'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Crear relación
            pac_os = PacientesXOs.objects.create(
                id_paciente=paciente,
                id_obra_social_id=request.data.get('id_obra_social'),
                id_parentesco_id=request.data.get('id_parentesco'),
                credencial_paciente=request.data.get('credencial_paciente'),
                titular=request.data.get('titular', '')
            )
            
            return Response({
                'success': True,
                'message': 'Obra social asignada correctamente',
                'data': {
                    'id_paciente_os': pac_os.id_paciente_os
                }
            }, status=status.HTTP_201_CREATED)
            
        except Pacientes.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Paciente no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, id_paciente, id_paciente_os):
        """Desafiliar paciente de una obra social"""
        try:
            pac_os = PacientesXOs.objects.get(
                id_paciente_os=id_paciente_os,
                id_paciente=id_paciente,
                eliminado__isnull=True
            )
            
            # Borrado lógico
            pac_os.eliminado = 1
            pac_os.fecha_eliminacion = timezone.now()
            pac_os.save()
            
            return Response({
                'success': True,
                'message': 'Obra social desafiliada correctamente'
            })
        except PacientesXOs.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Relación no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ObrasSocialesListView(APIView):
    """Listar obras sociales disponibles"""
    
    def get(self, request):
        try:
            # Filtrar por eliminado = 0 o eliminado IS NULL
            obras_sociales = ObrasSociales.objects.filter(
                Q(eliminado__isnull=True) | Q(eliminado=0)
            )
            serializer = ObraSocialSerializer(obras_sociales, many=True)
            return Response({
                'success': True,
                'data': serializer.data
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# pacientes/views.py - Agregar al final

# pacientes/views.py - Modificar PacienteFichaPatologicaView

class PacienteFichaPatologicaView(APIView):
    
    def get(self, request, id_paciente):
        """Obtener ficha patológica del paciente"""
        try:
            # Obtener o crear relación paciente-OS
            pac_os = self._get_or_create_paciente_os(id_paciente)
            
            try:
                ficha = FichasPatologicas.objects.get(id_paciente_os=pac_os)
                serializer = FichaPatologicaDetailSerializer(ficha)
                return Response({
                    'success': True,
                    'exists': True,
                    'data': serializer.data
                })
            except FichasPatologicas.DoesNotExist:
                return Response({
                    'success': True,
                    'exists': False,
                    'message': 'No existe ficha patológica para este paciente',
                    'id_paciente_os': pac_os.id_paciente_os
                })
                
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request, id_paciente):
        """Crear ficha patológica para el paciente"""
        try:
            # Obtener o crear relación paciente-OS
            pac_os = self._get_or_create_paciente_os(id_paciente)
            
            # Verificar si ya existe
            if FichasPatologicas.objects.filter(id_paciente_os=pac_os).exists():
                return Response({
                    'success': False,
                    'error': 'Ya existe una ficha patológica para este paciente'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Crear ficha
            data = request.data.copy()
            ficha = FichasPatologicas.objects.create(
                id_paciente_os=pac_os,
                **{k: v for k, v in data.items() if k != 'id_paciente_os'}
            )
            
            return Response({
                'success': True,
                'message': 'Ficha patológica creada correctamente',
                'data': {
                    'id_ficha_patologica': ficha.id_ficha_patologica
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, id_paciente):
        """Actualizar ficha patológica del paciente"""
        try:
            pac_os = self._get_or_create_paciente_os(id_paciente)
            
            try:
                ficha = FichasPatologicas.objects.get(id_paciente_os=pac_os)
                
                # Actualizar campos
                for field, value in request.data.items():
                    if hasattr(ficha, field) and field != 'id_ficha_patologica':
                        setattr(ficha, field, value)
                
                ficha.save()
                
                return Response({
                    'success': True,
                    'message': 'Ficha patológica actualizada correctamente'
                })
                
            except FichasPatologicas.DoesNotExist:
                return Response({
                    'success': False,
                    'error': 'No existe ficha patológica para este paciente'
                }, status=status.HTTP_404_NOT_FOUND)
                
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_or_create_paciente_os(self, id_paciente):
        """
        Obtiene la relación paciente-OS activa o crea una con 'Particular'
        si el paciente no tiene obra social
        """
        # Buscar relación activa existente
        pac_os = PacientesXOs.objects.filter(
            Q(id_paciente=id_paciente) & (Q(eliminado__isnull=True) | Q(eliminado=0))
        ).first()
        
        if pac_os:
            return pac_os
        
        # Si no tiene, crear con "Particular"
        paciente = Pacientes.objects.get(id_paciente=id_paciente)
        
        # Buscar u obtener obra social "Particular"
        obra_particular, created = ObrasSociales.objects.get_or_create(
            nombre_os='Particular',
            defaults={'eliminado': None}
        )
        
        # Buscar parentesco "Titular"
        parentesco_titular, created = Parentesco.objects.get_or_create(
            tipo_parentesco='Titular',
            defaults={'eliminado': None}
        )
        
        # Crear relación automática
        pac_os = PacientesXOs.objects.create(
            id_paciente=paciente,
            id_obra_social=obra_particular,
            id_parentesco=parentesco_titular,
            credencial_paciente=None,
            titular=f"{paciente.nombre_paciente} {paciente.apellido_paciente}"
        )
        
        return pac_os