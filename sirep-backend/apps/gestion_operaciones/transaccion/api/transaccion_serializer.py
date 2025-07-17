from rest_framework import serializers
from apps.gestion_operaciones.transaccion.models import Transaccion, DetalleTransaccion
from apps.inventario.productos.models import Producto
from apps.usuarios.persona.models import Persona
from apps.gestion_operaciones.caja_diaria.models import CajaDiaria
from apps.entidades.unidades_productivas.models import UnidadProductiva

# SERIALIZER PARA CADA PRODUCTO DE UNA TRANSACCIÓN (DETALLE)
class DetalleTransaccionSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)

    class Meta:
        model = DetalleTransaccion
        fields = ['producto', 'producto_nombre', 'cantidad', 'precio_unitario', 'subtotal']
    
    def validate(self, data):
        transaccion = data.get('transaccion')
        tipo = transaccion.tipo if transaccion else None
        producto = data.get('producto')
        nombre_producto = data.get('nombre_producto')

        if tipo == 'venta':
            if not producto:
                raise serializers.ValidationError("Debes seleccionar un producto para una venta.")
            if nombre_producto:
                raise serializers.ValidationError("No debes ingresar un nombre de producto libre en una venta.")
        
        elif tipo == 'compra':
            if not nombre_producto:
                raise serializers.ValidationError("Debes ingresar el nombre del producto en una compra.")
            if producto:
                raise serializers.ValidationError("No debes seleccionar un producto del sistema en una compra.")

        return data

class TransaccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaccion
        fields = ['id', 'tipo', 'monto_total', 'fecha']

# SERIALIZER PARA CONSULTAR DETALLE DE UNA TRANSACCIÓN COMPLETA
class TransaccionDetailSerializer(serializers.ModelSerializer):
    detalles = DetalleTransaccionSerializer(many=True, read_only=True)
    usuario_nombre = serializers.CharField(source='usuario.get_full_name', read_only=True)

    class Meta:
        model = Transaccion
        fields = ['id', 'tipo', 'usuario_nombre', 'fecha', 'monto_total', 'detalles']


# SERIALIZER PARA CREAR UNA TRANSACCIÓN (VENTA O COMPRA)
class ProductoTransaccionSerializer(serializers.Serializer):
    producto_id = serializers.IntegerField()
    cantidad = serializers.IntegerField(min_value=1)
    precio_unitario = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False
    )  # Solo requerido en compras

