from rest_framework.views import APIView
from rest_framework.response import Response
from decimal import Decimal
from rest_framework import status
from django.utils import timezone
from django.http import HttpResponse
from django.db.models import Q
from io import BytesIO
from decimal import Decimal
from datetime import date
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.lib.units import cm
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
                    Tratamientos.objects.filter(Q(eliminado=0) | Q(eliminado__isnull=True)), 
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
    """Lista de fichas médicas con filtro por estado de pago"""
    
    def get(self, request):
        try:
            # Parámetros de filtro
            id_paciente = request.query_params.get('id_paciente')
            estado_pago = request.query_params.get('estado_pago', '').strip()
            
            fichas = FichasMedicas.objects.filter(eliminado__isnull=True)
            
            # Filtro por paciente
            if id_paciente:
                fichas = fichas.filter(id_paciente_os__id_paciente=id_paciente)
            
            # Filtro por estado de pago
            if estado_pago:
                # Obtener IDs de fichas con ese estado de cobro
                detalles_con_estado = DetallesConsulta.objects.filter(
                    id_cobro_consulta__id_estado_pago__nombre_estado__iexact=estado_pago,
                    eliminado__isnull=True
                ).values_list('id_ficha_medica', flat=True).distinct()
                
                fichas = fichas.filter(id_ficha_medica__in=detalles_con_estado)
            
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
    """Genera PDF con formato similar al formulario odontológico oficial"""

    def get(self, request, id_ficha):
        try:
            ficha = FichasMedicas.objects.select_related(
                'id_paciente_os__id_paciente',
                'id_paciente_os__id_obra_social'
            ).get(id_ficha_medica=id_ficha, eliminado__isnull=True)

            paciente = ficha.id_paciente_os.id_paciente
            paciente_os = ficha.id_paciente_os
            obra_social = paciente_os.id_obra_social.nombre_obra_social if paciente_os.id_obra_social else ''
            parentesco = getattr(paciente_os.id_parentesco, 'tipo_parentesco', '')
            titular = "Sí" if paciente_os.titular else "No"

            detalles = DetallesConsulta.objects.filter(
                id_ficha_medica=ficha, eliminado__isnull=True
            ).select_related('id_tratamiento', 'id_diente')

            total_importe = Decimal('0.00')
            filas = []
            for d in detalles:
                importe = Decimal(d.id_tratamiento.importe or 0)
                total_importe += importe
                cara = ""
                try:
                    cara = CarasDiente.objects.get(id_cara=d.id_cara).abreviatura
                except:
                    cara = str(d.id_cara or "")
                filas.append({
                    'diente': d.id_diente.id_diente if d.id_diente else '',
                    'cara': cara,
                    'codigo': d.id_tratamiento.codigo,
                    'fecha': d.fecha_realizacion.strftime("%d/%m/%Y") if hasattr(d, 'fecha_realizacion') else '',
                    'conf': 'Sí' if d.conformidad_paciente else 'No',
                    'importe': importe
                })

            # Crear PDF
            buffer = BytesIO()
            p = canvas.Canvas(buffer, pagesize=landscape(A4))
            width, height = landscape(A4)

            # Encabezado principal
            p.setFont("Helvetica-Bold", 14)
            p.drawString(2*cm, height - 2*cm, "REGISTRO DE PRESTACIONES")
            p.setFont("Helvetica", 10)
            p.drawString(2*cm, height - 2.6*cm, "ASOCIACIÓN ODONTOLÓGICA SALTEÑA")

            # Logo simulado (cuando tengas la imagen, se puede usar drawImage)
            p.drawImage("ficha_medica/static/AOS-logo.png", 1*cm, height - 3*cm, width=1.5*cm, height=1.5*cm, preserveAspectRatio=True)

            # Entidad y obra social
            p.setFont("Helvetica-Bold", 10)
            p.drawString(13*cm, height - 2*cm, "ENTIDAD PRIMARIA: A.O.S")
            p.drawString(13*cm, height - 2.6*cm, f"OBRA SOCIAL: {obra_social}")

            # Fecha
            p.setFont("Helvetica", 10)
            hoy = date.today()
            p.drawString(2*cm, height - 3.6*cm, f"FECHA: {hoy.day:02d}/{hoy.month:02d}/{hoy.year}")

            # Datos del paciente
            y = height - 4.5*cm
            p.setFont("Helvetica-Bold", 10)
            p.drawString(2*cm, y, "PACIENTE:")
            p.setFont("Helvetica", 10)
            p.drawString(5*cm, y, f"{paciente.apellido_paciente}, {paciente.nombre_paciente}")
            p.drawString(13*cm, y, f"Edad: {paciente.get_edad() if hasattr(paciente, 'get_edad') else ''}")
            p.drawString(17*cm, y, f"Credencial: {paciente_os.credencial_paciente or ''}")
            y -= 0.5*cm
            p.drawString(2*cm, y, f"Titular: {titular}")
            p.drawString(8*cm, y, f"Parentesco: {parentesco}")
            p.drawString(14*cm, y, f"Fecha nac.: {paciente.fecha_nacimiento}")
            y -= 0.5*cm
            p.drawString(2*cm, y, f"Domicilio: {paciente.domicilio or ''}")
            p.drawString(12*cm, y, f"Localidad: {paciente.localidad or ''}")
            p.drawString(18*cm, y, f"Tel: {paciente.telefono or ''}")

            # Línea separadora
            y -= 0.6*cm
            p.line(2*cm, y, width - 2*cm, y)
            y -= 0.4*cm

            # Odontólogo (de momento fijo, se puede reemplazar dinámico)
            p.setFont("Helvetica-Bold", 10)
            p.drawString(2*cm, y, "ODONTÓLOGO: GISELA ALEJANDRA FLORES   Matrícula Profesional: 1802")
            y -= 0.6*cm

            # Encabezado de tabla
            p.setFont("Helvetica-Bold", 9)
            columnas = ["DIENTE Nº", "CARA", "CÓDIGO", "FECHA REALIZACIÓN", "CONFORMIDAD PACIENTE", "IMPORTE"]
            x_cols = [2*cm, 4*cm, 6*cm, 9*cm, 13*cm, 18*cm]
            for i, col in enumerate(columnas):
                p.drawString(x_cols[i], y, col)
            y -= 0.3*cm
            p.line(2*cm, y, width - 2*cm, y)
            y -= 0.3*cm

            # Filas
            p.setFont("Helvetica", 9)
            for fila in filas:
                if y < 3*cm:
                    p.showPage()
                    y = height - 3*cm
                p.drawString(x_cols[0], y, str(fila['diente']))
                p.drawString(x_cols[1], y, str(fila['cara']))
                p.drawString(x_cols[2], y, str(fila['codigo']))
                p.drawString(x_cols[3], y, fila['fecha'])
                p.drawString(x_cols[4], y, fila['conf'])
                p.drawRightString(x_cols[5] + 2*cm, y, f"${fila['importe']:.2f}")
                y -= 0.4*cm

            # Línea total
            p.line(2*cm, y, width - 2*cm, y)
            y -= 0.4*cm
            p.setFont("Helvetica-Bold", 10)
            p.drawRightString(width - 3*cm, y, f"TOTAL: ${total_importe:.2f}")
            y -= 0.8*cm

            # Observaciones
            p.setFont("Helvetica-Bold", 10)
            p.drawString(2*cm, y, "OBSERVACIONES:")
            y -= 0.4*cm
            p.setFont("Helvetica", 9)
            texto = str(ficha.observaciones or "")
            max_len = 120
            for linea in [texto[i:i+max_len] for i in range(0, len(texto), max_len)]:
                p.drawString(2*cm, y, linea)
                y -= 0.4*cm
                if y < 3*cm:
                    p.showPage()
                    y = height - 3*cm

            # Firma profesional
            p.setFont("Helvetica", 9)
            p.drawString(2*cm, 2.5*cm, "Cantidad de RX Adjuntas: _____")
            p.drawRightString(width - 5*cm, 2.5*cm, "Firma y Sello del Profesional")

            p.showPage()
            p.save()
            buffer.seek(0)

            response = HttpResponse(buffer, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename=ficha_medica_{id_ficha}.pdf'
            return response

        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class CobroUpdateView(APIView):
    """Actualizar información de cobro con acumulación automática y estado dinámico"""

    def patch(self, request, id_cobro):
        try:
            cobro = CobrosConsulta.objects.get(id_cobro_consulta=id_cobro)

            # Monto total esperado (paciente + obra social)
            monto_total_esperado = Decimal(str(cobro.monto_paciente)) + Decimal(str(cobro.monto_obra_social))

            # Si el monto total es 0, no permitir modificar
            if monto_total_esperado == 0:
                return Response({
                    'success': False,
                    'error': 'El monto total a pagar es 0. No se puede modificar el cobro.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Actualizar método de cobro
            if 'id_metodo_cobro' in request.data:
                cobro.id_metodo_cobro = request.data['id_metodo_cobro']

            # Convertir montos a Decimal
            monto_pag_paciente = Decimal(str(request.data.get('monto_pagado_paciente', 0)))
            monto_pag_os = Decimal(str(request.data.get('monto_pagado_obra_social', 0)))

            # Validaciones básicas
            if monto_pag_paciente < 0 or monto_pag_os < 0:
                return Response({
                    'success': False,
                    'error': 'Los montos no pueden ser negativos'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Sumar al monto ya pagado (acumulativo)
            cobro.monto_pagado = cobro.monto_pagado + monto_pag_paciente + monto_pag_os

            # Evitar que supere el monto total
            if cobro.monto_pagado > monto_total_esperado:
                cobro.monto_pagado = monto_total_esperado

            # Actualizar estado automáticamente
            if cobro.monto_pagado == 0:
                estado = EstadosPago.objects.get(nombre_estado='pendiente')
            elif cobro.monto_pagado < monto_total_esperado:
                estado = EstadosPago.objects.get(nombre_estado='parcial')
            else:
                estado = EstadosPago.objects.get(nombre_estado='pagado')
                if not cobro.fecha_hora_cobro:
                    cobro.fecha_hora_cobro = timezone.now()

            cobro.id_estado_pago = estado
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
            tratamientos = Tratamientos.objects.filter(Q(eliminado=0) | Q(eliminado__isnull=True))
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
            metodos = MetodosCobro.objects.filter(Q(eliminado=0) | Q(eliminado__isnull=True))
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


class UpdateConformidadView(APIView):
    """Actualizar conformidad del paciente en un detalle"""
    
    def patch(self, request, id_detalle):
        try:
            detalle = DetallesConsulta.objects.get(id_detalle=id_detalle)
            
            if 'conformidad_paciente' in request.data:
                detalle.conformidad_paciente = request.data['conformidad_paciente']
                detalle.save()
                
                return Response({
                    'success': True,
                    'message': 'Conformidad actualizada'
                })
            else:
                return Response({
                    'success': False,
                    'error': 'Campo conformidad_paciente requerido'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except DetallesConsulta.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Detalle no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)