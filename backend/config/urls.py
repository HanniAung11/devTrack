from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/batches/", include("batches.urls")),
    path("api/developers/", include("developers.urls")),
    path("api/sessions/", include("schedules.urls")),
    path("api/attendance/", include("attendance.urls")),
    path("api/assignments/", include("assignments.urls")),
    path("api/dashboard/", include("dashboard.urls")),
]
