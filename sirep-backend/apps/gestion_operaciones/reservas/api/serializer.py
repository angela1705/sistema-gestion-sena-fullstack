from rest_framework import serializers
from ..models import Reserva
from apps.usuarios.persona.api.serializer import PersonaSerializer
from apps.inventario.productos.api.serializer import ProductoSerializer
from apps.gestion_operaciones.transaccion.api.serializer import TransaccionSerializer
from apps.usuarios.persona.models import Persona

class ReservaSerializer(serializers.ModelSerializer):
    persona_info = PersonaSerializer(source='persona', read_only=True)
    producto_info = ProductoSerializer(source='producto', read_only=True)
    transaccion_info = TransaccionSerializer(source='transaccion', read_only=True)


    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)

    class Meta:
        model = Reserva
        fields = [
            'id', 'persona', 'persona_info',
            'producto', 'producto_info',
            'precio_unitario',
            'cantidad', 'total',
            'fecha_creacion', 'fecha_actualizacion',
            'estado', 'estado_display',
            'transaccion_info'
        ]
        read_only_fields = [
            'id', 'total', 'fecha_creacion',
            'fecha_actualizacion', 'precio_unitario'
        ]
        extra_kwargs = {
            'persona': {'write_only': True},
            'producto': {'write_only': True},
            'cantidad': {'min_value': 1}
        }

    def validate(self, data):
        if self.instance and 'estado' in data:
            estado_actual = self.instance.estado
            nuevo_estado = data['estado']
            if estado_actual in ['cancelada', 'entregada'] and estado_actual != nuevo_estado:
                raise serializers.ValidationError(
                    f"No se puede modificar una reserva {estado_actual}"
                )
        return data


class ReservaCreateSerializer(serializers.ModelSerializer):
    persona = serializers.PrimaryKeyRelatedField(queryset=Persona.objects.all(),required=False)
    class Meta:
        model = Reserva
        fields = [
            'persona', 'producto',
            'cantidad', 'estado'
        ]
        extra_kwargs = {
            'estado': {'read_only': True},
            'cantidad': {'min_value': 1}
        }

    def create(self, validated_data):
        producto = validated_data['producto']
        persona = validated_data.get('persona')
        
        # Lógica para calcular el precio según la persona
        validated_data['precio_unitario'] = producto.get_precio_para_persona(persona)
        validated_data['estado'] = 'pendiente'

        return super().create(validated_data)
