from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from ..models import Reserva
from .serializer import ReservaSerializer, ReservaCreateSerializer
from apps.gestion_operaciones.caja_diaria.models import CajaDiaria
from apps.gestion_operaciones.detalle_caja.models import DetalleCaja
from apps.gestion_operaciones.transaccion.models import Transaccion 
from apps.gestion_operaciones.transaccion.models import TipoTransaccion  
from apps.usuarios.persona.models import Persona
from apps.gestion_operaciones.detalle_caja.models import Tipo as TipoCaja
from apps.inventario.productos.models import Producto
from apps.gestion_operaciones.caja_diaria.models import CajaDiaria


class ReservaViewSet(viewsets.ModelViewSet):
    queryset = Reserva.objects.all()
    permission_classes = [IsAuthenticated]
    filterset_fields = ['persona', 'producto', 'estado', 'fecha_creacion', 'fecha_actualizacion']
    search_fields = ['producto__nombre']
    ordering_fields = ['fecha_creacion', 'total']
    ordering = ['-fecha_creacion']

    def get_serializer_class(self):
        if self.action == 'create':
            return ReservaCreateSerializer
        return ReservaSerializer

    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        """Endpoint para cancelar una reserva"""
        reserva = self.get_object()

        if reserva.estado == 'cancelada':
            return Response({'error': 'La reserva ya está cancelada'}, status=status.HTTP_400_BAD_REQUEST)

        if reserva.estado == 'entregada':
            return Response({'error': 'No se puede cancelar una reserva entregada'}, status=status.HTTP_400_BAD_REQUEST)

        reserva.estado = 'cancelada'
        reserva.save()

        return Response({
            'status': 'Reserva cancelada',
            'nuevo_estado': reserva.get_estado_display()
        })

    @action(detail=True, methods=['post'])
    def marcar_como_pagada(self, request, pk=None):
        """Marca una reserva como pagada y crea la transacción asociada"""
        reserva = self.get_object()

        if reserva.estado != 'pendiente':
            return Response({'error': 'Solo se pueden pagar reservas pendientes'}, status=status.HTTP_400_BAD_REQUEST)

        if reserva.transaccion:
           return Response({'error': 'Esta reserva ya está asociada a una transacción.'}, status=status.HTTP_400_BAD_REQUEST)

        # 🔧 Obtener la caja abierta de la unidad productiva del producto
        caja_abierta = CajaDiaria.objects.filter(
        unidadProductiva=reserva.producto.unidadP,
        fecha_cierre__isnull=True
        ).first()

        if not caja_abierta:
            return Response({'error': 'No hay una caja abierta para esta unidad productiva.'}, status=status.HTTP_400_BAD_REQUEST)

        # 💰 Crear la transacción
        transaccion = Transaccion.objects.create(
            tipo=TipoTransaccion.VENTA,
            producto=reserva.producto,
            cantidad=reserva.cantidad,
            usuario=reserva.persona
         )

        # 💼 Crear el detalle de caja
        DetalleCaja.objects.create(
            caja_id=caja_abierta,
            transaccion_id=transaccion,
            descripcion=f"Pago de reserva #{reserva.id}",
            tipo=TipoCaja.INGRESO,
            monto=reserva.total)

        # ✅ Marcar la reserva como pagada
        reserva.estado = 'pagada'
        reserva.transaccion = transaccion
        reserva.save(update_fields=['estado', 'transaccion'])

        return Response({
            'status': 'Reserva pagada y transacción creada',
            'nuevo_estado': reserva.get_estado_display(),
            'transaccion_id': transaccion.id
         }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='reservar-multiples')
    def reservar_multiples(self, request):
        """Permite a una vocera reservar un producto para varias personas de su ficha"""
        user = request.user

        if not user.rol.nombre.lower() == 'vocera':
            return Response({'error': 'Solo las voceras pueden hacer reservas múltiples.'}, status=status.HTTP_403_FORBIDDEN)

        producto_id = request.data.get('producto')
        cantidad = request.data.get('cantidad')
        personas_ids = request.data.get('personas', [])

        if not producto_id or not cantidad or not personas_ids:
            return Response({'error': 'Debes enviar producto, cantidad y lista de personas.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            producto = Producto.objects.get(pk=producto_id)
        except Producto.DoesNotExist:
            return Response({'error': 'Producto no encontrado.'}, status=status.HTTP_400_BAD_REQUEST)

        # 🛑 Validar si el producto está activo
        if not producto.activo:
            return Response({'error': 'El producto no está activo.'}, status=status.HTTP_400_BAD_REQUEST)

        if int(cantidad) <= 0:
            return Response({'error': 'La cantidad debe ser mayor a cero.'}, status=status.HTTP_400_BAD_REQUEST)

        reservas_creadas = []
        errores = []

        for persona_id in personas_ids:
            try:
                persona = Persona.objects.get(pk=persona_id)
            except Persona.DoesNotExist:
                errores.append({'persona_id': persona_id, 'error': 'Persona no encontrada'})
                continue

            if not user.numFicha or persona.numFicha != user.numFicha:
                errores.append({
                    'persona_id': persona_id,
                    'error': 'No pertenece a la misma ficha que la vocera'
                })
                continue

            data = {'persona': persona.id, 'producto': producto_id, 'cantidad': cantidad}
            serializer = ReservaCreateSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                reservas_creadas.append(serializer.data)
            else:
                errores.append({'persona_id': persona_id, 'error': serializer.errors})

        return Response({
            'mensaje': 'Proceso terminado',
            'total_reservas': len(reservas_creadas),
            'reservas_creadas': reservas_creadas,
            'errores': errores
        }, status=status.HTTP_201_CREATED if reservas_creadas else status.HTTP_400_BAD_REQUEST)
