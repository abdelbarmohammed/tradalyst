import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def custom_exception_handler(exc: Exception, context: dict) -> Response | None:
    """
    Wrap DRF's default handler so unhandled exceptions return JSON
    instead of Django's HTML error page.
    """
    response = exception_handler(exc, context)

    if response is None:
        logger.exception("Unhandled exception in view", exc_info=exc)
        return Response(
            {"detail": "An unexpected error occurred."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return response
