from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from .models import Paciente
from .forms import PacienteForm



from django.shortcuts import redirect, get_object_or_404
from .models import Paciente

def eliminar_paciente(request, paciente_id):
    paciente = get_object_or_404(Paciente, id=paciente_id)
    paciente.delete()
    return redirect('pacientes:lista')



# ✅ LISTAR PACIENTES
def lista_pacientes(request):
    pacientes = Paciente.objects.all()
    return render(request, "pacientes/lista.html", {"pacientes": pacientes})


# ✅ AGREGAR PACIENTE
def agregar_paciente(request):
    if request.method == "POST":
        form = PacienteForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("pacientes:lista")
    else:
        form = PacienteForm()
    return render(request, "pacientes/agregar.html", {"form": form})


# ✅ MODIFICAR PACIENTE
def modificar_paciente(request, id):
    paciente = get_object_or_404(Paciente, id=id)
    if request.method == "POST":
        form = PacienteForm(request.POST, instance=paciente)
        if form.is_valid():
            form.save()
            return redirect("pacientes:lista")
    else:
        form = PacienteForm(instance=paciente)
    return render(request, "pacientes/modificar.html", {"form": form})


# ✅ FICHA MÉDICA (provisorio)
def ficha_medica(request, id):
    paciente = get_object_or_404(Paciente, id=id)
    # Más adelante podés enlazar con un modelo de FichaMedica
    return render(request, "pacientes/ficha.html", {"paciente": paciente})


# ✅ ODONTOGRAMA (provisorio)
def odontograma(request, id):
    paciente = get_object_or_404(Paciente, id=id)
    # Más adelante podés enlazar con tu modelo/HTML de odontograma
    return render(request, "pacientes/odontograma.html", {"paciente": paciente})
