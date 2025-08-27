from django.shortcuts import render, get_object_or_404, redirect
from home.models import Pacientes
from .forms import PacienteForm

# Lista todos los pacientes
def lista_pacientes(request):
    pacientes = Pacientes.objects.all()
    return render(request, 'lista.html',)

# Agregar un nuevo paciente
def agregar_paciente(request):
    if request.method == 'POST':
        form = PacienteForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('paciente:lista')
    else:
        form = PacienteForm()
    return render(request, 'agregar.html', {'form': form})

# Modificar un paciente existente
def modificar_paciente(request, id):
    paciente = get_object_or_404(Pacientes, id=id)
    if request.method == 'POST':
        form = PacienteForm(request.POST, instance=paciente)
        if form.is_valid():
            form.save()
            return redirect('paciente:lista')
    else:
        form = PacienteForm(instance=paciente)
    return render(request, 'modificar.html', {'form': form, 'paciente': paciente})

# Ficha médica del paciente
def ficha_medica(request, id):
    paciente = get_object_or_404(Pacientes, id=id)
    return render(request, 'ficha.html',)

# Odontograma del paciente
def odontograma(request, id):
    paciente = get_object_or_404(Pacientes, id=id)
    return render(request, 'odontograma.html', {'paciente': paciente})
