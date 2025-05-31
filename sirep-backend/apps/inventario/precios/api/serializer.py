from rest_framework import serializers
from ..models import Precio
from apps.usuarios.persona.api.serializer import PersonaSerializer
from apps.inventario.productos.api.serializer import ProductoSerializer
from decimal import Decimal

class PrecioSerializer(serializers.ModelSerializer):
    persona_info = PersonaSerializer(source='persona', read_only=True)
    producto_info = ProductoSerializer(source='producto', read_only=True)

    class Meta:
        model = Precio
        fields = [
            'id', 'persona', 'persona_info',
            'producto', 'producto_info', 'valor'
        ]
        extra_kwargs = {
            'persona': {'write_only': True},
            'producto': {'write_only': True},
            'valor': {
                'min_value': Decimal('0.01'),
                'max_digits': 10,
                'decimal_places': 2
            }
        }

    def validate(self, data):
        """Valida que no exista un precio duplicado para la misma persona-producto"""
        if self.instance is None and Precio.objects.filter(
            persona=data.get('persona'),
            producto=data.get('producto')
        ).exists():
            raise serializers.ValidationError(
                "Ya existe un precio registrado para esta combinación de persona y producto."
            )
        return data