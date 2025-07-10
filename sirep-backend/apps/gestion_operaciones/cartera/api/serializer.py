from rest_framework import serializers
from ..models import DetalleCartera, AbonoCartera
from apps.entidades.unidades_productivas.models import UnidadProductiva
from decimal import Decimal 

class AbonoCarteraSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='usuario.get_full_name', read_only=True)

    def validate_valor(self, value):
        if value <= 0:
           raise serializers.ValidationError("El valor del abono debe ser positivo")
        return value
    
    class Meta:
        model = AbonoCartera
        fields = ['id', 'valor', 'fecha', 'observaciones', 'usuario', 'usuario_nombre']
        read_only_fields = ['usuario', 'fecha']

class DetalleCarteraSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    persona_nombre = serializers.CharField(source='persona.get_full_name', read_only=True)
    unidad_productiva_nombre = serializers.CharField(source='unidad_productiva.nombre', read_only=True)
    abonos = AbonoCarteraSerializer(many=True, read_only=True)
    total_pendiente = serializers.SerializerMethodField()

    def get_total_pendiente(self, obj):
        total_abonado = sum((abono.valor for abono in obj.abonos.all()), Decimal('0.00'))
        return max(Decimal('0.00'), obj.saldo - total_abonado)

    
    class Meta:
        model = DetalleCartera
        fields = [
            'id', 'persona', 'persona_nombre', 'producto', 'producto_nombre',
            'unidad_productiva', 'unidad_productiva_nombre', 'cantidad',
            'precio_unitario', 'valor_total', 'abono_inicial', 'saldo',
            'fecha', 'observaciones', 'abonos',  'total_pendiente'
        ]
        read_only_fields = [
            'precio_unitario', 'valor_total', 'saldo', 'abonos'
        ]
    
    def validate(self, data):
        producto = data.get('producto')
        cantidad = data.get('cantidad', 1)
        
        if producto.stock and producto.stock_actual < cantidad:
            raise serializers.ValidationError(
                f"No hay suficiente stock. Disponible: {producto.stock_actual}"
            )
            
        return data
    
    def create(self, validated_data):
        producto = validated_data['producto']
        if producto.stock:
            producto.stock_actual -= validated_data['cantidad']
            producto.save()
        
        detalle = DetalleCartera.objects.create(**validated_data)
        return detalle

class ResumenDeudasSerializer(serializers.Serializer):
    persona_id = serializers.IntegerField(source='persona')
    persona_nombre = serializers.CharField(source='persona__first_name')
    persona_apellido = serializers.CharField(source='persona__last_name')
    total_deuda = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0.00'))
    total_fiado = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0.00'))
    total_abonado = serializers.DecimalField(max_digits=10, decimal_places=2 ,min_value=Decimal('0.00'))
    cantidad_fiados = serializers.IntegerField()
    unidad_productiva_id = serializers.IntegerField(source='unidad_productiva', required=False)
    unidad_productiva_nombre = serializers.CharField(source='unidad_productiva__nombre', required=False)

class UnidadProductivaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnidadProductiva
        fields = ['id', 'nombre', 'direccion']