from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from home.models import Turnos
from .forms import TurnoForm
from django.contrib.auth.decorators import login_required

# -------------------------
# VISTAS HTML
# -------------------------
@login_required
def vista_turnos(request):
    """Renderiza la vista principal con la tabla de turnos."""
    return render(request, "vista_turnos.html")

@login_required
def registrar_turno(request):
    """Formulario para registrar un turno nuevo."""
    if request.method == "POST":
        form = TurnoForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("vista_turnos")
    else:
        form = TurnoForm()
    return render(request, "registrar_turno.html", {"form": form})

@login_required
def modificar_turno(request, pk):
    """Formulario para editar un turno existente."""
    turno = get_object_or_404(Turnos, pk=pk)
    if request.method == "POST":
        form = TurnoForm(request.POST, instance=turno)
        if form.is_valid():
            form.save()
            return redirect("vista_turnos")
    else:
        form = TurnoForm(instance=turno)
    return render(request, "modificar_turno.html", {"form": form})


# -------------------------
# API JSON para DataTables
# -------------------------
@login_required 
@require_http_methods(["GET"])
def api_turnos(request):
    """
    Devuelve todos los turnos en formato JSON
    para ser consumidos por DataTables.
    """
    turnos = (
        Turnos.objects
        .select_related("id_paciente")  # Optimiza queries JOIN
        .all()
        .order_by("-fecha_turno", "-hora_turno")
    )

    data = [
        {
            "id": t.id_turno,
            "paciente": f"{t.id_paciente.nombre} {t.id_paciente.apellido}".strip(),
            "apellido": t.id_paciente.apellido,  # mantenido para compatibilidad
            "fecha": t.fecha_turno.strftime("%d/%m/%Y"),
            "hora": t.hora_turno.strftime("%H:%M"),
            "asunto": t.asunto or "",
            "comentario": t.comentario_turno or "",
        }
        for t in turnos
    ]

    return JsonResponse({"data": data})

@login_required
@csrf_exempt  # ✅ evita problemas con AJAX DELETE/POST sin token CSRF
@require_http_methods(["POST"])
def api_eliminar_turno(request, pk):
    """
    Elimina un turno y responde en JSON para AJAX.
    """
    turno = get_object_or_404(Turnos, pk=pk)
    turno.delete()
    return JsonResponse({
        "success": True,
        "type": "error",  # ⚠️ lo mantenemos así porque tu JS lo usa como "alerta roja"
        "message": "Turno eliminado correctamente."
    })