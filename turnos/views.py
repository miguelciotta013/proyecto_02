from django.shortcuts import render, redirect, get_object_or_404
from home.models import Turnos
from .forms import TurnoForm

# Lista de turnos
def vista_turnos(request):
    turnos = Turnos.objects.all()
    return render(request, "vista_turnos.html", {"Turnos": turnos})

# Registrar turno
def registrar_turno(request):
    if request.method == 'POST':
        form = TurnoForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('vista_turnos')
    else:
        form = TurnoForm()

    return render(request, 'registrar_turno.html', {'form': form})

# Modificar turno
def modificar_turno(request, pk):
    turno = get_object_or_404(Turnos, pk=pk)
    if request.method == "POST":
        form = TurnoForm(request.POST, instance=turno)
        if form.is_valid():
            form.save()
            return redirect('vista_turnos')
    else:
        form = TurnoForm(instance=turno)

    return render(request, 'modificar_turno.html', {'form': form})

# Eliminar turno
def eliminar_turno(request, pk):
    turno = get_object_or_404(Turnos, pk=pk)
    turno.delete()
    return redirect('vista_turnos')
