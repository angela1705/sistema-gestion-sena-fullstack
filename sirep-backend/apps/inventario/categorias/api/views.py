from rest_framework import viewsets
from ..models import TipoCategoria
from .serializer import TipoCategoriaSerializer, TipoCategoriaCreateUpdateSerializer

class TipoCategoriaViewSet(viewsets.ModelViewSet):
    queryset = TipoCategoria.objects.all()
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TipoCategoriaCreateUpdateSerializer
        return TipoCategoriaSerializer