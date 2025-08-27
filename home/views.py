from django.shortcuts import render
from django.http import JsonResponse
from home.models import Turnos

# Create your views here.
def home(request):
    return render(request, "home.html")

def turnos_json(request):
    turnos = Turnos.objects.select_related("id_paciente").all()
    eventos = []
    for turno in turnos:
        eventos.append({
            "title": f"{turno.id_paciente} - {turno.asunto}",
            "start": f"{turno.fecha_turno}T{turno.hora_turno}",
            "extendedProps": {
                "comentario": turno.comentario_turno
            }
        })
    return JsonResponse(eventos, safe=False)