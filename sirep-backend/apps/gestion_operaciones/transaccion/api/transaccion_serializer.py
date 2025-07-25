from rest_framework import serializers
from apps.gestion_operaciones.transaccion.models import Transaccion, DetalleTransaccion
from apps.inventario.productos.models import Producto
from apps.usuarios.persona.models import Persona
from apps.gestion_operaciones.caja_diaria.models import CajaDiaria
from apps.entidades.unidades_productivas.models import UnidadProductiva
from apps.gestion_operaciones.detalle_caja.models import DetalleCaja, Tipo

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
    producto_id = serializers.IntegerField(required=False)
    nombre_producto = serializers.CharField(required=False)
    cantidad = serializers.IntegerField(min_value=1)
    precio_unitario = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False
    ) 

    def validate(self, data):
        tipo = self.context['tipo']
        if tipo == Transaccion.VENTA:
            if not data.get('producto_id'):
                raise serializers.ValidationError("Se requiere producto_id para ventas.")
            if 'precio_unitario' in data:
                raise serializers.ValidationError("No debe enviarse precio_unitario en ventas.")
        elif tipo == Transaccion.COMPRA:
            if not data.get('nombre_producto'):
                raise serializers.ValidationError("Se requiere nombre_producto en compras.")
            if 'precio_unitario' not in data:
                raise serializers.ValidationError("Se requiere precio_unitario en compras.")
        return data 

class TransaccionCreateSerializer(serializers.ModelSerializer):
    productos = ProductoTransaccionSerializer(many=True)
    persona_id = serializers.IntegerField(required=False)
    unidad_productiva_id = serializers.IntegerField(required=False)
    tipo = serializers.ChoiceField(choices=Transaccion.TIPO_CHOICES)

    class Meta:
        model = Transaccion
        fields = ['tipo', 'productos', 'persona_id', 'unidad_productiva_id']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Añadir el tipo al contexto del serializer hijo
        initial_data = kwargs.get('data')
        if initial_data and 'tipo' in initial_data:
            tipo = initial_data['tipo']
            self.fields['productos'].child.context.update({'tipo': tipo})

    def validate(self, data):
        request = self.context['request']
        usuario = request.user
        tipo = data['tipo']
        productos_validos = []

        # Validar y limpiar productos usando el serializer hijo
        productos_serializer = ProductoTransaccionSerializer(
            data=data['productos'],
            many=True,
            context={'tipo': tipo})
        
        productos_serializer.is_valid(raise_exception=True)
        productos_data = productos_serializer.validated_data

        if tipo == Transaccion.VENTA:
            # Intentar obtener caja abierta
            caja_abierta = CajaDiaria.objects.filter(
                abierta_por=usuario, fecha_cierre__isnull=True
            ).order_by('-fecha_apertura').first()

            if caja_abierta:
                unidad_caja = caja_abierta.unidadProductiva
                data['caja_diaria'] = caja_abierta
                data['persona'] = None
            else:
                unidad_caja = None
                data['caja_diaria'] = None

            tiendaY_obligatoria = False

            for item in productos_data:
                producto_id = item['producto_id']
                cantidad = item['cantidad']

                try:
                    producto = Producto.objects.get(id=producto_id)
                except Producto.DoesNotExist:
                    raise serializers.ValidationError(f"Producto con ID {producto_id} no encontrado.")

                if producto.unidadP and producto.unidadP.nombre == "Tienda Yamboro":
                    tiendaY_obligatoria = True

                if caja_abierta and producto.unidadP != unidad_caja:
                    raise serializers.ValidationError(
                    f"El producto '{producto}' no pertenece a la unidad de la caja abierta."
                )

                if producto.stock and producto.stock_actual is not None:
                    if producto.stock_actual < cantidad:
                        raise serializers.ValidationError(
                        f"Stock insuficiente para '{producto.nombre}'. Quedan {producto.stock_actual} unidades."
                    )

                productos_validos.append({
                    'producto': producto,
                    'cantidad': cantidad})

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
            # Verificar caja abierta
            caja_abierta = CajaDiaria.objects.filter(
                abierta_por=usuario, fecha_cierre__isnull=True
            ).order_by('-fecha_apertura').first()

            if caja_abierta:
                data['caja_diaria'] = caja_abierta
                data['persona'] = usuario
            else:
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
                nombre_producto = item['nombre_producto']
                cantidad = item['cantidad']
                precio_unitario = item['precio_unitario']

                producto = Producto.objects.create(nombre=nombre_producto,descripcion=f"Compra de {nombre_producto}",
                           stock=False,stock_actual=None,reservas=False,hora_limite_reserva=None,max_reservas=None,
                           precio_compra=precio_unitario,unidadP=data.get("unidad_productiva"))
                productos_validos.append({
                    'producto': producto,
                    'cantidad': cantidad,
                    'precio_unitario': precio_unitario})

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

        if tipo == Transaccion.COMPRA and caja_diaria:
            total_compra = sum(item['precio_unitario'] * item['cantidad'] for item in productos)
            if caja_diaria.saldo_final is not None and total_compra > caja_diaria.saldo_final:
                raise serializers.ValidationError("Saldo insuficiente en caja para registrar esta compra.")

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

        if caja_diaria:
            if caja_diaria.saldo_final is None:
                caja_diaria.saldo_final = caja_diaria.saldo_inicial

            if tipo == Transaccion.COMPRA:
                caja_diaria.saldo_final -= monto_total

            elif tipo == Transaccion.VENTA:
                caja_diaria.saldo_final += monto_total

            caja_diaria.save()

            tipo_detalle = Tipo.INGRESO if tipo == Transaccion.VENTA else Tipo.EGRESO
            DetalleCaja.objects.create(
                caja=caja_diaria,
                transaccion=transaccion,
                descripcion=f"{'Venta' if tipo == Transaccion.VENTA else 'Compra'} registrada",
                tipo=tipo_detalle,
                monto=monto_total)

        return transaccion
