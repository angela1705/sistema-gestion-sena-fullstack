from datetime import datetime
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.gestion_operaciones.detalle_caja.models import DetalleCaja
from apps.gestion_operaciones.detalle_caja.api.serializer import DetalleCajaSerializer

class DetalleCajaViewSet(viewsets.ModelViewSet):
    queryset = DetalleCaja.objects.all().order_by('-fecha')
    serializer_class = DetalleCajaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        params = self.request.query_params

        caja_id = params.get('caja_id')
        tipo = params.get('tipo')
        transaccion_id = params.get('transaccion_id')
        fecha = params.get('fecha')
        fecha_inicio = params.get('fecha_inicio')
        fecha_fin = params.get('fecha_fin')

        if caja_id:
            queryset = queryset.filter(caja_id=caja_id)
        if tipo:
            queryset = queryset.filter(tipo=tipo)
        if transaccion_id:
            queryset = queryset.filter(transaccion_id=transaccion_id)
        if fecha:
            try:
                fecha_obj = datetime.strptime(fecha, "%Y-%m-%d").date()
                queryset = queryset.filter(fecha__date=fecha_obj)
            except ValueError:
                pass  # O puedes lanzar un error 400
        if fecha_inicio:
            try:
                fecha_inicio_obj = datetime.strptime(fecha_inicio, "%Y-%m-%d")
                queryset = queryset.filter(fecha__gte=fecha_inicio_obj)
            except ValueError:
                pass
        if fecha_fin:
            try:
                fecha_fin_obj = datetime.strptime(fecha_fin, "%Y-%m-%d")
                queryset = queryset.filter(fecha__lte=fecha_fin_obj)
            except ValueError:
                pass

        return queryset
