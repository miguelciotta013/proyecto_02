from django.shortcuts import render

# Create your views here.
def lista(request):
    return render(request, "lista.html")

def datospaciente(request):
    return render(request, "datospaciente.html") 