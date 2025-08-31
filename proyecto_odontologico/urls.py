from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('home.urls')),          # Página principal
    path('turnos/', include('turnos.urls')),
    path('pacientes/', include('pacientes.urls')),
    path('ficha_medica/', include('ficha_medica.urls')),
    path('caja/', include('caja.urls', namespace='caja')),  # Cajas con namespace
]
