from rest_framework import viewsets, filters, status 
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from ..models import Producto
from .serializer import ProductoSerializer, ProductoCreateUpdateSerializer
from .permissions import EsLiderOAdministrador
class ProductoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Productos con soporte para:
    - Precios base
    - Precios personalizados por cargo
    - Búsqueda y filtrado avanzado
    """
    queryset = Producto.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'categoria': ['exact'],
        'unidadP': ['exact'],
        'estado': ['exact'],
        'tiene_descuento': ['exact'],
        'precio_compra': ['gte', 'lte'],
    }
    search_fields = ['nombre', 'descripcion', 'categoria__nombre']
    ordering_fields = ['nombre', 'precio_compra', 'fecha_creacion']
    ordering = ['-id']
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [EsLiderOAdministrador()]
        return [IsAuthenticatedOrReadOnly()]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductoCreateUpdateSerializer
        return ProductoSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=True, methods=['get'])
    def precios_personalizados(self, request, pk=None):
        """Lista todos los precios personalizados del producto"""
        producto = self.get_object()
        precios = producto.precio_set.all()
        
        page = self.paginate_queryset(precios)
        from apps.inventario.precios.api.serializer import PrecioSerializer
        serializer = PrecioSerializer(page if page is not None else precios, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def mi_precio(self, request, pk=None):
        """Obtiene el precio personalizado según el cargo del usuario"""
        producto = self.get_object()

        if not request.user.is_authenticated:
            return Response({
                'precio_base': producto.precio_final,
                'precio_personalizado': None,
                'mensaje': 'Usuario no autenticado, mostrando precio base'
            })

        cargo = getattr(request.user, 'cargo', None)
        precio_personalizado = None
        if cargo:
            precio_personalizado = producto.precio_set.filter(cargo=cargo).first()

        return Response({
            'precio_base': producto.precio_final,
            'precio_personalizado': precio_personalizado.valor if precio_personalizado else None,
            'tiene_descuento': producto.tiene_descuento,
            'descuento_aplicado': producto.porcentaje_descuento if producto.tiene_descuento else None
        })

    @action(detail=True, methods=['post'])
    def establecer_precio_personal(self, request, pk=None):
        """
        Establece un precio personalizado para el cargo del usuario actual.
        Requiere que el usuario tenga un cargo asignado.
        """
        from apps.inventario.precios.api.serializer import PrecioSerializer
        producto = self.get_object()

        if not request.user.is_authenticated or not hasattr(request.user, 'cargo') or not request.user.cargo:
            return Response(
                {'detail': 'El usuario debe estar autenticado y tener un cargo asignado.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = PrecioSerializer(
            data={
                'producto': producto.id,
                'cargo': request.user.cargo.id,
                'valor': request.data.get('valor')
            },
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def con_precios_personalizados(self, request):
        """Lista productos que tienen al menos un precio personalizado definido"""
        productos = Producto.objects.filter(precio__isnull=False).distinct()

        page = self.paginate_queryset(productos)
        serializer = self.get_serializer(page if page is not None else productos, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)
