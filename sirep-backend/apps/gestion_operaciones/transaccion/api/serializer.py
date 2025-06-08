from rest_framework import serializers
from ..models import Transaccion, TipoTransaccion
from apps.inventario.productos.api.serializer import ProductoSerializer
from apps.usuarios.persona.api.serializer import PersonaSerializer

class TransaccionSerializer(serializers.ModelSerializer):
    # Campos relacionados (solo lectura)
    producto_info = ProductoSerializer(source='producto', read_only=True)
    usuario_info = PersonaSerializer(source='usuario', read_only=True)
    transaccion_revertida_id = serializers.IntegerField(source='transaccion_revertida.id',read_only=True)
    # Campos para choices
    tipo_display = serializers.CharField(source='get_tipo_display',read_only=True)
    
    # Validación del tipo
    tipo = serializers.ChoiceField(choices=TipoTransaccion.choices,default=TipoTransaccion.VENTA)
    

    class Meta:
        model = Transaccion
        fields = [
            'id', 'tipo', 'tipo_display',
            'producto', 'producto_info',
            'cantidad', 'fecha','transaccion_revertida_id', 
            'usuario', 'usuario_info'
        ]
        read_only_fields = [
            'id', 'fecha', 'tipo_display',
            'producto_info', 'usuario_info'
        ]
        extra_kwargs = {
            'producto': {'write_only': True},
            'usuario': {
                'write_only': True,
                'required': False
            },
            'cantidad': {
                'min_value': 1
            }
        }

    def validate(self, data):
        """Validaciones personalizadas"""
        producto = data.get('producto') or self.instance.producto if self.instance else None
        cantidad = data.get('cantidad')
        tipo = data.get('tipo')
        
        # Validar si el producto está activo
        if producto:
            if hasattr(producto, 'activo') and not producto.activo:
                raise serializers.ValidationError("No se pueden registrar transacciones con productos inactivos")

        # Validar stock para ventas y devoluciones
        if producto and cantidad and tipo:
            if tipo == TipoTransaccion.VENTA:
                if producto.stock_actual is not None and producto.stock_actual < cantidad:
                    raise serializers.ValidationError(
                    f"Stock insuficiente. Disponible: {producto.stock_actual}"
                )

            if tipo == TipoTransaccion.DEVOLUCION:
                if producto.stock_actual is not None:
                    ventas_previas = Transaccion.objects.filter(
                    producto=producto,
                    tipo=TipoTransaccion.VENTA
                    ).count()
                    if cantidad > ventas_previas:
                        raise serializers.ValidationError(
                        f"No se pueden devolver {cantidad} unidades si solo se han vendido {ventas_previas}"
                    )

        return data


class TransaccionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaccion
        fields = [
            'tipo', 'producto',
            'cantidad', 'usuario'
        ]
        extra_kwargs = {
            'usuario': {'required': False},
            'cantidad': {'min_value': 1}
        }

    def create(self, validated_data):
        # Asignar usuario automáticamente si no se especifica
        if not validated_data.get('usuario'):
            request = self.context.get('request')
            if request and request.user.is_authenticated:
                validated_data['usuario'] = request.user

        
        # Ejecutar la transacción
        transaccion = super().create(validated_data)
        
        # Actualizar stock si corresponde
        if transaccion.producto.tipo_gestion == 'stock'and transaccion.producto.stock_actual is not None:
            if transaccion.tipo == TipoTransaccion.VENTA:
                transaccion.producto.stock_actual -= transaccion.cantidad
            elif transaccion.tipo == TipoTransaccion.COMPRA:
                transaccion.producto.stock_actual += transaccion.cantidad
            elif transaccion.tipo == TipoTransaccion.DEVOLUCION:
                transaccion.producto.stock_actual += transaccion.cantidad
            
            transaccion.producto.save()
        return transaccion
    
       
    

    




