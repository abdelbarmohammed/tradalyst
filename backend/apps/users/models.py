import logging
import uuid
from datetime import timedelta
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.utils.html import strip_tags
from core.constants import PASSWORD_RESET_TOKEN_EXPIRY_HOURS, EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS

logger = logging.getLogger(__name__)


class Role(models.TextChoices):
    TRADER = "trader", "Trader"
    MENTOR = "mentor", "Mentor"
    ADMIN = "admin", "Admin"


class ThemePreference(models.TextChoices):
    LIGHT = "light", "Light"
    DARK = "dark", "Dark"


class LanguagePreference(models.TextChoices):
    ES = "es", "Español"
    EN = "en", "English"


class Plan(models.TextChoices):
    FREE = "free", "Free"
    PRO = "pro", "Pro"


class CustomUserManager(BaseUserManager):
    def create_user(self, email: str, password: str | None = None, **extra_fields) -> "CustomUser":
        """Create and save a regular user with the given email and password."""
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user: CustomUser = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email: str, password: str, **extra_fields) -> "CustomUser":
        """Create and save a superuser."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", Role.ADMIN)
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    """Platform user. Email is the login field. Role determines access."""

    email = models.EmailField(unique=True)
    display_name = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.TRADER)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    onboarding_completed = models.BooleanField(default=False)
    theme_preference = models.CharField(
        max_length=5, choices=ThemePreference.choices, default=ThemePreference.LIGHT
    )
    plan = models.CharField(max_length=4, choices=Plan.choices, default=Plan.FREE)
    trial_ends_at = models.DateTimeField(null=True, blank=True)
    stripe_customer_id = models.CharField(max_length=100, blank=True)
    language_preference = models.CharField(
        max_length=2, choices=LanguagePreference.choices, default=LanguagePreference.ES
    )
    pinned_assets = models.JSONField(default=list, blank=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        db_table = "users_customuser"

    def clean(self) -> None:
        """Strip HTML tags from display_name before any full_clean() call (admin, forms)."""
        if self.display_name:
            self.display_name = strip_tags(self.display_name).strip()[:50]

    def __str__(self) -> str:
        return self.email


def _password_reset_token_expiry() -> "timezone.datetime":
    return timezone.now() + timedelta(hours=PASSWORD_RESET_TOKEN_EXPIRY_HOURS)


class PasswordResetToken(models.Model):
    """Single-use token for password reset. Expires after PASSWORD_RESET_TOKEN_EXPIRY_HOURS hours."""

    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="password_reset_tokens"
    )
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)
    expires_at = models.DateTimeField(default=_password_reset_token_expiry)

    class Meta:
        db_table = "users_passwordresettoken"

    def is_valid(self) -> bool:
        """Return True if the token has not been used and has not expired."""
        return not self.used and timezone.now() < self.expires_at

    def __str__(self) -> str:
        return f"PasswordResetToken({self.user.email}, used={self.used})"


def _email_verification_token_expiry() -> "timezone.datetime":
    return timezone.now() + timedelta(hours=EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS)


class EmailVerificationToken(models.Model):
    """Single-use token for email verification. Expires after EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS hours."""

    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="email_verification_tokens"
    )
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)
    expires_at = models.DateTimeField(default=_email_verification_token_expiry)

    class Meta:
        db_table = "users_emailverificationtoken"

    def is_valid(self) -> bool:
        """Return True if the token has not been used and has not expired."""
        return not self.used and timezone.now() < self.expires_at

    def __str__(self) -> str:
        return f"EmailVerificationToken({self.user.email}, used={self.used})"
