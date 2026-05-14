import django_filters

from .models import Session


class SessionFilter(django_filters.FilterSet):
    session_date_gte = django_filters.DateFilter(field_name="session_date", lookup_expr="gte")
    session_date_lte = django_filters.DateFilter(field_name="session_date", lookup_expr="lte")

    class Meta:
        model = Session
        fields = ("batch", "session_type")
