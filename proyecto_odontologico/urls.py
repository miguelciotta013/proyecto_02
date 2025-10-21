from django.contrib import admin
from django.urls import path, include
from django.urls import path
from login.views import LoginTemplateView, LogoutTemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('login.urls')),
    # Rutas web para inicio/cierre de sesión
    path('login/', LoginTemplateView.as_view(), name='login'),
    path('logout/', LogoutTemplateView.as_view(), name='logout'),
    path('api/home/', include('home.urls')),
    path('api/ficha_medica/', include('ficha_medica.urls')),
    path('api/pacientes/', include('pacientes.urls')),
    path('api/turnos/', include('turnos.urls')),
    path('api/caja/', include('caja.urls')),
    path('api/panel-control/', include('panel_control.urls')),
]
