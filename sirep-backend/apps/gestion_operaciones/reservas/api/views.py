from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.authentication import JWTAuthentication
from ..models import Reserva
from .serializer import ReservaSerializer, ReservaCreateSerializer
from apps.gestion_operaciones.caja_diaria.models import CajaDiaria
from apps.gestion_operaciones.detalle_caja.models import DetalleCaja
from apps.gestion_operaciones.transaccion.models import Transaccion
from apps.usuarios.persona.models import Persona
from apps.gestion_operaciones.detalle_caja.models import Tipo as TipoCaja
from apps.inventario.productos.models import Producto
from apps.gestion_operaciones.cartera.models import DetalleCartera
from decimal import Decimal

class ReservaViewSet(viewsets.ModelViewSet):
    @action(detail=False, methods=['get'])
    def reporte_pdf(self, request):
        from reportlab.lib.pagesizes import letter
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
        from datetime import datetime
        from django.http import HttpResponse
        from collections import Counter

        fecha_inicio = request.GET.get('fecha_inicio')
        fecha_fin = request.GET.get('fecha_fin')
        unidad_productiva_id = request.GET.get('unidad_productiva')
        producto_id = request.GET.get('producto')

        if not (fecha_inicio and fecha_fin and unidad_productiva_id and producto_id):
            return HttpResponse("Error: Debes proporcionar 'fecha_inicio', 'fecha_fin', 'unidad_productiva' y 'producto'", status=400)

        try:
            fecha_inicio_dt = datetime.strptime(fecha_inicio, "%Y-%m-%d")
            fecha_fin_dt = datetime.strptime(fecha_fin, "%Y-%m-%d")
        except Exception:
            return HttpResponse("Error: Formato de fecha inválido. Usa YYYY-MM-DD", status=400)


        reservas = Reserva.objects.filter(
            fecha_creacion__date__range=[fecha_inicio_dt, fecha_fin_dt],
            producto_id=producto_id,
            producto__unidadP_id=unidad_productiva_id,
            estado__in=["fiado", "pagada"]
        )

        if not reservas.exists():
            return HttpResponse("No hay reservas fiadas o pagadas para los filtros seleccionados", status=404)

        unidad_productiva = reservas.first().producto.unidadP
        producto = reservas.first().producto
        cantidad_total = sum(r.cantidad for r in reservas)

        # Desglose por cargo
        cargos = [r.persona.cargo.nombre if r.persona.cargo else 'Sin cargo' for r in reservas]
        conteo_cargos = Counter()
        for r in reservas:
            cargo = r.persona.cargo.nombre if r.persona.cargo else 'Sin cargo'
            conteo_cargos[cargo] += r.cantidad

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="reporte_reservas.pdf"'

        doc = SimpleDocTemplate(response, pagesize=letter)
        elementos = []
        styles = getSampleStyleSheet()


        encabezado_data = [
            ["", Paragraph(f"<b>Centro de gestión y desarrollo sostenible surcolombiano<br/>SENA - YAMBORÓ</b>", styles['Normal']), ""],
            ["", Paragraph(f"<b>Informe de Reservas</b>", styles['Heading2']), Paragraph(f"{datetime.today().strftime('%Y-%m-%d')}", styles['Normal'])],
            ["", "", Paragraph("Página 1 de 1", styles['Normal'])],
        ]
        tabla_encabezado = Table(encabezado_data, colWidths=[60, 350, 100])
        tabla_encabezado.setStyle(TableStyle([
            ('SPAN', (0, 0), (0, 2)),
            ('SPAN', (1, 0), (1, 1)),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        elementos.append(tabla_encabezado)

        elementos.append(Spacer(1, 10))
        elementos.append(Paragraph(f"<b>Unidad Productiva:</b> {unidad_productiva.nombre}", styles['Normal']))
        elementos.append(Paragraph(f"<b>Producto:</b> {producto.nombre}", styles['Normal']))
        elementos.append(Paragraph(f"<b>Periodo:</b> {fecha_inicio} a {fecha_fin}", styles['Normal']))
        elementos.append(Spacer(1, 10))

        objetivo_texto = "Este documento presenta un resumen detallado de las reservas realizadas en el sistema para el producto y unidad productiva seleccionados, incluyendo cantidad total y desglose por cargo de las personas que realizaron la reserva."
        objetivo = Paragraph("<b>1. Objetivo</b><br/>" + objetivo_texto, styles['Normal'])
        elementos.append(objetivo)
        elementos.append(Spacer(1, 15))

        elementos.append(Paragraph("<b>2. Detalle de reservas</b>", styles['Heading3']))
        elementos.append(Spacer(1, 5))

        data_reservas = [["Persona", "Cargo", "Cantidad", "Fecha"]]
        for r in reservas:
            persona = f"{r.persona.first_name} {r.persona.last_name}"
            cargo = r.persona.cargo.nombre if r.persona.cargo else 'Sin cargo'
            data_reservas.append([
                persona,
                cargo,
                r.cantidad,
                r.fecha_creacion.strftime("%Y-%m-%d")
            ])

        tabla_reservas = Table(data_reservas)
        tabla_reservas.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.black),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        elementos.append(tabla_reservas)
        elementos.append(Spacer(1, 15))

        elementos.append(Paragraph("<b>3. Resumen General</b>", styles['Heading3']))
        resumen_texto = f"""
        Durante el período del {fecha_inicio} al {fecha_fin}, se realizaron {reservas.count()} reservas para el producto <b>{producto.nombre}</b> en la unidad productiva <b>{unidad_productiva.nombre}</b>.<br/>
        <b>Cantidad total reservada:</b> {cantidad_total} unidades.<br/>
        <b>Desglose por cargo:</b><br/>
        """
        for cargo, cantidad in conteo_cargos.items():
            resumen_texto += f"- {cargo}: {cantidad} <br/>"
        elementos.append(Paragraph(resumen_texto, styles['Normal']))

        doc.build(elementos)
        return response
    queryset = Reserva.objects.all()
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    filterset_fields = ['persona', 'producto', 'estado', 'fecha_creacion', 'fecha_actualizacion']
    search_fields = ['producto__nombre']
    ordering_fields = ['fecha_creacion', 'total']
    ordering = ['-fecha_creacion']

    def get_serializer_class(self):
        if self.action == 'create':
            return ReservaCreateSerializer
        return ReservaSerializer
    
    def perform_create(self, serializer):
        serializer.save(persona=self.request.user)

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
        """Solo el líder de la unidad productiva puede marcar la reserva como pagada"""
        reserva = self.get_object()
        user = request.user

        # Validar que tenga rol y que sea "liderup"
        if not hasattr(user, 'rol') or user.rol.nombre != 'liderup':
            return Response(
                {'error': 'Solo el líder de la unidad productiva puede marcar como pagada esta reserva.'},
                status=status.HTTP_403_FORBIDDEN
        )

        #  Validar que pertenezca a la misma unidad productiva del producto
        if not hasattr(user, 'unidadP') or user.unidadP != reserva.producto.unidadP:
            return Response(
                {'error': 'No puedes marcar como pagada una reserva de otra unidad productiva.'},
                status=status.HTTP_403_FORBIDDEN
        )


        if reserva.estado != 'pendiente':
            return Response({'error': 'Solo se pueden pagar reservas pendientes'}, status=status.HTTP_400_BAD_REQUEST)

        if reserva.transaccion:
            return Response({'error': 'Esta reserva ya está asociada a una transacción.'}, status=status.HTTP_400_BAD_REQUEST)

        # Obtener la caja abierta de la unidad productiva del producto
        caja_abierta = CajaDiaria.objects.filter(
            unidadProductiva=reserva.producto.unidadP,
            fecha_cierre__isnull=True
        ).first()

        if not caja_abierta:
            return Response({'error': 'No hay una caja abierta para esta unidad productiva.'}, status=status.HTTP_400_BAD_REQUEST)

        # Crear la transacción
        transaccion = Transaccion.objects.create(
            tipo=Transaccion.VENTA,
            producto=reserva.producto,
            cantidad=reserva.cantidad,
            usuario=reserva.persona
        )

        # Crear el detalle de caja
        DetalleCaja.objects.create(
            caja_id=caja_abierta,
            transaccion_id=transaccion,
            descripcion=f"Pago de reserva #{reserva.id}",
            tipo=TipoCaja.INGRESO,
            monto=reserva.total
        )

        # Marcar la reserva como pagada
        reserva.estado = 'pagada'
        reserva.transaccion = transaccion
        reserva.save(update_fields=['estado', 'transaccion'])

        return Response({
            'status': 'Reserva pagada y transacción creada',
            'nuevo_estado': reserva.get_estado_display(),
            'transaccion_id': transaccion.id
        }, status=status.HTTP_200_OK)

    @csrf_exempt
    @action(detail=False, methods=['post'], url_path='reservar-multiples')
    def reservar_multiples(self, request):
        """Permite a una vocera reservar un producto para varias personas de su ficha"""
        user = request.user

        # Verificación mejorada del rol
        if not hasattr(user, 'rol') or not hasattr(user.rol, 'nombre') or str(user.rol.nombre).lower() != 'vocera':
            return Response(
                {'error': 'Solo las voceras pueden hacer reservas múltiples.'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        producto_id = request.data.get('producto')
        cantidad = request.data.get('cantidad')
        personas_ids = request.data.get('personas', [])

        # Validación más robusta
        if not all([producto_id, cantidad, personas_ids]):
            return Response(
                {'error': 'Debes enviar producto, cantidad y lista de personas.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            producto = Producto.objects.get(pk=producto_id, estado='disponible', reservas=True)
            cantidad = int(cantidad)
            if cantidad <= 0:
                raise ValueError
        except Producto.DoesNotExist:
            return Response(
                {'error': 'Producto no encontrado o no está activo.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except ValueError:
            return Response(
                {'error': 'La cantidad debe ser un número entero mayor a cero.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        reservas_creadas = []
        errores = []

        for persona_id in personas_ids:
            try:
                persona = Persona.objects.get(pk=persona_id)
                
                if not hasattr(user, 'numFicha') or not hasattr(persona, 'numFicha') or persona.numFicha != user.numFicha:
                    errores.append({
                        'persona_id': persona_id,
                        'error': 'No pertenece a la misma ficha que la vocera'
                    })
                    continue

                data = {
                    'persona': persona.id, 
                    'producto': producto_id, 
                    'cantidad': cantidad
                }
                
                serializer = ReservaCreateSerializer(
                    data=data,
                    context={'request': request}
                )
                
                if serializer.is_valid():
                    reserva = serializer.save()
                    reservas_creadas.append(ReservaSerializer(reserva).data)
                else:
                    errores.append({
                        'persona_id': persona_id,
                        'error': serializer.errors
                    })

            except Persona.DoesNotExist:
                errores.append({
                    'persona_id': persona_id, 
                    'error': 'Persona no encontrada'
                })
                continue
            except Exception as e:
                errores.append({
                    'persona_id': persona_id, 
                    'error': str(e)
                })
                continue

        status_code = status.HTTP_201_CREATED if reservas_creadas else status.HTTP_400_BAD_REQUEST
        
        return Response({
            'mensaje': 'Proceso terminado',
            'total_reservas': len(reservas_creadas),
            'reservas_creadas': reservas_creadas,
            'errores': errores
        }, status=status_code)
    

    @action(detail=True, methods=['post'])
    def marcar_como_fiado(self, request, pk=None):
        """Solo el líder de la unidad productiva puede marcar la reserva como fiada"""
        reserva = self.get_object()
        user = request.user

        # Validar rol
        if not hasattr(user, 'rol') or user.rol.nombre != 'liderup':
            return Response(
                {'error': 'Solo el líder de la unidad productiva puede marcar como fiado esta reserva.'},
                status=status.HTTP_403_FORBIDDEN)

        if reserva.estado != 'pendiente':
            return Response({'error': 'Solo se pueden fiar reservas pendientes'}, status=status.HTTP_400_BAD_REQUEST)

        # Evitar múltiples registros
        ya_fiado = DetalleCartera.objects.filter(
            persona=reserva.persona,
            producto=reserva.producto,
            unidad_productiva=reserva.producto.unidadP,
            cantidad=reserva.cantidad,
            fecha__date=reserva.fecha_creacion.date()
        ).exists()
    
        if ya_fiado:
            return Response({'error': 'Esta reserva ya ha sido registrada como fiado anteriormente.'}, status=status.HTTP_400_BAD_REQUEST)

        # Crear el detalle de cartera (fiado)
        DetalleCartera.objects.create(
            persona=reserva.persona,
            producto=reserva.producto,
            unidad_productiva=reserva.producto.unidadP,
            cantidad=reserva.cantidad,
            abono_inicial=Decimal('0.00'),
            observaciones=f'Fiado generado a partir de la reserva #{reserva.id}')

        reserva.estado = 'fiado'
        reserva.save(update_fields=['estado'])

        return Response({'status': 'Reserva marcada como fiado y detalle de cartera creado',
        'nuevo_estado': reserva.get_estado_display()
    }, status=status.HTTP_200_OK)