from rest_framework import serializers
from ..models import TipoCategoria

class TipoCategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoCategoria
        fields = ['id', 'nombre']
        read_only_fields = ['id'] 
        extra_kwargs = {
            'nombre': {
                'required': True,
                'allow_blank': False,
                'max_length': 100
            }
        }

    def validate_nombre(self, value):
        
        value = value.strip().capitalize()  
        
        queryset = TipoCategoria.objects.filter(nombre__iexact=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
            
        if queryset.exists():
            raise serializers.ValidationError("Ya existe una categoría con este nombre.")
        
        return value


class TipoCategoriaCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoCategoria
        fields = ['nombre']  
        extra_kwargs = {
            'nombre': {
                'required': True,
                'allow_blank': False,
                'max_length': 100
            }
        }
