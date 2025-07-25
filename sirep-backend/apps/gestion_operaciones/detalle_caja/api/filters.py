import django_filters
from ..models import DetalleCaja

class DetalleCajaFilter(django_filters.FilterSet):
    fecha_desde = django_filters.DateFilter(
        field_name='fecha', 
        lookup_expr='gte',
        label="Fecha desde (YYYY-MM-DD)"
    )
    fecha_hasta = django_filters.DateFilter(
        field_name='fecha', 
        lookup_expr='lte',
        label="Fecha hasta (YYYY-MM-DD)"
    )
    caja = django_filters.NumberFilter(
        field_name='caja__id',
        label="ID de Caja"
    )

    class Meta:
        model = DetalleCaja
        fields = ['tipo', 'caja']