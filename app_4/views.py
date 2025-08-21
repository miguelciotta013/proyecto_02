from django.shortcuts import render

# Create your views here.

def login(request):
    return render(request, 'login.html')

def aaa(request):
    return render(request, 'aaa.html')