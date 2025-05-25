from django.db import models
from apps.usuarios.persona.models import Persona
from apps.inventario.productos.models import Producto

class Precio(models.Model):
    
    persona = models.ForeignKey(Persona, on_delete=models.PROTECT)
    producto=models.ForeignKey(Producto,  on_delete=models.PROTECT)
    valor=models.DecimalField(max_digits=10, decimal_places=2, default=0)
 
   
    def __str__(self):
        return self.valor

