# caja/views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.http import JsonResponse
from home.models import Caja, ServiciosParticulares, DetalleServicio
from .forms import AperturaCajaForm, CierreCajaForm, CobrarServicioForm, DetalleServicioFormSet
from datetime import date

# ----------------------------
# Lista de cajas
# ----------------------------
@login_required
def lista_cajas(request):
    # Obtener todas las cajas ordenadas por fecha de apertura descendente
    cajas = Caja.objects.select_related('id_usuario').order_by('-fecha_apertura', '-hora_apertura')
    
    # Verificar si hay una caja abierta
    caja_abierta = Caja.objects.filter(
        fecha_cierre__isnull=True,
        hora_cierre__isnull=True
    ).first()
    
    # Calcular totales para cada caja
    for caja in cajas:
        # Total de servicios cobrados en esta caja
        servicios = ServiciosParticulares.objects.filter(id_caja=caja.id_caja)
        caja.total_cobros = sum(servicio.total for servicio in servicios)
        caja.total_servicios = servicios.count()
        
        # Calcular diferencia (por ahora solo cobros, puedes agregar gastos después)
        caja.diferencia = caja.total_cobros
    
    context = {
        'cajas': cajas,
        'caja_abierta': caja_abierta,
        'total_cajas': cajas.count(),
        'cajas_hoy': cajas.filter(fecha_apertura=date.today()).count(),
    }
    return render(request, 'caja/lista_cajas.html', context)

# ----------------------------
# Apertura de caja
# ----------------------------


@login_required
def apertura_caja(request):
    # Verificar si ya hay una caja abierta
    caja_abierta = Caja.objects.filter(
        fecha_cierre__isnull=True,
        hora_cierre__isnull=True
    ).exists()
    
    if caja_abierta:
        messages.error(request, 'Ya existe una caja abierta. Debe cerrarla antes de abrir una nueva.')
        return redirect('caja:lista_cajas')
    
    if request.method == 'POST':
        form = AperturaCajaForm(request.POST, user=request.user)
        if form.is_valid():
            try:
                caja = form.save()
                messages.success(request, f'Caja abierta exitosamente con ${caja.monto_apertura}')
                return redirect('caja:lista_cajas')
            except Exception as e:
                messages.error(request, f'Error al abrir la caja: {str(e)}')
    else:
        form = AperturaCajaForm(user=request.user)
    
    context = {
        'form': form,
        'titulo': 'Apertura de Caja',
    }
    return render(request, 'caja/apertura_caja.html', context)

# ----------------------------
# Cierre de caja
# ----------------------------
@login_required
def cierre_caja(request):
    # Obtener la caja abierta
    try:
        caja_abierta = Caja.objects.get(
            fecha_cierre__isnull=True,
            hora_cierre__isnull=True
        )
    except Caja.DoesNotExist:
        messages.error(request, 'No hay una caja abierta para cerrar.')
        return redirect('caja:lista_cajas')
    
    # Calcular resumen de la caja
    servicios = ServiciosParticulares.objects.filter(id_caja=caja_abierta.id_caja)
    total_cobros = sum(servicio.total for servicio in servicios)
    total_servicios = servicios.count()
    monto_teorico = caja_abierta.monto_apertura + total_cobros
    
    if request.method == 'POST':
        form = CierreCajaForm(request.POST, instance=caja_abierta)
        if form.is_valid():
            try:
                caja = form.save()
                diferencia = caja.monto_cierre - monto_teorico
                
                if diferencia == 0:
                    messages.success(request, 'Caja cerrada correctamente. Los montos coinciden.')
                elif diferencia > 0:
                    messages.warning(request, f'Caja cerrada con sobrante de ${diferencia}')
                else:
                    messages.warning(request, f'Caja cerrada con faltante de ${abs(diferencia)}')
                
                return redirect('caja:lista_cajas')
            except Exception as e:
                messages.error(request, f'Error al cerrar la caja: {str(e)}')
    else:
        form = CierreCajaForm(instance=caja_abierta)
    
    context = {
        'form': form,
        'caja': caja_abierta,
        'total_cobros': total_cobros,
        'total_servicios': total_servicios,
        'monto_teorico': monto_teorico,
        'servicios': servicios.order_by('-created_at')[:10],  # Últimos 10 servicios
        'titulo': 'Cierre de Caja',
    }
    return render(request, 'caja/cierre_caja.html', context)

