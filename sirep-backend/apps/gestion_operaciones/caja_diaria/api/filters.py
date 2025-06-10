import django_filters
from apps.gestion_operaciones.caja_diaria.models import CajaDiaria

class CajaDiariaFilter(django_filters.FilterSet):
    esta_abierta = django_filters.BooleanFilter(method='filter_esta_abierta')

    class Meta:
        model = CajaDiaria
        fields = ['unidadProductiva', 'abierta_por', 'cerrada_por']

    def filter_esta_abierta(self, queryset, name, value):
        if value:
            return queryset.filter(fecha_cierre__isnull=True)
        else:
            return queryset.filter(fecha_cierre__isnull=False)
