from django.db import models
from apps.usuarios.persona.models import Persona
from apps.inventario.precios.models import Precio
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
    producto = models.ForeignKey(Producto,on_delete=models.PROTECT,blank=True)
    cantidad = models.IntegerField(default=1,validators=[MinValueValidator(1)])
    precio = models.ForeignKey(Precio, on_delete=SET_NULL, null=True)
    fecha = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey(Persona, on_delete=SET_NULL, null=True)

    def __str__(self):
        return self.tipo
    
   
