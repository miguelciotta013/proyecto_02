# login/views.py
from django.shortcuts import render  # <- Importante, sin esto render da error

def login_view(request):
    return render(request, 'login.html')  # Asegúrate que la plantilla exista
