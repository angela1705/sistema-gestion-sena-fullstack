from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from ..models import Persona

from .serializer import (
    PersonaRegisterSerializer,
    PersonaSerializer,
    PersonaUpdateSerializer,
    PersonaResponsableSerializer
)

class PersonaTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = PersonaSerializer(self.user).data
        return data

class PersonaAuthView(TokenObtainPairView):
    serializer_class = PersonaTokenObtainPairSerializer

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class PersonaRegisterView(generics.CreateAPIView):
    queryset = Persona.objects.all()
    serializer_class = PersonaRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        rol_id = request.data.get('rol')
        if rol_id and int(rol_id) == 3:  # Ejemplo: pasante
            if not request.data.get('numFicha'):
                return Response(
                    {"numFicha": "El número de ficha es obligatorio para pasantes."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        user = Persona.objects.get(username=serializer.data['username'])
        tokens = get_tokens_for_user(user)

        return Response(
            {
                'user': serializer.data,
                'access': tokens['access'],
                'refresh': tokens['refresh']
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )


class PersonaListView(generics.ListAPIView):
    queryset = Persona.objects.all()
    serializer_class = PersonaSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = super().get_queryset()
        rol = self.request.query_params.get('rol')
        if rol:
            queryset = queryset.filter(rol__id=rol)
        sede = self.request.query_params.get('sede')
        if sede:
            queryset = queryset.filter(sede__id=sede)
        return queryset


class PersonaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Persona.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PersonaUpdateSerializer
        return PersonaSerializer

    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [permissions.IsAdminUser()]
        return super().get_permissions()

    def perform_update(self, serializer):
        if not self.request.user.is_superuser:
            excluded_fields = ['rol', 'cargo', 'sede']
            for field in excluded_fields:
                if field in serializer.validated_data:
                    del serializer.validated_data[field]
        serializer.save()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if not (request.user.is_staff or request.user == instance):
            return Response(
                {"detail": "No tienes permiso para ver este perfil."},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = PersonaSerializer(request.user, context={'request': request})
        return Response(serializer.data)


class PersonaResponsableView(generics.ListAPIView):
    serializer_class = PersonaResponsableSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Persona.objects.filter(unidad_productiva__isnull=False)
