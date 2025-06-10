from rest_framework import serializers
from apps.gestion_operaciones.detalle_caja.models import DetalleCaja
from apps.gestion_operaciones.caja_diaria.models import CajaDiaria
from apps.gestion_operaciones.transaccion.models import Transaccion

class DetalleCajaSerializer(serializers.ModelSerializer):
    caja_id = serializers.PrimaryKeyRelatedField(
        queryset=CajaDiaria.objects.all(),
        required=False,
        allow_null=True
    )
    transaccion_id = serializers.PrimaryKeyRelatedField(
        queryset=Transaccion.objects.all(),
        required=False,
        allow_null=True
    )
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    fecha_formateada = serializers.DateTimeField(source='fecha', format="%d/%m/%Y %H:%M", read_only=True)

    class Meta:
        model = DetalleCaja
        fields = [
            'id',
            'caja_id',
            'transaccion_id',
            'descripcion',
            'tipo',
            'tipo_display',
            'monto',
            'fecha',
            'fecha_formateada'
        ]
        read_only_fields = ['fecha']