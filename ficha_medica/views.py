from rest_framework.views import APIView
from rest_framework.response import Response
from decimal import Decimal
from rest_framework import status
from django.utils import timezone
from django.http import HttpResponse
from django.db.models import Q
from io import BytesIO
from datetime import date
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.lib.units import cm, mm

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
    """Genera PDF replicando el formulario oficial de A.O.S."""

    def calcular_edad(self, fecha_nacimiento):
        """Calcula la edad actual desde la fecha de nacimiento"""
        hoy = date.today()
        edad = hoy.year - fecha_nacimiento.year
        # Ajustar si aún no cumplió años este año
        if (hoy.month, hoy.day) < (fecha_nacimiento.month, fecha_nacimiento.day):
            edad -= 1
        return edad

    def get(self, request, id_ficha):
        try:
            # ============================================
            # 1. OBTENER DATOS DE LA BASE DE DATOS
            # ============================================
            ficha = FichasMedicas.objects.select_related(
                'id_paciente_os__id_paciente',
                'id_paciente_os__id_obra_social',
                'id_paciente_os__id_parentesco',
                'id_empleado__user'
            ).get(id_ficha_medica=id_ficha, eliminado__isnull=True)

            # Datos del paciente
            paciente = ficha.id_paciente_os.id_paciente
            paciente_os = ficha.id_paciente_os
            
            # Calcular edad
            edad = self.calcular_edad(paciente.fecha_nacimiento) if paciente.fecha_nacimiento else ""
            
            # Datos de obra social
            obra_social = paciente_os.id_obra_social.nombre_os if paciente_os.id_obra_social else ''
            parentesco = getattr(paciente_os.id_parentesco, 'tipo_parentesco', '')
            titular_nombre = paciente_os.titular or ''
            
            # Fecha de creación de la ficha (para usar en todos los detalles)
            fecha_ficha = ficha.fecha_creacion
            
            # Obtener detalles de tratamientos
            detalles = DetallesConsulta.objects.filter(
                id_ficha_medica=ficha, 
                eliminado__isnull=True
            ).select_related('id_tratamiento', 'id_diente')

            # Calcular total y preparar filas de tratamientos
            total_importe = Decimal('0.00')
            filas_tratamientos = []
            
            for d in detalles:
                importe = Decimal(d.id_tratamiento.importe or 0)
                total_importe += importe
                
                # Obtener cara del diente
                cara = ""
                if d.id_cara:
                    try:
                        cara = CarasDiente.objects.get(id_cara=d.id_cara).abreviatura
                    except CarasDiente.DoesNotExist:
                        cara = ""
                
                # Usar fecha de creación de la ficha
                fecha_str = fecha_ficha.strftime("%d/%m/%Y") if fecha_ficha else ''
                
                # Conformidad: usar tilde si está confirmado
                conformidad = '✓' if d.conformidad_paciente else ''
                
                filas_tratamientos.append({
                    'diente': str(d.id_diente.id_diente) if d.id_diente else '',
                    'cara': cara,
                    'codigo': d.id_tratamiento.codigo,
                    'fecha': fecha_str,
                    'conformidad': conformidad,
                    'importe': float(importe)
                })

            # ============================================
            # 2. CONFIGURAR PDF
            # ============================================
            buffer = BytesIO()
            pdf = canvas.Canvas(buffer, pagesize=landscape(A4))
            width, height = landscape(A4)  # width=842pt, height=595pt
            
            # Fecha actual
            hoy = date.today()

            # ============================================
            # 3. ENCABEZADO CON LOGO Y TÍTULO
            # ============================================
            y_pos = height - 1.5*cm
            
            # Logo (izquierda)
            try:
                pdf.drawImage(
                    "ficha_medica/static/AOS-logo.png", 
                    1*cm, 
                    y_pos - 2.5*cm, 
                    width=2.5*cm, 
                    height=2.5*cm, 
                    preserveAspectRatio=True
                )
            except:
                pass
            
            # Título principal
            pdf.setFont("Helvetica-Bold", 14)
            pdf.drawString(4*cm, y_pos - 0.5*cm, "REGISTRO DE")
            pdf.drawString(4*cm, y_pos - 1*cm, "PRESTACIONES")
            
            pdf.setFont("Helvetica", 9)
            pdf.drawString(4*cm, y_pos - 1.5*cm, "ASOCIACIÓN ODONTOLÓGICA")
            pdf.drawString(4*cm, y_pos - 1.9*cm, "SALTEÑA")
            
            pdf.setFont("Helvetica", 7)
            pdf.drawString(4*cm, y_pos - 2.4*cm, "ESPAÑA 1175 - TEL. 0387 431-1116 - 4400 SALTA")
            
            # ============================================
            # 4. RECUADROS SUPERIORES (Entidad y Obra Social)
            # ============================================
            # Recuadro ENTIDAD PRIMARIA
            pdf.setStrokeColor(colors.black)
            pdf.setLineWidth(1)
            pdf.rect(13*cm, y_pos - 2.5*cm, 6.5*cm, 2.5*cm, stroke=1, fill=0)
            
            pdf.setFont("Helvetica", 7)
            pdf.drawString(13.2*cm, y_pos - 0.5*cm, "ENTIDAD")
            pdf.drawString(13.2*cm, y_pos - 0.8*cm, "PRIMARIA:")
            
            pdf.setFont("Helvetica-Bold", 18)
            pdf.drawString(14.5*cm, y_pos - 1.5*cm, "A.O.S.")
            
            pdf.setFont("Helvetica", 7)
            pdf.drawString(13.2*cm, y_pos - 2*cm, "CÓDIGO")
            #pdf.rect(14.5*cm, y_pos - 2.2*cm, 1*cm, 0.4*cm, stroke=1, fill=0)
            
            # Recuadro OBRA SOCIAL
            pdf.rect(19.5*cm, y_pos - 2.5*cm, 9.5*cm, 2.5*cm, stroke=1, fill=0)
            
            pdf.setFont("Helvetica-Bold", 12)
            pdf.drawString(22*cm, y_pos - 0.7*cm, "OBRA SOCIAL")
            
            # Nombre de la obra social (arriba)
            pdf.setFont("Helvetica", 10)
            pdf.drawString(20*cm, y_pos - 1.2*cm, obra_social)
            
            # Nº y Código (abajo)
            pdf.setFont("Helvetica", 7)
            pdf.drawString(19.7*cm, y_pos - 1.8*cm, "Nº")
            pdf.drawString(21.5*cm, y_pos - 1.8*cm, "CÓDIGO")
            
            pdf.rect(20.2*cm, y_pos - 2*cm, 1*cm, 0.4*cm, stroke=1, fill=0)
            pdf.rect(22.5*cm, y_pos - 2*cm, 6*cm, 0.4*cm, stroke=1, fill=0)
            
            # ============================================
            # 5. FECHA (debajo de los recuadros, a la derecha)
            # ============================================
            pdf.setFont("Helvetica-Bold", 10)
            pdf.drawString(19.5*cm, y_pos - 3*cm, "FECHA:")
            pdf.setFont("Helvetica", 10)
            pdf.drawString(21.5*cm, y_pos - 3*cm, f"Día {hoy.day:02d}")
            pdf.drawString(24*cm, y_pos - 3*cm, f"Mes {hoy.month:02d}")
            pdf.drawString(26.5*cm, y_pos - 3*cm, f"Año 20{hoy.year % 100:02d}")
            
            y_pos -= 3.8*cm
            
            # ============================================
            # 6. DATOS DEL PACIENTE (centrados verticalmente)
            # ============================================
            pdf.setStrokeColor(colors.black)
            pdf.setLineWidth(1.5)
            pdf.rect(1*cm, y_pos - 1*cm, width - 2*cm, 1*cm, stroke=1, fill=0)
            
            pdf.setFont("Helvetica-Bold", 10)
            pdf.drawString(1.2*cm, y_pos - 0.6*cm, "PACIENTE:")
            
            # Nombre del paciente
            pdf.setFont("Helvetica", 10)
            nombre_completo = f"{paciente.apellido_paciente}, {paciente.nombre_paciente}"
            pdf.drawString(3.5*cm, y_pos - 0.6*cm, nombre_completo)
            
            # Edad (centrada verticalmente)
            pdf.setFont("Helvetica", 9)
            pdf.drawString(15*cm, y_pos - 0.55*cm, f"Edad:")
            pdf.rect(16*cm, y_pos - 0.65*cm, 1*cm, 0.4*cm, stroke=1, fill=0)
            pdf.drawCentredString(16.5*cm, y_pos - 0.60*cm, str(edad))
            
            # Credencial (centrada verticalmente)
            pdf.drawString(18*cm, y_pos - 0.55*cm, f"Credencial:")
            pdf.rect(20*cm, y_pos - 0.65*cm, 5*cm, 0.4*cm, stroke=1, fill=0)
            credencial = str(paciente_os.credencial_paciente) if paciente_os.credencial_paciente else ""
            pdf.drawString(20.2*cm, y_pos - 0.60*cm, credencial)
            
            y_pos -= 1.3*cm
            
            # DATOS ADICIONALES (fuera del recuadro)
            pdf.setFont("Helvetica", 9)
            # Primera línea - Titular, Parentesco, Fecha de nacimiento
            pdf.drawString(1.2*cm, y_pos, f"Titular: {titular_nombre}")
            pdf.drawString(11*cm, y_pos, f"Parentesco: {parentesco}")
            fecha_nac = paciente.fecha_nacimiento.strftime("%d/%m/%Y") if paciente.fecha_nacimiento else '_ _ / _ _ / _ _ _ _'
            pdf.drawString(20*cm, y_pos, f"Fecha de nacimiento: {fecha_nac}")
            
            y_pos -= 0.5*cm
            
            # Segunda línea - Domicilio, Localidad
            pdf.drawString(1.2*cm, y_pos, f"Domicilio: {paciente.domicilio or '_' * 50}")
            pdf.drawString(15*cm, y_pos, f"Localidad: {paciente.localidad or '_' * 30}")
            
            y_pos -= 0.5*cm
            
            # Tercera línea - Lugar de trabajo del Titular, Tel
            pdf.drawString(1.2*cm, y_pos, f"Lugar de trabajo del Titular: {'_' * 55}")
            pdf.drawString(21*cm, y_pos, f"Tel: {paciente.telefono or '_' * 15}")
            
            y_pos -= 0.8*cm
            
            # ============================================
            # 7. DATOS DEL ODONTÓLOGO (recuadro corregido)
            # ============================================
            pdf.setStrokeColor(colors.black)
            pdf.setLineWidth(1.5)
            pdf.rect(1*cm, y_pos - 1.3*cm, width - 2*cm, 1.3*cm, stroke=1, fill=0)
            
            pdf.setFont("Helvetica-Bold", 10)
            pdf.drawString(1.2*cm, y_pos - 0.7*cm, "ODONTÓLOGO:")
            
            # Nombre del odontólogo (fijo)
            pdf.setFont("Helvetica", 9)
            pdf.drawCentredString(10*cm, y_pos - 0.5*cm, "GISELA ALEJANDRA FLORES")
            pdf.setFont("Helvetica", 8)
            pdf.drawCentredString(10*cm, y_pos - 0.8*cm, "ODONTÓLOGA")
            pdf.drawCentredString(10*cm, y_pos - 1.1*cm, "M.P. 1802")
            
            # Matrícula Profesional (CORREGIDO: dentro del recuadro)
            pdf.setFont("Helvetica", 9)
            pdf.drawString(22*cm, y_pos - 0.5*cm, "Matrícula")
            pdf.drawString(22*cm, y_pos - 0.8*cm, "Profesional:")
            pdf.rect(24.5*cm, y_pos - 0.9*cm, 3.5*cm, 0.7*cm, stroke=1, fill=0)
            pdf.setFont("Helvetica-Bold", 12)
            pdf.drawCentredString(26.2*cm, y_pos - 0.6*cm, "1802")
            
            y_pos -= 1.5*cm
            
            # ============================================
            # 8. TABLA DE TRATAMIENTOS
            # ============================================
            pdf.setStrokeColor(colors.black)
            pdf.setLineWidth(1)
            
            # Encabezados de la tabla
            alto_fila = 0.6*cm
            x_diente = 1*cm
            x_cara = 2.5*cm
            x_codigo = 4.5*cm
            x_fecha = 7.5*cm
            x_conformidad = 11*cm
            x_importe = 23*cm
            ancho_total = width - 2*cm
            
            # Dibujar encabezados
            pdf.setFillColor(colors.lightgrey)
            pdf.rect(x_diente, y_pos - alto_fila, ancho_total, alto_fila, stroke=1, fill=1)
            
            pdf.setFillColor(colors.black)
            pdf.setFont("Helvetica-Bold", 9)
            pdf.drawCentredString(x_diente + 0.75*cm, y_pos - 0.4*cm, "DIENTE Nº")
            pdf.drawCentredString(x_cara + 1*cm, y_pos - 0.4*cm, "CARA")
            pdf.drawCentredString(x_codigo + 1.5*cm, y_pos - 0.4*cm, "CÓDIGO")
            pdf.drawCentredString(x_fecha + 1.75*cm, y_pos - 0.4*cm, "Fecha Realización")
            pdf.drawCentredString(x_conformidad + 6*cm, y_pos - 0.4*cm, "CONFORMIDAD PACIENTE")
            pdf.drawCentredString(x_importe + 3*cm, y_pos - 0.4*cm, "IMPORTE")
            
            # Líneas verticales de encabezado
            pdf.line(x_cara, y_pos - alto_fila, x_cara, y_pos)
            pdf.line(x_codigo, y_pos - alto_fila, x_codigo, y_pos)
            pdf.line(x_fecha, y_pos - alto_fila, x_fecha, y_pos)
            pdf.line(x_conformidad, y_pos - alto_fila, x_conformidad, y_pos)
            pdf.line(x_importe, y_pos - alto_fila, x_importe, y_pos)
            
            y_pos -= alto_fila
            
            # Filas de tratamientos (máximo 10 filas visibles)
            pdf.setFont("Helvetica", 9)
            num_filas_visibles = 10
            
            for i in range(num_filas_visibles):
                if i < len(filas_tratamientos):
                    fila = filas_tratamientos[i]
                    pdf.drawCentredString(x_diente + 0.75*cm, y_pos - 0.4*cm, fila['diente'])
                    pdf.drawCentredString(x_cara + 1*cm, y_pos - 0.4*cm, fila['cara'])
                    pdf.drawCentredString(x_codigo + 1.5*cm, y_pos - 0.4*cm, fila['codigo'])
                    pdf.drawCentredString(x_fecha + 1.75*cm, y_pos - 0.4*cm, fila['fecha'])
                    pdf.drawCentredString(x_conformidad + 6*cm, y_pos - 0.4*cm, fila['conformidad'])
                    pdf.drawRightString(x_importe + 5.5*cm, y_pos - 0.4*cm, f"${fila['importe']:.2f}")
                
                # Dibujar fila
                pdf.rect(x_diente, y_pos - alto_fila, ancho_total, alto_fila, stroke=1, fill=0)
                
                # Líneas verticales
                pdf.line(x_cara, y_pos - alto_fila, x_cara, y_pos)
                pdf.line(x_codigo, y_pos - alto_fila, x_codigo, y_pos)
                pdf.line(x_fecha, y_pos - alto_fila, x_fecha, y_pos)
                pdf.line(x_conformidad, y_pos - alto_fila, x_conformidad, y_pos)
                pdf.line(x_importe, y_pos - alto_fila, x_importe, y_pos)
                
                y_pos -= alto_fila
            
            # Fila de TOTAL
            pdf.setFont("Helvetica-Bold", 10)
            pdf.drawRightString(x_conformidad + 11.5*cm, y_pos - 0.4*cm, "TOTAL")
            pdf.drawRightString(x_importe + 5.5*cm, y_pos - 0.4*cm, f"${total_importe:.2f}")
            pdf.rect(x_diente, y_pos - alto_fila, ancho_total, alto_fila, stroke=1, fill=0)
            pdf.line(x_importe, y_pos - alto_fila, x_importe, y_pos)
            
            y_pos -= 1.2*cm
            
            # ============================================
            # 9. OBSERVACIONES
            # ============================================
            pdf.setStrokeColor(colors.black)
            pdf.setLineWidth(1)
            pdf.rect(1*cm, y_pos - 2.5*cm, 18*cm, 2.5*cm, stroke=1, fill=0)
            
            pdf.setFont("Helvetica-Bold", 9)
            pdf.drawString(1.2*cm, y_pos - 0.4*cm, "OBSERVACIONES:")
            
            # Texto de observaciones
            pdf.setFont("Helvetica", 8)
            texto_obs = str(ficha.observaciones or "")
            
            # Líneas para escribir
            y_obs = y_pos - 0.9*cm
            for _ in range(4):
                pdf.drawString(1.2*cm, y_obs, "_" * 110)
                y_obs -= 0.5*cm
            
            # Escribir observaciones si existen
            if texto_obs:
                y_obs = y_pos - 0.9*cm
                max_chars = 80
                for i in range(0, min(len(texto_obs), 320), max_chars):
                    linea = texto_obs[i:i+max_chars]
                    pdf.drawString(1.2*cm, y_obs, linea)
                    y_obs -= 0.5*cm
                    if y_obs < y_pos - 2.3*cm:
                        break
            
            # ============================================
            # 10. CANTIDAD DE RX Y FIRMA
            # ============================================
            # Recuadro RX Adjuntas
            pdf.rect(19.5*cm, y_pos - 2.5*cm, 3*cm, 2.5*cm, stroke=1, fill=0)
            pdf.setFont("Helvetica", 8)
            pdf.drawString(19.7*cm, y_pos - 0.6*cm, "Cantidad de RX")
            pdf.drawString(19.7*cm, y_pos - 0.9*cm, "Adjuntas")
            
            # Cuadro para número (más abajo)
            pdf.rect(20*cm, y_pos - 1.7*cm, 2*cm, 0.8*cm, stroke=1, fill=0)
            
            # Firma y sello
            pdf.rect(22.5*cm, y_pos - 2.5*cm, 6.5*cm, 2.5*cm, stroke=1, fill=0)
            pdf.setFont("Helvetica", 8)
            pdf.drawCentredString(25.7*cm, y_pos - 0.5*cm, "GISELA ALEJANDRA FLORES")
            pdf.setFont("Helvetica", 7)
            pdf.drawCentredString(25.7*cm, y_pos - 0.8*cm, "ODONTÓLOGA")
            pdf.drawCentredString(25.7*cm, y_pos - 1.1*cm, "M.P. 1802")
            pdf.setFont("Helvetica-Bold", 7)
            pdf.drawCentredString(25.7*cm, y_pos - 2.2*cm, "SELLO Y FIRMA DEL PROFESIONAL")

            # ============================================
            # 11. FINALIZAR PDF
            # ============================================
            pdf.showPage()
            pdf.save()
            buffer.seek(0)

            # ============================================
            # 12. RESPUESTA HTTP
            # ============================================
            response = HttpResponse(buffer, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename=ficha_medica_{id_ficha}.pdf'
            return response

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



class CobroUpdateView(APIView):
    """Actualizar información de cobro con acumulación automática y estado dinámico"""

    def patch(self, request, id_cobro):
        try:
            cobro = CobrosConsulta.objects.get(id_cobro_consulta=id_cobro)
                # Validar que exista una caja abierta

            caja_abierta = Cajas.objects.filter(estado_caja=1).first()
            if not caja_abierta:
                return Response({
                'success': False,
                'error': 'No hay una caja abierta. No se pueden registrar cobros.'
                }, status=status.HTTP_400_BAD_REQUEST)

                # Si el cobro no tiene caja asignada, asignar la caja abierta
            if cobro.id_caja is None:
                cobro.id_caja = caja_abierta


            # VALIDACIÓN: No permitir cobrar si NO hay una caja abierta
            caja_abierta = Cajas.objects.filter(estado_caja=1).first()
            if not caja_abierta:
                return Response({
                    'success': False,
                    'error': 'No hay una caja abierta. Debe abrir una caja antes de registrar un cobro.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # ✔ Asociar el cobro a la caja abierta si aún no tiene caja asignada

            if cobro.id_caja is None:
                cobro.id_caja = caja_abierta


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


# Agregar estas vistas al archivo views.py existente

class OdontogramaView(APIView):
    """Obtener información del odontograma de una ficha médica con estructura para visualización"""
    
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
            
            # Definir rangos de dientes
            dientes_adultos = list(range(11, 19)) + list(range(21, 29)) + list(range(31, 39)) + list(range(41, 49))
            dientes_ninos = list(range(51, 56)) + list(range(61, 66)) + list(range(71, 76)) + list(range(81, 86))
            todos_los_dientes = dientes_adultos + dientes_ninos
            
            # Detectar qué dentadura se está usando
            tiene_tratamiento_adulto = False
            tiene_tratamiento_nino = False
            
            for detalle in detalles:
                if detalle.id_diente:
                    diente_id = detalle.id_diente.id_diente
                    if diente_id in dientes_adultos:
                        tiene_tratamiento_adulto = True
                    elif diente_id in dientes_ninos:
                        tiene_tratamiento_nino = True
            
            # Inicializar estructura de dientes
            odontograma = {}
            for diente_num in todos_los_dientes:
                # Determinar si este diente debe estar tachado por exclusión
                debe_tachar = False
                if tiene_tratamiento_adulto and diente_num in dientes_ninos:
                    debe_tachar = True
                elif tiene_tratamiento_nino and diente_num in dientes_adultos:
                    debe_tachar = True
                
                odontograma[diente_num] = {
                    'id_diente': diente_num,
                    'extraido': debe_tachar,  # Marcar como extraído si debe tacharse
                    'caras_tratadas': [],
                    'tratamientos': [],
                    'tachado_por_exclusion': debe_tachar  # Flag adicional
                }
            
            # Procesar detalles de tratamientos reales
            for detalle in detalles:
                if detalle.id_diente:
                    diente_id = detalle.id_diente.id_diente
                    
                    if diente_id in odontograma:
                        # Verificar si es extracción
                        nombre_trat = detalle.id_tratamiento.nombre_tratamiento.lower()
                        es_extraccion = 'extraccion' in nombre_trat or 'extracción' in nombre_trat
                        
                        if es_extraccion:
                            odontograma[diente_id]['extraido'] = True
                            odontograma[diente_id]['tachado_por_exclusion'] = False
                        
                        # Obtener información de la cara
                        cara_info = None
                        if detalle.id_cara:
                            try:
                                cara = CarasDiente.objects.get(id_cara=detalle.id_cara)
                                cara_info = {
                                    'id_cara': cara.id_cara,
                                    'nombre_cara': cara.nombre_cara,
                                    'abreviatura': cara.abreviatura
                                }
                                # Agregar cara a la lista si no está ya
                                if detalle.id_cara not in odontograma[diente_id]['caras_tratadas']:
                                    odontograma[diente_id]['caras_tratadas'].append(detalle.id_cara)
                            except CarasDiente.DoesNotExist:
                                pass
                        
                        # Agregar tratamiento
                        odontograma[diente_id]['tratamientos'].append({
                            'id_detalle': detalle.id_detalle,
                            'tratamiento': detalle.id_tratamiento.nombre_tratamiento,
                            'codigo': detalle.id_tratamiento.codigo,
                            'cara': cara_info,
                            'es_extraccion': es_extraccion
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
                    'fecha_creacion': ficha.fecha_creacion,
                    'observaciones': ficha.observaciones,
                    'paciente': {
                        'id_paciente': ficha.id_paciente_os.id_paciente.id_paciente,
                        'nombre': ficha.id_paciente_os.id_paciente.nombre_paciente,
                        'apellido': ficha.id_paciente_os.id_paciente.apellido_paciente,
                        'dni': ficha.id_paciente_os.id_paciente.dni_paciente,
                        'fecha_nacimiento': ficha.id_paciente_os.id_paciente.fecha_nacimiento
                    },
                    'odontograma': odontograma,
                    'ficha_patologica': ficha_patologica_data,
                    'estructura_dientes': {
                        'adultos': dientes_adultos,
                        'ninos': dientes_ninos,
                        'tiene_tratamiento_adulto': tiene_tratamiento_adulto,
                        'tiene_tratamiento_nino': tiene_tratamiento_nino
                    }
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


class OdontogramaPdfView(APIView):
    """
    Genera un PDF con odontograma mostrando tratamientos realizados,
    extracciones y ficha patológica.
    """

    def get(self, request, id_ficha):
        try:
            # Obtener ficha médica con relaciones
            ficha = FichasMedicas.objects.select_related(
            'id_paciente_os__id_paciente',
            'id_paciente_os__id_obra_social',
            'id_ficha_patologica'
        ).get(id_ficha_medica=id_ficha, eliminado__isnull=True)

            paciente = ficha.id_paciente_os.id_paciente
            
            detalles = DetallesConsulta.objects.filter(
                id_ficha_medica=ficha,
                eliminado__isnull=True
            ).select_related('id_tratamiento', 'id_diente')

            dientes_adultos = set(range(11, 19)) | set(range(21, 29)) | set(range(31, 39)) | set(range(41, 49))
            dientes_ninos = set(range(51, 56)) | set(range(61, 66)) | set(range(71, 76)) | set(range(81, 86))
            
            dientes_con_tratamiento_adulto = set()
            dientes_con_tratamiento_nino = set()
            
            for detalle in detalles:
                if detalle.id_diente:
                    num_diente = detalle.id_diente.id_diente
                    if num_diente in dientes_adultos:
                        dientes_con_tratamiento_adulto.add(num_diente)
                    elif num_diente in dientes_ninos:
                        dientes_con_tratamiento_nino.add(num_diente)
            
            usa_dentadura_adulta = len(dientes_con_tratamiento_adulto) > 0
            usa_dentadura_nino = len(dientes_con_tratamiento_nino) > 0

            buffer = BytesIO()
            pdf = canvas.Canvas(buffer, pagesize=landscape(A4))
            width, height = landscape(A4)

            # SOLO ODONTOGRAMA
            self.dibujar_odontograma(pdf, width, height, detalles, usa_dentadura_adulta, usa_dentadura_nino)

            # SOLO FICHA PATOLÓGICA
            self.dibujar_ficha_patologica(pdf, width, height, ficha.id_ficha_patologica)

            pdf.showPage()
            pdf.save()
            buffer.seek(0)

            response = HttpResponse(buffer, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename=odontograma_{id_ficha}.pdf'
            return response

        except FichasMedicas.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Ficha médica no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import traceback
            print("Error completo:")
            print(traceback.format_exc())
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def dibujar_odontograma(self, pdf, width, height, detalles, usa_adulta, usa_nino):
        """Dibuja el odontograma completo"""
        
        # Posiciones iniciales
        margin_left = 2*cm
        margin_top = height - 2*cm
        
        # Dimensiones de cada diente
        diente_size = 1.2*cm
        gap = 0.3*cm
        
        # Organizar tratamientos por diente y cara
        tratamientos_por_diente = {}
        extracciones = set()
        
        for detalle in detalles:
            if detalle.id_diente:
                num_diente = detalle.id_diente.id_diente
                nombre_tratamiento = detalle.id_tratamiento.nombre_tratamiento.lower()
                
                # Detectar extracciones
                if 'extrac' in nombre_tratamiento or 'extracción' in nombre_tratamiento:
                    extracciones.add(num_diente)
                
                if num_diente not in tratamientos_por_diente:
                    tratamientos_por_diente[num_diente] = set()
                
                # Agregar la cara tratada (id_cara)
                if detalle.id_cara:
                    tratamientos_por_diente[num_diente].add(detalle.id_cara)

        # Definir layout de dientes
        # Fila 1: Adultos superiores derechos (18-11)
        fila1_nums = list(range(18, 10, -1))
        # Fila 2: Adultos superiores izquierdos (21-28)
        fila2_nums = list(range(21, 29))
        # Fila 3: Adultos inferiores derechos (48-41)
        fila3_nums = list(range(48, 40, -1))
        # Fila 4: Adultos inferiores izquierdos (31-38)
        fila4_nums = list(range(31, 39))
        
        # Fila 5: Niños superiores derechos (55-51)
        fila5_nums = list(range(55, 50, -1))
        # Fila 6: Niños superiores izquierdos (61-65)
        fila6_nums = list(range(61, 66))
        # Fila 7: Niños inferiores derechos (85-81)
        fila7_nums = list(range(85, 80, -1))
        # Fila 8: Niños inferiores izquierdos (71-75)
        fila8_nums = list(range(71, 76))

        # Posiciones Y para cada fila

        # Adultos superiores
        y_fila1 = margin_top - 1.5*cm
        y_fila2 = y_fila1

        # Adultos inferiores
        y_fila3 = y_fila1 - 2*cm
        y_fila4 = y_fila3

        # Ahora MOVER bien abajo las filas de NIÑOS
        # Niños superiores (deben ir debajo de los adultos inferiores)
        y_fila5 = y_fila3 - 3*cm
        y_fila6 = y_fila5

        # Niños inferiores (más abajo aún)
        y_fila7 = y_fila5 - 2*cm
        y_fila8 = y_fila7


        # Calcular X inicial para centrar
        x_inicio_izq = margin_left + 1*cm
        x_inicio_der = width/2 + 0.5*cm

        # Dibujar filas de adultos
        self.dibujar_fila_dientes(pdf, fila1_nums, x_inicio_izq, y_fila1, diente_size, gap, 
                                   tratamientos_por_diente, extracciones, not usa_adulta)
        self.dibujar_fila_dientes(pdf, fila2_nums, x_inicio_der, y_fila2, diente_size, gap, 
                                   tratamientos_por_diente, extracciones, not usa_adulta)
        self.dibujar_fila_dientes(pdf, fila3_nums, x_inicio_izq, y_fila3, diente_size, gap, 
                                   tratamientos_por_diente, extracciones, not usa_adulta)
        self.dibujar_fila_dientes(pdf, fila4_nums, x_inicio_der, y_fila4, diente_size, gap, 
                                   tratamientos_por_diente, extracciones, not usa_adulta)

        # Dibujar filas de niños
        x_inicio_nino_izq = margin_left + 4*cm
        x_inicio_nino_der = width/2 + 0.5*cm
        x_inicio_nino_izq_derecha = x_inicio_nino_izq + 1.5*cm
        
        # Fila 5 (55–51) → mover a la derecha
        self.dibujar_fila_dientes(
            pdf, fila5_nums, x_inicio_nino_izq_derecha, y_fila5, diente_size, gap,
            tratamientos_por_diente, extracciones, not usa_nino
        )

        # Fila 6 queda igual
        self.dibujar_fila_dientes(
            pdf, fila6_nums, x_inicio_nino_der, y_fila6, diente_size, gap,
            tratamientos_por_diente, extracciones, not usa_nino
        )

        # Fila 7 (85–81) → mover a la derecha
        self.dibujar_fila_dientes(
            pdf, fila7_nums, x_inicio_nino_izq_derecha, y_fila7, diente_size, gap,
            tratamientos_por_diente, extracciones, not usa_nino
        )

        # Fila 8 queda igual
        self.dibujar_fila_dientes(
            pdf, fila8_nums, x_inicio_nino_der, y_fila8, diente_size, gap,
            tratamientos_por_diente, extracciones, not usa_nino
        )
        # === Cuadro alrededor del odontograma ===
        odontograma_x = margin_left - 0.5*cm
        odontograma_y = y_fila4 - 6*cm        # un poco por debajo de la última fila adulta
        odontograma_width = width - 3.5*cm
        odontograma_height = (y_fila1 - odontograma_y) + diente_size + 1.5*cm

        pdf.setLineWidth(1)
        pdf.setStrokeColor(colors.black)
        pdf.rect(odontograma_x, odontograma_y, odontograma_width, odontograma_height, stroke=1, fill=0)
        # === Línea divisoria entre adultos y niños ===
        pdf.setStrokeColor(colors.black)
        pdf.setLineWidth(1)

        # Coordenadas de la línea
        line_y = (y_fila4 - (y_fila4 - y_fila5) / 2)  # punto medio entre adultos inferiores y niños superiores

        pdf.line(margin_left - 0*cm, line_y, width - margin_left - 1*cm, line_y)


        # Etiquetas "Derecha" e "Izquierda"
        pdf.setFont("Helvetica", 9)
        pdf.drawString(margin_left, y_fila3 - 1*cm, "Derecha")
        pdf.drawString(width - margin_left - 2*cm, y_fila3 - 1*cm, "Izquierda")


        # Leyenda de referencias
        self.dibujar_referencias(pdf, width, height)

    def dibujar_fila_dientes(self, pdf, numeros, x_inicio, y, size, gap, tratamientos, extracciones, marcar_no_usado):
        """Dibuja una fila de dientes"""
        
        x_actual = x_inicio
        
        for num in numeros:
            # Si el juego de dientes no se usa, dibujar línea roja horizontal
            if marcar_no_usado:
                self.dibujar_diente_no_usado(pdf, x_actual, y, size)
            else:
                # Verificar si el diente tiene extracción
                if num in extracciones:
                    self.dibujar_diente_extraido(pdf, x_actual, y, size)
                else:
                    # Dibujar diente con tratamientos
                    caras_tratadas = tratamientos.get(num, set())
                    self.dibujar_diente(pdf, x_actual, y, size, caras_tratadas)
            
            # CORRECCIÓN: Número del diente SIEMPRE se dibuja
            pdf.setFont("Helvetica", 7)
            pdf.setFillColor(colors.black)  # Asegurar que el texto sea negro
            pdf.drawCentredString(x_actual + size/2, y - 0.4*cm, str(num))
            
            x_actual += size + gap

    def dibujar_diente(self, pdf, x, y, size, caras_tratadas):
        """Dibuja un diente con sus 5 caras (cuadrado central + 4 trapecios)"""
        
        # Cuadrado central (oclusal)
        cuadrado_margin = size * 0.25
        cuadrado_x = x + cuadrado_margin
        cuadrado_y = y + cuadrado_margin
        cuadrado_size = size - 2 * cuadrado_margin
        
        # CORRECCIÓN: IDs de caras según tu BD
        # oclusal(id=1), vestibular(3), mesial(5), distal(6), palatino(7)
        
        # Verificar si oclusal (id_cara=1) está tratada
        if 1 in caras_tratadas:
            pdf.setFillColor(colors.blue)
            pdf.setStrokeColor(colors.black)
            pdf.rect(cuadrado_x, cuadrado_y, cuadrado_size, cuadrado_size, stroke=1, fill=1)
        else:
            pdf.setFillColor(colors.white)
            pdf.setStrokeColor(colors.black)
            pdf.rect(cuadrado_x, cuadrado_y, cuadrado_size, cuadrado_size, stroke=1, fill=0)
        
        # Dibujar trapecios para las 4 caras
        # Cara Vestibular (superior) - id_cara=3
        if 3 in caras_tratadas:
            self.dibujar_trapecio_superior(pdf, x, y, size, cuadrado_margin, colors.blue)
        else:
            self.dibujar_trapecio_superior(pdf, x, y, size, cuadrado_margin, colors.white)
        
        # Cara Palatino (inferior) - id_cara=7
        if 7 in caras_tratadas:
            self.dibujar_trapecio_inferior(pdf, x, y, size, cuadrado_margin, colors.blue)
        else:
            self.dibujar_trapecio_inferior(pdf, x, y, size, cuadrado_margin, colors.white)
        
        # Cara Mesial (izquierda) - id_cara=5
        if 5 in caras_tratadas:
            self.dibujar_trapecio_izquierdo(pdf, x, y, size, cuadrado_margin, colors.blue)
        else:
            self.dibujar_trapecio_izquierdo(pdf, x, y, size, cuadrado_margin, colors.white)
        
        # Cara Distal (derecha) - id_cara=6
        if 6 in caras_tratadas:
            self.dibujar_trapecio_derecho(pdf, x, y, size, cuadrado_margin, colors.blue)
        else:
            self.dibujar_trapecio_derecho(pdf, x, y, size, cuadrado_margin, colors.white)

    def dibujar_trapecio_superior(self, pdf, x, y, size, margin, color):
        """Dibuja el trapecio superior (vestibular)"""
        path = pdf.beginPath()
        path.moveTo(x + margin, y + size - margin)
        path.lineTo(x + size - margin, y + size - margin)
        path.lineTo(x + size, y + size)
        path.lineTo(x, y + size)
        path.close()
        pdf.setFillColor(color)
        pdf.setStrokeColor(colors.black)
        pdf.drawPath(path, stroke=1, fill=1)

    def dibujar_trapecio_inferior(self, pdf, x, y, size, margin, color):
        """Dibuja el trapecio inferior (palatino/lingual)"""
        path = pdf.beginPath()
        path.moveTo(x + margin, y + margin)
        path.lineTo(x + size - margin, y + margin)
        path.lineTo(x + size, y)
        path.lineTo(x, y)
        path.close()
        pdf.setFillColor(color)
        pdf.setStrokeColor(colors.black)
        pdf.drawPath(path, stroke=1, fill=1)

    def dibujar_trapecio_izquierdo(self, pdf, x, y, size, margin, color):
        """Dibuja el trapecio izquierdo (mesial)"""
        path = pdf.beginPath()
        path.moveTo(x + margin, y + margin)
        path.lineTo(x + margin, y + size - margin)
        path.lineTo(x, y + size)
        path.lineTo(x, y)
        path.close()
        pdf.setFillColor(color)
        pdf.setStrokeColor(colors.black)
        pdf.drawPath(path, stroke=1, fill=1)

    def dibujar_trapecio_derecho(self, pdf, x, y, size, margin, color):
        """Dibuja el trapecio derecho (distal)"""
        path = pdf.beginPath()
        path.moveTo(x + size - margin, y + margin)
        path.lineTo(x + size - margin, y + size - margin)
        path.lineTo(x + size, y + size)
        path.lineTo(x + size, y)
        path.close()
        pdf.setFillColor(color)
        pdf.setStrokeColor(colors.black)
        pdf.drawPath(path, stroke=1, fill=1)

    def dibujar_diente_extraido(self, pdf, x, y, size, color=colors.red):
        """Dibuja una X roja para dientes extraídos"""
        pdf.setStrokeColor(color)
        pdf.setLineWidth(2)
        pdf.line(x, y, x + size, y + size)
        pdf.line(x, y + size, x + size, y)
        
        # Dibujar contorno del diente
        pdf.setStrokeColor(colors.black)
        pdf.setLineWidth(1)
        pdf.rect(x, y, size, size, stroke=1, fill=0)

    def dibujar_diente_no_usado(self, pdf, x, y, size):
        """Dibuja línea roja horizontal para dentaduras no usadas"""
        pdf.setStrokeColor(colors.red)
        pdf.setLineWidth(1.5)
        pdf.line(x, y + size/2, x + size, y + size/2)
        
        # Dibujar contorno del diente
        pdf.setStrokeColor(colors.black)
        pdf.setLineWidth(1)
        pdf.rect(x, y, size, size, stroke=1, fill=0)

    def dibujar_referencias(self, pdf, width, height):
        """Dibuja el cuadro de referencias"""
       

    def dibujar_observaciones(self, pdf, width, height, ficha):
        """Dibuja la sección de observaciones"""
        y_obs = height - 9*cm
        pdf.setFont("Helvetica-Bold", 9)
        pdf.drawString(2*cm, y_obs, "OBSERVACIONES:")
        
        # Líneas para escribir
        pdf.setFont("Helvetica", 8)
        y_line = y_obs - 0.5*cm
        observaciones = ficha.observaciones or ""
        
        # Dibujar hasta 3 líneas de observaciones
        lineas = observaciones[:200].split('\n') if observaciones else []
        for i, linea in enumerate(lineas[:3]):
            pdf.drawString(2*cm, y_line - i*0.5*cm, linea[:100])

    def dibujar_ficha_patologica(self, pdf, width, height, ficha_patologica):
        """Dibuja la tabla de ficha patológica"""

        # CORRECCIÓN: Verificar si existe ficha patológica
        if not ficha_patologica:
            # Dibujar tabla vacía
            y_inicio = height - 10*cm
            x_inicio = 2*cm
            cell_width = 5*cm
            cell_height = 0.6*cm
            
            pdf.setFont("Helvetica", 7)
            pdf.drawString(x_inicio, y_inicio + 0.5*cm, "No hay ficha patológica registrada")
            return
        
        y_inicio = height - 14*cm
        x_inicio = 2*cm
        
        # Definir patologías en orden (7 filas x 5 columnas)
        # CORRECCIÓN: Usar los nombres exactos de los campos del modelo
        patologias = [
            ('Alergias', ficha_patologica.alergias),
            ('Embarazada o sospecha', ficha_patologica.embarazo_sospecha),
            ('Hipotensión', ficha_patologica.hipotension),
            ('Problemas tiroides', ficha_patologica.problemas_tiroides),
            ('VIH', ficha_patologica.vih),
            ('Anemias', ficha_patologica.anemia),
            ('Fiebre Reumática', ficha_patologica.fiebre_reumatica),
            ('Jaquecas', ficha_patologica.jaquecas),
            ('Problemas respiratorios', ficha_patologica.problemas_respiratorios),
            ('Portador de prótesis', ficha_patologica.portador_protesis),
            ('Artritis', ficha_patologica.artritis),
            ('Glaucoma', ficha_patologica.glaucoma),
            ('Lesiones de cabeza', ficha_patologica.lesiones_cabeza),
            ('Sinusitis', ficha_patologica.sinusitis),
            ('Problema periodontal', ficha_patologica.problema_periodontal),
            ('Asma', ficha_patologica.asma),
            ('Hemorragias', ficha_patologica.hemorragias),
            ('Problemas hepáticos', ficha_patologica.problemas_hepaticos),
            ('Tuberculosis', ficha_patologica.tuberculosis),
            ('Ortodoncia', ficha_patologica.ortodoncia),
            ('Desnutrición', ficha_patologica.desnutricion),
            ('Hepatitis', ficha_patologica.hepatitis),
            ('Problemas mentales', ficha_patologica.problemas_mentales),
            ('Tumores', ficha_patologica.tumores),
            ('Mala oclusión', ficha_patologica.mala_oclusion),
            ('Diabetes', ficha_patologica.diabetes),
            ('Herpes', ficha_patologica.herpes),
            ('Problemas Cardíacos', ficha_patologica.problemas_cardiacos),
            ('Úlceras', ficha_patologica.ulceras),
            ('Lesión en mucosa', ficha_patologica.lesion_mucosa),
            ('Epilepsia', ficha_patologica.epilepsia),
            ('Hipertensión', ficha_patologica.hipertension),
            ('Problemas renales', ficha_patologica.problemas_renales),
            ('Venéreas', ficha_patologica.venereas),
            ('Toma medicación', ficha_patologica.toma_medicacion),
        ]
        
        # Dimensiones de celdas
        cell_width = 5*cm
        cell_height = 0.6*cm
        
        pdf.setFont("Helvetica", 7)
        # === Cuadro alrededor de la ficha patológica ===
        cuadro_x = x_inicio - 0.3*cm
        cuadro_y = y_inicio - 7*cell_height - 0.8*cm   # cubre 7 filas + "otras"
        cuadro_width = (cell_width * 5) + 0.6*cm
        cuadro_height = (7 * cell_height) + cell_height + 1.1*cm

        pdf.setLineWidth(1)
        pdf.setStrokeColor(colors.black)
        pdf.rect(cuadro_x, cuadro_y, cuadro_width, cuadro_height, stroke=1, fill=0)

        # Dibujar tabla (7 filas x 5 columnas)
        for i, (nombre, valor) in enumerate(patologias):
            fila = i // 5
            columna = i % 5
            
            x = x_inicio + columna * cell_width
            y = y_inicio - fila * cell_height
            
            # Dibujar celda
            pdf.rect(x, y, cell_width, cell_height, stroke=1, fill=0)
            
            # Nombre de la patología
            pdf.setFillColor(colors.black)
            pdf.drawString(x + 0.1*cm, y + 0.2*cm, nombre)
            
            # CORRECCIÓN: Marcar si está presente (verificar que sea 1 o True)
            if valor == 1 or valor is True:
                pdf.setFont("Helvetica-Bold", 9)
                pdf.drawString(x + cell_width - 0.5*cm, y + 0.2*cm, "✓")
                pdf.setFont("Helvetica", 7)
        
        # Fila de "Otras especificar"
        y_otras = y_inicio - 7 * cell_height
        pdf.rect(x_inicio, y_otras, cell_width * 5, cell_height, stroke=1, fill=0)
        pdf.drawString(x_inicio + 0.1*cm, y_otras + 0.2*cm, "Otras especificar:")
        if ficha_patologica.otra:
            pdf.drawString(x_inicio + 3*cm, y_otras + 0.2*cm, str(ficha_patologica.otra)[:50])

    def dibujar_consentimiento_firmas(self, pdf, width, height, paciente):
        """Dibuja la sección de consentimiento y firmas"""
        y_consent = height - 17*cm
        
        # Texto de consentimiento
        pdf.setFont("Helvetica-Bold", 8)
        pdf.setFillColor(colors.black)
        pdf.drawString(2*cm, y_consent, "CONSENTIMIENTO PARA SOMETERSE A TRATAMIENTO ODONTOLÓGICO")
        
        pdf.setFont("Helvetica", 6)
        y_consent -= 0.4*cm
        texto_consent = "Declaro tener conocimiento que el tratamiento odontológico tiene un alto grado de conformidad, es un procedimiento biológico..."
        pdf.drawString(2*cm, y_consent, texto_consent[:110])
        
       
        
        
        # Datos del profesional
        pdf.drawString(width - 8*cm, "GISELA ALEJANDRA FLORES")
        pdf.drawString(width - 8*cm, "ODONTÓLOGA")
        pdf.drawString(width - 8*cm, "M.P. 1802")
        pdf.drawString(width - 8*cm, "SELLO Y FIRMA DEL PROFESIONAL")
        
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