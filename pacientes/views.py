from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.urls import reverse
from home.models import Pacientes, ObraSocial, PacientesXOs
from .forms import PacienteForm, ObraSocialForm, PacienteObraSocialForm


def lista_pacientes(request):
    """Vista principal: lista todos los pacientes"""
    pacientes = Pacientes.objects.all().order_by('apellido', 'nombre')
    return render(request, 'pacientes/lista.html', {
        'pacientes': pacientes
    })


def agregar_paciente(request):
    """Vista para agregar un nuevo paciente sin obra social"""
    if request.method == 'POST':
        form = PacienteForm(request.POST)
        if form.is_valid():
            paciente = form.save()
            messages.success(request, f'Paciente {paciente.nombre} {paciente.apellido} agregado exitosamente.')
            return redirect('pacientes:lista')
    else:
        form = PacienteForm()
    
    return render(request, 'pacientes/agregar_paciente.html', {
        'form': form
    })


def agregar_obra(request, paciente_id):
    """Vista para agregar obra social a un paciente existente"""
    paciente = get_object_or_404(Pacientes, id_paciente=paciente_id)
    
    if request.method == 'POST':
        obra_form = ObraSocialForm(request.POST)
        paciente_obra_form = PacienteObraSocialForm(request.POST)
        
        # Verificar qué formulario se está enviando
        if 'nueva_obra_social' in request.POST:
            # Crear nueva obra social
            if obra_form.is_valid():
                obra_social = obra_form.save()
                messages.success(request, f'Obra social "{obra_social.nombre_os}" creada exitosamente.')
                return redirect('pacientes:agregar_obra', paciente_id=paciente_id)
        
        elif 'asociar_obra_social' in request.POST:
            # Asociar obra social existente al paciente
            if paciente_obra_form.is_valid():
                paciente_obra = paciente_obra_form.save(commit=False)
                paciente_obra.id_paciente = paciente
                paciente_obra.save()
                messages.success(request, f'Obra social asociada al paciente {paciente.nombre} {paciente.apellido}.')
                return redirect('pacientes:informacion_paciente', paciente_id=paciente_id)
    else:
        obra_form = ObraSocialForm()
        paciente_obra_form = PacienteObraSocialForm()
    
    return render(request, 'pacientes/agregar_obra.html', {
        'paciente': paciente,
        'obra_form': obra_form,
        'paciente_obra_form': paciente_obra_form
    })


def editar_paciente(request, paciente_id):
    """Vista para editar información del paciente"""
    paciente = get_object_or_404(Pacientes, id_paciente=paciente_id)
    
    if request.method == 'POST':
        form = PacienteForm(request.POST, instance=paciente)
        if form.is_valid():
            form.save()
            messages.success(request, f'Información de {paciente.nombre} {paciente.apellido} actualizada.')
            return redirect('pacientes:informacion_paciente', paciente_id=paciente_id)
    else:
        form = PacienteForm(instance=paciente)
    
    return render(request, 'pacientes/editar_paciente.html', {
        'form': form,
        'paciente': paciente
    })


def editar_obra(request, paciente_id, obra_id):
    """Vista para editar la relación paciente-obra social"""
    paciente = get_object_or_404(Pacientes, id_paciente=paciente_id)
    paciente_obra = get_object_or_404(PacientesXOs, id_paciente_os=obra_id, id_paciente=paciente)
    
    if request.method == 'POST':
        form = PacienteObraSocialForm(request.POST, instance=paciente_obra)
        if form.is_valid():
            form.save()
            messages.success(request, 'Información de obra social actualizada.')
            return redirect('pacientes:informacion_paciente', paciente_id=paciente_id)
    else:
        form = PacienteObraSocialForm(instance=paciente_obra)
    
    return render(request, 'pacientes/editar_obra.html', {
        'form': form,
        'paciente': paciente,
        'paciente_obra': paciente_obra
    })


def informacion_paciente(request, paciente_id):
    """Vista para mostrar información detallada del paciente"""
    paciente = get_object_or_404(Pacientes, id_paciente=paciente_id)
    obras_sociales = PacientesXOs.objects.filter(id_paciente=paciente).select_related('id_obra_social')
    
    return render(request, 'pacientes/informacion_paciente.html', {
        'paciente': paciente,
        'obras_sociales': obras_sociales
    })


def eliminar_paciente(request, paciente_id):
    """Vista para eliminar un paciente"""
    paciente = get_object_or_404(Pacientes, id_paciente=paciente_id)
    
    if request.method == 'POST':
        nombre_completo = f"{paciente.nombre} {paciente.apellido}"
        paciente.delete()
        messages.success(request, f'Paciente {nombre_completo} eliminado exitosamente.')
        return redirect('pacientes:lista')
    
    return render(request, 'pacientes/confirmar_eliminar.html', {
        'paciente': paciente
    })


def eliminar_obra_social(request, paciente_id, obra_id):
    """Vista para eliminar la asociación paciente-obra social"""
    paciente = get_object_or_404(Pacientes, id_paciente=paciente_id)
    paciente_obra = get_object_or_404(PacientesXOs, id_paciente_os=obra_id, id_paciente=paciente)
    
    if request.method == 'POST':
        obra_social_nombre = paciente_obra.id_obra_social.nombre_os
        paciente_obra.delete()
        messages.success(request, f'Obra social "{obra_social_nombre}" desvinculada del paciente.')
        return redirect('pacientes:informacion_paciente', paciente_id=paciente_id)
    
    return render(request, 'pacientes/confirmar_eliminar_obra.html', {
        'paciente': paciente,
        'paciente_obra': paciente_obra
    })