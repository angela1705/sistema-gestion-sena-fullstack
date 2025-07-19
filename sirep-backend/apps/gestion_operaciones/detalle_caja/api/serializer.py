from rest_framework import serializers
from ..models import DetalleCaja, Tipo
from apps.gestion_operaciones.transaccion.api.transaccion_serializer import TransaccionSerializer
from apps.gestion_operaciones.caja_diaria.api.serializer import CajaDiariaSerializer

class DetalleCajaSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    transaccion_info = TransaccionSerializer(source='transaccion', read_only=True)
    caja_info = CajaDiariaSerializer(source='caja', read_only=True)

    class Meta:
        model = DetalleCaja
        fields = [
            'id', 'caja', 'caja_info',
            'transaccion', 'transaccion_info',
            'tipo', 'tipo_display',
            'monto', 'fecha', 'descripcion'
        ]
        read_only_fields = ['id', 'fecha', 'tipo_display', 'transaccion_info', 'caja_info']
        extra_kwargs = {
            'descripcion': {'required': False},
            'monto': {'min_value': 0}
        }

    def validate(self, data):
        if not data.get('caja'):
            raise serializers.ValidationError({"caja": "La caja es obligatoria."})
        if not data.get('tipo'):
            raise serializers.ValidationError({"tipo": "El tipo (ingreso o egreso) es obligatorio."})
        if not data.get('monto') or data['monto'] < 0:
            raise serializers.ValidationError({"monto": "Debe ingresar un monto válido."})
        return data
