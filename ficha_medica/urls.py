from django.urls import path
from ficha_medica import views


urlpatterns = [
    path("", views.vista_ficha, name = "ficha_medica"),
]