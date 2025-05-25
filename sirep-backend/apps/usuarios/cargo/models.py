from django.db import models

class Cargo(models.Model):

    nombre = models.CharField(max_length=20, unique=True)
    descripcion = models.TextField(blank=True )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nombre