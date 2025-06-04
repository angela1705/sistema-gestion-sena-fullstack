from rest_framework import viewsets
from ..models import Precio
from .serializer import PrecioSerializer
from rest_framework.permissions import IsAuthenticated

class PrecioViewSet(viewsets.ModelViewSet):
    queryset = Precio.objects.all()
    serializer_class = PrecioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filtra precios por producto o cargo según query params"""
        queryset = super().get_queryset()
        
        producto_id = self.request.query_params.get('producto')
        if producto_id:
            queryset = queryset.filter(producto_id=producto_id)
            
        cargo_id = self.request.query_params.get('cargo')
        if cargo_id:
            queryset = queryset.filter(cargo_id=cargo_id)
            
        return queryset

    def perform_create(self, serializer):
        """
        Guarda el objeto normalmente.
        Ya no se asigna automáticamente una persona, porque se trabaja con cargo.
        """
        serializer.save()
