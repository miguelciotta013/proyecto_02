from django.shortcuts import render

# Create your views here.
def vista_cajas(request):
    # Aquí iría la lógica de tu vista
    return render(request, "vista_cajas.html")