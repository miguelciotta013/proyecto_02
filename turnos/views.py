import json
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from home.models import Turnos, EstadosTurno, Pacientes
from .forms import TurnoForm


# =====================
# VISTAS HTML
# =====================
def vista_turno(request):
    return render(request, "vista_turno.html")


def registrar_turno(request):
    if request.method == "POST":
        form = TurnoForm(request.POST)
        if form.is_valid():
            turno = form.save(commit=False)
            estado_obj = EstadosTurno.objects.filter(estado_turno__iexact="Pendiente").first()
            if not estado_obj:
                estado_obj = EstadosTurno.objects.create(estado_turno="Pendiente", eliminado=0)
            turno.id_turno_estado = estado_obj
            turno.eliminado = 0
            turno.fecha_eliminacion = None
            turno.save()
            return redirect("turnos:vista_turno")
    else:
        form = TurnoForm()
    return render(request, "registrar_turno.html", {"form": form})


def modificar_turno(request, pk):
    turno = get_object_or_404(Turnos, pk=pk)
    if request.method == "POST":
        form = TurnoForm(request.POST, instance=turno)
        if form.is_valid():
            form.save()
            return redirect("turnos:vista_turno")
    else:
        form = TurnoForm(instance=turno)
    return render(request, "modificar_turno.html", {"form": form, "turno": turno})


# =====================
# API JSON
# =====================
@csrf_exempt
@require_http_methods(["GET"])
def api_turnos(request):
    turnos = (
        Turnos.objects
        .select_related("id_paciente", "id_turno_estado")
        .exclude(eliminado=1)
        .order_by("-fecha_turno", "-hora_turno")
    )
    data = []
    for t in turnos:
        paciente = t.id_paciente
        nombre = getattr(paciente, "nombre_paciente", "") or getattr(paciente, "nombre", "")
        apellido = getattr(paciente, "apellido_paciente", "") or getattr(paciente, "apellido", "")
        estado_obj = getattr(t, "id_turno_estado", None)
        estado_text = estado_obj.estado_turno if estado_obj else ""
        data.append({
            "id": t.id_turno,
            "paciente": f"{nombre} {apellido}".strip(),
            "apellido": apellido,
            "fecha": t.fecha_turno.strftime("%d/%m/%Y") if t.fecha_turno else "",
            "hora": t.hora_turno.strftime("%H:%M") if t.hora_turno else "",
            "asunto": t.asunto or "",
            "comentario": t.comentario_turno or "",
            "estado": estado_text,
            "estado_id": getattr(estado_obj, "id_estado_turno", None) if estado_obj else None,
        })
    return JsonResponse({"data": data})


@csrf_exempt
@require_http_methods(["POST"])
def api_eliminar_turno(request, pk):
    turno = get_object_or_404(Turnos, pk=pk)
    turno.eliminado = 1
    turno.fecha_eliminacion = timezone.now()
    turno.save()
    return JsonResponse({"success": True, "message": "Turno eliminado correctamente."})


@csrf_exempt
@require_http_methods(["POST"])
def api_set_estado(request, pk):
    turno = get_object_or_404(Turnos, pk=pk)
    if turno.eliminado == 1:
        return JsonResponse({"success": False, "message": "No se puede cambiar el estado de un turno eliminado."}, status=400)

    estado = None
    if request.content_type and request.content_type.startswith("application/json"):
        try:
            data = json.loads(request.body.decode("utf-8"))
            estado = data.get("estado")
        except Exception:
            return JsonResponse({"success": False, "message": "Error en el formato JSON."}, status=400)
    else:
        estado = request.POST.get("estado")

    if not estado:
        return JsonResponse({"success": False, "message": "Falta parámetro 'estado'."}, status=400)

    estado_obj = EstadosTurno.objects.filter(estado_turno__iexact=estado).first()
    if not estado_obj:
        estado_obj = EstadosTurno.objects.create(estado_turno=estado, eliminado=0)

    turno.id_turno_estado = estado_obj
    turno.save()
    return JsonResponse({"success": True, "message": "Estado actualizado.", "estado": estado_obj.estado_turno})
