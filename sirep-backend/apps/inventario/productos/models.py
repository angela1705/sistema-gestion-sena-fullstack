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
    
    TIPO_GESTION = [  
        ('stock', 'Gestión por stock'),
        ('produccion', 'Producción diaria (almuerzos)')
    ]
    
    nombre = models.CharField(max_length=100) 
    descripcion = models.TextField()
    categoria = models.ForeignKey(TipoCategoria, on_delete=models.SET_NULL, null=True,blank=True)
    unidadP=models.ForeignKey(UnidadProductiva, on_delete=models.SET_NULL, null=True,blank=True)

    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='disponible')
    tipo_gestion = models.CharField(max_length=20,choices=TIPO_GESTION,default='con_stock')
    reservas=models.BooleanField(default=True)
    hora_limite_reserva = models.TimeField(null=True, blank=True)
   

    stock_actual = models.PositiveIntegerField(null=True,blank=True)#solo para los que si utilizan stock
    capacidad_diaria = models.PositiveIntegerField(null=True,blank=True,help_text="Para productos sin stock (ej: almuerzos)")
    precio_compra = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tiene_descuento = models.BooleanField(default=False)
    porcentaje_descuento = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True,validators=[
        MinValueValidator(0),
        MaxValueValidator(100)])
    precio_descuento = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, editable=False)
 
    imagen= models.ImageField( upload_to='producto_images/',null=True,blank=True) 

    unidad_medida_base = models.CharField(max_length=10,default='unidad',
        choices=[
            ('unidad', 'Unidades'),
            ('gramos', 'Gramos'), 
            ('ml', 'Mililitros'),
            ('kg', 'Kilogramos'),
            ('litro', 'Litros')
        ])

    def clean(self):
        """Validaciones adicionales"""
        if self.tipo_gestion == 'stock' and self.stock_actual is None:
            raise ValidationError({
                'stock_actual': 'Debe especificar el stock para productos con este tipo de gestión'
            })
            
        if self.tiene_descuento and not self.porcentaje_descuento:
            raise ValidationError({
                'porcentaje_descuento': 'Debe especificar un porcentaje cuando hay descuento'
            })

    def calcular_precio_descuento(self):
        """Calcula el precio con descuento aplicando redondeo bancario"""
        if not (self.tiene_descuento and self.porcentaje_descuento):
            return None
            
        descuento = self.precio_compra * (self.porcentaje_descuento / Decimal(100))
        return (self.precio_compra - descuento).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    def save(self, *args, **kwargs):
        self.full_clean()  
        if self.tiene_descuento:
            self.precio_descuento = self.calcular_precio_descuento()
        else:
            self.precio_descuento = None
        super().save(*args, **kwargs)

    @property
    def precio_final(self):
        """Retorna el precio final a mostrar (con o sin descuento)"""
        return self.precio_descuento if self.tiene_descuento else self.precio_compra

    def __str__(self):
        return f"{self.nombre} - {self.get_unidad_medida_base_display()}"