from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from django.db.models import Sum, Q

from ..models import Transaccion, TipoTransaccion
from .serializer import TransaccionSerializer, TransaccionCreateSerializer

class TransaccionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar transacciones de inventario con:
    - Validación de stock
    - Control de tipos de transacción
    - Actualización automática de inventario
    """
    queryset = Transaccion.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'tipo': ['exact'],
        'producto': ['exact'],
        'usuario': ['exact'],
        'fecha': ['date', 'gte', 'lte']
    }
    search_fields = ['producto__nombre', 'usuario__username']
    ordering_fields = ['fecha', 'cantidad', 'producto__nombre']
    ordering = ['-fecha']

    def get_serializer_class(self):
        return TransaccionCreateSerializer if self.action == 'create' else TransaccionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.is_superuser:
            queryset = queryset.filter(usuario=self.request.user)
        return queryset.select_related('producto', 'usuario')

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    @action(detail=False, methods=['get'], url_path='resumen')
    def resumen_por_tipo(self, request):
        """
        Devuelve un resumen de transacciones por tipo:
        {
            "venta": 10,
            "compra": 5,
            "devolucion": 2
        }
        """
        resumen = (
            Transaccion.objects.filter(usuario=request.user)
            .values_list('tipo')
            .annotate(total=models.Count('id'))
        )
        return Response({item[0]: item[1] for item in resumen})

    @action(detail=False, methods=['get'], url_path='por-producto')
    def por_producto(self, request):
        """
        Devuelve totales agrupados por producto (ventas y compras).
        """
        transacciones = (
            Transaccion.objects.filter(usuario=request.user)
            .values('producto__id', 'producto__nombre')
            .annotate(
                total_vendido=Sum('cantidad', filter=Q(tipo=TipoTransaccion.VENTA)),
                total_comprado=Sum('cantidad', filter=Q(tipo=TipoTransaccion.COMPRA))
            )
        )
        return Response(transacciones)

    @action(detail=True, methods=['post'], url_path='revertir')
    def revertir(self, request, pk=None):
        """
        Revertir una transacción: crea una transacción opuesta.
        """
        transaccion = self.get_object()

        # Bloquea si ya fue revertida
        if transaccion.transaccion_revertida_id:
            return Response(
                {"error": "Esta transacción ya fue revertida"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Bloquea reversión de ajustes
        if transaccion.tipo == TipoTransaccion.AJUSTE:
            return Response(
                {"error": "No se pueden revertir transacciones de tipo AJUSTE"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mapeo de tipos opuestos
        tipo_opuesto = {
            TipoTransaccion.VENTA: TipoTransaccion.DEVOLUCION,
            TipoTransaccion.COMPRA: TipoTransaccion.VENTA,
            TipoTransaccion.DEVOLUCION: TipoTransaccion.VENTA
        }

        # Crea transacción opuesta
        nueva_transaccion = Transaccion.objects.create(
            tipo=tipo_opuesto[transaccion.tipo],
            producto=transaccion.producto,
            cantidad=transaccion.cantidad,
            usuario=request.user
        )

        # Relaciona ambas transacciones
        transaccion.transaccion_revertida = nueva_transaccion
        transaccion.save()

        return Response({
            "status": "Transacción revertida exitosamente",
            "nueva_transaccion_id": nueva_transaccion.id
        }, status=status.HTTP_201_CREATED)
