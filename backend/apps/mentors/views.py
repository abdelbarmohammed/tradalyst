import logging
from django.db.models import QuerySet
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied

from apps.users.permissions import IsTrader, IsMentor
from apps.trades.models import Trade
from apps.trades.serializers import TradeSerializer
from .models import MentorAssignment, MentorAnnotation
from .serializers import MentorAssignmentSerializer, MentorAnnotationSerializer

logger = logging.getLogger(__name__)


class AssignmentListCreateView(generics.ListCreateAPIView):
    """Trader lists their mentors or assigns a new one."""

    permission_classes = [IsTrader]
    serializer_class = MentorAssignmentSerializer

    def get_queryset(self) -> QuerySet:
        return MentorAssignment.objects.filter(trader=self.request.user).select_related("mentor")

    def perform_create(self, serializer: MentorAssignmentSerializer) -> None:
        serializer.save(trader=self.request.user)


class AssignmentDetailView(generics.RetrieveDestroyAPIView):
    """Trader views or removes a specific mentor assignment."""

    permission_classes = [IsTrader]
    serializer_class = MentorAssignmentSerializer

    def get_queryset(self) -> QuerySet:
        return MentorAssignment.objects.filter(trader=self.request.user)


class MentorTraderListView(generics.ListAPIView):
    """Mentor lists all traders currently assigned to them."""

    permission_classes = [IsMentor]
    serializer_class = MentorAssignmentSerializer

    def get_queryset(self) -> QuerySet:
        return (
            MentorAssignment.objects
            .filter(mentor=self.request.user, is_active=True)
            .select_related("trader")
        )


class MentorTraderTradeListView(generics.ListAPIView):
    """Mentor reads the full trade journal of one of their assigned traders."""

    permission_classes = [IsMentor]
    serializer_class = TradeSerializer

    def get_queryset(self) -> QuerySet:
        trader_id = self.kwargs["trader_id"]
        is_assigned = MentorAssignment.objects.filter(
            mentor=self.request.user,
            trader_id=trader_id,
            is_active=True,
        ).exists()
        if not is_assigned:
            raise PermissionDenied("You are not assigned to this trader.")
        return Trade.objects.filter(user_id=trader_id).order_by("-entry_time")


class AnnotationListCreateView(generics.ListCreateAPIView):
    """Mentor lists or adds annotations on a specific trade."""

    permission_classes = [IsMentor]
    serializer_class = MentorAnnotationSerializer

    def get_queryset(self) -> QuerySet:
        return (
            MentorAnnotation.objects
            .filter(trade_id=self.kwargs["trade_id"], mentor=self.request.user)
            .order_by("-created_at")
        )

    def perform_create(self, serializer: MentorAnnotationSerializer) -> None:
        trade = Trade.objects.get(pk=self.kwargs["trade_id"])
        is_assigned = MentorAssignment.objects.filter(
            mentor=self.request.user,
            trader=trade.user,
            is_active=True,
        ).exists()
        if not is_assigned:
            raise PermissionDenied("You are not assigned to this trade's owner.")
        serializer.save(mentor=self.request.user, trade=trade)


class AnnotationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Mentor views, edits, or deletes one of their own annotations."""

    permission_classes = [IsMentor]
    serializer_class = MentorAnnotationSerializer

    def get_queryset(self) -> QuerySet:
        return MentorAnnotation.objects.filter(mentor=self.request.user)
