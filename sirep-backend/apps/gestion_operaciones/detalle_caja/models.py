from django.db import models
from apps.gestion_operaciones.caja_diaria.models import CajaDiaria
from apps.gestion_operaciones.transaccion.models import Transaccion

class Tipo(models.TextChoices):
        INGRESO = 'INGRESO', 'Ingreso'
        EGRESO = 'EGRESO', 'Egreso'

class DetalleCaja(models.Model):
    caja = models.ForeignKey(CajaDiaria, on_delete=models.CASCADE, related_name='detalles')
    transaccion = models.ForeignKey(Transaccion, on_delete=models.CASCADE, related_name='detalles_caja')
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    descripcion = models.TextField(blank=True, null=True)
    creado = models.DateTimeField(auto_now_add=True)
    tipo = models.CharField(max_length=10, choices=Tipo.choices)

    def __str__(self):
        return f"{self.tipo.upper()} - {self.monto} - {self.creado.strftime('%Y-%m-%d')}"

    class Meta:
        ordering = ['-creado']