<<<<<<< HEAD
from django.shortcuts import render

# Create your views here.
def vista_cajas(request):
    # Aquí iría la lógica de tu vista
    return render(request, "vista_cajas.html")
=======
# caja/views.py
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Caja, Servicio
from datetime import datetime
import json

# ----------------------------
# Home de cajas
# ----------------------------
def caja_home(request):
    cajas = Caja.objects.all().order_by('-fecha_apertura')
    return render(request, 'caja/caja_home.html', {'cajas': cajas})

# ----------------------------
# Abrir caja
# ----------------------------
def abrir_caja(request):
    return render(request, 'caja/abrir_caja.html')

@csrf_exempt
def abrir_caja_ajax(request):
    if request.method == "POST":
        data = json.loads(request.body)
        fecha = data.get("fecha")
        hora = data.get("hora")
        monto = data.get("monto")
        responsable = data.get("responsable")

        if not all([fecha, hora, monto, responsable]):
            return JsonResponse({"mensaje": "Todos los campos son obligatorios"}, status=400)

        try:
            fecha_obj = datetime.strptime(fecha, "%Y-%m-%d").date()
            hora_obj = datetime.strptime(hora, "%H:%M").time()
        except ValueError:
            return JsonResponse({"mensaje": "Fecha u hora inválida"}, status=400)

        Caja.objects.create(
            fecha_apertura=fecha_obj,
            hora_apertura=hora_obj,
            monto_inicial=monto,
            responsable=responsable,
            estado="Abierta"
        )
        return JsonResponse({"mensaje": "Caja abierta correctamente"})

# ----------------------------
# Cerrar caja
# ----------------------------
def cerrar_caja(request):
    return render(request, 'caja/cerrar_caja.html')

@csrf_exempt
def cerrar_caja_ajax(request):
    if request.method == "POST":
        data = json.loads(request.body)
        caja = Caja.objects.filter(estado="Abierta").last()
        if not caja:
            return JsonResponse({"mensaje": "No hay caja abierta"}, status=400)

        caja.hora_cierre = data.get("hora_cierre")
        caja.monto_final = data.get("monto_final")
        caja.responsable = data.get("responsable")
        caja.estado = "Cerrada"
        caja.save()
        return JsonResponse({"mensaje": "Caja cerrada correctamente"})

# ----------------------------
# Cobrar servicio
# ----------------------------
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Servicio
import json

# Vista HTML
def cobrar_servicio(request):
    return render(request, 'caja/cobrar_servicio.html')

# AJAX POST
@csrf_exempt
def cobrar_servicio_ajax(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'mensaje': 'Datos inválidos'}, status=400)

        paciente = data.get('paciente', '').strip()
        servicio = data.get('servicio', '').strip()
        monto = data.get('monto')
        pago = data.get('pago', '').strip()

        # Validaciones
        if not paciente or not servicio or not monto or not pago:
            return JsonResponse({'mensaje': 'Todos los campos son obligatorios'}, status=400)

        try:
            monto = float(monto)
        except ValueError:
            return JsonResponse({'mensaje': 'El monto debe ser un número'}, status=400)

        # Crear el registro
        Servicio.objects.create(
            paciente=paciente,
            servicio=servicio,
            monto=monto,
            metodo_pago=pago
        )

        return JsonResponse({'mensaje': 'Servicio cobrado correctamente'})

    return JsonResponse({'mensaje': 'Método no permitido'}, status=405)
>>>>>>> 2c65912ca339491170783650d55c94db544aa425
