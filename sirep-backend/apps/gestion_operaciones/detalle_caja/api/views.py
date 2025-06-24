from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.db.models import Sum
from ..models import DetalleCaja, Tipo
from .serializer import DetalleCajaSerializer
from apps.gestion_operaciones.caja_diaria.models import CajaDiaria

class DetalleCajaViewSet(viewsets.ModelViewSet):
    queryset = DetalleCaja.objects.all().order_by('-fecha')
    serializer_class = DetalleCajaSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['caja', 'tipo']
    http_method_names = ['get', 'post', 'head']

    def get_queryset(self):
        """
        Filtra los detalles de caja según la unidad productiva del usuario.
        """
        user = self.request.user
        persona = getattr(user, 'persona', None)
        if not persona or not persona.unidadP:
            return DetalleCaja.objects.none()

        cajas = CajaDiaria.objects.filter(unidadProductiva=persona.unidadP)
        return DetalleCaja.objects.filter(caja__in=cajas)

    def perform_create(self, serializer):
        """
        Guarda un detalle de caja nuevo, manualmente.
        """
        serializer.save()

    @action(detail=False, methods=['get'], url_path='resumen/(?P<caja_id>[^/.]+)')
    def resumen_por_caja(self, request, caja_id=None):
        """
        Devuelve el total de ingresos y egresos para una caja específica (útil para el cierre).
        """
        try:
            caja = CajaDiaria.objects.get(pk=caja_id)
        except CajaDiaria.DoesNotExist:
            return Response({'error': 'Caja no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

        ingresos = DetalleCaja.objects.filter(caja=caja, tipo=Tipo.INGRESO).aggregate(total=Sum('monto'))['total'] or 0
        egresos = DetalleCaja.objects.filter(caja=caja, tipo=Tipo.EGRESO).aggregate(total=Sum('monto'))['total'] or 0

        return Response({
            'caja_id': caja.id,
            'unidad_productiva': str(caja.unidadProductiva),
            'fecha_apertura': caja.fecha_apertura,
            'ingresos': ingresos,
            'egresos': egresos,
            'saldo_estimado_final': caja.saldo_inicial + ingresos - egresos
        })
