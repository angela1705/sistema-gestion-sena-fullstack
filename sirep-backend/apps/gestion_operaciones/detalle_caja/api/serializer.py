from rest_framework import serializers
from ..models import DetalleCaja
from apps.gestion_operaciones.transaccion.api.transaccion_serializer import TransaccionSerializer

class DetalleCajaSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(
        source='get_tipo_display', 
        read_only=True
    )
    transaccion_info = TransaccionSerializer(
        source='transaccion', 
        read_only=True
    )
    comprobante_url = serializers.SerializerMethodField()

    class Meta:
        model = DetalleCaja
        fields = [
            'id',
            'caja',
            'transaccion',
            'transaccion_info',
            'fecha',
            'tipo',
            'tipo_display',
            'monto',
            'descripcion',
            'beneficiario',
            'comprobante',
            'comprobante_url'
        ]
        read_only_fields = [
            'id',
            'fecha',
            'tipo_display',
            'comprobante_url',
            'transaccion_info'
        ]
        extra_kwargs = {
            'monto': {'min_value': 0.01}
        }

    def get_comprobante_url(self, obj):
        if obj.comprobante and hasattr(obj.comprobante, 'url'):
            return self.context['request'].build_absolute_uri(obj.comprobante.url)
        return None

    def validate(self, data):
        """Validaciones personalizadas"""
        if data['tipo'] == 'ingreso' and not data.get('transaccion'):
            raise serializers.ValidationError(
                "Los ingresos deben estar asociados a una transacción"
            )
        return data