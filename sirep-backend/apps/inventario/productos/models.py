from django.db import models
from apps.entidades.unidades_productivas.models import UnidadProductiva
from apps.inventario.categorias.models import TipoCategoria
from decimal import Decimal, ROUND_HALF_UP
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError

class Producto(models.Model):
    ESTADO_CHOICES = [
        ('disponible', 'Disponible'),
        ('no_disponible', 'No disponible')]
    
    nombre = models.CharField(max_length=100) 
    descripcion = models.TextField()
    categoria = models.ForeignKey(TipoCategoria, on_delete=models.SET_NULL, null=True, blank=True)
    unidadP = models.ForeignKey(UnidadProductiva, on_delete=models.SET_NULL, null=True, blank=True)

    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='disponible')
    stock = models.BooleanField(default=True)
    reservas = models.BooleanField(default=True)
    hora_limite_reserva = models.TimeField(null=True, blank=True)
    max_reservas = models.PositiveIntegerField(null=True, blank=True, help_text="Cantidad máxima de reservas permitidas")
    
    stock_actual = models.PositiveIntegerField(null=True, blank=True, help_text="Solo para productos que manejan stock")
    precio_compra = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tiene_descuento = models.BooleanField(default=False)
    porcentaje_descuento = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    precio_descuento = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, editable=False)
 
    imagen = models.ImageField(upload_to='uploads/', null=True, blank=True)

    unidad_medida_base = models.CharField(
        max_length=10,
        default='unidad',
        choices=[
            ('unidad', 'Unidades'),
            ('gramos', 'Gramos'), 
            ('ml', 'Mililitros'),
            ('kg', 'Kilogramos'),
            ('litro', 'Litros')
        ]
    )

    def clean(self):
        """Validaciones personalizadas"""
        super().clean()
        
        # Si maneja stock, debe tener stock_actual definido
        if self.stock and self.stock_actual is None:
            raise ValidationError({'stock_actual': 'Debe especificar la cantidad de stock para productos que manejan inventario.'})
        
        # Si no maneja stock, no debería tener stock_actual
        if not self.stock and self.stock_actual is not None:
            raise ValidationError({'stock_actual': 'No puede tener stock actual si el producto no maneja inventario.'})
            
        # Si permite reservas, debe tener hora límite y máximo de reservas definido
        if self.reservas:
            if not self.hora_limite_reserva:
                raise ValidationError({'hora_limite_reserva': 'Debe establecer una hora límite para las reservas.'})
            if not self.max_reservas:
                raise ValidationError({'max_reservas': 'Debe establecer un máximo de reservas permitidas.'})
                
        # Si no permite reservas, no debería tener estos campos
        if not self.reservas:
            if self.hora_limite_reserva:
                raise ValidationError({'hora_limite_reserva': 'No puede tener hora límite si no permite reservas.'})
            if self.max_reservas:
                raise ValidationError({'max_reservas': 'No puede tener máximo de reservas si no permite reservas.'})
        
        # Validar que si maneja stock y permite reservas, haya stock disponible
        if self.stock and self.reservas and self.stock_actual == 0:
            self.estado = 'no_disponible'
            self.reservas = False  # Desactivar reservas si no hay stock

    def calcular_precio_descuento(self):
        """Calcula el precio con descuento aplicando redondeo bancario"""
        if not (self.tiene_descuento and self.porcentaje_descuento):
            return None
            
        descuento = self.precio_compra * (self.porcentaje_descuento / Decimal(100))
        return (self.precio_compra - descuento).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    def save(self, *args, **kwargs):
        self.full_clean()  # Ejecuta las validaciones
        if self.tiene_descuento:
            self.precio_descuento = self.calcular_precio_descuento()
        else:
            self.precio_descuento = None
            
        # Actualizar estado según disponibilidad
        if self.stock and self.stock_actual == 0:
            self.estado = 'no_disponible'
            if self.reservas:
                self.reservas = False
        else:
            self.estado = 'disponible'
            
        super().save(*args, **kwargs)

    @property
    def precio_final(self):
        """Retorna el precio final a mostrar (con o sin descuento)"""
        return self.precio_descuento if self.tiene_descuento else self.precio_compra

    @property
    def disponible_para_reservas(self):
        """Determina si el producto está disponible para reservas"""
        if not self.reservas:
            return False
        if self.stock and self.stock_actual == 0:
            return False
        return True

    def __str__(self):
        return f"{self.nombre} - {self.get_unidad_medida_base_display()}"
    
    def get_precio_para_persona(self, persona):
        from apps.inventario.precios.models import Precio
        if persona and persona.cargo:
            precio_personalizado = Precio.objects.filter(
                producto=self,
                cargo=persona.cargo
            ).first()
            if precio_personalizado:
                return precio_personalizado.valor
        return self.precio_final