import logging
from django.db.models import QuerySet
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied, NotFound
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsTrader, IsMentor, IsTraderOrMentor
from apps.trades.models import Trade
from apps.trades.serializers import TradeSerializer
from .models import MentorAssignment, MentorAnnotation, MentorRequest
from .serializers import (
    MentorAssignmentSerializer,
    MentorAnnotationSerializer,
    MentorRequestSerializer,
    MentorRequestCreateSerializer,
)

logger = logging.getLogger(__name__)


# ── Mentor request views ──────────────────────────────────────────────────────

class MentorRequestCreateView(generics.CreateAPIView):
    """Mentor sends a follow request to a trader by email."""

    permission_classes = [IsMentor]
    serializer_class = MentorRequestCreateSerializer

    def perform_create(self, serializer):
        serializer.save()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(MentorRequestSerializer(instance).data, status=status.HTTP_201_CREATED)


class MentorRequestSentView(generics.ListAPIView):
    """Mentor lists all requests they have sent."""

    permission_classes = [IsMentor]
    serializer_class = MentorRequestSerializer

    def get_queryset(self) -> QuerySet:
        return MentorRequest.objects.filter(mentor=self.request.user).select_related("trader")


class MentorRequestReceivedView(generics.ListAPIView):
    """Trader lists all pending requests they have received."""

    permission_classes = [IsTrader]
    serializer_class = MentorRequestSerializer

    def get_queryset(self) -> QuerySet:
        return (
            MentorRequest.objects
            .filter(trader=self.request.user, status=MentorRequest.Status.PENDING)
            .select_related("mentor")
        )


class MentorRequestAcceptView(APIView):
    """Trader accepts a pending mentor request — creates an assignment."""

    permission_classes = [IsTrader]

    def post(self, request, pk: int) -> Response:
        try:
            req = MentorRequest.objects.get(pk=pk, trader=request.user, status=MentorRequest.Status.PENDING)
        except MentorRequest.DoesNotExist:
            raise NotFound("Solicitud no encontrada.")

        req.status = MentorRequest.Status.ACCEPTED
        req.save()

        assignment, _ = MentorAssignment.objects.get_or_create(
            trader=request.user,
            mentor=req.mentor,
            defaults={"is_active": True},
        )
        assignment.is_active = True
        assignment.save()

        return Response(MentorAssignmentSerializer(assignment).data, status=status.HTTP_200_OK)


class MentorRequestRejectView(APIView):
    """Trader rejects a pending mentor request."""

    permission_classes = [IsTrader]

    def post(self, request, pk: int) -> Response:
        try:
            req = MentorRequest.objects.get(pk=pk, trader=request.user, status=MentorRequest.Status.PENDING)
        except MentorRequest.DoesNotExist:
            raise NotFound("Solicitud no encontrada.")

        req.status = MentorRequest.Status.REJECTED
        req.save()
        return Response({"detail": "Solicitud rechazada."}, status=status.HTTP_200_OK)


# ── Assignment views ──────────────────────────────────────────────────────────

class AssignmentDeleteView(APIView):
    """Either party can end the mentor–trader relationship."""

    permission_classes = [IsTraderOrMentor]

    def delete(self, request, pk: int) -> Response:
        from apps.users.models import Role
        user = request.user
        try:
            if user.role == Role.MENTOR:
                assignment = MentorAssignment.objects.get(pk=pk, mentor=user)
            else:
                assignment = MentorAssignment.objects.get(pk=pk, trader=user)
        except MentorAssignment.DoesNotExist:
            raise NotFound("Asignación no encontrada.")

        assignment.is_active = False
        assignment.save()

        MentorRequest.objects.filter(
            mentor=assignment.mentor, trader=assignment.trader
        ).update(status=MentorRequest.Status.REJECTED)

        return Response(status=status.HTTP_204_NO_CONTENT)


class MentorTraderListView(generics.ListAPIView):
    """Mentor lists all active traders assigned to them with stats."""

    permission_classes = [IsMentor]
    serializer_class = MentorAssignmentSerializer

    def get_queryset(self) -> QuerySet:
        return (
            MentorAssignment.objects
            .filter(mentor=self.request.user, is_active=True)
            .select_related("trader")
        )


class MentorMyMentorView(generics.RetrieveAPIView):
    """Trader retrieves their active mentor assignment."""

    permission_classes = [IsTrader]
    serializer_class = MentorAssignmentSerializer

    def get_object(self):
        try:
            return (
                MentorAssignment.objects
                .select_related("mentor")
                .get(trader=self.request.user, is_active=True)
            )
        except MentorAssignment.DoesNotExist:
            raise NotFound("No tienes ningún mentor asignado.")


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
            raise PermissionDenied("No estás asignado a este trader.")
        return Trade.objects.filter(user_id=trader_id).order_by("-entry_time")


class MentorTradesView(generics.ListAPIView):
    """Trader reads their mentor's trade journal (read-only)."""

    permission_classes = [IsTrader]
    serializer_class = TradeSerializer

    def get_queryset(self) -> QuerySet:
        try:
            assignment = MentorAssignment.objects.get(trader=self.request.user, is_active=True)
        except MentorAssignment.DoesNotExist:
            raise NotFound("No tienes ningún mentor asignado.")
        return Trade.objects.filter(user=assignment.mentor).order_by("-entry_time")


# ── Annotation views ──────────────────────────────────────────────────────────

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
            raise PermissionDenied("No estás asignado al propietario de esta operación.")
        serializer.save(mentor=self.request.user, trade=trade)


class AnnotationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Mentor views, edits, or deletes one of their own annotations."""

    permission_classes = [IsMentor]
    serializer_class = MentorAnnotationSerializer

    def get_queryset(self) -> QuerySet:
        return MentorAnnotation.objects.filter(mentor=self.request.user)
