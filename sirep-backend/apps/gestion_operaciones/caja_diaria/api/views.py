from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from .filters import CajaDiariaFilter
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from ..models import CajaDiaria
from django.db.models import F, ExpressionWrapper, FloatField
from apps.gestion_operaciones.transaccion.models import DetalleTransaccion
from django.shortcuts import get_object_or_404
from apps.gestion_operaciones.detalle_caja.api.serializer import DetalleCajaSerializer
from apps.gestion_operaciones.detalle_caja.models import DetalleCaja
from django.db.models import Sum
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
        """Asigna automáticamente el usuario que abre la caja y define saldo_final igual al saldo_inicial"""
        caja = serializer.save(abierta_por=self.request.user)
        if caja.saldo_final is None or caja.saldo_final == 0:
            caja.saldo_final = caja.saldo_inicial
            caja.save()

    @action(detail=True, methods=['post'])
    def cerrar_caja(self, request, pk=None):
        """Endpoint para cerrar una caja"""
        caja = self.get_object()
        
        if caja.fecha_cierre:
            return Response({'detail': 'La caja ya está cerrada.'}, status=400)

        caja.fecha_cierre = timezone.now()
        caja.save()

        detalles = DetalleCaja.objects.filter(caja=caja)
        ingresos = detalles.filter(transaccion__tipo='venta')
        egresos = detalles.filter(transaccion__tipo='compra')

        total_ingresos = ingresos.aggregate(total=Sum('monto'))['total'] or 0
        total_egresos = egresos.aggregate(total=Sum('monto'))['total'] or 0
        saldo_final = caja.saldo_inicial + total_ingresos - total_egresos

        comisiones = []
        total_comision = 0
        for detalle in ingresos:
            transaccion = detalle.transaccion
            detalle_transaccion = DetalleTransaccion.objects.filter(transaccion=transaccion).first()
            producto = detalle_transaccion.producto if detalle_transaccion else None
            if producto and producto.comision:
               valor_comision = detalle.monto * (producto.comision / 100)
               total_comision += valor_comision
               comisiones.append({
                'producto': str(producto.nombre),
                'valor_venta': detalle.monto,
                'porcentaje_comision': producto.comision,
                'valor_comision': round(valor_comision, 2),
                'unidad_destino': str(producto.unidad_comision_destino.nombre) if producto.unidad_comision_destino else None
            })

        serializer = DetalleCajaSerializer(detalles, many=True)
        return Response({
            'mensaje': 'Caja cerrada correctamente.',
            'fecha_cierre': caja.fecha_cierre,
            'unidad_productiva': caja.unidadProductiva.nombre,
            'abierta_por': caja.abierta_por.get_full_name(),
            'fecha_apertura': caja.fecha_apertura,
            'saldo_inicial': caja.saldo_inicial,
            'total_ingresos': total_ingresos,
            'total_egresos': total_egresos,
            'saldo_final': saldo_final,
            'total_comision': round(total_comision, 2),
            'comisiones': comisiones,
            'detalles': serializer.data
        }, status=200)
    
    @action(detail=True, methods=['get'], url_path='resumen', permission_classes=[IsAuthenticated])
    def resumen(self, request, pk=None):
        caja = get_object_or_404(CajaDiaria, pk=pk)
    
        if caja.esta_abierta:
            return Response({'error': 'La caja aún está abierta'}, status=400)

        detalles = caja.detalles.all()
        resumen = {
            'fecha_apertura': caja.fecha_apertura,
            'fecha_cierre': caja.fecha_cierre,
            'saldo_inicial': caja.saldo_inicial,
            'saldo_final': caja.saldo_final,
            'total_ventas': sum([d.monto for d in detalles if d.transaccion and d.transaccion.tipo == 'venta']),
            'total_compras': sum([d.monto for d in detalles if d.transaccion and d.transaccion.tipo == 'compra']),
            'detalle': DetalleCajaSerializer(detalles, many=True).data,
    }

        return Response(resumen)


    @action(detail=False, methods=['get'])
    def cajas_abiertas(self, request):
        """Lista todas las cajas abiertas"""
        cajas = self.get_queryset().filter(fecha_cierre__isnull=True)
        serializer = self.get_serializer(cajas, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def resumen_cajas(self, request):
        """
        Devuelve un resumen de cajas por unidad productiva, incluyendo total de dinero movido
        """
        from django.db.models import Sum, Count

        cajas = CajaDiaria.objects.annotate(
            movido=ExpressionWrapper(F('saldo_final') - F('saldo_inicial'),output_field=FloatField()))

        resumen = cajas.values( 'unidadProductiva__id','unidadProductiva__nombre').annotate(
        total_cajas=Count('id'),
        cajas_abiertas=Count('id', filter=Q(fecha_cierre__isnull=True)),
        total_movido=Sum('movido')
    )

        return Response(resumen)