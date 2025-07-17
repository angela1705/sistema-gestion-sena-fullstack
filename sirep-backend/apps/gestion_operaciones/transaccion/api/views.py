from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError

from apps.gestion_operaciones.transaccion.models import  Transaccion
from apps.gestion_operaciones.transaccion.api.transaccion_serializer import (TransaccionCreateSerializer,TransaccionDetailSerializer)
from .permissions import PuedeCrearTransaccion


class TransaccionViewSet(viewsets.ModelViewSet):
    queryset = Transaccion.objects.all().order_by('-fecha')
    permission_classes = [IsAuthenticated, PuedeCrearTransaccion]

    def get_serializer_class(self):
        if self.action == 'create':
            return TransaccionCreateSerializer
        return TransaccionDetailSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        try:
            transaccion = serializer.save()
        except ValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'message': f"{transaccion.tipo.title()} registrada exitosamente.",
            'transaccion_id': transaccion.id,
            'monto_total': float(transaccion.monto_total)
        }, status=status.HTTP_201_CREATED)

    def retrieve(self, request, *args, **kwargs):
        transaccion = self.get_object()
        serializer = self.get_serializer(transaccion)
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        # Opcional: filtrar por unidad productiva si se pasa como query param
        unidad_id = request.query_params.get('unidad_productiva_id')
        if unidad_id:
            queryset = queryset.filter(detalles__producto__unidadP_id=unidad_id).distinct()

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
