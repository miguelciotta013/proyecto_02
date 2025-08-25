from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path("", include("home.urls")),
    path("turnos/", include("turnos.urls")),
    path("pacientes/", include("pacientes.urls")),
    path("ficha_medica/", include("ficha_medica.urls")),
<<<<<<< HEAD
    path('caja/', include('caja.urls')), 
    path('login/', include('login.urls')),
   
=======
    path("caja/", include("caja.urls")),
    path('admin/', admin.site.urls),
    path('caja/', include('caja.urls')), 
    
>>>>>>> 2c65912ca339491170783650d55c94db544aa425
]