# ----------------------------
# Cobrar servicio
# ----------------------------
@login_required
def cobrar_servicio(request):
    # Verificar que hay una caja abierta
    try:
        caja_abierta = Caja.objects.get(
            fecha_cierre__isnull=True,
            hora_cierre__isnull=True
        )
    except Caja.DoesNotExist:
        messages.error(request, 'Debe abrir una caja antes de cobrar servicios.')
        return redirect('caja:lista_cajas')
    
    if request.method == 'POST':
        form = CobrarServicioForm(request.POST, caja_abierta=caja_abierta)
        
        if form.is_valid():
            try:
                with transaction.atomic():
                    # Guardar el servicio
                    servicio = form.save()
                    
                    # Procesar el formset de detalles
                    formset = DetalleServicioFormSet(request.POST, instance=servicio)
                    if formset.is_valid():
                        detalles = formset.save(commit=False)
                        total_calculado = 0
                        
                        for detalle in detalles:
                            detalle.created_at = servicio.created_at
                            detalle.save()
                            total_calculado += detalle.importe
                        
                        # Actualizar el total del servicio
                        servicio.total = total_calculado
                        servicio.save()
                        
                        messages.success(request, f'Servicio cobrado exitosamente. Total: ${servicio.total}')
                        return redirect('caja:lista_cajas')
                    else:
                        messages.error(request, 'Error en los detalles del servicio.')
            except Exception as e:
                messages.error(request, f'Error al procesar el cobro: {str(e)}')
    else:
        form = CobrarServicioForm(caja_abierta=caja_abierta)
        formset = DetalleServicioFormSet()
    
    context = {
        'form': form,
        'formset': formset,
        'caja_abierta': caja_abierta,
        'titulo': 'Cobrar Servicio',
    }
    return render(request, 'caja/cobrar_servicio.html', context)

# ----------------------------
# Vista de detalle de caja (AJAX)
# ----------------------------
@login_required
def detalle_caja(request, caja_id):
    caja = get_object_or_404(Caja, id_caja=caja_id)
    servicios = ServiciosParticulares.objects.filter(id_caja=caja_id).select_related('id_paciente')
    
    data = {
        'caja': {
            'id': caja.id_caja,
            'usuario': f"{caja.id_usuario.first_name} {caja.id_usuario.last_name}",
            'fecha_apertura': caja.fecha_apertura.strftime('%d/%m/%Y'),
            'hora_apertura': caja.hora_apertura.strftime('%H:%M'),
            'monto_apertura': caja.monto_apertura,
            'monto_cierre': caja.monto_cierre,
            'estado': caja.estado_cierre,
        },
        'servicios': [
            {
                'id': servicio.id_servicio,
                'paciente': f"{servicio.id_paciente.nombre} {servicio.id_paciente.apellido}",
                'fecha': servicio.fecha_realizacion.strftime('%d/%m/%Y'),
                'total': servicio.total,
                'metodo_pago': servicio.metodo_pago,
                'estado_pago': servicio.estado_pago,
            } for servicio in servicios
        ],
        'total_servicios': servicios.count(),
        'total_cobros': sum(s.total for s in servicios),
    }
    
    return JsonResponse(data)

# ----------------------------
# Reporte de caja (opcional)
# ----------------------------
@login_required
def reporte_caja(request):
    # Esta vista la puedes implementar después para generar reportes
    pass