from rest_framework import serializers
from ..models import Producto
from apps.inventario.categorias.api.serializer import TipoCategoriaSerializer
from apps.entidades.unidades_productivas.api.serializer import UnidadProductivaSerializer
from decimal import Decimal


class ProductoSerializer(serializers.ModelSerializer):
    
    categoria_info = TipoCategoriaSerializer(source='categoria', read_only=True)
    unidadP_info = UnidadProductivaSerializer(source='unidadP', read_only=True)
    precio_final = serializers.DecimalField(max_digits=10,decimal_places=2,read_only=True)
    
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    tipo_gestion_display = serializers.CharField(source='get_tipo_gestion_display', read_only=True)
    unidad_medida_display = serializers.CharField(source='get_unidad_medida_base_display', read_only=True)
    
    imagen_url = serializers.SerializerMethodField()
    precios_personalizados = serializers.SerializerMethodField()
    precio_para_usuario = serializers.SerializerMethodField()

    class Meta:
        model = Producto
        fields = [
            'id', 'nombre', 'descripcion',
            'categoria', 'categoria_info',
            'unidadP', 'unidadP_info',
            'estado', 'estado_display',
            'tipo_gestion', 'tipo_gestion_display',
            'reservas', 'hora_limite_reserva',
            'stock_actual', 'capacidad_diaria',
            'precio_compra', 'tiene_descuento',
            'porcentaje_descuento', 'precio_descuento',
            'precio_final', 'imagen', 'imagen_url',
            'unidad_medida_base', 'unidad_medida_display',
            'precios_personalizados','precio_para_usuario' 
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
            }
        }

    def get_imagen_url(self, obj):
        if obj.imagen and hasattr(obj.imagen, 'url'):
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.imagen.url)
            return obj.imagen.url
        return None

    def validate(self, data):
        """Validaciones personalizadas"""
        if data.get('tipo_gestion') == 'stock' and data.get('stock_actual') is None:
            raise serializers.ValidationError(
                {'stock_actual': 'Este campo es requerido para gestión por stock'}
            )
            
        if data.get('tiene_descuento', False) and not data.get('porcentaje_descuento'):
            raise serializers.ValidationError(
                {'porcentaje_descuento': 'Este campo es requerido cuando hay descuento'}
            )
            
        return data
    def get_precios_personalizados(self, obj):
        """Devuelve todos los precios personalizados para este producto"""
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

    
class ProductoSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'precio_final']



class ProductoCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = [
            'nombre', 'descripcion', 'categoria', 'unidadP',
            'estado', 'tipo_gestion', 'reservas', 'hora_limite_reserva',
            'stock_actual', 'capacidad_diaria', 'precio_compra',
            'tiene_descuento', 'porcentaje_descuento', 'imagen',
            'unidad_medida_base'
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
            }
        }