import csv
import logging
from datetime import timedelta

from django.db.models import Count, Max
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.mentors.models import MentorAssignment, MentorRequest
from apps.trades.models import Trade
from apps.trades.serializers import TradeSerializer
from .models import CustomUser, Role, Plan
from .permissions import IsAdmin

logger = logging.getLogger(__name__)

_ADMIN_TOP_TRADERS_LIMIT = 5
_ADMIN_SIGNUPS_DAYS = 30


class AdminStatsView(APIView):
    """GET /api/admin/stats/ — platform-wide statistics for the admin dashboard."""

    permission_classes = [IsAdmin]

    def get(self, request: Request) -> Response:
        now = timezone.now()
        week_start = now - timedelta(days=7)
        last_week_start = now - timedelta(days=14)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        all_users = CustomUser.objects.all()

        users_data = {
            "total": all_users.count(),
            "traders": all_users.filter(role=Role.TRADER).count(),
            "mentors": all_users.filter(role=Role.MENTOR).count(),
            "admins": all_users.filter(role=Role.ADMIN).count(),
            "free": all_users.filter(plan=Plan.FREE).count(),
            "pro": all_users.filter(plan=Plan.PRO).count(),
            "new_this_week": all_users.filter(date_joined__gte=week_start).count(),
            "new_last_week": all_users.filter(
                date_joined__gte=last_week_start,
                date_joined__lt=week_start,
            ).count(),
        }

        all_trades = Trade.objects.all()
        trades_data = {
            "total": all_trades.count(),
            "this_week": all_trades.filter(entry_time__gte=week_start).count(),
            "last_week": all_trades.filter(
                entry_time__gte=last_week_start,
                entry_time__lt=week_start,
            ).count(),
            "today": all_trades.filter(entry_time__gte=today_start).count(),
        }

        mentorships_data = {
            "active": MentorAssignment.objects.filter(is_active=True).count(),
            "pending_requests": MentorRequest.objects.filter(
                status=MentorRequest.Status.PENDING
            ).count(),
        }

        top_traders_qs = (
            CustomUser.objects
            .filter(role=Role.TRADER)
            .annotate(trade_count=Count("trades"))
            .order_by("-trade_count")[:_ADMIN_TOP_TRADERS_LIMIT]
        )
        top_traders = []
        for user in top_traders_qs:
            closed = user.trades.filter(result__in=["win", "loss"])
            wins = closed.filter(result="win").count()
            total_closed = closed.count()
            win_rate = round(wins / total_closed * 100) if total_closed > 0 else 0
            last_trade = user.trades.order_by("-entry_time").first()
            top_traders.append({
                "id": user.id,
                "display_name": user.display_name or user.email.split("@")[0],
                "email": user.email,
                "trade_count": user.trade_count,
                "win_rate": win_rate,
                "plan": user.plan,
                "last_active": (
                    last_trade.entry_time.date().isoformat() if last_trade else None
                ),
            })

        thirty_days_ago = now - timedelta(days=_ADMIN_SIGNUPS_DAYS)
        signups_qs = (
            CustomUser.objects
            .filter(date_joined__gte=thirty_days_ago)
            .values("date_joined__date")
            .annotate(count=Count("id"))
            .order_by("date_joined__date")
        )
        signups_map = {
            str(row["date_joined__date"]): row["count"] for row in signups_qs
        }
        signups_last_30_days = [
            {
                "date": str((now - timedelta(days=i)).date()),
                "count": signups_map.get(str((now - timedelta(days=i)).date()), 0),
            }
            for i in range(_ADMIN_SIGNUPS_DAYS, -1, -1)
        ]

        # Recent activity: last 5 registrations + last 5 assignments
        recent_users = (
            CustomUser.objects
            .order_by("-date_joined")[:5]
        )
        recent_assignments = (
            MentorAssignment.objects
            .filter(is_active=True)
            .select_related("mentor", "trader")
            .order_by("-created_at")[:5]
        )
        activity = []
        for u in recent_users:
            activity.append({
                "type": "registration",
                "display_name": u.display_name or u.email.split("@")[0],
                "timestamp": u.date_joined.isoformat(),
            })
        for a in recent_assignments:
            activity.append({
                "type": "assignment",
                "mentor_name": a.mentor.display_name or a.mentor.email.split("@")[0],
                "trader_name": a.trader.display_name or a.trader.email.split("@")[0],
                "timestamp": a.created_at.isoformat(),
            })
        activity.sort(key=lambda x: x["timestamp"], reverse=True)

        return Response({
            "users": users_data,
            "trades": trades_data,
            "mentorships": mentorships_data,
            "top_traders": top_traders,
            "signups_last_30_days": signups_last_30_days,
            "recent_activity": activity[:10],
        })


