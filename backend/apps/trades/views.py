import csv
import io
import logging
from datetime import datetime
from decimal import Decimal, InvalidOperation
from django.db.models import Sum, Avg, Count, Max, Min, QuerySet
from rest_framework import generics, status
from rest_framework.parsers import MultiPartParser
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from core.constants import CSV_IMPORT_MAX_ROWS, CSV_IMPORT_MAX_SIZE_BYTES
from apps.users.permissions import IsTrader, IsTraderOrMentor
from .models import Trade, TradeResult, Direction, Emotion
from .serializers import TradeSerializer, TradeStatsSerializer
from .filters import TradeFilter

logger = logging.getLogger(__name__)


class TradeListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsTraderOrMentor]
    serializer_class = TradeSerializer
    filterset_class = TradeFilter
    ordering_fields = ["entry_time", "pnl", "created_at"]
    ordering = ["-entry_time"]

    def get_queryset(self) -> QuerySet:
        return Trade.objects.filter(user=self.request.user)

    def perform_create(self, serializer: TradeSerializer) -> None:
        serializer.save(user=self.request.user)


class TradeDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsTraderOrMentor]
    serializer_class = TradeSerializer

    def get_queryset(self) -> QuerySet:
        return Trade.objects.filter(user=self.request.user)


class TradeStatsView(APIView):
    permission_classes = [IsTraderOrMentor]

    def get(self, request: Request) -> Response:
        """Return aggregate trading statistics for the authenticated trader."""
        qs = Trade.objects.filter(user=request.user)
        closed = qs.exclude(pnl__isnull=True)

        winning = closed.filter(result=TradeResult.WIN).count()
        losing = closed.filter(result=TradeResult.LOSS).count()
        breakeven = closed.filter(result=TradeResult.BREAKEVEN).count()
        closed_count = closed.count()

        win_rate = (winning / closed_count * 100) if closed_count > 0 else 0.0

        agg = closed.aggregate(
            total_pnl=Sum("pnl"),
            avg_pnl=Avg("pnl"),
            avg_rr=Avg("risk_reward_ratio"),
            best_pnl=Max("pnl"),
            worst_pnl=Min("pnl"),
        )

        most_traded = (
            qs.values("pair")
            .annotate(count=Count("id"))
            .order_by("-count")
            .first()
        )

        stats = {
            "total_trades": qs.count(),
            "closed_trades": closed_count,
            "winning_trades": winning,
            "losing_trades": losing,
            "breakeven_trades": breakeven,
            "win_rate": round(win_rate, 2),
            "total_pnl": agg["total_pnl"] or Decimal("0"),
            "avg_pnl_per_trade": agg["avg_pnl"] or Decimal("0"),
            "avg_risk_reward": agg["avg_rr"],
            "max_drawdown": self._calculate_max_drawdown(closed.order_by("entry_time")),
            "best_trade_pnl": agg["best_pnl"],
            "worst_trade_pnl": agg["worst_pnl"],
            "most_traded_pair": most_traded["pair"] if most_traded else None,
        }

        return Response(TradeStatsSerializer(stats).data)

    @staticmethod
    def _calculate_max_drawdown(closed_trades: QuerySet) -> Decimal:
        """Peak-to-trough decline in cumulative P&L across chronological trades."""
        cumulative = Decimal("0")
        peak = Decimal("0")
        max_dd = Decimal("0")
        for trade in closed_trades.only("pnl"):
            cumulative += trade.pnl or Decimal("0")
            if cumulative > peak:
                peak = cumulative
            drawdown = peak - cumulative
            if drawdown > max_dd:
                max_dd = drawdown
        return max_dd


# ── Column name aliases accepted from CSV headers ────────────────────────────
_COL_ALIASES: dict[str, str] = {
    "date": "entry_time",
    "fecha": "entry_time",
    "entry_time": "entry_time",
    "asset": "pair",
    "par": "pair",
    "pair": "pair",
    "ticker": "pair",
    "symbol": "pair",
    "direction": "direction",
    "direccion": "direction",
    "lado": "direction",
    "side": "direction",
    "entry_price": "entry_price",
    "entry": "entry_price",
    "entrada": "entry_price",
    "precio_entrada": "entry_price",
    "exit_price": "exit_price",
    "exit": "exit_price",
    "salida": "exit_price",
    "precio_salida": "exit_price",
    "size": "quantity",
    "quantity": "quantity",
    "cantidad": "quantity",
    "volumen": "quantity",
    "volume": "quantity",
    "result": "result",
    "resultado": "result",
    "outcome": "result",
    "pnl": "pnl",
    "profit": "pnl",
    "ganancia": "pnl",
    "reasoning": "notes",
    "notes": "notes",
    "notas": "notes",
    "comentario": "notes",
    "emotion": "emotion",
    "emocion": "emotion",
    "estado": "emotion",
}


def _parse_direction(raw: str) -> str:
    v = raw.strip().lower()
    if v in ("long", "buy", "compra", "l"):
        return Direction.LONG
    if v in ("short", "sell", "venta", "s"):
        return Direction.SHORT
    raise ValueError(f"Direction invalida: {raw!r}")


