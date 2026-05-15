from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsAdminForWriteOrAuthenticatedRead(BasePermission):

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return getattr(user, "role", None) == "ADMIN"


class IsAdminOrReadOrDeveloperSubmissionWrite(BasePermission):
    """
    Admins: full access. Authenticated users: GET/HEAD/OPTIONS.
    Developers: may create/update/delete submissions (scoped to own rows via queryset).
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if getattr(user, "role", None) == "ADMIN":
            return True
        if request.method in SAFE_METHODS:
            return True
        return getattr(user, "role", None) == "DEVELOPER"


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and getattr(user, "role", None) == "ADMIN"
        )