class TransaccionCreateSerializer(serializers.ModelSerializer):
    productos = ProductoTransaccionSerializer(many=True)
    persona_id = serializers.IntegerField(required=False)
    unidad_productiva_id = serializers.IntegerField(required=False)
    tipo = serializers.ChoiceField(choices=Transaccion.TIPO_CHOICES)

    class Meta:
        model = Transaccion
        fields = ['tipo', 'productos', 'persona_id', 'unidad_productiva_id']

    def validate(self, data):
        request = self.context['request']
        usuario = request.user
        tipo = data['tipo']
        productos_data = data['productos']
        productos_validos = []

        if tipo == Transaccion.VENTA:
            try:
                try:
                    caja_abierta = CajaDiaria.objects.filter(abierta_por=usuario, fecha_cierre__isnull=True).order_by('-fecha_apertura').first()
                except CajaDiaria.DoesNotExist:
                    raise serializers.ValidationError("No hay una caja abierta para este usuario.")
                data['caja_diaria'] = caja_abierta
                data['persona'] = None
                unidad_caja = caja_abierta.unidadProductiva
            except CajaDiaria.DoesNotExist:
                caja_abierta = None
                data['caja_diaria'] = None
                unidad_caja = None

            tiendaY_obligatoria = False

            for item in productos_data:
                try:
                    producto = Producto.objects.get(id=item['producto_id'])
                except Producto.DoesNotExist:
                    raise serializers.ValidationError(f"Producto con ID {item['producto_id']} no encontrado.")

                if producto.unidadP and producto.unidadP.nombre == "Tienda Yamboro":
                    tiendaY_obligatoria = True

                if caja_abierta and producto.unidadP != unidad_caja:
                    raise serializers.ValidationError(
                        f"El producto '{producto}' no pertenece a la unidad de la caja abierta."
                    )

                if producto.stock and producto.stock_actual is not None:
                    if producto.stock_actual < item['cantidad']:
                        raise serializers.ValidationError(
                            f"Stock insuficiente para '{producto.nombre}'. Quedan {producto.stock_actual} unidades."
                        )

                productos_validos.append({
                    'producto': producto,
                    'cantidad': item['cantidad']
                })

            if tiendaY_obligatoria and not caja_abierta:
                raise serializers.ValidationError("Debe abrir caja para registrar ventas de la Tienda Yamboro.")

            if not caja_abierta and not data.get('persona_id') and not tiendaY_obligatoria:
                raise serializers.ValidationError("Debe proporcionar persona_id si no hay caja activa.")

            if not caja_abierta and data.get('persona_id'):
                try:
                    persona = Persona.objects.get(id=data['persona_id'])
                    data['persona'] = persona
                except Persona.DoesNotExist:
                    raise serializers.ValidationError("La persona no existe.")

        elif tipo == Transaccion.COMPRA:
            try:
                caja_abierta = CajaDiaria.objects.get(usuario=usuario, cerrada=False)
                data['caja_diaria'] = caja_abierta
                data['persona'] = usuario
            except CajaDiaria.DoesNotExist:
                data['caja_diaria'] = None
                data['persona'] = usuario

                unidad_id = self.initial_data.get("unidad_productiva_id")
                if not unidad_id:
                    raise serializers.ValidationError("Debe indicar la unidad productiva donde se hizo la compra.")
                try:
                    data['unidad_productiva'] = UnidadProductiva.objects.get(id=unidad_id)
                except UnidadProductiva.DoesNotExist:
                    raise serializers.ValidationError("Unidad productiva inválida.")

            for item in productos_data:
                try:
                    producto = Producto.objects.get(id=item['producto_id'])
                except Producto.DoesNotExist:
                    raise serializers.ValidationError(f"Producto con ID {item['producto_id']} no encontrado.")

                if 'precio_unitario' not in item:
                    raise serializers.ValidationError(
                        f"Debe proporcionar el 'precio_unitario' para el producto '{producto.nombre}'."
                    )

                productos_validos.append({
                    'producto': producto,
                    'cantidad': item['cantidad'],
                    'precio_unitario': item['precio_unitario']
                })

        else:
            raise serializers.ValidationError("Tipo de transacción inválido.")

        data['productos_validos'] = productos_validos
        return data

    def create(self, validated_data):
        tipo = validated_data['tipo']
        persona = validated_data['persona']
        caja_diaria = validated_data['caja_diaria']
        productos = validated_data['productos_validos']

        transaccion = Transaccion.objects.create(
            tipo=tipo,
            usuario=persona,
            caja_diaria=caja_diaria
        )

        monto_total = 0

        for item in productos:
            producto = item['producto']
            cantidad = item['cantidad']

            if tipo == Transaccion.VENTA:
                precio_unitario = producto.get_precio_para_persona(persona)
                if producto.stock and producto.stock_actual is not None:
                    producto.stock_actual -= cantidad
                    producto.save()
            else:  # COMPRA
                precio_unitario = item['precio_unitario']

            subtotal = precio_unitario * cantidad
            monto_total += subtotal

            DetalleTransaccion.objects.create(
                transaccion=transaccion,
                producto=producto,
                cantidad=cantidad,
                precio_unitario=precio_unitario,
                subtotal=subtotal
            )

        transaccion.monto_total = monto_total
        transaccion.save()

        if tipo == Transaccion.COMPRA and caja_diaria:
            if caja_diaria.saldo_final < monto_total:
                raise serializers.ValidationError("Saldo insuficiente en la caja para registrar la compra.")
            caja_diaria.saldo_final -= monto_total
            caja_diaria.save()

        return transaccion
