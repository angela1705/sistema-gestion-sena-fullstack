from rest_framework import serializers
from ..models import SenaEmpresa
from django.urls import reverse

class SenaEmpresaSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    sedes_activas = serializers.SerializerMethodField()
    detail_url = serializers.HyperlinkedIdentityField(view_name='senaempresa-detail')

    class Meta:
        model = SenaEmpresa
        fields = [
            'id', 'nombre', 'nit', 'direccion_principal', 
            'telefono_contacto', 'email_contacto', 'logo', 
            'logo_url', 'fecha_creacion', 'activa',
            'sedes_activas', 'detail_url'
        ]
        extra_kwargs = {
            'logo': {'write_only': True, 'required': False},
            'nit': {'required': True},
        }

    def get_logo_url(self, obj):
        if obj.logo and hasattr(obj.logo, 'url'):
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None

    def get_sedes_activas(self, obj):
        from apps.entidades.sede.api.serializer import SedeShortSerializer  
        return SedeShortSerializer (obj.sedes_activas, many=True, context=self.context).data


class SenaEmpresaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SenaEmpresa
        fields = [
            'nombre', 'nit', 'direccion_principal',
            'telefono_contacto', 'email_contacto', 'logo', 'activa'
        ]

    def validate_nit(self, value):
        """Valida que el NIT sea único"""
        if self.instance and self.instance.nit == value:
            return value
            
        if SenaEmpresa.objects.filter(nit=value).exists():
            raise serializers.ValidationError("Una empresa con este NIT ya existe.")
        return value