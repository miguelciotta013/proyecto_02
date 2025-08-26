from django.shortcuts import render

# Create your views here.

def vista_ficha(request):
    return render(request, "ficha_medica.html")