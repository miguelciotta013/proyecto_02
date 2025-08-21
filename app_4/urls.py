from django.urls import path, include
from app_4 import views 

urlpatterns = [
    path("login/",views.login,name="login"),
     path("aaa/",views.aaa,name="aaa")
]