def _parse_result(raw: str) -> str:
    v = raw.strip().lower()
    if v in ("win", "ganancia", "profit", "w", "1"):
        return TradeResult.WIN
    if v in ("loss", "pérdida", "perdida", "lose", "l", "-1"):
        return TradeResult.LOSS
    if v in ("breakeven", "be", "empate", "0"):
        return TradeResult.BREAKEVEN
    return ""


def _parse_emotion(raw: str) -> str:
    v = raw.strip().lower()
    emotion_map = {
        "calm": Emotion.CALM, "calmado": Emotion.CALM, "tranquilo": Emotion.CALM,
        "confident": Emotion.CONFIDENT, "confiado": Emotion.CONFIDENT,
        "fearful": Emotion.FEARFUL, "miedo": Emotion.FEARFUL,
        "greedy": Emotion.GREEDY, "codicia": Emotion.GREEDY,
        "anxious": Emotion.ANXIOUS, "ansioso": Emotion.ANXIOUS,
        "fomo": Emotion.FOMO,
        "revenge": Emotion.REVENGE, "venganza": Emotion.REVENGE,
        "neutral": Emotion.NEUTRAL,
    }
    return emotion_map.get(v, "")


def _parse_datetime(raw: str) -> datetime:
    raw = raw.strip()
    for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y"):
        try:
            dt = datetime.strptime(raw, fmt)
            if dt.tzinfo is None:
                from django.utils.timezone import make_aware
                dt = make_aware(dt)
            return dt
        except ValueError:
            continue
    raise ValueError(f"Fecha no reconocida: {raw!r}")


class TradeCSVImportView(APIView):
    """POST /api/trades/import/ — import trades from a CSV file."""

    permission_classes = [IsTrader]
    parser_classes = [MultiPartParser]

    def post(self, request: Request) -> Response:
        file = request.FILES.get("file")
        if file is None:
            return Response({"detail": "No se recibió ningún archivo."}, status=status.HTTP_400_BAD_REQUEST)

        if file.size > CSV_IMPORT_MAX_SIZE_BYTES:
            return Response({"detail": "Archivo demasiado grande (máx. 5 MB)."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            content = file.read().decode("utf-8-sig")
        except UnicodeDecodeError:
            return Response({"detail": "El archivo debe estar codificado en UTF-8."}, status=status.HTTP_400_BAD_REQUEST)

        reader = csv.DictReader(io.StringIO(content))
        if not reader.fieldnames:
            return Response({"detail": "CSV vacío o sin cabecera."}, status=status.HTTP_400_BAD_REQUEST)

        # Map CSV headers to internal field names
        header_map: dict[str, str] = {}
        for raw_col in reader.fieldnames:
            normalised = raw_col.strip().lower().replace(" ", "_")
            if normalised in _COL_ALIASES:
                header_map[raw_col] = _COL_ALIASES[normalised]

        to_create: list[Trade] = []
        errors: list[str] = []
        skipped = 0

        for i, row in enumerate(reader, start=2):
            if len(to_create) + skipped >= CSV_IMPORT_MAX_ROWS:
                errors.append(f"Límite de {CSV_IMPORT_MAX_ROWS} filas alcanzado; el resto se ignoró.")
                break

            mapped: dict[str, str] = {}
            for raw_col, field in header_map.items():
                val = (row.get(raw_col) or "").strip()
                if val:
                    mapped[field] = val

            # Required fields
            missing = [f for f in ("entry_time", "pair", "direction", "entry_price", "quantity") if f not in mapped]
            if missing:
                errors.append(f"Fila {i}: faltan columnas: {', '.join(missing)}")
                skipped += 1
                continue

            try:
                entry_time = _parse_datetime(mapped["entry_time"])
                direction = _parse_direction(mapped["direction"])
                entry_price = Decimal(mapped["entry_price"].replace(",", "."))
                quantity = Decimal(mapped["quantity"].replace(",", "."))

                exit_price: Decimal | None = None
                if "exit_price" in mapped and mapped["exit_price"]:
                    exit_price = Decimal(mapped["exit_price"].replace(",", "."))

                exit_time = None
                if "exit_time" in mapped and mapped["exit_time"]:
                    exit_time = _parse_datetime(mapped["exit_time"])

                result = _parse_result(mapped.get("result", ""))
                emotion = _parse_emotion(mapped.get("emotion", ""))
                notes = mapped.get("notes", "")

                trade = Trade(
                    user=request.user,
                    pair=mapped["pair"].upper(),
                    direction=direction,
                    entry_price=entry_price,
                    exit_price=exit_price,
                    quantity=quantity,
                    entry_time=entry_time,
                    exit_time=exit_time,
                    result=result,
                    emotion=emotion,
                    notes=notes,
                )
                to_create.append(trade)
            except (ValueError, InvalidOperation) as exc:
                errors.append(f"Fila {i}: {exc}")
                skipped += 1

        if to_create:
            # Use save() per row so the auto-pnl logic in Trade.save() fires
            for trade in to_create:
                trade.save()

        return Response({
            "imported": len(to_create),
            "skipped": skipped,
            "errors": errors[:20],
        }, status=status.HTTP_200_OK)
