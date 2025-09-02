from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
#from django.http import JsonResponse
from django.urls import reverse
from django.db import transaction
from home.models import Pacientes, FichaMedica, Consultas, DetalleConsulta
from .forms import FichaMedicaForm, ConsultaForm, DetalleConsultaForm


def lista_pacientes(request):
    """Vista principal - Lista de pacientes"""
    pacientes = Pacientes.objects.all().order_by('apellido', 'nombre')
    return render(request, 'ficha/lista_pacientes.html', {
        'pacientes': pacientes
    })


def agregar_ficha(request, paciente_id):
    """Vista para agregar ficha médica y consulta"""
    paciente = get_object_or_404(Pacientes, id_paciente=paciente_id)
    
    if request.method == 'POST':
        ficha_form = FichaMedicaForm(request.POST)
        consulta_form = ConsultaForm(request.POST)
        
        if ficha_form.is_valid() and consulta_form.is_valid():
            try:
                with transaction.atomic():
                    # Crear ficha médica
                    ficha = ficha_form.save(commit=False)
                    ficha.id_paciente = paciente
                    ficha.id_usuario = 1  # Usuario fijo por ahora (sin auth)
                    ficha.save()
                    
                    # Crear consulta
                    consulta = consulta_form.save(commit=False)
                    consulta.save()
                    
                    # Redirigir a agregar detalles
                    return redirect('agregar_detalles', 
                                  ficha_id=ficha.id_ficha_medica, 
                                  consulta_id=consulta.id_consulta)
                    
            except Exception as e:
                messages.error(request, f'Error al guardar: {str(e)}')
    else:
        ficha_form = FichaMedicaForm()
        consulta_form = ConsultaForm()
    
    return render(request, 'ficha/agregar_ficha.html', {
        'paciente': paciente,
        'ficha_form': ficha_form,
        'consulta_form': consulta_form
    })


def agregar_detalles(request, ficha_id, consulta_id):
    """Vista para agregar detalles a la consulta"""
    ficha = get_object_or_404(FichaMedica, id_ficha_medica=ficha_id)
    consulta = get_object_or_404(Consultas, id_consulta=consulta_id)
    
    # Obtener detalles existentes
    detalles = DetalleConsulta.objects.filter(
        id_consulta=consulta,
        id_ficha_medica=ficha
    ).order_by('id_detalle_consulta')
    
    # Calcular total de detalles
    total_detalles = sum(detalle.importe for detalle in detalles)
    
    if request.method == 'POST' and 'finalizar' in request.POST:
        # Finalizar y volver a la lista de pacientes
        messages.success(request, 'Ficha médica y consulta guardadas correctamente.')
        return redirect('lista_pacientes')
    
    return render(request, 'ficha/agregar_detalles.html', {
        'ficha': ficha,
        'consulta': consulta,
        'detalles': detalles,
        'paciente': ficha.id_paciente,
        'total_detalles': total_detalles
    })


def agregar_detalle(request, ficha_id, consulta_id):
    """Vista para agregar un detalle individual"""
    ficha = get_object_or_404(FichaMedica, id_ficha_medica=ficha_id)
    consulta = get_object_or_404(Consultas, id_consulta=consulta_id)
    
    if request.method == 'POST':
        form = DetalleConsultaForm(request.POST)
        if form.is_valid():
            detalle = form.save(commit=False)
            detalle.id_consulta = consulta
            detalle.id_ficha_medica = ficha
            detalle.save()
            messages.success(request, 'Detalle agregado correctamente.')
            return redirect('agregar_detalles', ficha_id=ficha_id, consulta_id=consulta_id)
    else:
        form = DetalleConsultaForm()
    
    return render(request, 'ficha/agregar_detalle.html', {
        'form': form,
        'ficha': ficha,
        'consulta': consulta,
        'paciente': ficha.id_paciente
    })


def editar_detalle(request, detalle_id):
    """Vista para editar un detalle existente"""
    detalle = get_object_or_404(DetalleConsulta, id_detalle_consulta=detalle_id)
    
    if request.method == 'POST':
        form = DetalleConsultaForm(request.POST, instance=detalle)
        if form.is_valid():
            form.save()
            messages.success(request, 'Detalle actualizado correctamente.')
            return redirect('agregar_detalles', 
                          ficha_id=detalle.id_ficha_medica.id_ficha_medica, 
                          consulta_id=detalle.id_consulta.id_consulta)
    else:
        form = DetalleConsultaForm(instance=detalle)
    
    return render(request, 'ficha/editar_detalle.html', {
        'form': form,
        'detalle': detalle,
        'paciente': detalle.id_ficha_medica.id_paciente
    })


def eliminar_detalle(request, detalle_id):
    """Vista para eliminar un detalle"""
    detalle = get_object_or_404(DetalleConsulta, id_detalle_consulta=detalle_id)
    ficha_id = detalle.id_ficha_medica.id_ficha_medica
    consulta_id = detalle.id_consulta.id_consulta
    
    if request.method == 'POST':
        detalle.delete()
        messages.success(request, 'Detalle eliminado correctamente.')
        return redirect('agregar_detalles', ficha_id=ficha_id, consulta_id=consulta_id)
    
    return render(request, 'ficha/eliminar_detalle.html', {
        'detalle': detalle,
        'paciente': detalle.id_ficha_medica.id_paciente
    })


def historial_paciente(request, paciente_id):
    """Vista para ver el historial del paciente"""
    paciente = get_object_or_404(Pacientes, id_paciente=paciente_id)
    
    # Obtener todas las fichas médicas del paciente
    fichas = FichaMedica.objects.filter(id_paciente=paciente).order_by('-fecha_creacion')
    
    # Obtener consultas con sus detalles
    historial = []
    for ficha in fichas:
        # Buscar si hay detalles de consulta para esta ficha
        detalles = DetalleConsulta.objects.filter(id_ficha_medica=ficha).select_related('id_consulta')
        
        if detalles.exists():
            # Agrupar por consulta
            consultas_dict = {}
            for detalle in detalles:
                consulta = detalle.id_consulta
                if consulta.id_consulta not in consultas_dict:
                    consultas_dict[consulta.id_consulta] = {
                        'consulta': consulta,
                        'detalles': []
                    }
                consultas_dict[consulta.id_consulta]['detalles'].append(detalle)
            
            for consulta_data in consultas_dict.values():
                total_detalles = sum(detalle.importe for detalle in consulta_data['detalles'])
                historial.append({
                    'ficha': ficha,
                    'consulta': consulta_data['consulta'],
                    'detalles': consulta_data['detalles'],
                    'total_detalles': total_detalles
                })
        else:
            # Ficha sin consultas asociadas
            historial.append({
                'ficha': ficha,
                'consulta': None,
                'detalles': [],
                'total_detalles': 0
            })
    
    return render(request, 'ficha/historial_paciente.html', {
        'paciente': paciente,
        'historial': historial
    })