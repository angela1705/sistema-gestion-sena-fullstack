from django.db import models
from apps.usuarios.persona.models import Persona
from apps.inventario.precios.models import Precio
from apps.inventario.productos.models import Producto

class Reserva(models.Model):

    ESTADOS_RESERVA = [
        ('pendiente', 'Pendiente'),
        ('pagada', 'Pagada'),
        ('cancelada', 'Cancelada'),
        ('entregada', 'Entregada'),
    ]

    persona = models.ForeignKey(Persona,  on_delete=models.PROTECT)
    producto=models.ForeignKey(Producto,  on_delete=models.PROTECT)
    precio=models.ForeignKey(Precio,on_delete=models.PROTECT)
    cantidad=models.PositiveIntegerField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    estado = models.CharField(max_length=20, choices=ESTADOS_RESERVA, default='pendiente') 
     
    class Meta:
        verbose_name = "Reserva"
        verbose_name_plural = "Reservas"
        ordering = ['-fecha_creacion']  

    def __str__(self):
        return f"Reserva #{self.id} - {self.get_estado_display()} ({self.producto})"  

    @property
    def total(self):
        """Calcula el total de la reserva (precio x cantidad)"""
        return self.precio.valor * self.cantidad
    
    