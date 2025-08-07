from django.shortcuts import render

# Create your views here.

def vista_pacientes(request):
    return render(request, "vista_pacientes.html")