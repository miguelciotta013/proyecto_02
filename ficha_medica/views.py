from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.http import HttpResponse
from django.db.models import Q
from home.models import (
    Pacientes, FichasMedicas, PacientesXOs, FichasPatologicas,
    Dientes, CarasDiente, Tratamientos, DetallesConsulta, 
    CoberturasOs, CobrosConsulta, EstadosPago, Cajas, MetodosCobro
)
from .serializers import (
    PacienteFichaSerializer, FichaMedicaCreateSerializer,
    FichaMedicaDetailSerializer, DientesSerializer, CarasDienteSerializer,
    ParentescoSerializer, TratamientosSerializer, FichaPatologicaSerializer,
    FichaPatologicaCreateUpdateSerializer, FichaMedicaConCobroSerializer,
    CobroDetailSerializer, MetodosCobroSerializer, EstadosPagoSerializer
)


class ListaPacientesFicha(APIView):
    """
    GET: Lista de pacientes con búsqueda
    POST: Crear nueva ficha médica
    """
    def get(self, request):
        try:
            # Parámetro de búsqueda
            search = request.query_params.get('search', '').strip()
            
            pacientes = Pacientes.objects.filter(eliminado__isnull=True)
            
            # Aplicar filtro de búsqueda
            if search:
                pacientes = pacientes.filter(
                    Q(nombre_paciente__icontains=search) |
                    Q(apellido_paciente__icontains=search) |
                    Q(dni_paciente__icontains=search)
                )
            
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
        """Crear nueva ficha médica"""
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
    """Obtener todos los catálogos necesarios para odontología"""
    def get(self, request):
        try:
            from home.models import Parentesco
            
            return Response({
                'success': True,
                'data': {
                    'dientes': DientesSerializer(
                        Dientes.objects.all(),
                        many=True
                    ).data,
                    'caras': CarasDienteSerializer(
                        CarasDiente.objects.all(), 
                        many=True
                    ).data,
                    'parentescos': ParentescoSerializer(
                        Parentesco.objects.all(),
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
    """Lista de todas las relaciones paciente-obra social"""
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
    """Gestión de fichas patológicas"""
    
    def get(self, request):
        """Verificar si existe ficha patológica para un paciente-OS"""
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
            if not id_ficha_patologica:
                return Response({
                    'success': False,
                    'error': 'id_ficha_patologica es requerido'
                }, status=status.HTTP_400_BAD_REQUEST)
            
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


class FichasMedicasListView(APIView):
    """Lista de fichas médicas con filtros"""
    
    def get(self, request):
        try:
            id_paciente = request.query_params.get('id_paciente')
            fecha_desde = request.query_params.get('fecha_desde')
            fecha_hasta = request.query_params.get('fecha_hasta')
            
            fichas = FichasMedicas.objects.filter(eliminado__isnull=True)
            
            if id_paciente:
                fichas = fichas.filter(id_paciente_os__id_paciente=id_paciente)
            
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


class FichaMedicaDetailView(APIView):
    """Operaciones sobre una ficha médica específica"""
    
    def get(self, request, id_ficha):
        """Obtener detalle completo de una ficha médica"""
        try:
            ficha = FichasMedicas.objects.get(
                id_ficha_medica=id_ficha,
                eliminado__isnull=True
            )
            serializer = FichaMedicaConCobroSerializer(ficha)
            return Response({
                'success': True,
                'data': serializer.data
            })
        except FichasMedicas.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Ficha médica no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, id_ficha):
        """Actualizar datos de ficha médica"""
        try:
            ficha = FichasMedicas.objects.get(
                id_ficha_medica=id_ficha,
                eliminado__isnull=True
            )
            
            if 'observaciones' in request.data:
                ficha.observaciones = request.data['observaciones']
            if 'nro_autorizacion' in request.data:
                ficha.nro_autorizacion = request.data['nro_autorizacion']
            if 'nro_coseguro' in request.data:
                ficha.nro_coseguro = request.data['nro_coseguro']
            
            ficha.save()
            
            serializer = FichaMedicaConCobroSerializer(ficha)
            return Response({
                'success': True,
                'message': 'Ficha médica actualizada correctamente',
                'data': serializer.data
            })
        except FichasMedicas.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Ficha médica no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, id_ficha):
        """Eliminar (soft delete) ficha médica"""
        try:
            ficha = FichasMedicas.objects.get(
                id_ficha_medica=id_ficha,
                eliminado__isnull=True
            )
            
            ficha.eliminado = 1
            ficha.fecha_eliminacion = timezone.now()
            ficha.save()
            
            # Eliminar detalles asociados
            DetallesConsulta.objects.filter(
                id_ficha_medica=ficha
            ).update(eliminado=1, fecha_eliminacion=timezone.now())
            
            return Response({
                'success': True,
                'message': 'Ficha médica eliminada correctamente'
            })
        except FichasMedicas.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Ficha médica no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FichaMedicaPDFView(APIView):
    """Generar y descargar PDF de ficha médica"""
    
    def get(self, request, id_ficha):
        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.pdfgen import canvas
            from reportlab.lib.units import inch
            from io import BytesIO
            
            ficha = FichasMedicas.objects.get(
                id_ficha_medica=id_ficha,
                eliminado__isnull=True
            )
            
            buffer = BytesIO()
            p = canvas.Canvas(buffer, pagesize=A4)
            width, height = A4
            
            # Título
            p.setFont("Helvetica-Bold", 16)
            p.drawString(1*inch, height - 1*inch, f"Ficha Medica #{id_ficha}")
            
            # Datos del paciente
            p.setFont("Helvetica-Bold", 12)
            p.drawString(1*inch, height - 1.5*inch, "Datos del Paciente:")
            
            p.setFont("Helvetica", 10)
            paciente = ficha.id_paciente_os.id_paciente
            p.drawString(1*inch, height - 1.8*inch, 
                        f"Nombre: {paciente.nombre_paciente} {paciente.apellido_paciente}")
            p.drawString(1*inch, height - 2.0*inch, f"DNI: {paciente.dni_paciente}")
            
            # Obra Social
            p.drawString(1*inch, height - 2.2*inch, 
                        f"Obra Social: {ficha.id_paciente_os.id_obra_social.nombre_os}")
            
            # Fecha
            p.drawString(1*inch, height - 2.4*inch, 
                        f"Fecha: {ficha.fecha_creacion}")
            
            # Observaciones
            if ficha.observaciones:
                p.setFont("Helvetica-Bold", 12)
                p.drawString(1*inch, height - 2.8*inch, "Observaciones:")
                p.setFont("Helvetica", 10)
                p.drawString(1*inch, height - 3.0*inch, str(ficha.observaciones)[:80])
            
            # Detalles de tratamientos
            p.setFont("Helvetica-Bold", 12)
            p.drawString(1*inch, height - 3.4*inch, "Tratamientos Realizados:")
            
            detalles = DetallesConsulta.objects.filter(
                id_ficha_medica=ficha,
                eliminado__isnull=True
            )
            
            y_position = height - 3.7*inch
            p.setFont("Helvetica", 9)
            
            for detalle in detalles:
                tratamiento_text = f"- {detalle.id_tratamiento.nombre_tratamiento}"
                if detalle.id_diente:
                    tratamiento_text += f" - Diente: {detalle.id_diente.nombre_diente}"
                p.drawString(1.2*inch, y_position, tratamiento_text)
                y_position -= 0.2*inch
                
                if y_position < 1*inch:
                    p.showPage()
                    y_position = height - 1*inch
            
            # Obtener cobro
            if detalles.exists():
                cobro = detalles.first().id_cobro_consulta
                if cobro:
                    p.setFont("Helvetica-Bold", 12)
                    p.drawString(1*inch, y_position - 0.3*inch, "Informacion de Cobro:")
                    
                    p.setFont("Helvetica", 10)
                    p.drawString(1*inch, y_position - 0.6*inch, 
                                f"Monto Total: ${cobro.monto_total}")
                    p.drawString(1*inch, y_position - 0.8*inch, 
                                f"Cobertura Obra Social: ${cobro.monto_obra_social}")
                    p.drawString(1*inch, y_position - 1.0*inch, 
                                f"Monto Paciente: ${cobro.monto_paciente}")
                    p.drawString(1*inch, y_position - 1.2*inch, 
                                f"Estado: {cobro.id_estado_pago.nombre_estado}")
            
            p.showPage()
            p.save()
            
            buffer.seek(0)
            
            response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="ficha_medica_{id_ficha}.pdf"'
            
            return response
            
        except FichasMedicas.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Ficha médica no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)
        except ImportError:
            return Response({
                'success': False,
                'error': 'La libreria reportlab no esta instalada. Ejecute: pip install reportlab'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CobroUpdateView(APIView):
    """Actualizar información de cobro"""
    
    def patch(self, request, id_cobro):
        try:
            cobro = CobrosConsulta.objects.get(id_cobro_consulta=id_cobro)
            
            if 'id_metodo_cobro' in request.data:
                cobro.id_metodo_cobro = request.data['id_metodo_cobro']
            
            if 'monto_pagado' in request.data:
                nuevo_monto = float(request.data['monto_pagado'])
                # Solo permitir incrementar el monto pagado
                if nuevo_monto >= float(cobro.monto_pagado):
                    cobro.monto_pagado = nuevo_monto
                else:
                    return Response({
                        'success': False,
                        'error': 'El monto pagado no puede ser menor al actual'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            if 'id_estado_pago' in request.data:
                estado = EstadosPago.objects.get(id_estado_pago=request.data['id_estado_pago'])
                cobro.id_estado_pago = estado
            
            # Actualizar fecha de cobro si se marca como pagado completamente
            if float(cobro.monto_pagado) >= float(cobro.monto_paciente):
                try:
                    estado_pagado = EstadosPago.objects.get(nombre_estado='pagado')
                    cobro.id_estado_pago = estado_pagado
                    if not cobro.fecha_hora_cobro:
                        cobro.fecha_hora_cobro = timezone.now()
                except EstadosPago.DoesNotExist:
                    pass
            
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
        except EstadosPago.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Estado de pago no válido'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PacienteDetalleView(APIView):
    """Obtener información detallada de un paciente"""
    
    def get(self, request, id_paciente):
        try:
            paciente = Pacientes.objects.get(
                id_paciente=id_paciente,
                eliminado__isnull=True
            )
            
            # Obtener obras sociales del paciente
            pacientes_os = PacientesXOs.objects.filter(
                id_paciente=paciente,
                eliminado__isnull=True
            ).select_related('id_obra_social')
            
            obras_sociales = [{
                'id_paciente_os': pos.id_paciente_os,
                'id_obra_social': pos.id_obra_social.id_obra_social,
                'nombre_os': pos.id_obra_social.nombre_os,
                'credencial': pos.credencial_paciente
            } for pos in pacientes_os]
            
            return Response({
                'success': True,
                'data': {
                    'id_paciente': paciente.id_paciente,
                    'dni': paciente.dni_paciente,
                    'nombre': paciente.nombre_paciente,
                    'apellido': paciente.apellido_paciente,
                    'nombre_completo': f"{paciente.nombre_paciente} {paciente.apellido_paciente}",
                    'fecha_nacimiento': paciente.fecha_nacimiento,
                    'telefono': paciente.telefono,
                    'correo': paciente.correo,
                    'domicilio': paciente.domicilio,
                    'localidad': paciente.localidad,
                    'obras_sociales': obras_sociales
                }
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


class CajaEstadoView(APIView):
    """Verificar estado de caja"""
    
    def get(self, request):
        try:
            caja_abierta = Cajas.objects.filter(
                estado_caja=1,
                fecha_hora_cierre__isnull=True
            ).first()
            
            if caja_abierta:
                return Response({
                    'success': True,
                    'caja_abierta': True,
                    'data': {
                        'id_caja': caja_abierta.id_caja,
                        'fecha_hora_apertura': caja_abierta.fecha_hora_apertura,
                        'monto_apertura': str(caja_abierta.monto_apertura),
                        'empleado_id': caja_abierta.id_empleado.id_empleado
                    }
                })
            else:
                return Response({
                    'success': True,
                    'caja_abierta': False,
                    'message': 'No hay caja abierta. Debe abrir una caja para crear fichas medicas.'
                })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ObrasSocialesPacienteView(APIView):
    """Obtener obras sociales de un paciente específico"""
    
    def get(self, request, id_paciente):
        try:
            pacientes_os = PacientesXOs.objects.filter(
                id_paciente=id_paciente,
                eliminado__isnull=True
            ).select_related('id_obra_social', 'id_parentesco')
            
            obras_sociales = [{
                'id_paciente_os': pos.id_paciente_os,
                'id_obra_social': pos.id_obra_social.id_obra_social,
                'nombre_os': pos.id_obra_social.nombre_os,
                'credencial': pos.credencial_paciente,
                'id_parentesco': pos.id_parentesco.id_parentesco,
                'parentesco': pos.id_parentesco.tipo_parentesco
            } for pos in pacientes_os]
            
            return Response({
                'success': True,
                'data': obras_sociales,
                'total': len(obras_sociales)
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TratamientosConCoberturaView(APIView):
    """Obtener tratamientos con cobertura según obra social"""
    
    def get(self, request):
        id_obra_social = request.query_params.get('id_obra_social')
        
        try:
            tratamientos = Tratamientos.objects.filter(eliminado__isnull=True)
            data = []
            
            for trat in tratamientos:
                importe_obra_social = 0
                importe_paciente = trat.importe
                porcentaje_cobertura = 0
                
                if id_obra_social:
                    try:
                        cobertura = CoberturasOs.objects.get(
                            id_obra_social=id_obra_social,
                            id_tratamiento=trat.id_tratamiento
                        )
                        porcentaje_cobertura = cobertura.porcentaje
                        importe_obra_social = (trat.importe * porcentaje_cobertura / 100)
                        importe_paciente = trat.importe - importe_obra_social
                    except CoberturasOs.DoesNotExist:
                        pass
                
                data.append({
                    'id_tratamiento': trat.id_tratamiento,
                    'nombre_tratamiento': trat.nombre_tratamiento,
                    'codigo': trat.codigo,
                    'importe_base': str(trat.importe),
                    'porcentaje_cobertura': porcentaje_cobertura,
                    'importe_obra_social': str(importe_obra_social),
                    'importe_paciente': str(importe_paciente)
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


class OdontogramaView(APIView):
    """Obtener información del odontograma de una ficha médica"""
    
    def get(self, request, id_ficha):
        try:
            ficha = FichasMedicas.objects.get(
                id_ficha_medica=id_ficha,
                eliminado__isnull=True
            )
            
            # Obtener detalles de tratamientos
            detalles = DetallesConsulta.objects.filter(
                id_ficha_medica=ficha,
                eliminado__isnull=True
            ).select_related('id_tratamiento', 'id_diente')
            
            # Agrupar por diente
            dientes_tratados = {}
            for detalle in detalles:
                if detalle.id_diente:
                    diente_id = detalle.id_diente.id_diente
                    if diente_id not in dientes_tratados:
                        dientes_tratados[diente_id] = {
                            'id_diente': diente_id,
                            'nombre_diente': detalle.id_diente.nombre_diente,
                            'tratamientos': []
                        }
                    
                    try:
                        cara = CarasDiente.objects.get(id_cara=detalle.id_cara)
                        cara_nombre = cara.nombre_cara
                    except CarasDiente.DoesNotExist:
                        cara_nombre = f"Cara {detalle.id_cara}"
                    
                    dientes_tratados[diente_id]['tratamientos'].append({
                        'id_detalle': detalle.id_detalle,
                        'id_cara': detalle.id_cara,
                        'cara': cara_nombre,
                        'tratamiento': detalle.id_tratamiento.nombre_tratamiento,
                        'codigo': detalle.id_tratamiento.codigo
                    })
            
            # Obtener ficha patológica
            ficha_patologica = ficha.id_ficha_patologica
            if ficha_patologica:
                ficha_patologica_data = FichaPatologicaSerializer(ficha_patologica).data
            else:
                ficha_patologica_data = None

            return Response({
                'success': True,
                'data': {
                    'id_ficha_medica': ficha.id_ficha_medica,
                    'paciente': {
                        'nombre': ficha.id_paciente_os.id_paciente.nombre_paciente,
                        'apellido': ficha.id_paciente_os.id_paciente.apellido_paciente
                    },
                    'dientes_tratados': list(dientes_tratados.values()),
                    'ficha_patologica': ficha_patologica_data
                }
            })
        except FichasMedicas.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Ficha médica no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MetodosCobroView(APIView):
    """Listar métodos de cobro disponibles"""
    
    def get(self, request):
        try:
            metodos = MetodosCobro.objects.filter(eliminado__isnull=True)
            serializer = MetodosCobroSerializer(metodos, many=True)
            return Response({
                'success': True,
                'data': serializer.data
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EstadosPagoView(APIView):
    """Listar estados de pago disponibles"""
    
    def get(self, request):
        try:
            estados = EstadosPago.objects.all()
            serializer = EstadosPagoSerializer(estados, many=True)
            return Response({
                'success': True,
                'data': serializer.data
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)