from django.db import models
from apps.usuarios.persona.models import Persona
from apps.inventario.productos.models import Producto
from django.db.models import SET_NULL
from django.core.validators import MinValueValidator
from apps.gestion_operaciones.caja_diaria.models import CajaDiaria

class Transaccion(models.Model):
    VENTA = 'venta'
    COMPRA = 'compra'

    TIPO_CHOICES = [
        (VENTA, 'Venta'),
        (COMPRA, 'Compra'),
    ]

    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT, null=True, blank=True)
    caja_diaria = models.ForeignKey(CajaDiaria, on_delete=models.SET_NULL, null=True, blank=True)
    nombre_producto = models.CharField(max_length=100, null=True, blank=True)  # Solo para compras
    cantidad = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    costo = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # Solo para compras
    monto_venta = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # Solo para ventas
    fecha = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey(Persona, on_delete=SET_NULL, null=True)
   
