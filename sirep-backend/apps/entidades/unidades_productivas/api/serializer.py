from rest_framework import serializers
from ..models import UnidadProductiva
from apps.usuarios.persona.api.serializer import PersonaResponsableSerializer
from apps.entidades.sede.api.serializer import SedeSerializer

class UnidadProductivaSerializer(serializers.ModelSerializer):
    # Campos de solo lectura para choices y propiedades
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    logo_url = serializers.SerializerMethodField()
    
    # Información detallada de relaciones
    encargado_info = PersonaResponsableSerializer(source='encargado', read_only=True)
    sede_info = SedeSerializer(source='sede', read_only=True)
    
    class Meta:
        model = UnidadProductiva
        fields = [
            'id', 'logo', 'logo_url', 'descripcion','activa' ,
            'tipo', 'tipo_display', 'encargado', 'encargado_info', 'sede',
            'sede_info', 'horario_atencion', 'fecha_creacion',
            'fecha_actualizacion'
        ]
        extra_kwargs = {
            'logo': {'write_only': True, 'required': False},
            'encargado': {'write_only': True},
            'sede': {'write_only': True},
        
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
             'logo', 'descripcion', 'tipo', 'activa' ,
            'encargado', 'sede', 'horario_atencion'
        ]

    def validate_tipo(self, value):
        if self.instance:  # si es una edición
            if UnidadProductiva.objects.exclude(pk=self.instance.pk).filter(tipo=value).exists():
                raise serializers.ValidationError("Ya existe una unidad productiva con este tipo.")
        else:  # si es una creación
            if UnidadProductiva.objects.filter(tipo=value).exists():
                raise serializers.ValidationError("Ya existe una unidad productiva con este tipo.")
        return value
