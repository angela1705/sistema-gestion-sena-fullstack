from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count, Q
from rest_framework.permissions import IsAuthenticated
from ..models import DetalleCartera, AbonoCartera
from .serializer import (
    DetalleCarteraSerializer,
    AbonoCarteraSerializer,
    ResumenDeudasSerializer,
    UnidadProductivaSerializer
)
from apps.entidades.unidades_productivas.models import UnidadProductiva
from .permissions import EsLiderOAdministrador
from decimal import Decimal
from django.db.models import F, ExpressionWrapper, DecimalField
from django.db.models.functions import Coalesce
from django.db import transaction

class DetalleCarteraViewSet(viewsets.ModelViewSet):
    """
    Vista completa para gestión de cartera (fiados) con:
    - Filtrado por unidad productiva
    - Resumen de deudas
    - Detalle por usuario
    - Registro de abonos
    """
    queryset = DetalleCartera.objects.select_related('producto', 'persona', 'unidad_productiva').prefetch_related('abonos').order_by('-fecha')
    serializer_class = DetalleCarteraSerializer
    permission_classes = [IsAuthenticated, EsLiderOAdministrador]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['unidad_productiva', 'persona']
    search_fields = ['producto__nombre', 'persona__nombre', 'persona__apellido']

    def get_queryset(self):
        queryset = super().get_queryset()
    
        # Filtro por unidad productiva del usuario (si no es admin)
        if not self.request.user.is_superuser:
            if hasattr(self.request.user, 'perfil') and self.request.user.perfil.unidad_productiva:
               queryset = queryset.filter(unidad_productiva=self.request.user.perfil.unidad_productiva)
    
        # Filtros adicionales
        unidad_id = self.request.query_params.get('unidad_productiva')
        persona_id = self.request.query_params.get('persona')
        fecha_inicio = self.request.query_params.get('fecha_inicio')
        fecha_fin = self.request.query_params.get('fecha_fin')
        pendientes = self.request.query_params.get('pendientes', '').lower() == 'true'
    
        if unidad_id:
            queryset = queryset.filter(unidad_productiva_id=unidad_id)
        if persona_id:
            queryset = queryset.filter(persona_id=persona_id)
        if fecha_inicio and fecha_fin:
            queryset = queryset.filter(fecha__date__range=[fecha_inicio, fecha_fin])
        if pendientes:
           queryset = queryset.annotate(
            total_abonado=Coalesce(Sum('abonos__valor'), 0)
            ).filter(Q(saldo__gt=F('total_abonado')))
        
        return queryset

    @action(detail=False, methods=['get'])
    def unidades_disponibles(self, request):
        """
        Lista todas las unidades productivas disponibles para filtrar.
        Para administradores: muestra todas las unidades.
        Para líderes: muestra solo su unidad asignada o unidades que administra.
        """
        if request.user.is_superuser:
            unidades = UnidadProductiva.objects.all()
        else:
            unidades = UnidadProductiva.objects.filter(
                Q(id=request.user.perfil.unidad_productiva.id) | 
                Q(administradores=request.user)
            ).distinct()  # Evita duplicados si el usuario es administrador de varias
        serializer = UnidadProductivaSerializer(unidades, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def resumen_deudas(self, request):
        """
        Resumen de deudas agrupado por persona, filtrado por unidad productiva.
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        resumen = queryset.values(
            'persona',
            'persona__first_name',
            'persona__last_name'
        ).annotate(
            total_deuda=ExpressionWrapper(F('valor_total') - F('abono_inicial')- Coalesce(Sum('abonos__valor'), 0),output_field=DecimalField(max_digits=10, decimal_places=2)),
            total_fiado=Sum('valor_total'),
            total_abonado=ExpressionWrapper(F('abono_inicial') + Coalesce(Sum('abonos__valor'), 0),output_field=DecimalField(max_digits=10, decimal_places=2)),
            cantidad_fiados=Count('id')
        ).order_by('persona__first_name', 'persona__last_name')
        
        serializer = ResumenDeudasSerializer(resumen, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def detalle_usuario(self, request):
        """
        Detalle completo de fiados para un usuario específico,
        incluyendo tabla de productos y total pendiente.
        Optimizado con select_related y prefetch_related.
        """
        persona_id = request.query_params.get('persona_id')
        if not persona_id:
            return Response(
                {"error": "Se requiere el parámetro persona_id"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.filter_queryset(
            self.get_queryset()
            .filter(persona_id=persona_id)
            .select_related('producto', 'persona', 'unidad_productiva')
            .prefetch_related('abonos')
        )
        
        serializer = self.get_serializer(queryset, many=True)
        total_pendiente = sum(Decimal(item['total_pendiente']) for item in serializer.data)
        
        persona_nombre = ""
        if queryset.exists():
            persona_nombre = queryset.first().persona.get_full_name()
        
        return Response({
            "persona_id": persona_id,
            "persona_nombre": persona_nombre,
            "total_pendiente": total_pendiente,
            "fiados": serializer.data
        })

    @action(detail=True, methods=['post'])
    def registrar_abono(self, request, pk=None):
        detalle = self.get_object()
        serializer = AbonoCarteraSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
    
        # Calcular saldo pendiente
        total_abonado = detalle.abonos.aggregate(total=Sum('valor'))['total'] or 0
        saldo_pendiente = detalle.saldo - Decimal(total_abonado)
    
        if serializer.validated_data['valor'] > saldo_pendiente:
            return Response(
                {"error": f"El abono excede el saldo pendiente (${saldo_pendiente:.2f})"},
                status=status.HTTP_400_BAD_REQUEST
        )

        serializer.save(usuario=request.user, detalle_cartera=detalle)
        detalle.recalcular_saldo()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def resumen_unidades(self, request):
    
        queryset = self.filter_queryset(self.get_queryset())
    
        resumen = queryset.values(
            'unidad_productiva',
            'unidad_productiva__nombre'
        ).annotate(
            total_deuda=Sum('saldo'),
            total_fiado=Sum('valor_total'),
            total_abonado=Sum('abono_inicial'),
            cantidad_fiados=Count('id')
        ).order_by('unidad_productiva__nombre')
    
        serializer = ResumenDeudasSerializer(resumen, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def resumen_personas_por_unidad(self, request):
        """
        Devuelve el resumen de deudas por persona para una unidad productiva específica.
        """
        unidad_id = request.query_params.get('unidad_productiva_id')
        if not unidad_id:
            return Response({"error": "Se requiere el parámetro unidad_productiva_id"}, status=400)

        queryset = self.get_queryset().filter(unidad_productiva_id=unidad_id)

        resumen = queryset.values(
            'persona',
            'persona__first_name',
            'persona__last_name',
            'unidad_productiva',
            'unidad_productiva__nombre'
        ).annotate(
            total_deuda=ExpressionWrapper(F('valor_total') - F('abono_inicial') - Coalesce(Sum('abonos__valor'), 0),output_field=DecimalField(max_digits=10, decimal_places=2)),
            total_fiado=Sum('valor_total'),
            total_abonado=ExpressionWrapper(F('abono_inicial') + Coalesce(Sum('abonos__valor'), 0),output_field=DecimalField(max_digits=10, decimal_places=2)),
            cantidad_fiados=Count('id')
        ).order_by('persona__first_name', 'persona__last_name')

        serializer = ResumenDeudasSerializer(resumen, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def abonar_multiples(self, request):
        """
        Aplica un abono general a las deudas más antiguas de una persona
        en una unidad productiva.
        """
        persona_id = request.data.get('persona_id')
        unidad_id = request.data.get('unidad_productiva_id')
        valor = request.data.get('valor')

        if not all([persona_id, unidad_id, valor]):
            return Response({"error": "persona_id, unidad_productiva_id y valor son requeridos."},
                        status=status.HTTP_400_BAD_REQUEST)

        try:
            valor = Decimal(valor)
            if valor <= 0:
                raise ValueError()
        except:
            return Response({"error": "El valor del abono debe ser un número positivo."},
                        status=status.HTTP_400_BAD_REQUEST)

        detalles = DetalleCartera.objects.filter(persona_id=persona_id,unidad_productiva_id=unidad_id
                ).annotate(total_abonado=Coalesce(Sum('abonos__valor', output_field=DecimalField(max_digits=10, decimal_places=2)),Decimal(0)),
                        saldo_pendiente=ExpressionWrapper(F('saldo') - F('total_abonado'),output_field=DecimalField(max_digits=10, decimal_places=2))
                        ).filter(saldo_pendiente__gt=0).order_by('fecha')

        if not detalles.exists():
            return Response({"error": "No hay deudas activas para esta persona en esta unidad productiva."},
                        status=status.HTTP_404_NOT_FOUND)

        abonos_realizados = []

        with transaction.atomic():
            for detalle in detalles:
                total_abonado = detalle.abonos.aggregate(total=Sum('valor'))['total'] or 0
                saldo_pendiente = detalle.saldo - Decimal(total_abonado)
            
                if saldo_pendiente <= 0:
                    continue

                abono_a_aplicar = min(saldo_pendiente, valor)

                abono = AbonoCartera.objects.create(
                    detalle_cartera=detalle,
                    valor=abono_a_aplicar,
                    usuario=request.user,
                    observaciones="Abono automático por lote")

                abonos_realizados.append({
                    "detalle_id": detalle.id,
                    "producto": detalle.producto.nombre,
                    "valor_abonado": str(abono.valor),
                    "saldo_restante": str(detalle.saldo - (total_abonado + abono.valor))})

                detalle.recalcular_saldo()

                valor -= abono_a_aplicar
                if valor <= 0:
                    break

        return Response({"mensaje": f"Se aplicaron {len(abonos_realizados)} abonos.","abonos": abonos_realizados}, status=status.HTTP_201_CREATED)

    
