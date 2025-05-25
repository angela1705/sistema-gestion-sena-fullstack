from django.db import models
from apps.entidades.unidades_productivas.models import UnidadProductiva
from apps.usuarios.persona.models import Persona
from django.core.validators import MinValueValidator

class CajaDiaria(models.Model):
    fecha_apertura = models.DateTimeField(auto_now_add=True)
    fecha_cierre = models.DateTimeField(null=True, blank=True)
    saldo_inicial = models.DecimalField(max_digits=10, decimal_places=2, default=0,validators=[MinValueValidator(0)])
    saldo_final = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    unidadProductiva = models.ForeignKey(UnidadProductiva,on_delete=models.PROTECT)
    abierta_por = models.ForeignKey(Persona, on_delete=models.SET_NULL, null=True, related_name='cajas_abiertas')
    cerrada_por = models.ForeignKey(Persona, on_delete=models.SET_NULL, null=True, blank=True, related_name='cajas_cerradas')
    observaciones = models.TextField(blank=True)

    def __str__(self):
        return f"Caja {self.unidadProductiva} - {self.fecha_apertura.date()}"
