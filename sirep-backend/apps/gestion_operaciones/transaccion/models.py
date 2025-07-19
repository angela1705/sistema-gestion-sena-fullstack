from django.db import models
from django.db.models import SET_NULL, PROTECT
from apps.usuarios.persona.models import Persona
from apps.inventario.productos.models import Producto
from apps.gestion_operaciones.caja_diaria.models import CajaDiaria
from decimal import Decimal

class Transaccion(models.Model):
    VENTA = 'venta'
    COMPRA = 'compra'

    TIPO_CHOICES = [
        (VENTA, 'Venta'),
        (COMPRA, 'Compra'),
    ]

    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    usuario = models.ForeignKey(Persona, on_delete=SET_NULL, null=True, blank=True)
    caja_diaria = models.ForeignKey(CajaDiaria, on_delete=SET_NULL, null=True, blank=True)
    monto_total = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    fecha = models.DateTimeField(auto_now_add=True)
    observacion = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.tipo.title()} - {self.usuario or 'Sin usuario'} - {self.fecha.strftime('%Y-%m-%d')}"

    class Meta:
        ordering = ['-fecha']


class DetalleTransaccion(models.Model):
    transaccion = models.ForeignKey(Transaccion, on_delete=models.CASCADE, related_name="detalles")
    producto = models.ForeignKey(Producto, on_delete=PROTECT)
    nombre_producto = models.CharField(max_length=255, null=True, blank=True)
    cantidad = models.PositiveIntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.nombre_producto or self.producto.nombre} x{self.cantidad}"

    class Meta:
        ordering = ['id']