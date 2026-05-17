from rest_framework.permissions import BasePermission

from citosis_pro.common import RoleChoices, UserStatusChoices


class IsActiveSystemUser(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.deleted_at is None
            and user.status == UserStatusChoices.ACTIVE
        )


class IsAdminOrManager(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.deleted_at is None
            and user.status == UserStatusChoices.ACTIVE
            and user.role in {RoleChoices.ADMIN, RoleChoices.MANAGER}
        )


class IsAdminOnly(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.deleted_at is None
            and user.status == UserStatusChoices.ACTIVE
            and user.role == RoleChoices.ADMIN
        )