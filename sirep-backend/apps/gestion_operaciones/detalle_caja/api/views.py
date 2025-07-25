from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Q
from django.shortcuts import get_object_or_404

from ..models import DetalleCaja
from .serializer import DetalleCajaSerializer
from .filters import DetalleCajaFilter

class DetalleCajaViewSet(viewsets.ModelViewSet):
    queryset = DetalleCaja.objects.all().select_related(
        'caja',
        'transaccion'
    ).order_by('-fecha')
    serializer_class = DetalleCajaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = DetalleCajaFilter
    http_method_names = ['get', 'post', 'patch', 'delete', 'head']

    def get_queryset(self):
        """Filtra por la unidad productiva del usuario"""
        queryset = super().get_queryset()
        user = self.request.user
        
        if not user.is_superuser:
            persona = getattr(user, 'persona', None)
            if persona and persona.unidadP:
                queryset = queryset.filter(caja__unidadProductiva=persona.unidadP)
            else:
                queryset = queryset.none()
                
        return queryset

    @action(detail=False, methods=['get'], url_path='resumen/(?P<caja_id>\d+)')
    def resumen_por_caja(self, request, caja_id=None):
        
        # Totales básicos
        resumen = self.get_queryset().filter(caja_id=caja_id).aggregate(
            total_ingresos=Sum('monto', filter=Q(tipo='ingreso')),
            total_egresos=Sum('monto', filter=Q(tipo='egreso'))
        )

        # Cálculo de comisiones desde transacciones
        from apps.gestion_operaciones.transaccion.models import DetalleTransaccion
        comisiones = DetalleTransaccion.objects.filter(
            transaccion__caja_diaria_id=caja_id,
            producto__tiene_comision=True
        ).values('producto__unidad_comision_destino__nombre').annotate(
            total=Sum('subtotal') * Sum('producto__comision') / 100
        )

        return Response({
            'totales': {
                'ingresos': float(resumen['total_ingresos'] or 0),
                'egresos': float(resumen['total_egresos'] or 0)
            },
            'comisiones': [
                {
                    'unidad': item['producto__unidad_comision_destino__nombre'],
                    'total': float(item['total'] or 0)
                } for item in comisiones
            ]
        })

    @action(detail=True, methods=['patch'])
    def adjuntar_comprobante(self, request, pk=None):
        """Endpoint para subir comprobantes"""
        detalle = self.get_object()
        
        if 'comprobante' not in request.FILES:
            return Response(
                {'error': 'No se proporcionó archivo'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        detalle.comprobante = request.FILES['comprobante']
        detalle.save()
        
        return Response(
            self.get_serializer(detalle).data,
            status=status.HTTP_200_OK
        )