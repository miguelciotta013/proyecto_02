from django.contrib import admin
from django.urls import path, include
from login.views import LoginTemplateView, LogoutTemplateView
from django.contrib.auth import views as auth_views  # 👈 necesario para recuperación

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # 🔐 Login / Logout
    path('login/', LoginTemplateView.as_view(), name='login'),
    path('logout/', LogoutTemplateView.as_view(), name='logout'),

    # 🧩 API endpoints
    path('api/auth/', include('login.urls')),
    path('api/home/', include('home.urls')),
    path('api/ficha_medica/', include('ficha_medica.urls')),
    path('api/pacientes/', include('pacientes.urls')),
    path('api/turnos/', include('turnos.urls')),
    path('api/caja/', include('caja.urls')),
    path('api/panel-control/', include('panel_control.urls')),

    # 🔑 Recuperación de contraseña (Django built-in)
    path('password_reset/', auth_views.PasswordResetView.as_view(), name='password_reset'),
    path('password_reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),
    path('api/auth/', include('login.urls')),

]
