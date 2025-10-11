from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/ficha_medica/', include('ficha_medica.urls')),
    path('api/pacientes/', include('pacientes.urls')),
    path('api/turnos/', include('turnos.urls')),
    path('api/caja/', include('caja.urls')),
    path('api/home/', include('home.urls')),
    path('api/panel_control/', include('panel_control.urls')),
]
