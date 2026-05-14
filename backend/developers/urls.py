from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import DeveloperViewSet

router = DefaultRouter()
router.register("", DeveloperViewSet, basename="developer")

urlpatterns = [
    path("", include(router.urls)),
]
