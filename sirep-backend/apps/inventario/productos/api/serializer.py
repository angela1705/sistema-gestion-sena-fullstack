from rest_framework import serializers
from ..models import Producto
from apps.inventario.categorias.api.serializer import TipoCategoriaSerializer
from apps.entidades.unidades_productivas.api.serializer import UnidadProductivaSerializer
from decimal import Decimal


class ProductoSerializer(serializers.ModelSerializer):
    categoria_info = TipoCategoriaSerializer(source='categoria', read_only=True)
    unidadP_info = UnidadProductivaSerializer(source='unidadP', read_only=True)
    
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    unidad_medida_display = serializers.CharField(source='get_unidad_medida_base_display', read_only=True)

    precio_final = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    disponible_para_reservas = serializers.BooleanField(read_only=True)
    imagen_url = serializers.SerializerMethodField()

    precios_personalizados = serializers.SerializerMethodField()
    precio_para_usuario = serializers.SerializerMethodField()

    comision = serializers.DecimalField(max_digits=5, decimal_places=2, required=False)
    unidad_comision_destino = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Producto
        fields = [
            'id', 'nombre', 'descripcion',
            'categoria', 'categoria_info',
            'unidadP', 'unidadP_info',
            'estado', 'estado_display',
            'stock', 'stock_actual',
            'reservas', 'hora_limite_reserva', 'max_reservas',
            'precio_compra', 'tiene_descuento',
            'porcentaje_descuento', 'precio_descuento',
            'precio_final', 'precio_para_usuario', 'precios_personalizados',
            'disponible_para_reservas',
            'imagen', 'imagen_url',
            'unidad_medida_base', 'unidad_medida_display','tiene_comision','comision',
             'unidad_comision_destino'
        ]
        read_only_fields = ['id', 'precio_descuento', 'precio_final']
        extra_kwargs = {
            'categoria': {'write_only': True},
            'unidadP': {'write_only': True},
            'imagen': {'required': False},
            'precio_compra': {
                'min_value': Decimal('0.01'),
                'max_digits': 10,
                'decimal_places': 2
            },
            'porcentaje_descuento': {
                'min_value': 0,
                'max_value': 100
            }
        }

    def get_imagen_url(self, obj):
        request = self.context.get('request')
        if obj.imagen and request:
            return request.build_absolute_uri(obj.imagen.url)
        return None

    def get_precios_personalizados(self, obj):
        from apps.inventario.precios.api.serializer import PrecioSerializer  
        precios = obj.precio_set.all()
        return PrecioSerializer(precios, many=True).data

    def get_precio_para_usuario(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            cargo = getattr(request.user, 'cargo', None)
            if cargo:
                precio_personalizado = obj.precio_set.filter(cargo=cargo).first()
                if precio_personalizado:
                    return precio_personalizado.valor
        return obj.precio_final

    def validate(self, data):
        # Validaciones adicionales coherentes con el modelo
        stock = data.get('stock', getattr(self.instance, 'stock', None))
        stock_actual = data.get('stock_actual', getattr(self.instance, 'stock_actual', None))
        reservas = data.get('reservas', getattr(self.instance, 'reservas', None))
        hora_limite = data.get('hora_limite_reserva', getattr(self.instance, 'hora_limite_reserva', None))
        max_reservas = data.get('max_reservas', getattr(self.instance, 'max_reservas', None))

        if stock and stock_actual is None:
            raise serializers.ValidationError({'stock_actual': 'Debe especificar el stock actual.'})
        if not stock and stock_actual is not None:
            raise serializers.ValidationError({'stock_actual': 'No debe tener stock si no lo gestiona.'})

        if reservas:
            if not hora_limite:
                raise serializers.ValidationError({'hora_limite_reserva': 'Debe establecer una hora límite.'})
            if not max_reservas:
                raise serializers.ValidationError({'max_reservas': 'Debe establecer el máximo de reservas.'})
        else:
            if hora_limite:
                raise serializers.ValidationError({'hora_limite_reserva': 'No debe tener hora límite si no permite reservas.'})
            if max_reservas:
                raise serializers.ValidationError({'max_reservas': 'No debe tener máximo de reservas si no permite reservas.'})

        if data.get('tiene_descuento') and not data.get('porcentaje_descuento'):
            raise serializers.ValidationError({'porcentaje_descuento': 'Debe indicar el porcentaje si hay descuento.'})
        
        # --- Validación específica para comisión ---
        request = self.context['request']
        user = request.user

        # Extraemos la unidad productiva que está siendo asignada al producto
        unidadP = data.get('unidadP', getattr(self.instance, 'unidadP', None))
        es_lider = hasattr(user, 'rol') and user.rol and user.rol.nombre == 'liderup'

        # Verificamos si es el líder de "Tienda Yamboro"
        es_lider_tienda_yamboro = (
             es_lider and unidadP and unidadP.nombre.strip().lower() == 'tienda yamboro'
         )

        if not es_lider_tienda_yamboro:
        # Si NO es líder de Tienda Yamboro, no debe poder enviar esos campos
            if 'comision' in data or 'unidad_comision_destino' in data:
               raise serializers.ValidationError({
                'detalle': 'Solo el líder de Tienda Yamboro puede definir comisiones.'
            })

        else:
        # Si es líder de Tienda Yamboro y pone comisión, debe definir unidad destino
            if data.get('comision', 0) > 0 and not data.get('unidad_comision_destino'):
                raise serializers.ValidationError({
                'unidad_comision_destino': 'Debes indicar la unidad que recibirá la comisión.'
            })

        return data

     
        
    
class ProductoSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'precio_final']



class ProductoCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = [
            'nombre', 'descripcion', 'categoria', 'unidadP',
            'estado', 'stock', 'stock_actual',
            'reservas', 'hora_limite_reserva', 'max_reservas',
            'precio_compra', 'tiene_descuento',
            'porcentaje_descuento', 'imagen',
            'unidad_medida_base','tiene_comision','comision','unidad_comision_destino'
        ]
        extra_kwargs = {
            'imagen': {'required': False},
            'precio_compra': {
                'min_value': Decimal('0.01'),
                'max_digits': 10,
                'decimal_places': 2
            },
            'porcentaje_descuento': {
                'min_value': 0,
                'max_value': 100
            },
            'comision': {
                'required':False,
                'min_value': 0,
                'max_value': 100
            },
            'unidad_comision_destino':{'required':False}
        }
