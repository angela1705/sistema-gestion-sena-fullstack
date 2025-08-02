from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from apps.usuarios.persona.models import Persona
from apps.usuarios.rol.models import Rol

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
    filterset_fields = ['sede', 'tipo', 'activa', 'encargado']
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UnidadProductivaCreateUpdateSerializer
        return UnidadProductivaSerializer


    @action(detail=False, methods=['get'],url_path="opciones")
    def opciones(self, request):
        tipos = dict(UnidadProductiva._meta.get_field('tipo').choices)

        rol_liderup = Rol.objects.filter(nombre='liderup').first()
        encargados = Persona.objects.filter(rol=rol_liderup).values(
        'id', 'first_name', 'last_name')

        # Construir lista con nombre completo
        encargados_data = [
        {'id': p['id'], 'nombre_completo': f"{p['first_name']} {p['last_name']}".strip()}
        for p in encargados]

        return Response({
        "tipos": tipos,
        "encargados":encargados_data
        })