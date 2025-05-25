from rest_framework import serializers
from ..models import UnidadProductiva
from apps.usuarios.persona.api.serializer import PersonaResponsableSerializer
from apps.entidades.sede.api.serializer import SedeSerializer

class UnidadProductivaSerializer(serializers.ModelSerializer):
    # Campos de solo lectura para choices y propiedades
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    esta_activa = serializers.BooleanField(read_only=True)
    logo_url = serializers.SerializerMethodField()
    
    # Información detallada de relaciones
    encargado_info = PersonaResponsableSerializer(source='encargado', read_only=True)
    sede_info = SedeSerializer(source='sede', read_only=True)
    
    class Meta:
        model = UnidadProductiva
        fields = [
            'id', 'nombre', 'logo', 'logo_url', 'descripcion',
            'tipo', 'tipo_display', 'estado', 'estado_display',
            'esta_activa', 'encargado', 'encargado_info', 'sede',
            'sede_info', 'horario_atencion', 'fecha_creacion',
            'fecha_actualizacion'
        ]
        extra_kwargs = {
            'logo': {'write_only': True, 'required': False},
            'encargado': {'write_only': True},
            'sede': {'write_only': True},
            'nombre': {'required': True}
        }

    def get_logo_url(self, obj):
        """Genera URL absoluta para el logo"""
        if obj.logo and hasattr(obj.logo, 'url'):
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None

class UnidadProductivaCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnidadProductiva
        fields = [
            'nombre', 'logo', 'descripcion', 'tipo', 'estado',
            'encargado', 'sede', 'horario_atencion'
        ]

    def validate_nombre(self, value):
        """Valida que el nombre sea único"""
        if self.instance and self.instance.nombre == value:
            return value
            
        if UnidadProductiva.objects.filter(nombre=value).exists():
            raise serializers.ValidationError("Ya existe una unidad productiva con este nombre.")
        return value

    