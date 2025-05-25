from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.settings import api_settings
from django.contrib.auth import authenticate

from ..models import Persona
from .serializer import (
    PersonaRegisterSerializer,
    PersonaSerializer,
    PersonaUpdateSerializer,
    PersonaResponsableSerializer
)


class PersonaAuthView(ObtainAuthToken):
    """Vista personalizada para obtener el token de autenticación"""
    renderer_classes = api_settings.DEFAULT_RENDERER_CLASSES

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        # Usamos el PersonaSerializer para devolver los datos del usuario
        user_serializer = PersonaSerializer(user, context={'request': request})
        
        return Response({
            'token': token.key,
            'user': user_serializer.data
        })


class PersonaRegisterView(generics.CreateAPIView):
    """Vista para registro de nuevos usuarios"""
    queryset = Persona.objects.all()
    serializer_class = PersonaRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Validación adicional para numFicha si es pasante
        rol_id = request.data.get('rol')
        if rol_id and int(rol_id) == 3:  # Suponiendo que 3 es el ID para 'Pasante'
            if not request.data.get('numFicha'):
                return Response(
                    {"numFicha": "El número de ficha es obligatorio para pasantes."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        
        # Creamos token para el nuevo usuario
        user = Persona.objects.get(username=serializer.data['username'])
        token, created = Token.objects.get_or_create(user=user)
        
        return Response(
            {
                'user': serializer.data,
                'token': token.key
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )


class PersonaListView(generics.ListAPIView):
    """Vista para listar usuarios (solo admin)"""
    queryset = Persona.objects.all()
    serializer_class = PersonaSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtros opcionales
        rol = self.request.query_params.get('rol')
        if rol:
            queryset = queryset.filter(rol__id=rol)
            
        sede = self.request.query_params.get('sede')
        if sede:
            queryset = queryset.filter(sede__id=sede)
            
        return queryset


class PersonaDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vista para ver, actualizar o eliminar un usuario"""
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
        # Solo permitir que admin cambie rol, cargo o sede
        if not self.request.user.is_superuser:
            excluded_fields = ['rol', 'cargo', 'sede']
            for field in excluded_fields:
                if field in serializer.validated_data:
                    del serializer.validated_data[field]
        serializer.save()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Solo permitir ver el perfil propio o si es admin
        if not (request.user.is_staff or request.user == instance):
            return Response(
                {"detail": "No tienes permiso para ver este perfil."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class CurrentUserView(APIView):
    """Vista para obtener los datos del usuario actual"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = PersonaSerializer(request.user, context={'request': request})
        return Response(serializer.data)


class PersonaResponsableView(generics.ListAPIView):
    """Vista para listar responsables (usuarios con unidad productiva)"""
    serializer_class = PersonaResponsableSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Persona.objects.filter(unidad_productiva__isnull=False)