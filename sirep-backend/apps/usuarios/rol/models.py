from django.db import models

class Rol(models.Model):
    OPCIONES_ROL= [
        ('consumidor', 'Consumidor'),
        ('pasante', 'Pasante'),
        ('liderup', 'Lider de unidad productiva'),
        ('administrador', 'Administrador')
    ]   
    
    nombre = models.CharField(max_length=20, choices=OPCIONES_ROL, unique=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
   

    def __str__(self):
        return self.get_nombre_display()