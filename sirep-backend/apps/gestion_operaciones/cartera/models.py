from django.db import models
from django.utils import timezone
from decimal import Decimal
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from apps.usuarios.persona.models import Persona
from apps.inventario.productos.models import Producto
from apps.entidades.unidades_productivas.models import UnidadProductiva

class DetalleCartera(models.Model):
    persona = models.ForeignKey(Persona, on_delete=models.CASCADE, related_name='fiados')
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='ventas_fiadas')
    unidad_productiva = models.ForeignKey(UnidadProductiva, on_delete=models.CASCADE, related_name='ventas_fiadas')
    cantidad = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2, editable=False)
    valor_total = models.DecimalField(max_digits=10, decimal_places=2, editable=False)
    abono_inicial = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        validators=[MinValueValidator(0)]
    )
    saldo = models.DecimalField(max_digits=10, decimal_places=2, editable=False)
    fecha = models.DateTimeField(default=timezone.now)
    observaciones = models.TextField(blank=True, null=True)
    
    class Meta:
        verbose_name = "Detalle de Cartera"
        verbose_name_plural = "Detalles de Cartera"
        ordering = ['-fecha']
    
    def __str__(self):
        return f"{self.cantidad} x {self.producto} para {self.persona} - Saldo: ${self.saldo}"
    
    def clean(self):
        """Validaciones personalizadas"""
        super().clean()
        
        if self.abono_inicial > self.valor_total:
            raise ValidationError({'abono_inicial': 'El abono inicial no puede ser mayor al valor total.'})
        
        if self.unidad_productiva != self.producto.unidadP:
            raise ValidationError({'unidad_productiva': 'La unidad productiva no coincide con la unidad del producto.'})
    
    def calcular_valores(self):
        """Calcula todos los valores automáticamente"""
        self.precio_unitario = self.producto.get_precio_para_persona(self.persona)
        self.valor_total = Decimal(self.cantidad) * self.precio_unitario
        self.saldo = self.valor_total - Decimal(self.abono_inicial)
    
    def save(self, *args, **kwargs):
        self.calcular_valores()
        self.full_clean()
        super().save(*args, **kwargs)

class AbonoCartera(models.Model):
    detalle_cartera = models.ForeignKey(DetalleCartera, on_delete=models.CASCADE, related_name='abonos')
    valor = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    fecha = models.DateTimeField(default=timezone.now)
    observaciones = models.TextField(blank=True)
    usuario = models.ForeignKey(Persona, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        ordering = ['-fecha']
    
    def clean(self):
        if self.valor > self.detalle_cartera.saldo:
            raise ValidationError("El abono no puede ser mayor al saldo pendiente")
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
        # Actualizar el saldo en DetalleCartera
        self.detalle_cartera.saldo -= self.valor
        self.detalle_cartera.save()