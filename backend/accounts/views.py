from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from developers.models import Developer

from .serializers import (
    DeveloperProfileSerializer,
    LoginSerializer,
    LogoutSerializer,
    ProfileUpdateSerializer,
    RegisterSerializer,
    UserMentorSerializer,
    UserPublicSerializer,
)

User = get_user_model()


def build_profile_payload(user):
    data = {"user": UserPublicSerializer(user).data, "developer": None}
    if getattr(user, "role", None) == User.Role.DEVELOPER:
        dev = (
            Developer.objects.filter(user=user)
            .select_related("batch", "batch__mentor")
            .first()
        )
        if dev is not None:
            data["developer"] = DeveloperProfileSerializer(dev).data
    return data


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        payload = build_profile_payload(user)
        payload["access"] = str(refresh.access_token)
        payload["refresh"] = str(refresh)
        return Response(payload, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].strip().lower()
        password = serializer.validated_data["password"]

        user = User.objects.filter(email__iexact=email).first()
        if not user or not user.check_password(password):
            return Response(
                {"detail": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        if not user.is_active:
            return Response(
                {"detail": "This account is disabled."},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        payload = build_profile_payload(user)
        payload["access"] = str(refresh.access_token)
        payload["refresh"] = str(refresh)
        return Response(payload)


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Logged out successfully."})


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(build_profile_payload(request.user))

    def put(self, request):
        serializer = ProfileUpdateSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.update(request.user, serializer.validated_data)
        request.user.refresh_from_db()
        return Response(build_profile_payload(request.user))


class RefreshView(TokenRefreshView):
    permission_classes = [AllowAny]


class MentorListView(ListAPIView):
    """Users with ADMIN role (for batch mentor picker)."""

    serializer_class = UserMentorSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return User.objects.filter(role=User.Role.ADMIN, is_active=True).order_by(
            "email"
        )
