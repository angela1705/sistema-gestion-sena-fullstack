from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from django.shortcuts import get_object_or_404

from ..models import DetalleCaja
from .serializer import DetalleCajaSerializer
from apps.gestion_operaciones.caja_diaria.models import CajaDiaria
from apps.gestion_operaciones.transaccion.models import DetalleTransaccion

class DetalleCajaViewSet(viewsets.ModelViewSet):
    queryset = DetalleCaja.objects.all()
    serializer_class = DetalleCajaSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='actual', permission_classes=[IsAuthenticated])
    def detalle_actual(self, request):
        user = request.user
        caja = CajaDiaria.objects.filter(
            abierta_por=user,
            fecha_cierre__isnull=True
        ).order_by('-fecha_apertura').first()

        if not caja:
            return Response({'detail': 'No hay caja abierta actualmente.'}, status=404)

        detalles = DetalleCaja.objects.filter(caja=caja)

        ingresos = detalles.filter(transaccion__tipo='venta')
        egresos = detalles.filter(transaccion__tipo='compra')

        total_ingresos = ingresos.aggregate(total=Sum('monto'))['total'] or 0
        total_egresos = egresos.aggregate(total=Sum('monto'))['total'] or 0
        saldo_estimado = caja.saldo_inicial + total_ingresos - total_egresos

        

        comisiones = []
        for detalle in ingresos:
            transaccion = detalle.transaccion
            # Buscar el detalle de transacción para obtener el producto
            detalle_transaccion = DetalleTransaccion.objects.filter(transaccion=transaccion).first()

            producto = detalle_transaccion.producto if detalle_transaccion else None

            if producto and producto.comision:
                valor_comision = detalle.monto * (producto.comision / 100)
                comisiones.append({
                    'producto': str(producto.nombre),
                    'valor_venta': detalle.monto,
                    'porcentaje_comision': producto.comision,
                    'valor_comision': round(valor_comision, 2),
                    'unidad_destino': str(producto.unidad_comision_destino.nombre) if producto.unidad_comision_destino else None
                })

        serializer = DetalleCajaSerializer(detalles, many=True)
        return Response({
            'unidad_productiva': caja.unidadProductiva.nombre,
            'abierta_por': caja.abierta_por.get_full_name(),
            'fecha_apertura': caja.fecha_apertura,
            'saldo_inicial': caja.saldo_inicial,
            'total_ingresos': total_ingresos,
            'total_egresos': total_egresos,
            'saldo_estimado': saldo_estimado,
            'comisiones': comisiones,
            'detalles': serializer.data
        }, status=200)
