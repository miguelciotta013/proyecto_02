
# caja/views.py
from django.shortcuts import render

from home.models import Caja 

# ----------------------------
# Home de cajas
# ----------------------------
def lista_cajas(request):
    cajas = Caja.objects.all().order_by('-fecha_apertura')
    return render(request, 'caja/lista_cajas.html', {'cajas': cajas})

