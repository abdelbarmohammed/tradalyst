import logging
from django.contrib.auth import authenticate
from django.conf import settings
from django.db.models import QuerySet
from rest_framework import generics, status, permissions
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from core.constants import ACCESS_TOKEN_LIFETIME_MINUTES, REFRESH_TOKEN_LIFETIME_DAYS
from .authentication import TradalystRefreshToken
from .models import CustomUser
from .permissions import IsAdmin
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserProfileSerializer,
    AdminUserSerializer,
)

logger = logging.getLogger(__name__)


def _set_auth_cookies(response: Response, refresh: RefreshToken) -> None:
    """Write access and refresh JWTs as httpOnly cookies on the response."""
    domain = getattr(settings, "COOKIE_DOMAIN", None)
    response.set_cookie(
        "access_token",
        str(refresh.access_token),
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=ACCESS_TOKEN_LIFETIME_MINUTES * 60,
        domain=domain,
    )
    response.set_cookie(
        "refresh_token",
        str(refresh),
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=REFRESH_TOKEN_LIFETIME_DAYS * 24 * 60 * 60,
        domain=domain,
    )


def _clear_auth_cookies(response: Response) -> None:
    """Delete both auth cookies from the client."""
    domain = getattr(settings, "COOKIE_DOMAIN", None)
    response.delete_cookie("access_token", domain=domain)
    response.delete_cookie("refresh_token", domain=domain)


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request: Request) -> Response:
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = TradalystRefreshToken.for_user(user)
        response = Response(UserProfileSerializer(user).data, status=status.HTTP_201_CREATED)
        _set_auth_cookies(response, refresh)
        return response


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request: Request) -> Response:
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            request,
            username=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )
        if user is None:
            return Response(
                {"detail": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        refresh = TradalystRefreshToken.for_user(user)
        response = Response(UserProfileSerializer(user).data)
        _set_auth_cookies(response, refresh)
        return response


class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request: Request) -> Response:
        raw_refresh = request.COOKIES.get("refresh_token")
        if raw_refresh:
            try:
                RefreshToken(raw_refresh).blacklist()
            except TokenError as exc:
                logger.debug("Logout blacklist skipped (token already invalid): %s", exc)
        response = Response({"detail": "Logged out."})
        _clear_auth_cookies(response)
        return response


class CookieTokenRefreshView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request: Request) -> Response:
        raw_refresh = request.COOKIES.get("refresh_token")
        if not raw_refresh:
            return Response(
                {"detail": "Refresh token not found."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        try:
            refresh = TradalystRefreshToken(raw_refresh)
        except TokenError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_401_UNAUTHORIZED)
        response = Response({"detail": "Token refreshed."})
        _set_auth_cookies(response, refresh)
        return response


class UserMeView(generics.RetrieveUpdateAPIView):
    """GET or PATCH the authenticated user's own profile."""

    serializer_class = UserProfileSerializer

    def get_object(self) -> CustomUser:
        return self.request.user


class AdminUserListView(generics.ListAPIView):
    """Admin: list all users on the platform."""

    permission_classes = [IsAdmin]
    serializer_class = AdminUserSerializer

    def get_queryset(self) -> QuerySet:
        return CustomUser.objects.all().order_by("-date_joined")


class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    """Admin: view or modify any user (suspend, change role)."""

    permission_classes = [IsAdmin]
    serializer_class = AdminUserSerializer
    queryset = CustomUser.objects.all()
