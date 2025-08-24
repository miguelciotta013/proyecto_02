from django.db import models

class Caja(models.Model):
    fecha_apertura = models.DateField()
    hora_apertura = models.TimeField()
    monto_inicial = models.DecimalField(max_digits=10, decimal_places=2)
    hora_cierre = models.TimeField(null=True, blank=True)
    monto_final = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    responsable = models.CharField(max_length=100)
    estado = models.CharField(max_length=20, default='Cerrada')

    def __str__(self):
        return f"Caja {self.id} - {self.estado}"

class Servicio(models.Model):
    paciente = models.CharField(max_length=100)
    servicio = models.CharField(max_length=200)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    metodo_pago = models.CharField(max_length=50)
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.servicio} - {self.paciente}"
