from django.db import models
from django.conf import settings
import uuid

class CodigoRecuperacion(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    codigo = models.CharField(max_length=10)
    creado = models.DateTimeField(auto_now_add=True)
    usado = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.email} - {self.codigo}"
