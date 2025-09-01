from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils import timezone
from django.db import transaction
from django.db.models import Sum
# Importar modelos desde la app home
from home.models import Caja, ServiciosParticulares, DetalleServicio, AuthUser
from .forms import AperturaCajaForm, CierreCajaForm, ServicioParticularForm, DetalleServicioForm

@login_required
def lista_cajas(request):
    """Lista todas las cajas y muestra el estado actual"""
    cajas = Caja.objects.all().order_by('-fecha_apertura', '-hora_apertura')
    caja_abierta = Caja.objects.filter(estado_cierre='abierta').first()
    
    context = {
        'cajas': cajas,
        'caja_abierta': caja_abierta,
        'tiene_caja_abierta': caja_abierta is not None
    }
    return render(request, 'caja/lista_cajas.html', context)

@login_required
def apertura_caja(request):
    """Abrir una nueva caja"""
    # Verificar que no haya una caja abierta
    caja_abierta = Caja.objects.filter(estado_cierre='abierta').exists()
    if caja_abierta:
        messages.error(request, 'Ya existe una caja abierta. Debe cerrarla antes de abrir una nueva.')
        return redirect('caja:lista_cajas')
    
    if request.method == 'POST':
        form = AperturaCajaForm(request.POST)
        if form.is_valid():
            caja = form.save(commit=False)
            # Obtener el AuthUser correspondiente al usuario autenticado
            try:
                auth_user = AuthUser.objects.get(username=request.user.username)
                caja.id_usuario = auth_user
            except AuthUser.DoesNotExist:
                messages.error(request, 'Error: Usuario no encontrado en el sistema.')
                return redirect('caja:lista_cajas')
            
            caja.fecha_apertura = timezone.now().date()
            caja.hora_apertura = timezone.now().time()
            caja.estado_cierre = 'abierta'
            caja.created_at = timezone.now()
            caja.save()
            messages.success(request, 'Caja abierta exitosamente.')
            return redirect('caja:lista_cajas')
    else:
        form = AperturaCajaForm()
    
    return render(request, 'caja/apertura_caja.html', {'form': form})

@login_required
def cierre_caja(request):
    """Cerrar la caja actual"""
    caja_abierta = get_object_or_404(Caja, estado_cierre='abierta')
    
    if request.method == 'POST':
        form = CierreCajaForm(request.POST, instance=caja_abierta)
        if form.is_valid():
            caja = form.save(commit=False)
            caja.fecha_cierre = timezone.now().date()
            caja.hora_cierre = timezone.now().time()
            caja.estado_cierre = 'cerrada'
            caja.updated_at = timezone.now()
            caja.save()
            messages.success(request, 'Caja cerrada exitosamente.')
            return redirect('caja:lista_cajas')
    else:
        form = CierreCajaForm(instance=caja_abierta)
    
    # Calcular total de servicios del día
    total_servicios = ServiciosParticulares.objects.filter(
        id_caja=caja_abierta,
        estado_pago='pagado'
    ).aggregate(total=Sum('total'))['total'] or 0
    
    context = {
        'form': form,
        'caja': caja_abierta,
        'total_servicios': total_servicios
    }
    return render(request, 'caja/cierre_caja.html', context)

@login_required
@transaction.atomic
def cobrar_servicio(request):
    """Registrar un nuevo servicio y su detalle"""
    # Verificar que haya una caja abierta
    caja_abierta = Caja.objects.filter(estado_cierre='abierta').first()
    if not caja_abierta:
        messages.error(request, 'Debe abrir una caja antes de registrar servicios.')
        return redirect('caja:lista_cajas')
    
    if request.method == 'POST':
        servicio_form = ServicioParticularForm(request.POST)
        detalle_form = DetalleServicioForm(request.POST)
        
        if servicio_form.is_valid() and detalle_form.is_valid():
            # Guardar el servicio
            servicio = servicio_form.save(commit=False)
            servicio.id_caja = caja_abierta
            servicio.fecha_realizacion = timezone.now().date()
            servicio.created_at = timezone.now()
            servicio.save()
            
            # Guardar el detalle
            detalle = detalle_form.save(commit=False)
            detalle.id_servicio = servicio
            detalle.created_at = timezone.now()
            detalle.save()
            
            messages.success(request, 'Servicio registrado exitosamente.')
            return redirect('lista_cajas')
    else:
        servicio_form = ServicioParticularForm()
        detalle_form = DetalleServicioForm()
    
    context = {
        'servicio_form': servicio_form,
        'detalle_form': detalle_form,
        'caja_abierta': caja_abierta
    }
    return render(request, 'caja/cobrar_servicio.html', context)