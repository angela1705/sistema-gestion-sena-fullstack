from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from .filters import CajaDiariaFilter
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from ..models import CajaDiaria
from .serializer import (
    CajaDiariaSerializer,
    CajaDiariaAperturaSerializer,
    CajaDiariaCierreSerializer
)
class CajaDiariaViewSet(viewsets.ModelViewSet):
    queryset = CajaDiaria.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = CajaDiariaSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = CajaDiariaFilter  
    search_fields = ['unidadProductiva__nombre', 'observaciones']
    ordering_fields = ['fecha_apertura', 'fecha_cierre', 'saldo_inicial']
    ordering = ['-fecha_apertura']

    def get_serializer_class(self):
        if self.action == 'create':
            return CajaDiariaAperturaSerializer
        elif self.action == 'cerrar_caja':
            return CajaDiariaCierreSerializer
        return CajaDiariaSerializer

    def perform_create(self, serializer):
        """Asigna automáticamente el usuario que abre la caja"""
        serializer.save(abierta_por=self.request.user)

    @action(detail=True, methods=['post'])
    def cerrar_caja(self, request, pk=None):
        """Endpoint para cerrar una caja"""
        caja = self.get_object()
        
        if not caja.esta_abierta:
            return Response(
                {"error": "Esta caja ya está cerrada"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer_class()(
            caja,
            data=request.data,
            partial=True
        )
        
        serializer.is_valid(raise_exception=True)
        serializer.save(
            fecha_cierre=timezone.now(),
            cerrada_por=request.user
        )
        
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def cajas_abiertas(self, request):
        """Lista todas las cajas abiertas"""
        cajas = self.get_queryset().filter(fecha_cierre__isnull=True)
        serializer = self.get_serializer(cajas, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def resumen_cajas(self, request):
        """
        Devuelve un resumen de cajas por unidad productiva
        """
        from django.db.models import Sum, Count
        resumen = CajaDiaria.objects.values(
            'unidadProductiva__id',
            'unidadProductiva__nombre'
        ).annotate(
            total_cajas=Count('id'),
            cajas_abiertas=Count('id', filter=Q(fecha_cierre__isnull=True)),
            total_movido=Sum('saldo_final') - Sum('saldo_inicial')
        )
        
        return Response(resumen)