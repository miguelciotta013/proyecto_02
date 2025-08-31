from django.shortcuts import render, redirect, get_object_or_404
from home.models import Pacientes



def lista_pacientes(request):
    pacientes = Pacientes.objects.all()
    return render(request, "pacientes/lista.html", {"pacientes": pacientes})

