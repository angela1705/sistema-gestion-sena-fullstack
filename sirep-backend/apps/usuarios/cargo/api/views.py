from rest_framework import viewsets
from ..models import Cargo
from .serializer import CargoSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly

class CargoViewSet(viewsets.ModelViewSet):
    queryset = Cargo.objects.all()
    serializer_class = CargoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]  # Solo usuarios autenticados pueden editar

    def perform_create(self, serializer):
        """Guarda el cargo con el nombre capitalizado."""
        nombre = serializer.validated_data.get('nombre', '')
        serializer.save(nombre=nombre.capitalize())