from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend

from ..models import UnidadProductiva
from .serializer import (
    UnidadProductivaSerializer,
    UnidadProductivaCreateUpdateSerializer
)

class UnidadProductivaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar unidades productivas
    """
    queryset = UnidadProductiva.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['sede', 'tipo', 'estado', 'encargado']
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UnidadProductivaCreateUpdateSerializer
        return UnidadProductivaSerializer

    @action(detail=True, methods=['patch'])
    def cambiar_estado(self, request, pk=None):
        """
        Cambia el estado de la unidad productiva
        Ejemplo payload: {'estado': 'inactiva'}
        """
        unidad = self.get_object()
        nuevo_estado = request.data.get('estado')
        
        if nuevo_estado not in dict(UnidadProductiva.ESTADOS_UNIDAD).keys():
            return Response(
                {'error': 'Estado no válido'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        unidad.estado = nuevo_estado
        unidad.save()
        
        return Response(
            {'estado': unidad.estado, 'estado_display': unidad.get_estado_display()},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'])
    def opciones(self, request):
        """
        Devuelve las opciones disponibles para campos choices
        """
        return Response({
            'tipos': dict(UnidadProductiva.TIPO_UNIDAD),
            'estados': dict(UnidadProductiva.ESTADOS_UNIDAD)
        })