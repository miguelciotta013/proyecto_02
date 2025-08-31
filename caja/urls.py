from django.urls import path
from . import views

app_name = 'caja'

urlpatterns = [
    path('', views.caja_home, name='caja_home'),
   
]