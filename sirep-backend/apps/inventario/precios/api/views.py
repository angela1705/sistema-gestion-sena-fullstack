from rest_framework import viewsets
from ..models import Precio
from .serializer import PrecioSerializer
from rest_framework.permissions import IsAuthenticated

class PrecioViewSet(viewsets.ModelViewSet):
    queryset = Precio.objects.all()
    serializer_class = PrecioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filtra precios por producto o persona según query params"""
        queryset = super().get_queryset()
        
        producto_id = self.request.query_params.get('producto')
        if producto_id:
            queryset = queryset.filter(producto_id=producto_id)
            
        persona_id = self.request.query_params.get('persona')
        if persona_id:
            queryset = queryset.filter(persona_id=persona_id)
            
        return queryset

    def perform_create(self, serializer):
        """Asigna automáticamente el usuario actual si no se especifica"""
        if 'persona' not in serializer.validated_data:
            serializer.save(persona=self.request.user)
        else:
            serializer.save()