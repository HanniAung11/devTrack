from django.urls import path

from .views import admin_dashboard, developer_dashboard

urlpatterns = [
    path("admin/", admin_dashboard, name="dashboard-admin"),
    path("developer/", developer_dashboard, name="dashboard-developer"),
]
