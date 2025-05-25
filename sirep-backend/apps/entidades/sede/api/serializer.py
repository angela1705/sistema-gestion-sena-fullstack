from rest_framework import serializers
from ..models import Sede
from apps.entidades.sena_empresa.api.serializer import SenaEmpresaCreateSerializer

class SedeSerializer(serializers.ModelSerializer):
    nombre_display = serializers.CharField(source='get_nombre_display', read_only=True)
    nombre_completo = serializers.CharField(read_only=True)
    sena_empresa_info = SenaEmpresaCreateSerializer(source='sena_empresa', read_only=True)
    
    class Meta:
        model = Sede
        fields = [
            'id', 'nombre', 'nombre_display', 'nombre_completo',
            'sena_empresa', 'sena_empresa_info', 'direccion',
            'telefono', 'responsable', 'activa', 'fecha_creacion'
        ]
        extra_kwargs = {
            'sena_empresa': {'write_only': True},
            'nombre': {'required': True}
        }

class SedeCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sede
        fields = [
            'nombre', 'sena_empresa', 'direccion',
            'telefono', 'responsable', 'activa'
        ]

    def validate_nombre(self, value):
        """Valida que el nombre de sede sea único para la empresa"""
        if self.instance and self.instance.nombre == value:
            return value
            
        if Sede.objects.filter(nombre=value).exists():
            raise serializers.ValidationError("Ya existe una sede con este nombre.")
        return value
    
class SedeShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sede
        fields = ['id', 'nombre', 'activa']
