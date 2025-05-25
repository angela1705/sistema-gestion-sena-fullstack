from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend

from ..models import SenaEmpresa
from .serializer import (
    SenaEmpresaSerializer,
    SenaEmpresaCreateSerializer
)

class SenaEmpresaViewSet(viewsets.ModelViewSet):
    queryset = SenaEmpresa.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['activa', 'nit']
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return SenaEmpresaCreateSerializer
        return SenaEmpresaSerializer

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['patch'])
    def activate(self, request, pk=None):
        """Activa/desactiva una empresa"""
        empresa = self.get_object()
        empresa.activa = not empresa.activa
        empresa.save()
        return Response({'status': 'empresa activada' if empresa.activa else 'empresa desactivada'})

    @action(detail=True, methods=['get'])
    def sedes(self, request, pk=None):
        """Lista todas las sedes de la empresa"""
        empresa = self.get_object()
        sedes = empresa.sedes.all()
        page = self.paginate_queryset(sedes)
        
        if page is not None:
            from apps.entidades.sede.api.serializer import SedeShortSerializer
            serializer = SedeShortSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        from apps.entidades.sede.api.serializer import SedeShortSerializer
        serializer = SedeShortSerializer(sedes, many=True, context={'request': request})
        return Response(serializer.data)