class AdminMentorshipsView(APIView):
    """GET /api/admin/mentorships/ — all active assignments and pending requests."""

    permission_classes = [IsAdmin]

    def get(self, request: Request) -> Response:
        assignments = (
            MentorAssignment.objects
            .filter(is_active=True)
            .select_related("mentor", "trader")
            .annotate(trader_trade_count=Count("trader__trades", distinct=True))
            .order_by("-created_at")
        )

        assignments_data = [
            {
                "id": a.id,
                "mentor": {
                    "id": a.mentor.id,
                    "display_name": a.mentor.display_name or a.mentor.email.split("@")[0],
                    "email": a.mentor.email,
                },
                "trader": {
                    "id": a.trader.id,
                    "display_name": a.trader.display_name or a.trader.email.split("@")[0],
                    "email": a.trader.email,
                    "trade_count": a.trader_trade_count,
                    "plan": a.trader.plan,
                },
                "assigned_at": a.created_at.isoformat(),
                "is_active": a.is_active,
            }
            for a in assignments
        ]

        pending_requests = (
            MentorRequest.objects
            .filter(status=MentorRequest.Status.PENDING)
            .select_related("mentor", "trader")
            .order_by("-created_at")
        )

        requests_data = [
            {
                "id": r.id,
                "mentor": {
                    "id": r.mentor.id,
                    "display_name": r.mentor.display_name or r.mentor.email.split("@")[0],
                    "email": r.mentor.email,
                },
                "trader": {
                    "id": r.trader.id,
                    "display_name": r.trader.display_name or r.trader.email.split("@")[0],
                    "email": r.trader.email,
                },
                "status": r.status,
                "created_at": r.created_at.isoformat(),
            }
            for r in pending_requests
        ]

        return Response({
            "assignments": assignments_data,
            "requests": requests_data,
        })


class AdminAssignmentDeleteView(APIView):
    """DELETE /api/admin/assignments/<pk>/ — admin dissolves any mentorship."""

    permission_classes = [IsAdmin]

    def delete(self, request: Request, pk: int) -> Response:
        try:
            assignment = MentorAssignment.objects.get(pk=pk)
        except MentorAssignment.DoesNotExist:
            raise NotFound("Asignación no encontrada.")

        assignment.is_active = False
        assignment.save()

        MentorRequest.objects.filter(
            mentor=assignment.mentor,
            trader=assignment.trader,
        ).update(status=MentorRequest.Status.REJECTED)

        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminUserTradesView(APIView):
    """GET /api/admin/users/<pk>/trades/ — last 10 trades for any user."""

    permission_classes = [IsAdmin]

    def get(self, request: Request, pk: int) -> Response:
        try:
            user = CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            raise NotFound("Usuario no encontrado.")

        trades = user.trades.order_by("-entry_time")[:10]
        return Response(TradeSerializer(trades, many=True).data)


class AdminExportUsersView(APIView):
    """GET /api/admin/export/users/ — CSV download of all users."""

    permission_classes = [IsAdmin]

    def get(self, request: Request) -> HttpResponse:
        users = (
            CustomUser.objects
            .annotate(
                trade_count=Count("trades"),
                last_trade_date=Max("trades__entry_time"),
            )
            .order_by("-date_joined")
        )

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="tradalyst_users.csv"'

        writer = csv.writer(response)
        writer.writerow([
            "email", "display_name", "role", "plan",
            "trade_count", "joined_date", "last_active", "is_active",
        ])

        for user in users:
            last_active = (
                user.last_trade_date.date().isoformat()
                if user.last_trade_date
                else user.date_joined.date().isoformat()
            )
            writer.writerow([
                user.email,
                user.display_name,
                user.role,
                user.plan,
                user.trade_count,
                user.date_joined.date().isoformat(),
                last_active,
                user.is_active,
            ])

        return response
