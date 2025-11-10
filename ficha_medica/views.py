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
                
                filas_tratamientos.append({
                    'diente': str(d.id_diente.id_diente) if d.id_diente else '',
                    'cara': cara,
                    'codigo': d.id_tratamiento.codigo,
                    'fecha': d.fecha_realizacion.strftime("%d/%m/%Y") if hasattr(d, 'fecha_realizacion') and d.fecha_realizacion else '',
                    'conformidad': 'X' if d.conformidad_paciente else '',
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
            pdf.rect(14.5*cm, y_pos - 2.2*cm, 1*cm, 0.4*cm, stroke=1, fill=0)
            
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
            # 6. DATOS DEL PACIENTE (solo nombre, apellido, edad y credencial)
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
            
            # Edad
            pdf.setFont("Helvetica", 9)
            pdf.drawString(15*cm, y_pos - 0.6*cm, f"Edad:")
            pdf.rect(16*cm, y_pos - 0.7*cm, 1*cm, 0.4*cm, stroke=1, fill=0)
            pdf.drawCentredString(16.5*cm, y_pos - 0.5*cm, str(edad))
            
            # Credencial (más corta)
            pdf.drawString(18*cm, y_pos - 0.6*cm, f"Credencial:")
            pdf.rect(20*cm, y_pos - 0.7*cm, 5*cm, 0.4*cm, stroke=1, fill=0)
            credencial = str(paciente_os.credencial_paciente) if paciente_os.credencial_paciente else ""
            pdf.drawString(20.2*cm, y_pos - 0.5*cm, credencial)
            
            y_pos -= 1.3*cm
            
            # DATOS ADICIONALES (fuera del recuadro)
            pdf.setFont("Helvetica", 9)
            # Primera línea - Titular, Parentesco, Fecha de nacimiento
            pdf.drawString(1.2*cm, y_pos, f"Titular: {'_' * 40}")
            pdf.drawString(11*cm, y_pos, f"Parentesco: {'_' * 25}")
            pdf.drawString(20*cm, y_pos, f"Fecha de nacimiento: {paciente.fecha_nacimiento or '_ _ / _ _ / _ _ _ _'}")
            
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
            # 7. DATOS DEL ODONTÓLOGO (recuadro más alto)
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
            
            # Matrícula Profesional (derecha)
            pdf.setFont("Helvetica", 9)
            pdf.drawString(23*cm, y_pos - 0.5*cm, "Matrícula")
            pdf.drawString(23*cm, y_pos - 0.8*cm, "Profesional:")
            pdf.rect(25.5*cm, y_pos - 0.9*cm, 3.5*cm, 0.7*cm, stroke=1, fill=0)
            pdf.setFont("Helvetica-Bold", 12)
            pdf.drawCentredString(27.2*cm, y_pos - 0.6*cm, "1802")
            
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
            
            # Cuadro para número
            pdf.rect(20*cm, y_pos - 1.5*cm, 2*cm, 0.8*cm, stroke=1, fill=0)
            
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
            
            # Estructura para todos los dientes (1-85 según notación universal)
            # Dientes permanentes: 11-18, 21-28, 31-38, 41-48
            # Dientes temporales: 51-55, 61-65, 71-75, 81-85
            dientes_permanentes_superior = list(range(11, 19)) + list(range(21, 29))
            dientes_permanentes_inferior = list(range(31, 39)) + list(range(41, 49))
            dientes_temporales_superior = list(range(51, 56)) + list(range(61, 66))
            dientes_temporales_inferior = list(range(71, 76)) + list(range(81, 86))
            
            todos_los_dientes = (
                dientes_permanentes_superior + 
                dientes_temporales_superior +
                dientes_temporales_inferior +
                dientes_permanentes_inferior
            )
            
            # Inicializar estructura de dientes
            odontograma = {}
            for diente_num in todos_los_dientes:
                odontograma[diente_num] = {
                    'id_diente': diente_num,
                    'extraido': False,
                    'caras_tratadas': [],  # Lista de id_cara tratadas
                    'tratamientos': []
                }
            
            # Procesar detalles
            for detalle in detalles:
                if detalle.id_diente:
                    diente_id = detalle.id_diente.id_diente
                    
                    if diente_id in odontograma:
                        # Verificar si es extracción
                        es_extraccion = 'extracción' in detalle.id_tratamiento.nombre_tratamiento.lower() or \
                                      'extraccion' in detalle.id_tratamiento.nombre_tratamiento.lower()
                        
                        if es_extraccion:
                            odontograma[diente_id]['extraido'] = True
                        
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
                        'permanentes_superior': dientes_permanentes_superior,
                        'permanentes_inferior': dientes_permanentes_inferior,
                        'temporales_superior': dientes_temporales_superior,
                        'temporales_inferior': dientes_temporales_inferior
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


class OdontogramaPDFView(APIView):
    """Genera PDF del odontograma con representación visual de dientes"""
    
    def dibujar_diente(self, pdf, x, y, size, caras_tratadas, extraido=False, es_superior=True):
        """
        Dibuja un diente dividido en 5 secciones
        caras_tratadas: lista de IDs de caras [1,2,3,4,5]
        1: Oclusal/Incisal (centro)
        2: Vestibular
        3: Palatino/Lingual
        4: Mesial (izquierda)
        5: Distal (derecha)
        
        es_superior: True para dientes superiores (vestibular arriba, palatino abajo)
                     False para dientes inferiores (vestibular abajo, palatino arriba)
        """
        from reportlab.lib import colors
        
        # Si está extraído, dibujar X
        if extraido:
            pdf.setStrokeColor(colors.red)
            pdf.setLineWidth(2)
            pdf.line(x, y, x + size, y + size)
            pdf.line(x, y + size, x + size, y)
            pdf.setStrokeColor(colors.black)
            pdf.setLineWidth(1)
            return
        
        # Dibujar cuadrado exterior
        pdf.setStrokeColor(colors.black)
        pdf.setLineWidth(1)
        pdf.rect(x, y, size, size, stroke=1, fill=0)
        
        # Calcular puntos para las 5 secciones
        centro_x = x + size/2
        centro_y = y + size/2
        
        # Definir colores
        color_normal = colors.white
        color_tratado = colors.HexColor('#4A90E2')  # Azul
        
        # 1. Centro (Oclusal/Incisal) - Rombo central
        puntos_centro = [
            (centro_x, y + size),           # Arriba
            (x + size, centro_y),           # Derecha
            (centro_x, y),                  # Abajo
            (x, centro_y)                   # Izquierda
        ]
        
        if 1 in caras_tratadas:
            pdf.setFillColor(color_tratado)
        else:
            pdf.setFillColor(color_normal)
        
        path = pdf.beginPath()
        path.moveTo(puntos_centro[0][0], puntos_centro[0][1])
        for punto in puntos_centro[1:]:
            path.lineTo(punto[0], punto[1])
        path.close()
        pdf.drawPath(path, fill=1, stroke=1)
        
        # Determinar posición de vestibular y palatino según si es superior o inferior
        if es_superior:
            # Dientes superiores: Vestibular arriba, Palatino abajo
            vestibular_arriba = True
        else:
            # Dientes inferiores: Vestibular abajo, Palatino arriba
            vestibular_arriba = False
        
        # 2. Vestibular - Posición depende de si es superior o inferior
        if 2 in caras_tratadas:
            pdf.setFillColor(color_tratado)
        else:
            pdf.setFillColor(color_normal)
        
        if vestibular_arriba:
            # Vestibular en parte superior (dientes superiores)
            path = pdf.beginPath()
            path.moveTo(x, y + size)                # Esquina superior izquierda
            path.lineTo(centro_x, y + size)         # Centro superior
            path.lineTo(x, centro_y)                # Centro izquierdo
            path.close()
            pdf.drawPath(path, fill=1, stroke=1)
            
            path = pdf.beginPath()
            path.moveTo(x + size, y + size)         # Esquina superior derecha
            path.lineTo(centro_x, y + size)         # Centro superior
            path.lineTo(x + size, centro_y)         # Centro derecho
            path.close()
            pdf.drawPath(path, fill=1, stroke=1)
        else:
            # Vestibular en parte inferior (dientes inferiores)
            path = pdf.beginPath()
            path.moveTo(x, y)                       # Esquina inferior izquierda
            path.lineTo(centro_x, y)                # Centro inferior
            path.lineTo(x, centro_y)                # Centro izquierdo
            path.close()
            pdf.drawPath(path, fill=1, stroke=1)
            
            path = pdf.beginPath()
            path.moveTo(x + size, y)                # Esquina inferior derecha
            path.lineTo(centro_x, y)                # Centro inferior
            path.lineTo(x + size, centro_y)         # Centro derecho
            path.close()
            pdf.drawPath(path, fill=1, stroke=1)
        
        # 3. Palatino/Lingual - Posición opuesta a vestibular
        if 3 in caras_tratadas:
            pdf.setFillColor(color_tratado)
        else:
            pdf.setFillColor(color_normal)
        
        if vestibular_arriba:
            # Palatino en parte inferior (dientes superiores)
            path = pdf.beginPath()
            path.moveTo(x, y)                       # Esquina inferior izquierda
            path.lineTo(centro_x, y)                # Centro inferior
            path.lineTo(x, centro_y)                # Centro izquierdo
            path.close()
            pdf.drawPath(path, fill=1, stroke=1)
            
            path = pdf.beginPath()
            path.moveTo(x + size, y)                # Esquina inferior derecha
            path.lineTo(centro_x, y)                # Centro inferior
            path.lineTo(x + size, centro_y)         # Centro derecho
            path.close()
            pdf.drawPath(path, fill=1, stroke=1)
        else:
            # Palatino en parte superior (dientes inferiores)
            path = pdf.beginPath()
            path.moveTo(x, y + size)                # Esquina superior izquierda
            path.lineTo(centro_x, y + size)         # Centro superior
            path.lineTo(x, centro_y)                # Centro izquierdo
            path.close()
            pdf.drawPath(path, fill=1, stroke=1)
            
            path = pdf.beginPath()
            path.moveTo(x + size, y + size)         # Esquina superior derecha
            path.lineTo(centro_x, y + size)         # Centro superior
            path.lineTo(x + size, centro_y)         # Centro derecho
            path.close()
            pdf.drawPath(path, fill=1, stroke=1)
        
        # 4. Mesial (Izquierda)
        if 4 in caras_tratadas:
            pdf.setFillColor(color_tratado)
            
            # Redibujar triángulos izquierdos
            if vestibular_arriba:
                # Superior: vestibular arriba
                path = pdf.beginPath()
                path.moveTo(x, y + size)
                path.lineTo(centro_x, y + size)
                path.lineTo(x, centro_y)
                path.close()
                pdf.drawPath(path, fill=1, stroke=1)
                
                # Palatino abajo
                path = pdf.beginPath()
                path.moveTo(x, y)
                path.lineTo(centro_x, y)
                path.lineTo(x, centro_y)
                path.close()
                pdf.drawPath(path, fill=1, stroke=1)
            else:
                # Inferior: palatino arriba
                path = pdf.beginPath()
                path.moveTo(x, y + size)
                path.lineTo(centro_x, y + size)
                path.lineTo(x, centro_y)
                path.close()
                pdf.drawPath(path, fill=1, stroke=1)
                
                # Vestibular abajo
                path = pdf.beginPath()
                path.moveTo(x, y)
                path.lineTo(centro_x, y)
                path.lineTo(x, centro_y)
                path.close()
                pdf.drawPath(path, fill=1, stroke=1)
        
        # 5. Distal (Derecha)
        if 5 in caras_tratadas:
            pdf.setFillColor(color_tratado)
            
            # Redibujar triángulos derechos
            if vestibular_arriba:
                # Superior: vestibular arriba
                path = pdf.beginPath()
                path.moveTo(x + size, y + size)
                path.lineTo(centro_x, y + size)
                path.lineTo(x + size, centro_y)
                path.close()
                pdf.drawPath(path, fill=1, stroke=1)
                
                # Palatino abajo
                path = pdf.beginPath()
                path.moveTo(x + size, y)
                path.lineTo(centro_x, y)
                path.lineTo(x + size, centro_y)
                path.close()
                pdf.drawPath(path, fill=1, stroke=1)
            else:
                # Inferior: palatino arriba
                path = pdf.beginPath()
                path.moveTo(x + size, y + size)
                path.lineTo(centro_x, y + size)
                path.lineTo(x + size, centro_y)
                path.close()
                pdf.drawPath(path, fill=1, stroke=1)
                
                # Vestibular abajo
                path = pdf.beginPath()
                path.moveTo(x + size, y)
                path.lineTo(centro_x, y)
                path.lineTo(x + size, centro_y)
                path.close()
                pdf.drawPath(path, fill=1, stroke=1)
        
        # Redibujar bordes del diente
        pdf.setStrokeColor(colors.black)
        pdf.setFillColor(color_normal)
        pdf.rect(x, y, size, size, stroke=1, fill=0)
        
        # Dibujar líneas del rombo central
        pdf.line(centro_x, y + size, centro_x, y)      # Vertical
        pdf.line(x, centro_y, x + size, centro_y)      # Horizontal
    
    def get(self, request, id_ficha):
        try:
            from reportlab.pdfgen import canvas
            from reportlab.lib.pagesizes import A4
            from reportlab.lib import colors
            from reportlab.lib.units import cm
            from io import BytesIO
            
            # Obtener datos del odontograma
            ficha = FichasMedicas.objects.get(
                id_ficha_medica=id_ficha,
                eliminado__isnull=True
            )
            
            # Obtener detalles
            detalles = DetallesConsulta.objects.filter(
                id_ficha_medica=ficha,
                eliminado__isnull=True
            ).select_related('id_tratamiento', 'id_diente')
            
            # Procesar odontograma
            odontograma = {}
            for detalle in detalles:
                if detalle.id_diente:
                    diente_id = detalle.id_diente.id_diente
                    
                    if diente_id not in odontograma:
                        odontograma[diente_id] = {
                            'extraido': False,
                            'caras_tratadas': []
                        }
                    
                    # Verificar extracción
                    es_extraccion = 'extracción' in detalle.id_tratamiento.nombre_tratamiento.lower() or \
                                  'extraccion' in detalle.id_tratamiento.nombre_tratamiento.lower()
                    
                    if es_extraccion:
                        odontograma[diente_id]['extraido'] = True
                    
                    # Agregar cara
                    if detalle.id_cara and detalle.id_cara not in odontograma[diente_id]['caras_tratadas']:
                        odontograma[diente_id]['caras_tratadas'].append(detalle.id_cara)
            
            # Crear PDF
            buffer = BytesIO()
            pdf = canvas.Canvas(buffer, pagesize=A4)
            width, height = A4
            
            # Título
            pdf.setFont("Helvetica-Bold", 16)
            pdf.drawCentredString(width/2, height - 2*cm, "ODONTOGRAMA")
            
            # Datos del paciente
            paciente = ficha.id_paciente_os.id_paciente
            pdf.setFont("Helvetica", 10)
            y_pos = height - 3*cm
            pdf.drawString(2*cm, y_pos, f"Paciente: {paciente.apellido_paciente}, {paciente.nombre_paciente}")
            y_pos -= 0.5*cm
            pdf.drawString(2*cm, y_pos, f"DNI: {paciente.dni_paciente}")
            pdf.drawString(10*cm, y_pos, f"Fecha: {ficha.fecha_creacion}")
            
            # Referencias
            y_pos -= 1*cm
            pdf.setFont("Helvetica-Bold", 10)
            pdf.drawString(2*cm, y_pos, "REFERENCIAS:")
            pdf.setFont("Helvetica", 9)
            y_pos -= 0.5*cm
            
            # Cuadrado azul
            pdf.setFillColor(colors.HexColor('#4A90E2'))
            pdf.rect(2*cm, y_pos - 0.2*cm, 0.4*cm, 0.4*cm, fill=1, stroke=1)
            pdf.setFillColor(colors.black)
            pdf.drawString(2.6*cm, y_pos, "Prestaciones requeridas")
            
            y_pos -= 0.5*cm
            
            # X roja
            pdf.setStrokeColor(colors.red)
            pdf.setLineWidth(2)
            pdf.line(2*cm, y_pos - 0.2*cm, 2.4*cm, y_pos + 0.2*cm)
            pdf.line(2*cm, y_pos + 0.2*cm, 2.4*cm, y_pos - 0.2*cm)
            pdf.setStrokeColor(colors.black)
            pdf.setLineWidth(1)
            pdf.drawString(2.6*cm, y_pos, "Diente ausente o extraer")
            
            # Dibujar odontograma
            y_pos -= 2*cm
            diente_size = 0.8*cm
            espacio = 0.2*cm
            
            # Dientes permanentes superiores (18-11, 21-28)
            pdf.setFont("Helvetica", 7)
            x_start = 2*cm
            
            # Fila 1: 18-11 (derecha del paciente)
            x_pos = x_start
            for num in range(18, 10, -1):
                caras = odontograma.get(num, {}).get('caras_tratadas', [])
                extraido = odontograma.get(num, {}).get('extraido', False)
                self.dibujar_diente(pdf, x_pos, y_pos, diente_size, caras, extraido, es_superior=True)
                pdf.drawCentredString(x_pos + diente_size/2, y_pos + diente_size + 0.1*cm, str(num))
                x_pos += diente_size + espacio
            
            # Separación central
            x_pos += espacio
            
            # Fila 1: 21-28 (izquierda del paciente)
            for num in range(21, 29):
                caras = odontograma.get(num, {}).get('caras_tratadas', [])
                extraido = odontograma.get(num, {}).get('extraido', False)
                self.dibujar_diente(pdf, x_pos, y_pos, diente_size, caras, extraido, es_superior=True)
                pdf.drawCentredString(x_pos + diente_size/2, y_pos + diente_size + 0.1*cm, str(num))
                x_pos += diente_size + espacio
            
            # Dientes temporales superiores (55-51, 61-65)
            y_pos -= (diente_size + 0.7*cm)
            x_pos = x_start + (diente_size + espacio) * 3
            
            for num in range(55, 50, -1):
                caras = odontograma.get(num, {}).get('caras_tratadas', [])
                extraido = odontograma.get(num, {}).get('extraido', False)
                self.dibujar_diente(pdf, x_pos, y_pos, diente_size, caras, extraido, es_superior=True)
                pdf.drawCentredString(x_pos + diente_size/2, y_pos + diente_size + 0.1*cm, str(num))
                x_pos += diente_size + espacio
            
            x_pos += espacio
            
            for num in range(61, 66):
                caras = odontograma.get(num, {}).get('caras_tratadas', [])
                extraido = odontograma.get(num, {}).get('extraido', False)
                self.dibujar_diente(pdf, x_pos, y_pos, diente_size, caras, extraido, es_superior=True)
                pdf.drawCentredString(x_pos + diente_size/2, y_pos + diente_size + 0.1*cm, str(num))
                x_pos += diente_size + espacio
            
            # Dientes temporales inferiores (85-81, 71-75)
            y_pos -= (diente_size + 0.7*cm)
            x_pos = x_start + (diente_size + espacio) * 3
            
            for num in range(85, 80, -1):
                caras = odontograma.get(num, {}).get('caras_tratadas', [])
                extraido = odontograma.get(num, {}).get('extraido', False)
                self.dibujar_diente(pdf, x_pos, y_pos, diente_size, caras, extraido, es_superior=False)
                pdf.drawCentredString(x_pos + diente_size/2, y_pos - 0.3*cm, str(num))
                x_pos += diente_size + espacio
            
            x_pos += espacio
            
            for num in range(71, 76):
                caras = odontograma.get(num, {}).get('caras_tratadas', [])
                extraido = odontograma.get(num, {}).get('extraido', False)
                self.dibujar_diente(pdf, x_pos, y_pos, diente_size, caras, extraido, es_superior=False)
                pdf.drawCentredString(x_pos + diente_size/2, y_pos - 0.3*cm, str(num))
                x_pos += diente_size + espacio
            
            # Dientes permanentes inferiores (48-41, 31-38)
            y_pos -= (diente_size + 0.7*cm)
            x_pos = x_start
            
            for num in range(48, 40, -1):
                caras = odontograma.get(num, {}).get('caras_tratadas', [])
                extraido = odontograma.get(num, {}).get('extraido', False)
                self.dibujar_diente(pdf, x_pos, y_pos, diente_size, caras, extraido, es_superior=False)
                pdf.drawCentredString(x_pos + diente_size/2, y_pos - 0.3*cm, str(num))
                x_pos += diente_size + espacio
            
            x_pos += espacio
            
            for num in range(31, 39):
                caras = odontograma.get(num, {}).get('caras_tratadas', [])
                extraido = odontograma.get(num, {}).get('extraido', False)
                self.dibujar_diente(pdf, x_pos, y_pos, diente_size, caras, extraido, es_superior=False)
                pdf.drawCentredString(x_pos + diente_size/2, y_pos - 0.3*cm, str(num))
                x_pos += diente_size + espacio
            
            # Ficha patológica
            y_pos -= 2*cm
            if ficha.id_ficha_patologica:
                fp = ficha.id_ficha_patologica
                pdf.setFont("Helvetica-Bold", 12)
                pdf.drawString(2*cm, y_pos, "FICHA PATOLÓGICA")
                
                y_pos -= 0.7*cm
                pdf.setFont("Helvetica", 8)
                
                # Lista de patologías marcadas
                patologias = []
                if fp.alergias: patologias.append("Alergias")
                if fp.diabetes: patologias.append("Diabetes")
                if fp.hipertension: patologias.append("Hipertensión")
                if fp.asma: patologias.append("Asma")
                if fp.hepatitis: patologias.append("Hepatitis")
                if fp.problemas_cardiacos: patologias.append("Problemas cardíacos")
                if fp.embarazo_sospecha: patologias.append("Embarazo/Sospecha")
                if fp.toma_medicacion: patologias.append("Toma medicación")
                
                if patologias:
                    texto = "Antecedentes: " + ", ".join(patologias)
                    pdf.drawString(2*cm, y_pos, texto)
                else:
                    pdf.drawString(2*cm, y_pos, "Sin antecedentes patológicos registrados")
                
                if fp.otra:
                    y_pos -= 0.5*cm
                    pdf.drawString(2*cm, y_pos, f"Otras: {fp.otra}")
            
            # Observaciones
            if ficha.observaciones:
                y_pos -= 1*cm
                pdf.setFont("Helvetica-Bold", 10)
                pdf.drawString(2*cm, y_pos, "OBSERVACIONES:")
                y_pos -= 0.5*cm
                pdf.setFont("Helvetica", 9)
                pdf.drawString(2*cm, y_pos, str(ficha.observaciones)[:100])
            
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