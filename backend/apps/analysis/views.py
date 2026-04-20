import logging
from django.db.models import QuerySet
from rest_framework import generics, status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsTrader
from .models import AiInsight, ChatMessage
from .serializers import AiInsightSerializer, ChatMessageSerializer, ChatInputSerializer
from .services.claude import ClaudeService

logger = logging.getLogger(__name__)


class InsightListView(generics.ListAPIView):
    """List all AI insights generated for the authenticated trader."""

    permission_classes = [IsTrader]
    serializer_class = AiInsightSerializer

    def get_queryset(self) -> QuerySet:
        return AiInsight.objects.filter(user=self.request.user)


class InsightGenerateView(APIView):
    """Trigger generation of a new weekly insight for the authenticated trader."""

    permission_classes = [IsTrader]

    def post(self, request: Request) -> Response:
        try:
            insight = ClaudeService().generate_weekly_insight(request.user)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            logger.error("Insight generation failed for %s: %s", request.user.email, exc)
            return Response(
                {"detail": "AI service temporarily unavailable."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response(AiInsightSerializer(insight).data, status=status.HTTP_201_CREATED)


class ChatHistoryView(generics.ListAPIView):
    """Return the full persistent chat history for the authenticated trader."""

    permission_classes = [IsTrader]
    serializer_class = ChatMessageSerializer

    def get_queryset(self) -> QuerySet:
        return ChatMessage.objects.filter(user=self.request.user).order_by("created_at")


class ChatSendView(APIView):
    """Send a message to Claude and return the assistant reply."""

    permission_classes = [IsTrader]

    def post(self, request: Request) -> Response:
        serializer = ChatInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            assistant_msg = ClaudeService().chat(
                request.user,
                serializer.validated_data["message"],
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as exc:
            logger.error("Chat failed for %s: %s", request.user.email, exc)
            return Response(
                {"detail": "AI service temporarily unavailable."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response(ChatMessageSerializer(assistant_msg).data, status=status.HTTP_201_CREATED)
