from django.db import models
from django.contrib.auth.models import AbstractUser
from apps.usuarios.rol.models import Rol
from apps.usuarios.cargo.models import Cargo
from apps.entidades.sede.models import Sede
from django.core.validators import RegexValidator
from django.contrib.auth.models import AbstractUser, Group, Permission

class Persona(AbstractUser):
    id_regex = RegexValidator(regex=r'^[0-9]{6,20}$')

    identificacion = models.CharField(unique=True,max_length=20)
    rol = models.ForeignKey(Rol, on_delete=models.SET_NULL, null=True, blank=True)
    cargo = models.ForeignKey(Cargo, on_delete=models.SET_NULL, null=True, blank=True)
    sede = models.ForeignKey(Sede, on_delete=models.SET_NULL, null=True, blank=True)
    telefono = models.CharField(max_length=10,blank=True,null=True)
    numFicha = models.IntegerField(blank=True,null=True)
    foto= models.ImageField( upload_to='usuarios/fotos/%Y/%m/%d/',null=True)
    
    class Meta:
        default_related_name = 'personas' 
    def __str__(self):
        return f"{self.get_full_name()} - {self.identificacion}"

