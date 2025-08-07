from django.shortcuts import render

# Create your views here.
def vista_turnos(request):
    return render(request, "vista_turnos.html")