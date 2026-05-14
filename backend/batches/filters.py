import django_filters

from .models import Batch


class BatchFilter(django_filters.FilterSet):
    start_date_gte = django_filters.DateFilter(field_name="start_date", lookup_expr="gte")
    start_date_lte = django_filters.DateFilter(field_name="start_date", lookup_expr="lte")
    end_date_gte = django_filters.DateFilter(field_name="end_date", lookup_expr="gte")
    end_date_lte = django_filters.DateFilter(field_name="end_date", lookup_expr="lte")

    class Meta:
        model = Batch
        fields = ("status", "mentor")
