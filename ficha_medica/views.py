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
    Genera un PDF con odontograma (cada diente: cuadrado oclusal + trapecios como caras)
    y la ficha patológica en la misma página.
    """

    PAGE_WIDTH, PAGE_HEIGHT = landscape(A4)

    # Lista de patologías con la disposición que queremos (7 filas x 5 columnas)
    PATHOLOGY_ORDER = [
        "Alergias", "Embarazada_o_sospecha", "Hipotencion", "Problemas_tiroideos", "VIH",
        "Anemias", "Fiebre_Reumatica", "Jaquecas", "Problemas_respiratorios", "Portador_protesis",
        "Artritis", "Glaucoma", "Lesiones_cabeza", "Sinusitis", "Problema_periodontal",
        "Asma", "Hemorragias", "Problemas_hepaticos", "Tuberculosis", "Ortodoncia",
        "Desnutricion", "Hepatitis", "Problemas_mentales", "Tumores", "Mala_occlusion",
        "Diabetes", "Herpes", "Problemas_cardíacos", "Ulceras", "Lesion_mucosa",
        "Epilepsia", "Hipertencion", "Problemas_renales", "Veneréas", "Toma_medicacion"
    ]
    # Si tu modelo usa otros nombres, reemplaza las cadenas por los nombres de atributo exactos.

    def get(self, request, paciente_id, *args, **kwargs):
        # Obtener paciente y datos
        paciente = Pacientes.objects.filter(pk=paciente_id).first()
        if not paciente:
            return HttpResponse("Paciente no encontrado", status=404)

        # Intenta obtener la ficha patológica asociada
        ficha = None
        # 3 intentos comunes de relación entre paciente y ficha (adapta si es diferente)
        try:
            ficha = FichasPatologicas.objects.filter(paciente=paciente).first()
        except Exception:
            # Si no existe modelo o relación, la variable quedará en None
            ficha = None

        # Obtener dientes del odontograma (suponemos que existe un modelo Diente con campo 'numero')
        dientes = Dientes.objects.filter(paciente=paciente).order_by('id')

        # Preparar buffer PDF
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=landscape(A4))
        c.setTitle(f"Odontograma - {getattr(paciente, 'nombre', 'Paciente')}")

        # Margenes y áreas
        margin = 12 * mm
        usable_width = self.PAGE_WIDTH - 2 * margin
        usable_height = self.PAGE_HEIGHT - 2 * margin

        # Dividimos la página: izquierda = odontograma, derecha = ficha patologica
        odontograma_width = usable_width * 0.62
        ficha_width = usable_width - odontograma_width - 10 * mm

        odontograma_x = margin
        odontograma_y = margin

        ficha_x = odontograma_x + odontograma_width + 10 * mm
        ficha_y = odontograma_y

        # Dibujar título
        c.setFont("Helvetica-Bold", 16)
        c.drawString(margin, self.PAGE_HEIGHT - margin - 10, "ODONTOGRAMA")

        # Zona del odontograma: organizamos en 4 filas (dos superiores, dos inferiores)
        # Definimos posiciones para cada diente según su número
        # Para simplicidad, creamos filas predefinidas con posiciones X,Y
        # Ajuste visual:
        top_y = self.PAGE_HEIGHT - margin - 40
        mid_y = top_y - 40
        center_y = odontograma_y + usable_height / 2 + 20
        bottom_y = odontograma_y + 60

        # Distribución X para cada diente en una fila (8 por fila típicamente)
        def gen_x_positions(left, width, count=8, gap=4 * mm):
            # devuelve lista de x centrados
            total_gap = (count - 1) * gap
            available = width - total_gap
            w_each = available / count
            xs = []
            cur = left
            for i in range(count):
                cx = cur + w_each / 2
                xs.append(cx)
                cur += w_each + gap
            return xs

        xs_top_left = gen_x_positions(odontograma_x + 4 * mm, odontograma_width / 2 - 6 * mm)
        xs_top_right = gen_x_positions(odontograma_x + odontograma_width / 2 + 6 * mm, odontograma_width / 2 - 6 * mm)

        # Mapa de posiciones por numero de diente (centro X,Y)
        positions = {}

        # Filas superiores adultos (11..18) (21..28) de izquierda a derecha (esquema dental occidental)
        # Nota: en la imagen el orden visual de la izquierda a la derecha puede invertirse según tu preferencia.
        # Aquí asumimos la siguiente colocación visual (izquierda dentadura paciente derecha del papel).
        adultos_sup_izq = list(range(18, 10, -1))  # 18..11
        adultos_sup_der = list(range(21, 29))       # 21..28

        adultos_inf_izq = list(range(48, 40, -1))   # 48..41
        adultos_inf_der = list(range(31, 39))       # 31..38

        ninos_sup_izq = list(range(55, 50, -1))     # 55..51
        ninos_sup_der = list(range(61, 66))         # 61..65

        ninos_inf_izq = list(range(85, 80, -1))     # 85..81
        ninos_inf_der = list(range(71, 76))         # 71..75

        # Asignar posiciones usando xs arrays
        # adult superior left -> xs_top_left  (indexes 0..7)
        for i, num in enumerate(adultos_sup_izq):
            if i < len(xs_top_left):
                positions[num] = (xs_top_left[i], top_y)

        # adult superior right -> xs_top_right
        for i, num in enumerate(adultos_sup_der):
            if i < len(xs_top_right):
                positions[num] = (xs_top_right[i], top_y)

        # niño superior left -> encima de la dentición infantil (pegado a top_y - 30)
        for i, num in enumerate(ninos_sup_izq):
            if i < len(xs_top_left):
                positions[num] = (xs_top_left[i], top_y - 30)

        for i, num in enumerate(ninos_sup_der):
            if i < len(xs_top_right):
                positions[num] = (xs_top_right[i], top_y - 30)

        # adult inferior left -> bottom positions (inverso visual)
        for i, num in enumerate(adultos_inf_izq):
            if i < len(xs_top_left):
                positions[num] = (xs_top_left[i], bottom_y)

        for i, num in enumerate(adultos_inf_der):
            if i < len(xs_top_right):
                positions[num] = (xs_top_right[i], bottom_y)

        # niño inferior
        for i, num in enumerate(ninos_inf_izq):
            if i < len(xs_top_left):
                positions[num] = (xs_top_left[i], bottom_y - 30)

        for i, num in enumerate(ninos_inf_der):
            if i < len(xs_top_right):
                positions[num] = (xs_top_right[i], bottom_y - 30)

        # Helper utilities para decidir si es superior/inferior y niño/adulto
        def is_superior(num):
            return (11 <= num <= 18) or (21 <= num <= 28) or (51 <= num <= 65)

        def is_inferior(num):
            return (31 <= num <= 38) or (41 <= num <= 48) or (71 <= num <= 85)

        def is_pediatric(num):
            return (51 <= num <= 65) or (71 <= num <= 85)

        # Dibujar cada diente con sus caras
        def draw_tooth(cnv, cx, cy, size=9 * mm, fill_color=colors.white, stroke_color=colors.black,
                       tooth_obj=None):
            """
            Dibuja un diente centrado en (cx, cy).
            - cuadrado central = oclusal
            - trapecios alrededor = vestibular, palatino, mesial, distal
            - tooth_obj: instancia de Diente con campos booleanos: oclusal, vestibular, distal, mesial, palatino
            """
            half = size / 2
            # Coords del cuadrado central (oclusal)
            sq_left = cx - half
            sq_right = cx + half
            sq_bottom = cy - half
            sq_top = cy + half

            # Dibujar oclusal (cuadrado central)
            cnv.setLineWidth(0.5)
            cnv.setStrokeColor(stroke_color)
            cnv.setFillColor(colors.white)
            cnv.rect(sq_left, sq_bottom, size, size, stroke=1, fill=0)

            # Determinar qué caras están activas (True => colorear)
            def has(attr):
                if tooth_obj is None:
                    return False
                return bool(getattr(tooth_obj, attr, False))

            # Trapecios: definimos sus 4 puntos
            # Arriba trapecio (vestibular si diente superior, palatino si inferior)
            up = [(sq_left - half * 0.6, sq_top),
                  (sq_right + half * 0.6, sq_top),
                  (sq_right, sq_top + half * 0.6),
                  (sq_left, sq_top + half * 0.6)]
            # Abajo trapecio
            down = [(sq_left - half * 0.6, sq_bottom),
                    (sq_right + half * 0.6, sq_bottom),
                    (sq_right, sq_bottom - half * 0.6),
                    (sq_left, sq_bottom - half * 0.6)]
            # Izquierda trapecio (mesial)
            left = [(sq_left, sq_bottom + half * 0.2),
                    (sq_left, sq_top - half * 0.2),
                    (sq_left - half * 0.6, sq_top),
                    (sq_left - half * 0.6, sq_bottom)]
            # Derecha trapecio (distal)
            right = [(sq_right, sq_bottom + half * 0.2),
                     (sq_right, sq_top - half * 0.2),
                     (sq_right + half * 0.6, sq_top),
                     (sq_right + half * 0.6, sq_bottom)]

            # Decide cuál es vestibular / palatino según si es superior o inferior
            # Si el diente está por encima del centro de la página -> consideramos superior
            vertical_position = cy
            # Heurística simple: si cy > (odontograma_y + usable_height/2) => superior
            # (podés adaptar)
            is_sup = vertical_position > (odontograma_y + usable_height / 2)

            # Asignación de trapecios a caras
            if is_sup:
                vestibular_tr = up
                palatino_tr = down
            else:
                vestibular_tr = down
                palatino_tr = up

            # Dibujar cada cara si tooth_obj tiene True correspondiente
            # Usamos color rojo para existencia/lesión (puedes ajustar)
            face_color = colors.lightgrey

            # Mesial (left)
            if has('mesial'):
                p = left
                path = cnv.beginPath()
                path.moveTo(*p[0])
                for (x, y) in p[1:]:
                    path.lineTo(x, y)
                path.close()
                cnv.setFillColor(face_color)
                cnv.drawPath(path, stroke=1, fill=1)
            else:
                # solo borde
                path = cnv.beginPath()
                p = left
                path.moveTo(*p[0])
                for (x, y) in p[1:]:
                    path.lineTo(x, y)
                path.close()
                cnv.setFillColor(colors.white)
                cnv.drawPath(path, stroke=1, fill=0)

            # Distal (right)
            if has('distal'):
                p = right
                path = cnv.beginPath()
                path.moveTo(*p[0])
                for (x, y) in p[1:]:
                    path.lineTo(x, y)
                path.close()
                cnv.setFillColor(face_color)
                cnv.drawPath(path, stroke=1, fill=1)
            else:
                path = cnv.beginPath()
                p = right
                path.moveTo(*p[0])
                for (x, y) in p[1:]:
                    path.lineTo(x, y)
                path.close()
                cnv.setFillColor(colors.white)
                cnv.drawPath(path, stroke=1, fill=0)

            # Vestibular (top or bottom)
            if has('vestibular'):
                p = vestibular_tr
                path = cnv.beginPath()
                path.moveTo(*p[0])
                for (x, y) in p[1:]:
                    path.lineTo(x, y)
                path.close()
                cnv.setFillColor(face_color)
                cnv.drawPath(path, stroke=1, fill=1)
            else:
                path = cnv.beginPath()
                p = vestibular_tr
                path.moveTo(*p[0])
                for (x, y) in p[1:]:
                    path.lineTo(x, y)
                path.close()
                cnv.setFillColor(colors.white)
                cnv.drawPath(path, stroke=1, fill=0)

            # Palatino/lingual
            if has('palatino'):
                p = palatino_tr
                path = cnv.beginPath()
                path.moveTo(*p[0])
                for (x, y) in p[1:]:
                    path.lineTo(x, y)
                path.close()
                cnv.setFillColor(face_color)
                cnv.drawPath(path, stroke=1, fill=1)
            else:
                path = cnv.beginPath()
                p = palatino_tr
                path.moveTo(*p[0])
                for (x, y) in p[1:]:
                    path.lineTo(x, y)
                path.close()
                cnv.setFillColor(colors.white)
                cnv.drawPath(path, stroke=1, fill=0)

            # Redibujar cuadrado central (para superponer borde)
            cnv.setStrokeColor(colors.black)
            cnv.rect(sq_left, sq_bottom, size, size, stroke=1, fill=0)

        # Recorremos dientes consultados y dibujamos en posiciones
        for tooth in dientes:
            try:
                num = int(getattr(tooth, "numero", None))
            except Exception:
                # si 'numero' no es convertible, saltar
                continue
            pos = positions.get(num)
            if not pos:
                # si no tenemos posición definida para ese número, saltamos
                continue
            x, y = pos
            draw_tooth(c, x, y, size=8.5 * mm, tooth_obj=tooth)
            # Escribir número del diente abajo
            c.setFont("Helvetica", 7)
            c.drawCentredString(x, y - 6 * mm, str(num))

        # ---- FICHA PATOLOGICA: dibujar tabla en la derecha ----
        c.setFont("Helvetica-Bold", 12)
        c.drawString(ficha_x, self.PAGE_HEIGHT - margin - 10, "FICHA PATOLÓGICA")

        # Tabla: 7 filas x 5 columnas -> 35 celdas + fila extra
        table_left = ficha_x
        table_top = self.PAGE_HEIGHT - margin - 35
        col_count = 5
        row_count = 7
        cell_w = ficha_width / col_count
        cell_h = 14 * mm / (row_count / 5)  # heurística; ajusta si quieres tamaño fijo

        # Mejor calcular con altura disponible:
        avail_height = table_top - (ficha_y + 40)
        # reservamos espacio para 8 filas (7 + 1 extra)
        cell_h = min(12 * mm, (avail_height - 10 * mm) / 8)

        # path: por cada celda dibujar texto y si corresponde marcar 'SI' o 'NO'
        c.setFont("Helvetica", 8)
        x0 = table_left
        y0 = table_top

        # Lista de etiquetas "humanas" para las PATHOLOGY_ORDER (si quieres mostrar otras etiquetas más legibles)
        label_map = {
            # si preferís, podés mapear nombres de campo a etiquetas bonitas
            "Alergias": "Alergias",
            "Embarazada_o_sospecha": "Embarazada o sospecha",
            "Hipotencion": "Hipotensión",
            "Problemas_tiroideos": "Problemas tiroides",
            "VIH": "VIH",
            # ... completa según tus nombres
        }

        # Usamos PATHOLOGY_ORDER hasta 35 primeros (7x5)
        idx = 0
        for r in range(row_count):
            for ccol in range(col_count):
                if idx >= len(self.PATHOLOGY_ORDER):
                    break
                field = self.PATHOLOGY_ORDER[idx]
                # calcular coordenadas de celda
                cx = x0 + ccol * cell_w
                cy = y0 - r * cell_h
                # dibujar rectángulo
                c.rect(cx, cy - cell_h, cell_w, cell_h, stroke=1, fill=0)
                # obtener valor de ficha (si existe)
                value = False
                if ficha is not None:
                    # intento por varios nombres: campo directo, minusculas, reemplazando espacios
                    for candidate in (field, field.lower(), field.lower().replace(" ", "_")):
                        if hasattr(ficha, candidate):
                            value = bool(getattr(ficha, candidate))
                            break
                # texto etiqueta
                label = label_map.get(field, field.replace("_", " "))
                # pintar etiqueta a la izquierda dentro de la celda
                c.setFont("Helvetica", 7)
                c.drawString(cx + 2 * mm, cy - cell_h + 3 * mm, label)
                # pintar marca SI/NO a la derecha
                mark = "SI" if value else "NO"
                c.drawRightString(cx + cell_w - 2 * mm, cy - cell_h + 3 * mm, mark)
                idx += 1

        # Fila extra "Otras patologías" ocupando todo el ancho de la tabla justo debajo
        extra_y = y0 - row_count * cell_h - 6 * mm
        c.rect(x0, extra_y - cell_h, cell_w * col_count, cell_h, stroke=1, fill=0)
        c.setFont("Helvetica", 8)
        c.drawString(x0 + 2 * mm, extra_y - cell_h + 3 * mm, "Otras patologías:")
        # Si ficha tiene un campo de texto para "otras" lo colocamos
        otras_text = ""
        if ficha is not None:
            for candidate in ("otras", "otras_patologias", "otra_patologia", "otra_patologia_text"):
                if hasattr(ficha, candidate):
                    otras_text = getattr(ficha, candidate) or ""
                    break
        if otras_text:
            # dibujar texto truncado si es muy largo
            c.setFont("Helvetica", 7)
            c.drawString(x0 + 40 * mm, extra_y - cell_h + 3 * mm, str(otras_text)[:120])

        # Pie con firma / leyenda
        c.setFont("Helvetica-Oblique", 8)
        c.drawString(margin, odontograma_y + 10, f"Paciente: {getattr(paciente, 'nombre', '')} {getattr(paciente, 'apellido', '')}")

        # Finalizar y retornar PDF
        c.showPage()
        c.save()
        pdf = buffer.getvalue()
        buffer.close()
        response = HttpResponse(content_type="application/pdf")
        response['Content-Disposition'] = f'inline; filename="odontograma_{paciente_id}.pdf"'
        response.write(pdf)
        return response


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