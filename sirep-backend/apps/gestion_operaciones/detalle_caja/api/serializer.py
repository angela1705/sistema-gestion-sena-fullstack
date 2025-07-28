from rest_framework import serializers
from ..models import DetalleCaja

class DetalleCajaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleCaja
        fields = ['id', 'transaccion', 'tipo', 'monto', 'descripcion', 'creado']
