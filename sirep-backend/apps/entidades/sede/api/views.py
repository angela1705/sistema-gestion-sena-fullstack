from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from ..models import Sede
from .serializer import SedeSerializer, SedeCreateUpdateSerializer

class SedeViewSet(viewsets.ModelViewSet):
    queryset = Sede.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return SedeCreateUpdateSerializer
        return SedeSerializer

    @action(detail=True, methods=['patch'])
    def toggle_activa(self, request, pk=None):
        """Activa/desactiva una sede"""
        sede = self.get_object()
        sede.activa = not sede.activa
        sede.save()
        return Response(
            {'activa': sede.activa},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'])
    def opciones_nombres(self, request):
        """Devuelve las opciones disponibles para el campo nombre"""
        opciones = dict(Sede.OPCIONES_SEDES)
        return Response(opciones, status=status.HTTP_200_OK)