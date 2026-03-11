from rest_framework import permissions
from .models import Role


class IsTrader(permissions.BasePermission):
    """Allow access only to users with the trader role."""

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == Role.TRADER
        )


class IsMentor(permissions.BasePermission):
    """Allow access only to users with the mentor role."""

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == Role.MENTOR
        )


class IsAdmin(permissions.BasePermission):
    """Allow access only to users with the admin role."""

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == Role.ADMIN
        )


class IsTraderOrMentor(permissions.BasePermission):
    """Allow traders and mentors — used for shared endpoints like watchlist and prices."""

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role in (Role.TRADER, Role.MENTOR)
        )
