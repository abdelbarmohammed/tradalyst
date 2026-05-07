import logging
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

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

    def __str__(self) -> str:
        return self.email
