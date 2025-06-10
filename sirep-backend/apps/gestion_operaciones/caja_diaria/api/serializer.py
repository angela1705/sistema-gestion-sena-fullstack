from rest_framework import serializers
from ..models import CajaDiaria
from apps.entidades.unidades_productivas.api.serializer import UnidadProductivaSerializer
from apps.usuarios.persona.api.serializer import PersonaSerializer

class CajaDiariaSerializer(serializers.ModelSerializer):
    # Campos relacionados (solo lectura)
    unidadProductiva_info = UnidadProductivaSerializer(
        source='unidadProductiva', 
        read_only=True
    )
    abierta_por_info = PersonaSerializer(
        source='abierta_por',
        read_only=True
    )
    cerrada_por_info = PersonaSerializer(
        source='cerrada_por',
        read_only=True
    )
    
    # Campos calculados
    esta_abierta = serializers.BooleanField(
        read_only=True
    )
    
    # Duración calculada
    duracion = serializers.SerializerMethodField()

    class Meta:
        model = CajaDiaria
        fields = [
            'id',
            'fecha_apertura',
            'fecha_cierre',
            'duracion',
            'saldo_inicial',
            'saldo_final',
            'unidadProductiva',
            'unidadProductiva_info',
            'abierta_por',
            'abierta_por_info',
            'cerrada_por',
            'cerrada_por_info',
            'observaciones',
            'esta_abierta'
        ]
        read_only_fields = [
            'id',
            'fecha_apertura',
            'abierta_por',
            'esta_abierta',
            'duracion'
        ]
        extra_kwargs = {
            'unidadProductiva': {'write_only': True},
            'saldo_inicial': {
                'min_value': 0,
                'max_digits': 10,
                'decimal_places': 2
            },
            'saldo_final': {
                'min_value': 0,
                'max_digits': 10,
                'decimal_places': 2,
                'required': False
            }
        }

    def get_duracion(self, obj):
        """Calcula la duración en horas/minutos"""
        if obj.fecha_cierre:
            delta = obj.fecha_cierre - obj.fecha_apertura
            total_segundos = delta.total_seconds()
            horas = int(total_segundos // 3600)
            minutos = int((total_segundos % 3600) // 60)
            return f"{horas}h {minutos}m"
        return None

    def validate(self, data):
        """Validaciones personalizadas"""
        # Validar que no haya cajas abiertas para la misma unidad productiva
        if self.instance is None:  # Solo al crear
            unidad = data.get('unidadProductiva')
            if unidad and CajaDiaria.objects.filter(
                unidadProductiva=unidad,
                fecha_cierre__isnull=True
            ).exists():
                raise serializers.ValidationError(
                    "Ya existe una caja abierta para esta unidad productiva"
                )
        
        # Validar que saldo_final >= 0 si se está cerrando
        if 'fecha_cierre' in data and data['fecha_cierre'] is not None:
            if 'saldo_final' not in data or data['saldo_final'] is None:
                raise serializers.ValidationError(
                    "Debe especificar el saldo final al cerrar la caja"
                )
        
        return data


class CajaDiariaAperturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CajaDiaria
        fields = [
            'unidadProductiva',
            'saldo_inicial',
            'observaciones'
        ]
        extra_kwargs = {
            'saldo_inicial': {
                'required': True,
                'min_value': 0
            }
        }


class CajaDiariaCierreSerializer(serializers.ModelSerializer):
    class Meta:
        model = CajaDiaria
        fields = [
            'saldo_final',
            'observaciones'
        ]
        extra_kwargs = {
            'saldo_final': {
                'required': True,
                'min_value': 0
            },
            'observaciones': {
                'required': False
            }
        }