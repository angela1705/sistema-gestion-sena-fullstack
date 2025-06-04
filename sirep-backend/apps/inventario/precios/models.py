from django.db import models
from apps.usuarios.cargo.models import Cargo
from apps.inventario.productos.models import Producto

class Precio(models.Model):
    
    cargo = models.ForeignKey(Cargo, on_delete=models.CASCADE)
    producto=models.ForeignKey(Producto,  on_delete=models.PROTECT)
    valor=models.DecimalField(max_digits=10, decimal_places=2, default=0)
 
   
    def __str__(self):
        return self.valor

