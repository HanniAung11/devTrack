import django_filters

from .models import Attendance


class AttendanceFilter(django_filters.FilterSet):
    session_date_gte = django_filters.DateFilter(
        field_name="session__session_date", lookup_expr="gte"
    )
    session_date_lte = django_filters.DateFilter(
        field_name="session__session_date", lookup_expr="lte"
    )

    class Meta:
        model = Attendance
        fields = ("developer", "session", "status")
