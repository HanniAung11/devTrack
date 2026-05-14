from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AssignmentViewSet, SubmissionViewSet

router = DefaultRouter()
router.register("submissions", SubmissionViewSet, basename="submission")
router.register("", AssignmentViewSet, basename="assignment")

urlpatterns = [
    path("", include(router.urls)),
]
