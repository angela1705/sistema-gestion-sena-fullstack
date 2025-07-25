from django.db import models
from apps.gestion_operaciones.caja_diaria.models import CajaDiaria
from apps.gestion_operaciones.transaccion.models import Transaccion
from django.db.models import SET_NULL
from django.core.validators import MinValueValidator

class Tipo(models.TextChoices):
    INGRESO = 'ingreso', 'Ingreso'
    EGRESO = 'egreso', 'Egreso'

class DetalleCaja(models.Model):
    caja = models.ForeignKey(CajaDiaria, on_delete=models.CASCADE,related_name='detalles')
    transaccion = models.ForeignKey( Transaccion, on_delete=models.SET_NULL,null=True,blank=True)
    fecha = models.DateTimeField(auto_now_add=True)
    tipo = models.CharField(max_length=20,choices=Tipo.choices)
    monto = models.DecimalField(max_digits=12,decimal_places=2,validators=[MinValueValidator(0.01)])
    descripcion = models.TextField()
    beneficiario = models.CharField(max_length=100, null=True, blank=True)
    comprobante = models.FileField(upload_to='comprobantes/',null=True,blank=True)

    class Meta:
        verbose_name = 'Detalle de Caja'
        verbose_name_plural = 'Detalles de Caja'
        ordering = ['-fecha']

    def __str__(self):
        return f"{self.get_tipo_display()} - ${self.monto} ({self.fecha.date()})"
 
