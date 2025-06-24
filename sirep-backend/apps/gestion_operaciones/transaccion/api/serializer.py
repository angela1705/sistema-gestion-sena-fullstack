from rest_framework import serializers
from ..models import Transaccion
from apps.inventario.productos.api.serializer import ProductoSerializer
from apps.usuarios.persona.api.serializer import PersonaSerializer
from apps.gestion_operaciones.caja_diaria.models import CajaDiaria

class TransaccionSerializer(serializers.ModelSerializer):
    producto_info = ProductoSerializer(source='producto', read_only=True)
    usuario_info = PersonaSerializer(source='usuario', read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)

    class Meta:
        model = Transaccion
        fields = [
            'id', 'tipo', 'tipo_display',
            'producto', 'producto_info',
            'nombre_producto', 'cantidad',
            'monto_venta', 'costo',
            'fecha', 'usuario', 'usuario_info'
        ]
        read_only_fields = [
            'id', 'fecha', 'producto_info', 'usuario_info', 'tipo_display'
        ]
        extra_kwargs = {
            'usuario': {'required': False},
            'cantidad': {'min_value': 1},
            'producto': {'required': False},
        }

    def validate(self, data):
        tipo = data.get('tipo')
        request = self.context.get('request')
        usuario = getattr(request.user, 'persona', None)

        if not usuario:
            raise serializers.ValidationError("No se pudo identificar al usuario actual.")

        unidad = usuario.unidadP
        caja_abierta = CajaDiaria.objects.filter(unidadProductiva=unidad, fecha_cierre__isnull=True).last()

        if not caja_abierta:
            raise serializers.ValidationError("No hay una caja diaria abierta en tu unidad productiva.")

        self.context['caja_abierta'] = caja_abierta

        if tipo == Transaccion.VENTA:
            if not data.get('producto'):
                raise serializers.ValidationError({"producto": "Debe seleccionar un producto para una venta."})
            if not data.get('monto_venta'):
                raise serializers.ValidationError({"monto_venta": "Debe ingresar el monto total de la venta."})
            if not data.get('cantidad'):
                raise serializers.ValidationError({"cantidad": "Debe ingresar una cantidad."})

            producto = data['producto']
            if producto.stock_actual is not None and producto.stock_actual < data['cantidad']:
                raise serializers.ValidationError({
                    "cantidad": f"Stock insuficiente. Disponible: {producto.stock_actual}"
                })

        elif tipo == Transaccion.COMPRA:
            if not data.get('nombre_producto'):
                raise serializers.ValidationError({"nombre_producto": "Debe ingresar el nombre del producto para una compra."})
            if not data.get('costo'):
                raise serializers.ValidationError({"costo": "Debe especificar el costo de la compra."})
            if not data.get('cantidad'):
                raise serializers.ValidationError({"cantidad": "Debe ingresar una cantidad."})

        else:
            raise serializers.ValidationError({"tipo": "Tipo de transacción no permitido."})

        return data

    def create(self, validated_data):
        request = self.context.get('request')
        usuario = validated_data.get('usuario') or getattr(request.user, 'persona', None)
        validated_data['usuario'] = usuario

        unidad = usuario.unidadP
        caja_abierta = CajaDiaria.objects.filter(unidadProductiva=unidad, fecha_cierre__isnull=True).last()

        if not caja_abierta:
            raise serializers.ValidationError("No hay una caja abierta para esta unidad productiva.")

        validated_data['caja_diaria'] = caja_abierta

        transaccion = super().create(validated_data)

        # Actualizar stock si es venta
        if transaccion.tipo == Transaccion.VENTA and transaccion.producto:
            transaccion.producto.stock_actual -= transaccion.cantidad
            transaccion.producto.save()

        # Si es compra, restar del saldo final
        if transaccion.tipo == Transaccion.COMPRA:
            if caja_abierta.saldo_final is None:
                caja_abierta.saldo_final = caja_abierta.saldo_inicial
            caja_abierta.saldo_final -= transaccion.costo
            caja_abierta.save()

        # Crear detalle de caja
        from apps.gestion_operaciones.detalle_caja.models import DetalleCaja, Tipo
        DetalleCaja.objects.create(
            caja=caja_abierta,
            transaccion=transaccion,
            tipo=Tipo.INGRESO if transaccion.tipo == Transaccion.VENTA else Tipo.EGRESO,
            monto=transaccion.monto_venta if transaccion.tipo == Transaccion.VENTA else transaccion.costo
        )

        return transaccion
