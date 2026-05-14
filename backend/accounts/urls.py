from django.urls import path

from .views import (
    LoginView,
    LogoutView,
    MentorListView,
    ProfileView,
    RefreshView,
    RegisterView,
)

urlpatterns = [
    path("login/", LoginView.as_view(), name="auth-login"),
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("token/refresh/", RefreshView.as_view(), name="auth-token-refresh"),
    path("profile/", ProfileView.as_view(), name="auth-profile"),
    path("mentors/", MentorListView.as_view(), name="auth-mentors"),
]
