from django.shortcuts import render, redirect, get_object_or_404
from app_3.models import Turnos
from .forms import TurnoForm

def ar(request):
    return render(request, 'ar.html')

def listar_turnos(request):
    turnos = Turnos.objects.all()
    return render(request, 'listaturno.html', {'turnos': turnos})

def registrar_turno(request):
    if request.method == "POST":
        form = TurnoForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("listar_turnos")
    else:
        form = TurnoForm()
    return render(request, 'registrar_turno.html', {'form': form})

def editar_turno(request, pk):
    turno = get_object_or_404(Turnos, pk=pk)
    if request.method == "POST":
        form = TurnoForm(request.POST, instance=turno)
        if form.is_valid():
            form.save()
            return redirect("listar_turnos")
    else:
        form = TurnoForm(instance=turno)
    return render(request, 'editar_turno.html', {'form': form, 'turno': turno})

def eliminar_turno(request,pk):
    turno = get_object_or_404(Turnos,pk=pk)
    if request.method == "POST":
        turno.delete()
        return redirect("listar_turnos")
    return render(request, 'eliminar_turno.html', {'turno': turno})
    

    