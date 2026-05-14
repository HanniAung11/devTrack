import django_filters
from .models import Developer


class DeveloperFilter(django_filters.FilterSet):
    batch = django_filters.CharFilter(method="filter_batch")
    is_active = django_filters.BooleanFilter()

    class Meta:
        model = Developer
        fields = ["batch", "is_active"]

    def filter_batch(self, queryset, name, value):
       
        if value.lower() == "none":
            return queryset.filter(batch__isnull=True)
       
        try:
            return queryset.filter(batch_id=int(value))
        except (ValueError, TypeError):
            return queryset.none()