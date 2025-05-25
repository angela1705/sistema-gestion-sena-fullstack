from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.hashers import make_password
from ..models import Persona


class PersonaRegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True,validators=[UniqueValidator(queryset=Persona.objects.all())])
    identificacion = serializers.CharField(required=True, max_length=20,validators=[UniqueValidator
        (queryset=Persona.objects.all())])
    password = serializers.CharField(write_only=True, required=True,min_length=8,style={'input_type': 'password'} )

    class Meta:
        model = Persona
        fields = (
            "id", "username", "email", "password", "identificacion",
            "first_name", "last_name", "telefono",
            "rol", "cargo", "sede", "numFicha"
        )
        extra_kwargs = {
            "password": {"write_only": True},
            "numFicha": {"required": False, "allow_null": True},
        }

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres")
        return value
    
    def create(self, validated_data):
        validated_data["password"] = make_password(validated_data["password"])
        return super().create(validated_data)
    


class PersonaSerializer(serializers.ModelSerializer):
    rol_nombre = serializers.SlugRelatedField(source="rol", slug_field="nombre", read_only=True)
    cargo_nombre = serializers.SlugRelatedField(source="cargo", slug_field="nombre", read_only=True)
    sede_nombre = serializers.SlugRelatedField(source="sede", slug_field="nombre", read_only=True)
    foto_url = serializers.SerializerMethodField()

    class Meta:
        model = Persona
        fields = (
            "id", "username", "email",
            "first_name", "last_name",
            "identificacion", "telefono",
            "rol", "rol_nombre",
            "cargo", "cargo_nombre",
            "sede", "sede_nombre",
            "numFicha", "foto_url",
        )

        extra_kwargs = {
            "rol": {"write_only": True},
            "cargo": {"write_only": True},
            "sede": {"write_only": True},
        }

    def get_foto_url(self, obj):
        if obj.foto and "request" in self.context:
            return self.context["request"].build_absolute_uri(obj.foto.url)
        return None



class PersonaUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Persona
        fields = (
            "first_name", "last_name", "email",
            "telefono", "foto",
        )
        extra_kwargs = {
            "foto": {"required": False},
            "numFicha": {"required": False},
        }



class PersonaResponsableSerializer(serializers.ModelSerializer):
    unidad_productiva = serializers.CharField(source="unidad_productiva.nombre", read_only=True)

    class Meta:
        model = Persona
        fields = (
            "id", "username", "email", "first_name",
            "last_name", "unidad_productiva",)