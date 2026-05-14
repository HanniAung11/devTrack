from django.contrib.auth import get_user_model
from rest_framework import serializers

from developers.models import Developer

User = get_user_model()


class UserPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "role", "is_active", "created_at")
        
class UserMentorSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "email", "display_name")

    def get_display_name(self, obj: User) -> str:
        name = obj.get_full_name()
        return name.strip() if name else obj.email

class DeveloperProfileSerializer(serializers.ModelSerializer):
    batch_name = serializers.CharField(
        source="batch.batch_name", read_only=True, allow_null=True
    )
    mentor_name = serializers.SerializerMethodField()
    class Meta:
        model = Developer
        fields = (
            "id",
            "developer_code",
            "full_name",
            "email",
            "phone",
            "batch",
            "batch_name",
            "mentor_name",
            "is_active",
            "joined_at",
        )

    def get_mentor_name(self, obj):
        if obj.batch and obj.batch.mentor_id:
            u = obj.batch.mentor
            return u.get_full_name() or u.email
        return None
class ProfileSerializer(serializers.Serializer):
    user = UserPublicSerializer(read_only=True)
    developer = DeveloperProfileSerializer(read_only=True, allow_null=True)
class ProfileUpdateSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    full_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=50, required=False, allow_blank=True)

    def validate_email(self, value):
        user = self.context["request"].user
        if (
            value
            and User.objects.exclude(pk=user.pk)
            .filter(email__iexact=value)
            .exists()
        ):
            raise serializers.ValidationError("This email is already in use.")
        return value

    def update(self, user, validated_data):
        email = validated_data.pop("email", None)
        full_name = validated_data.pop("full_name", None)
        phone = validated_data.pop("phone", None)
        if email is not None:
            user.email = email
            user.username = email
            user.save(update_fields=["email", "username"])
        if hasattr(user, "developer_profile"):
            dev = user.developer_profile
            if full_name is not None:
                dev.full_name = full_name
            if phone is not None:
                dev.phone = phone
            if email is not None:
                dev.email = email
            dev.save()
        return user


class RegisterSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=["ADMIN", "DEVELOPER"])

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )
        if User.objects.filter(email__iexact=attrs["email"]).exists():
            raise serializers.ValidationError(
                {"email": "An account with this email already exists."}
            )
        return attrs

    def create(self, validated_data):
        role = validated_data["role"]
        user = User.objects.create_user(
            username=validated_data["email"],
            email=validated_data["email"],
            password=validated_data["password"],
            role=role,
        )
        if role == User.Role.DEVELOPER:
            Developer.objects.create(
                user=user,
                full_name=validated_data["full_name"],
                email=user.email,
                phone="",
            )
        else:
            parts = validated_data["full_name"].strip().split(" ", 1)
            user.first_name = parts[0][:150]
            user.last_name = parts[1][:150] if len(parts) > 1 else ""
            user.save(update_fields=["first_name", "last_name"])
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def save(self, **kwargs):
        from rest_framework_simplejwt.tokens import RefreshToken

        token = RefreshToken(self.validated_data["refresh"])
        token.blacklist()
