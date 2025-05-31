from rest_framework import viewsets, filters, status
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from ..models import Producto
from .serializer import ProductoSerializer, ProductoCreateUpdateSerializer

class ProductoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Productos con soporte para:
    - Precios base
    - Precios personalizados por persona
    - Búsqueda y filtrado avanzado
    """
    queryset = Producto.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'categoria': ['exact'],
        'unidadP': ['exact'],
        'estado': ['exact'],
        'tipo_gestion': ['exact'],
        'tiene_descuento': ['exact'],
        'precio_compra': ['gte', 'lte'],
    }
    search_fields = ['nombre', 'descripcion', 'categoria__nombre']
    ordering_fields = ['nombre', 'precio_compra', 'fecha_creacion']
    ordering = ['nombre']  # Orden por defecto
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductoCreateUpdateSerializer
        return ProductoSerializer

    def get_serializer_context(self):
        """Incluye el request en el contexto para el serializador"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=True, methods=['get'])
    def precios_personalizados(self, request, pk=None):
        """Endpoint específico para listar todos los precios personalizados del producto"""
        producto = self.get_object()
        precios = producto.precio_set.all()
        
        # Paginación
        page = self.paginate_queryset(precios)
        if page is not None:
            from apps.inventario.precios.api.serializer import PrecioSerializer
            serializer = PrecioSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        from apps.inventario.precios.api.serializer import PrecioSerializer
        serializer = PrecioSerializer(precios, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def mi_precio(self, request, pk=None):
        """Obtiene el precio personalizado para el usuario actual"""
        producto = self.get_object()
        
        if not request.user.is_authenticated:
            return Response({
                'precio_base': producto.precio_final,
                'precio_personalizado': None,
                'mensaje': 'Usuario no autenticado, mostrando precio base'
            })
        
        precio_personalizado = producto.precio_set.filter(
            persona=request.user
        ).first()
        
        return Response({
            'precio_base': producto.precio_final,
            'precio_personalizado': precio_personalizado.valor if precio_personalizado else None,
            'tiene_descuento': producto.tiene_descuento,
            'descuento_aplicado': producto.porcentaje_descuento if producto.tiene_descuento else None
        })

    @action(detail=True, methods=['post'])
    def establecer_precio_personal(self, request, pk=None):
        """Establece un precio personalizado para el usuario actual"""
        from apps.inventario.precios.api.serializer import PrecioSerializer
        producto = self.get_object()
        
        serializer = PrecioSerializer(
            data={
                'producto': producto.id,
                'persona': request.user.id,
                'valor': request.data.get('valor')
            },
            context={'request': request}
        )
        
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def con_precios_personalizados(self, request):
        """Lista productos que tienen precios personalizados"""
        productos = Producto.objects.filter(
            precio__isnull=False
        ).distinct()
        
        page = self.paginate_queryset(productos)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)