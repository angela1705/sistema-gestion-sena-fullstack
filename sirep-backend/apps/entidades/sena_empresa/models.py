from django.db import models

class SenaEmpresa(models.Model):
    nombre = models.CharField(max_length=30)
    nit = models.CharField(max_length=20,unique=True,verbose_name="NIT")
    direccion_principal = models.TextField()
    telefono_contacto = models.CharField(max_length=20)
    email_contacto = models.EmailField()
    logo = models.ImageField(upload_to='sena/empresa/logos/',null=True,blank=True,verbose_name="Logo institucional")
    fecha_creacion = models.DateField(auto_now_add=True,verbose_name="Fecha de creación")
    activa = models.BooleanField(default=True,verbose_name="¿Empresa activa?")

    def __str__(self):
        return self.nombre
    
    
    @property
    def sedes_activas(self):
        """Retorna las sedes activas de esta empresa"""
        return self.sedes.filter(activa=True)

