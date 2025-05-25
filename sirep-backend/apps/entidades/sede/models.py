from django.db import models
from apps.entidades.sena_empresa.models import SenaEmpresa

class Sede(models.Model):
    OPCIONES_SEDES= [
        ('centro', 'Centro'),
        ('yamboro', 'Yamboro'),
    ]

    nombre = models.CharField(max_length=20, choices=OPCIONES_SEDES, unique=True)
    sena_empresa=models.ForeignKey(SenaEmpresa,on_delete=models.CASCADE,related_name='sedes') 
    direccion = models.TextField(verbose_name="Dirección completa")
    telefono = models.CharField(max_length=20, verbose_name="Teléfono de contacto")
    responsable = models.CharField(max_length=100, blank=True, verbose_name="Responsable de sede")
    activa = models.BooleanField(default=True, verbose_name="¿Sede activa?")
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")

    def __str__(self):
        return f"{self.get_nombre_display()} - {self.sena_empresa.nombre}"
    
    @property
    def nombre_completo(self):
        """Devuelve el nombre formal de la sede"""
        return f"Sede {self.get_nombre_display()}"
