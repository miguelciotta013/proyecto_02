
# caja/views.py
from django.shortcuts import render

from home.models import Caja 

# ----------------------------
# Home de cajas
# ----------------------------
def caja_home(request):
    cajas = Caja.objects.all().order_by('-fecha_apertura')
    return render(request, 'caja/caja_home.html', {'cajas': cajas})

