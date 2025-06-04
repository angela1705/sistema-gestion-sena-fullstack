from rest_framework import serializers
from ..models import Precio
from apps.inventario.productos.api.serializer import ProductoSimpleSerializer
from apps.usuarios.cargo.api.serializer import CargoSerializer  

from decimal import Decimal

class PrecioSerializer(serializers.ModelSerializer):
    cargo_info = CargoSerializer(source='cargo', read_only=True)
    producto_info = ProductoSimpleSerializer(source='producto', read_only=True)

    class Meta:
        model = Precio
        fields = [
            'id', 'cargo', 'cargo_info',
            'producto', 'producto_info', 'valor'
        ]
        extra_kwargs = {
            'cargo': {'write_only': True},
            'producto': {'write_only': True},
            'valor': {
                'min_value': Decimal('0.01'),
                'max_digits': 10,
                'decimal_places': 2
            }
        }

    def validate(self, data):
        """Valida que no exista un precio duplicado para la misma combinación de cargo y producto"""
        if self.instance is None and Precio.objects.filter(
            cargo=data.get('cargo'),
            producto=data.get('producto')
        ).exists():
            raise serializers.ValidationError(
                "Ya existe un precio registrado para esta combinación de cargo y producto."
            )
        return data
