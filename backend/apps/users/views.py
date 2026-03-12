import logging
from datetime import timedelta
from django.contrib.auth import authenticate
from django.conf import settings
from django.db.models import Count, Max, Prefetch, Q, QuerySet
from django.utils import timezone
from rest_framework import generics, status, permissions
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from core.constants import (
    ACCESS_TOKEN_LIFETIME_MINUTES,
    REFRESH_TOKEN_LIFETIME_DAYS,
    PASSWORD_RESET_MAX_REQUESTS_PER_HOUR,
)
from .authentication import TradalystRefreshToken
from .email_service import send_password_reset_email
from .models import CustomUser, PasswordResetToken
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
    """Admin: list all users on the platform with trade stats and mentor info."""

    permission_classes = [IsAdmin]
    serializer_class = AdminUserSerializer

    def get_queryset(self) -> QuerySet:
        from apps.mentors.models import MentorAssignment

        qs = (
            CustomUser.objects
            .annotate(
                trade_count_ann=Count("trades"),
                last_trade_date_ann=Max("trades__entry_time"),
            )
            .prefetch_related(
                Prefetch(
                    "mentor_assignments",
                    queryset=MentorAssignment.objects.filter(is_active=True).select_related("mentor"),
                    to_attr="active_mentor_assignments",
                ),
                Prefetch(
                    "trader_assignments",
                    queryset=MentorAssignment.objects.filter(is_active=True),
                    to_attr="active_trader_assignments",
                ),
            )
        )

        role = self.request.query_params.get("role")
        if role:
            qs = qs.filter(role=role)

        search = self.request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(Q(email__icontains=search) | Q(display_name__icontains=search))

        allowed_orderings = {"-date_joined", "date_joined", "email", "-email"}
        ordering = self.request.query_params.get("ordering", "-date_joined")
        qs = qs.order_by(ordering if ordering in allowed_orderings else "-date_joined")

        return qs


class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    """Admin: view or modify any user (suspend, change role)."""

    permission_classes = [IsAdmin]
    serializer_class = AdminUserSerializer
    queryset = CustomUser.objects.all()


_SAFE_RESPONSE = {
    "message": "Si existe una cuenta con ese email, recibirás un enlace en breve."
}


class ForgotPasswordView(APIView):
    """POST /api/auth/forgot-password/ — request a password-reset email."""

    permission_classes = [permissions.AllowAny]

    def post(self, request: Request) -> Response:
        email = (request.data.get("email") or "").strip().lower()
        if not email:
            return Response(_SAFE_RESPONSE)

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response(_SAFE_RESPONSE)

        one_hour_ago = timezone.now() - timedelta(hours=1)
        recent_count = PasswordResetToken.objects.filter(
            user=user, created_at__gte=one_hour_ago
        ).count()
        if recent_count >= PASSWORD_RESET_MAX_REQUESTS_PER_HOUR:
            return Response(_SAFE_RESPONSE)

        token = PasswordResetToken.objects.create(user=user)
        try:
            send_password_reset_email(user, token)
        except Exception:
            pass

        return Response(_SAFE_RESPONSE)


class ValidateResetTokenView(APIView):
    """GET /api/auth/validate-reset-token/<token>/ — check if a reset token is still valid."""

    permission_classes = [permissions.AllowAny]

    def get(self, request: Request, token: str) -> Response:
        try:
            reset_token = PasswordResetToken.objects.get(token=token)
        except PasswordResetToken.DoesNotExist:
            return Response({"detail": "Token inválido."}, status=status.HTTP_400_BAD_REQUEST)

        if not reset_token.is_valid():
            return Response({"detail": "Token expirado o ya utilizado."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "Token válido."})


class ResetPasswordView(APIView):
    """POST /api/auth/reset-password/ — set a new password using a valid reset token."""

    permission_classes = [permissions.AllowAny]

    def post(self, request: Request) -> Response:
        token_str = (request.data.get("token") or "").strip()
        password = request.data.get("password") or ""
        password_confirm = request.data.get("password_confirm") or ""

        if not token_str:
            return Response({"detail": "Token requerido."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            reset_token = PasswordResetToken.objects.select_related("user").get(token=token_str)
        except (PasswordResetToken.DoesNotExist, ValueError):
            return Response({"detail": "Token inválido."}, status=status.HTTP_400_BAD_REQUEST)

        if not reset_token.is_valid():
            return Response({"detail": "Token expirado o ya utilizado."}, status=status.HTTP_400_BAD_REQUEST)

        if not password or not password_confirm:
            return Response({"detail": "Contraseña requerida."}, status=status.HTTP_400_BAD_REQUEST)

        if password != password_confirm:
            return Response({"detail": "Las contraseñas no coinciden."}, status=status.HTTP_400_BAD_REQUEST)

        if len(password) < 8:
            return Response({"detail": "La contraseña debe tener al menos 8 caracteres."}, status=status.HTTP_400_BAD_REQUEST)

        import re
        if not re.search(r"[A-Z]", password):
            return Response({"detail": "La contraseña debe contener al menos una mayúscula."}, status=status.HTTP_400_BAD_REQUEST)

        if not re.search(r"[0-9]", password):
            return Response({"detail": "La contraseña debe contener al menos un número."}, status=status.HTTP_400_BAD_REQUEST)

        user = reset_token.user
        user.set_password(password)
        user.save(update_fields=["password"])

        reset_token.used = True
        reset_token.save(update_fields=["used"])

        try:
            from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
            outstanding = OutstandingToken.objects.filter(user=user)
            for outstanding_token in outstanding:
                BlacklistedToken.objects.get_or_create(token=outstanding_token)
        except Exception as exc:
            logger.warning("Could not blacklist outstanding tokens for user %s: %s", user.email, exc)

        return Response({"detail": "Contraseña actualizada correctamente."})
