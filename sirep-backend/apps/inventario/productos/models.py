from django.db import models
from apps.entidades.unidades_productivas.models import UnidadProductiva
from apps.inventario.categorias.models import TipoCategoria

class Producto(models.Model):

    ESTADO_CHOICES = [
        ('disponible', 'Disponible'),
        ('no_disponible', 'No disponible')]
    
    RESERVA_CHOICES = [
        ('si', 'Requiere reserva'),
        ('no', 'No requiere reserva'),
    ]

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
    reservas = models.CharField(max_length=20, choices=RESERVA_CHOICES,default='no')

    stock_actual = models.PositiveIntegerField(null=True,blank=True)#solo para los que si utilizan stock
    capacidad_diaria = models.PositiveIntegerField(null=True,blank=True,help_text="Para productos sin stock (ej: almuerzos)")
    precio_compra = models.DecimalField(max_digits=10, decimal_places=2, default=0) 
    imagen= models.ImageField( upload_to='producto_images/',null=True,blank=True) 

    unidad_medida_base = models.CharField(max_length=10,default='unidad',
        choices=[
            ('unidad', 'Unidades'),
            ('gramos', 'Gramos'), 
            ('ml', 'Mililitros'),
            ('kg', 'Kilogramos'),
            ('litro', 'Litros')
        ])

    

    def __str__(self):
        return self.nombre