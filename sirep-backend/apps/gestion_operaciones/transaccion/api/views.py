from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import Transaccion
from .serializer import TransaccionSerializer
from apps.usuarios.persona.models import Persona
from apps.gestion_operaciones.caja_diaria.models import CajaDiaria
from django.db import transaction

class TransaccionViewSet(viewsets.ModelViewSet):
    queryset = Transaccion.objects.all().order_by('-fecha')
    serializer_class = TransaccionSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'retrieve', 'list']  

    def get_queryset(self):
        """
        Filtra las transacciones según la unidad productiva del usuario
        """
        queryset = super().get_queryset()
        user = self.request.user
        
        if not hasattr(user, 'persona'):
            return Transaccion.objects.none()
            
        unidad_productiva = user.persona.unidadP
        return queryset.filter(usuario__unidadP=unidad_productiva)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """
        Crea una nueva transacción con manejo de errores específicos
        """
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except serializers.ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_create(self, serializer):
        """
        Asigna automáticamente el usuario actual a la transacción
        """
        user_persona = getattr(self.request.user, 'persona', None)
        if not user_persona:
            raise serializer.ValidationError("Usuario no tiene perfil de persona asociado")
        
        serializer.save(usuario=user_persona)

    def list(self, request, *args, **kwargs):
        """
        Lista transacciones con filtros opcionales por tipo y fecha
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        # Filtros
        tipo = request.query_params.get('tipo', None)
        fecha_inicio = request.query_params.get('fecha_inicio', None)
        fecha_fin = request.query_params.get('fecha_fin', None)
        
        if tipo in [Transaccion.VENTA, Transaccion.COMPRA]:
            queryset = queryset.filter(tipo=tipo)
        
        if fecha_inicio:
            queryset = queryset.filter(fecha__gte=fecha_inicio)
        
        if fecha_fin:
            queryset = queryset.filter(fecha__lte=fecha_fin)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        """
        Obtiene los detalles de una transacción específica
        """
        instance = self.get_object()
        
        # Verificar que la transacción pertenezca a la unidad del usuario
        user_unidad = request.user.persona.unidadP
        if instance.usuario.unidadP != user_unidad:
            return Response(
                {'detail': 'No encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
        serializer = self.get_serializer(instance)
        return Response(serializer.data)