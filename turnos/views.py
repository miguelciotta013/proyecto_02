from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponseNotAllowed
from django.views.decorators.http import require_http_methods
from django.contrib import messages
from home.models import Turnos
from .forms import TurnoForm

# -------------------------
# VISTAS HTML (tus vistas)
# -------------------------
def vista_turnos(request):
    # La tabla ahora se llena por AJAX, no hace falta pasar queryset
    return render(request, "vista_turnos.html")

def registrar_turno(request):
    if request.method == 'POST':
        form = TurnoForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Turno registrado correctamente ✅")
            return redirect('vista_turnos')
    else:
        form = TurnoForm()
    return render(request, 'registrar_turno.html', {'form': form})

def modificar_turno(request, pk):
    turno = get_object_or_404(Turnos, pk=pk)
    if request.method == "POST":
        form = TurnoForm(request.POST, instance=turno)
        if form.is_valid():
            form.save()
            messages.warning(request, "Turno modificado correctamente ✏️")
            return redirect('vista_turnos')
    else:
        form = TurnoForm(instance=turno)
    return render(request, 'modificar_turno.html', {'form': form})

# (Opcional) Mantener eliminación por POST clásico
@require_http_methods(["POST"])
def eliminar_turno(request, pk):
    turno = get_object_or_404(Turnos, pk=pk)
    nombre = f"{turno.id_paciente.nombre} {turno.id_paciente.apellido}"
    turno.delete()
    messages.error(request, f"El turno de {nombre} fue eliminado 🗑️")
    return redirect('vista_turnos')


# -------------------------
# API JSON para DataTables
# -------------------------
@require_http_methods(["GET"])
def api_turnos(request):
    """
    Devuelve la lista de turnos en formato JSON para DataTables.
    """
    turnos = Turnos.objects.select_related("id_paciente").all().order_by("-fecha_turno", "-hora_turno")

    data = []
    for t in turnos:
        data.append({
            "id": t.id_turno,
            "paciente": f"{t.id_paciente.nombre} {t.id_paciente.apellido}".strip(),
            "apellido": t.id_paciente.apellido,
            "fecha": t.fecha_turno.strftime("%d/%m/%Y"),
            "hora": t.hora_turno.strftime("%H:%M"),
            "asunto": t.asunto or "",
            "comentario": t.comentario_turno or "",
        })

    return JsonResponse({"data": data})


@require_http_methods(["POST"])
def api_eliminar_turno(request, pk):
    """
    Elimina un turno vía AJAX y responde JSON.
    Requiere header CSRF (X-CSRFToken).
    """
    turno = get_object_or_404(Turnos, pk=pk)
    turno.delete()
    return JsonResponse({"ok": True, "msg": "Turno eliminado"})
