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