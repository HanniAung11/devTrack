import django_filters

from .models import Assignment, Submission


class AssignmentFilter(django_filters.FilterSet):
    due_date_gte = django_filters.DateFilter(field_name="due_date", lookup_expr="gte")
    due_date_lte = django_filters.DateFilter(field_name="due_date", lookup_expr="lte")

    class Meta:
        model = Assignment
        fields = ("batch",)


class SubmissionFilter(django_filters.FilterSet):
    status = django_filters.CharFilter()

    class Meta:
        model = Submission
        fields = ("assignment", "developer", "status")
