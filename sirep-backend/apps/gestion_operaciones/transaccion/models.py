from django.db import models
from apps.usuarios.persona.models import Persona
from apps.inventario.productos.models import Producto
from django.db.models import SET_NULL
from django.core.validators import MinValueValidator

class TipoTransaccion(models.TextChoices):
    VENTA = 'venta', 'Venta'
    COMPRA = 'compra', 'Compra'
    DEVOLUCION = 'devolucion', 'Devolucion'
    AJUSTE = 'ajuste', 'Ajuste'

class Transaccion(models.Model):
    tipo = models.CharField(max_length=20, choices=TipoTransaccion.choices, default=TipoTransaccion.VENTA)
    producto = models.ForeignKey(Producto,on_delete=models.PROTECT)
    cantidad = models.PositiveIntegerField(default=1,validators=[MinValueValidator(1)])
    fecha = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey(Persona, on_delete=SET_NULL, null=True)
    transaccion_revertida = models.OneToOneField('self',null=True,blank=True,on_delete=models.SET_NULL,related_name='reversion_de')

    def __str__(self):
        return f"{self.tipo.title()} - {self.producto.nombre} ({self.cantidad})"
   
