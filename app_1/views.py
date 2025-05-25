from django.shortcuts import render, get_object_or_404, redirect
from app_1.models import *
from .forms import ProductForm
# Create your views here.
def index(request):
    return render(request, "index.html")

def odontogramas(request):
    odontograma = Odontogramas.objects.select_related("id_paciente").all()
    return render(request, "odontogramas/vista_odontograma.html", {"odontogramas":odontograma})

    
def modificar(request,pk):
    odontograma = get_object_or_404(Odontogramas, pk=pk)
    if request.method == "POST":
        form= ProductForm(request.POST, instance=odontograma)
        if form.is_valid():
            form.save()
        return redirect("odontogramas")
    else:
        form = ProductForm(instance=odontograma)
    return render(request, "odontogramas/modificar_odontogramas.html", {"form":form})