from rest_framework import serializers
from ..models import Cargo

class CargoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cargo
        fields = ['id', 'nombre', 'descripcion', 'fecha_creacion', 'fecha_actualizacion']
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']  # Campos autogenerados

    def validate_nombre(self, value):
        """Valida que el nombre del cargo sea único (case-insensitive)."""
        if self.instance and self.instance.nombre.lower() == value.lower():
            return value
        if Cargo.objects.filter(nombre__iexact=value).exists():
            raise serializers.ValidationError("Ya existe un cargo con este nombre.")
        return value