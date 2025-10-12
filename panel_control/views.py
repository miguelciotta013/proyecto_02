# panel_control/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Q
from home.models import (
    AuthUser,  # ✅ CAMBIAR: Usar AuthUser en lugar de User
    Empleados, Dientes, Tratamientos, ObrasSociales,
    CoberturasOs, MetodosCobro
)
from .serializers import (
    UsuarioListSerializer, UsuarioDetailSerializer,
    UsuarioCreateSerializer, UsuarioUpdateSerializer,
    DienteSerializer, TratamientoSerializer,
    TratamientoCreateUpdateSerializer, ObraSocialSerializer,
    ObraSocialCreateUpdateSerializer, CoberturaSerializer,
    CoberturaCreateUpdateSerializer, MetodoCobroSerializer,
    MetodoCobroCreateUpdateSerializer
)

# ===== GESTIÓN DE USUARIOS =====

class UsuarioListCreateView(APIView):
    """Listar y crear usuarios"""
    
    def get(self, request):
        try:
            # ✅ Usar AuthUser
            usuarios = AuthUser.objects.all().order_by('-date_joined')
            serializer = UsuarioListSerializer(usuarios, many=True)
            return Response({
                'success': True,
                'data': serializer.data,
                'total': usuarios.count()
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        try:
            serializer = UsuarioCreateSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            
            # ✅ Verificar con AuthUser
            if AuthUser.objects.filter(username=data['username']).exists():
                return Response({
                    'success': False,
                    'error': 'El nombre de usuario ya existe'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # ✅ Crear usuario con AuthUser
            auth_user = AuthUser.objects.create(
                username=data['username'],
                first_name=data['first_name'],
                last_name=data['last_name'],
                email=data.get('email', ''),
                is_superuser=0,
                is_staff=0,
                is_active=1,
                date_joined=timezone.now()
            )
            
            # Establecer contraseña
            auth_user.set_password(data['password'])
            auth_user.save()
            
            # Crear empleado asociado
            empleado = Empleados.objects.create(
                user=auth_user,
                rol=data['rol'],
                fecha_creacion=timezone.now()
            )
            
            # Asignar permisos según rol
            permisos = data.get('permisos', {})
            self._asignar_permisos(auth_user, permisos, data['rol'])
            
            return Response({
                'success': True,
                'message': 'Usuario creado correctamente',
                'data': {
                    'id': auth_user.id,
                    'username': auth_user.username
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _asignar_permisos(self, user, permisos, rol):
        """Asignar permisos según rol o permisos específicos"""
        if rol == 'admin':
            user.is_superuser = 1
            user.is_staff = 1
        elif rol == 'odontologo':
            user.is_staff = 0
        elif rol == 'recepcionista':
            user.is_staff = 0
        elif rol == 'cajero':
            user.is_staff = 0
        
        user.save()

class UsuarioDetailView(APIView):
    """Ver, actualizar y eliminar usuario"""
    
    def get(self, request, user_id):
        try:
            # ✅ Usar AuthUser
            user = AuthUser.objects.get(id=user_id)
            serializer = UsuarioDetailSerializer(user)
            return Response({
                'success': True,
                'data': serializer.data
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
    
    def put(self, request, user_id):
        try:
            # ✅ Usar AuthUser
            user = AuthUser.objects.get(id=user_id)
            serializer = UsuarioUpdateSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            
            # Actualizar campos básicos
            if 'first_name' in data:
                user.first_name = data['first_name']
            if 'last_name' in data:
                user.last_name = data['last_name']
            if 'email' in data:
                user.email = data['email']
            if 'password' in data:
                user.set_password(data['password'])
            if 'is_active' in data:
                user.is_active = 1 if data['is_active'] else 0
            
            user.save()
            
            # Actualizar rol si se especifica
            if 'rol' in data:
                try:
                    empleado = Empleados.objects.get(user=user)
                    empleado.rol = data['rol']
                    empleado.save()
                except Empleados.DoesNotExist:
                    pass
            
            return Response({
                'success': True,
                'message': 'Usuario actualizado correctamente'
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
    
    def delete(self, request, user_id):
        """Dar de baja usuario (borrado lógico)"""
        try:
            # ✅ Usar AuthUser
            user = AuthUser.objects.get(id=user_id)
            
            # Desactivar usuario
            user.is_active = 0
            user.save()
            
            # Marcar empleado como eliminado
            try:
                empleado = Empleados.objects.get(user=user)
                empleado.eliminado = 1
                empleado.fecha_eliminacion = timezone.now()
                empleado.save()
            except Empleados.DoesNotExist:
                pass
            
            return Response({
                'success': True,
                'message': 'Usuario dado de baja correctamente'
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


# ===== GESTIÓN DE DIENTES =====

class DienteListView(APIView):
    """Listar y actualizar dientes"""
    
    def get(self, request):
        try:
            dientes = Dientes.objects.filter(
                Q(eliminado__isnull=True) | Q(eliminado=0)
            ).order_by('id_diente')
            
            serializer = DienteSerializer(dientes, many=True)
            return Response({
                'success': True,
                'data': serializer.data,
                'total': dientes.count()
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, id_diente):
        """Actualizar nombre del diente"""
        try:
            diente = Dientes.objects.get(id_diente=id_diente)
            
            nombre_diente = request.data.get('nombre_diente')
            if nombre_diente:
                diente.nombre_diente = nombre_diente
                diente.save()
            
            return Response({
                'success': True,
                'message': 'Diente actualizado correctamente'
            })
            
        except Dientes.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Diente no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ===== GESTIÓN DE TRATAMIENTOS =====

class TratamientoListCreateView(APIView):
    """Listar y crear tratamientos"""
    
    def get(self, request):
        try:
            tratamientos = Tratamientos.objects.filter(
                Q(eliminado__isnull=True) | Q(eliminado=0)
            ).order_by('nombre_tratamiento')
            
            serializer = TratamientoSerializer(tratamientos, many=True)
            return Response({
                'success': True,
                'data': serializer.data,
                'total': tratamientos.count()
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        try:
            serializer = TratamientoCreateUpdateSerializer(data=request.data)
            
            if serializer.is_valid():
                tratamiento = serializer.save()
                return Response({
                    'success': True,
                    'message': 'Tratamiento creado correctamente',
                    'data': {
                        'id_tratamiento': tratamiento.id_tratamiento
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

class TratamientoDetailView(APIView):
    """Ver, actualizar y eliminar tratamiento"""
    
    def put(self, request, id_tratamiento):
        try:
            tratamiento = Tratamientos.objects.get(id_tratamiento=id_tratamiento)
            serializer = TratamientoCreateUpdateSerializer(tratamiento, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'message': 'Tratamiento actualizado correctamente'
                })
            else:
                return Response({
                    'success': False,
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Tratamientos.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Tratamiento no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, id_tratamiento):
        try:
            tratamiento = Tratamientos.objects.get(id_tratamiento=id_tratamiento)
            tratamiento.eliminado = 1
            tratamiento.fecha_eliminacion = timezone.now()
            tratamiento.save()
            
            return Response({
                'success': True,
                'message': 'Tratamiento eliminado correctamente'
            })
            
        except Tratamientos.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Tratamiento no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ===== GESTIÓN DE OBRAS SOCIALES =====

class ObraSocialListCreateView(APIView):
    """Listar y crear obras sociales"""
    
    def get(self, request):
        try:
            obras_sociales = ObrasSociales.objects.filter(
                Q(eliminado__isnull=True) | Q(eliminado=0)
            ).order_by('nombre_os')
            
            serializer = ObraSocialSerializer(obras_sociales, many=True)
            return Response({
                'success': True,
                'data': serializer.data,
                'total': obras_sociales.count()
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        try:
            serializer = ObraSocialCreateUpdateSerializer(data=request.data)
            
            if serializer.is_valid():
                obra_social = serializer.save()
                return Response({
                    'success': True,
                    'message': 'Obra social creada correctamente',
                    'data': {
                        'id_obra_social': obra_social.id_obra_social
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

class ObraSocialDetailView(APIView):
    """Ver, actualizar y eliminar obra social"""
    
    def put(self, request, id_obra_social):
        try:
            obra_social = ObrasSociales.objects.get(id_obra_social=id_obra_social)
            serializer = ObraSocialCreateUpdateSerializer(obra_social, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'message': 'Obra social actualizada correctamente'
                })
            else:
                return Response({
                    'success': False,
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except ObrasSociales.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Obra social no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, id_obra_social):
        try:
            obra_social = ObrasSociales.objects.get(id_obra_social=id_obra_social)
            obra_social.eliminado = 1
            obra_social.fecha_eliminacion = timezone.now()
            obra_social.save()
            
            return Response({
                'success': True,
                'message': 'Obra social eliminada correctamente'
            })
            
        except ObrasSociales.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Obra social no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ===== GESTIÓN DE COBERTURAS =====

class CoberturaListCreateView(APIView):
    """Listar y crear coberturas"""
    
    def get(self, request):
        try:
            id_obra_social = request.query_params.get('id_obra_social')
            
            coberturas = CoberturasOs.objects.all()
            
            if id_obra_social:
                coberturas = coberturas.filter(id_obra_social=id_obra_social)
            
            coberturas = coberturas.order_by('id_obra_social', 'id_tratamiento')
            
            serializer = CoberturaSerializer(coberturas, many=True)
            return Response({
                'success': True,
                'data': serializer.data,
                'total': coberturas.count()
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        try:
            serializer = CoberturaCreateUpdateSerializer(data=request.data)
            
            if serializer.is_valid():
                # Verificar si ya existe
                existe = CoberturasOs.objects.filter(
                    id_obra_social=serializer.validated_data['id_obra_social'],
                    id_tratamiento=serializer.validated_data['id_tratamiento']
                ).exists()
                
                if existe:
                    return Response({
                        'success': False,
                        'error': 'Ya existe una cobertura para este tratamiento en esta obra social'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                cobertura = serializer.save()
                return Response({
                    'success': True,
                    'message': 'Cobertura creada correctamente',
                    'data': {
                        'id_cobertura': cobertura.id_cobertura
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

class CoberturaDetailView(APIView):
    """Actualizar y eliminar cobertura"""
    
    def put(self, request, id_cobertura):
        try:
            cobertura = CoberturasOs.objects.get(id_cobertura=id_cobertura)
            serializer = CoberturaCreateUpdateSerializer(cobertura, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'message': 'Cobertura actualizada correctamente'
                })
            else:
                return Response({
                    'success': False,
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except CoberturasOs.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Cobertura no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, id_cobertura):
        try:
            cobertura = CoberturasOs.objects.get(id_cobertura=id_cobertura)
            cobertura.delete()
            
            return Response({
                'success': True,
                'message': 'Cobertura eliminada correctamente'
            })
            
        except CoberturasOs.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Cobertura no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ===== GESTIÓN DE MÉTODOS DE COBRO =====

class MetodoCobroListCreateView(APIView):
    """Listar y crear métodos de cobro"""
    
    def get(self, request):
        try:
            metodos = MetodosCobro.objects.filter(
                Q(eliminado__isnull=True) | Q(eliminado=0)
            ).order_by('tipo_cobro')
            
            serializer = MetodoCobroSerializer(metodos, many=True)
            return Response({
                'success': True,
                'data': serializer.data,
                'total': metodos.count()
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        try:
            serializer = MetodoCobroCreateUpdateSerializer(data=request.data)
            
            if serializer.is_valid():
                metodo = serializer.save()
                return Response({
                    'success': True,
                    'message': 'Método de cobro creado correctamente',
                    'data': {
                        'id_metodo_cobro': metodo.id_metodo_cobro
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

class MetodoCobroDetailView(APIView):
    """Actualizar y eliminar método de cobro"""
    
    def put(self, request, id_metodo_cobro):
        try:
            metodo = MetodosCobro.objects.get(id_metodo_cobro=id_metodo_cobro)
            serializer = MetodoCobroCreateUpdateSerializer(metodo, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'message': 'Método de cobro actualizado correctamente'
                })
            else:
                return Response({
                    'success': False,
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except MetodosCobro.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Método de cobro no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, id_metodo_cobro):
        try:
            metodo = MetodosCobro.objects.get(id_metodo_cobro=id_metodo_cobro)
            metodo.eliminado = 1
            metodo.fecha_eliminacion = timezone.now()
            metodo.save()
            
            return Response({
                'success': True,
                'message': 'Método de cobro eliminado correctamente'
            })
            
        except MetodosCobro.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Método de cobro no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)