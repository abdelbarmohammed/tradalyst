import logging
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken

logger = logging.getLogger(__name__)


class CookieJWTAuthentication(JWTAuthentication):
    """Read the JWT access token from the httpOnly 'access_token' cookie."""

    def authenticate(self, request):
        raw_token = request.COOKIES.get("access_token")
        if raw_token is None:
            return None
        try:
            validated_token = self.get_validated_token(raw_token)
        except (InvalidToken, TokenError) as exc:
            logger.debug("Cookie token validation failed: %s", exc)
            return None
        return self.get_user(validated_token), validated_token


class TradalystRefreshToken(RefreshToken):
    """RefreshToken subclass that injects the user's role into the payload."""

    @classmethod
    def for_user(cls, user) -> "TradalystRefreshToken":
        token = super().for_user(user)
        token["role"] = user.role
        return token
