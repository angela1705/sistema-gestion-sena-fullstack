from django.db import models
from apps.usuarios.persona.models import Persona
from apps.entidades.sede.models import Sede

class UnidadProductiva(models.Model):

    TIPO_UNIDAD = [
        ('agricola', 'Agricola'),
        ('agroindustria', 'Agroindustria'),
        ('gastronomia', 'Gastronomia'),
        ('pecuaria', 'Pecuaria'),
        ('escuelanacionalcafe', 'Escuela Nacional del Café'),
        ('ambiental', 'Ambiental'),
        ('empresaserviciopublicos', 'Servicios Publicos'),
        ('moda', 'Moda'),
        ('tiendaY', 'Tienda Yamboro'),

    ]
    
    logo= models.ImageField( upload_to='unidades/logos/%Y/%m/%d/',null=True,blank=True)
    descripcion = models.TextField( blank=True)
    tipo = models.CharField(max_length=25,choices=TIPO_UNIDAD,unique=True)
    activa = models.BooleanField(default=True,verbose_name="¿Unidad activa?")
    encargado = models.ForeignKey(Persona, on_delete=models.SET_NULL, null=True, blank=True)
    sede = models.ForeignKey(Sede, on_delete=models.CASCADE, related_name="unidades_productivas")
    horario_atencion = models.CharField( max_length=100,blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_tipo_display()}"

