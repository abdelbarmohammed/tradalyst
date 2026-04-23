#!/usr/bin/env python3
"""
Fill the gap between the last trade and today for trader@tradalyst.com.

Usage:
    cd /var/www/tradalyst/backend
    python ../tools/scripts/topup_trades.py
"""

import os
import sys
import random
import logging
from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, timedelta, timezone

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "..", "..", "backend")
sys.path.insert(0, os.path.abspath(BACKEND_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "tradalyst.settings.production")

import django
django.setup()

from apps.users.models import CustomUser
from apps.trades.models import Trade

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")
logger = logging.getLogger(__name__)

TRADER_EMAIL = "trader@tradalyst.com"

# ── Reuse the same config as seed_demo.py ────────────────────────────────────

ASSETS = {
    "BTC/USDT": {"base_price": 55_000.0, "annual_drift": 0.60, "volatility": 0.025,
                 "qty_min": 0.02, "qty_max": 0.15, "price_decimals": 2, "qty_decimals": 4},
    "ETH/USDT": {"base_price": 2_800.0, "annual_drift": 0.45, "volatility": 0.028,
                 "qty_min": 0.2, "qty_max": 4.0, "price_decimals": 2, "qty_decimals": 4},
    "SOL/USDT": {"base_price": 130.0, "annual_drift": 0.90, "volatility": 0.035,
                 "qty_min": 2.0, "qty_max": 40.0, "price_decimals": 3, "qty_decimals": 2},
    "EUR/USD":  {"base_price": 1.085, "annual_drift": -0.02, "volatility": 0.004,
                 "qty_min": 1_000.0, "qty_max": 10_000.0, "price_decimals": 5, "qty_decimals": 0},
    "AAPL":     {"base_price": 185.0, "annual_drift": 0.25, "volatility": 0.012,
                 "qty_min": 2.0, "qty_max": 25.0, "price_decimals": 2, "qty_decimals": 0},
}

ASSET_NAMES  = list(ASSETS.keys())
ASSET_WEIGHTS = [0.33, 0.27, 0.17, 0.13, 0.10]

EMOTION_DIST = [("confident", 0.40), ("fomo", 0.25), ("fearful", 0.20), ("revenge", 0.15)]
WIN_RATE     = {"confident": 0.93, "fomo": 0.33, "fearful": 0.86, "revenge": 0.30}

REASONS = {
    "confident": [
        "Confirmación de soporte técnico. RSI neutral, MACD alcista. Entrada con buena relación riesgo/beneficio y tendencia principal a favor.",
        "Patrón de continuación formado tras consolidación. Volumen creciente en ruptura. Stop colocado bajo mínimo de referencia anterior.",
        "Retroceso al 61.8%% de Fibonacci en tendencia alcista. Confluencia con media de 50 períodos. Target en máximos previos del rango.",
        "Ruptura de resistencia clave con cierre fuerte. Setup de alta probabilidad según historial. Gestión del riesgo bien definida.",
        "Setup alineado en H4 y diario. Volumen institucional en apertura europea. Sesgo positivo confirmado por contexto macro esta semana.",
        "Divergencia alcista en RSI frente a mínimos recientes. Zona de demanda histórica respetada. Entrada técnica limpia con stop ajustado.",
        "Estructura de mercado alcista intacta. Higher high y higher low confirmados. Entrada en pullback hacia zona de valor con momentum positivo.",
    ],
    "fomo": [
        "El precio lleva varias velas consecutivas al alza. Entro tarde en el movimiento sin esperar mi setup habitual por miedo a perderlo.",
        "Movimiento muy fuerte en las últimas horas. He entrado sin confirmación porque no quería quedarme fuera del rally principal de hoy.",
        "Todos los activos subiendo fuerte. He entrado impulsivamente sin respetar mi plan de trading. El FOMO ha ganado esta vez.",
        "Noticia positiva inesperada. Precio en movimiento explosivo. He entrado sin pullback, directamente en el breakout por miedo a perder.",
    ],
    "fearful": [
        "Setup válido técnicamente pero hay incertidumbre macro. Entro con tamaño reducido y stop muy ajustado. No tengo total convicción.",
        "Señal técnica clara pero el mercado está volátil hoy. He reducido el tamaño al 50%% de lo habitual por precaución.",
        "Zona de soporte históricamente sólida pero el contexto general es negativo. Entro con cautela y tamaño conservador.",
        "Patrón válido aunque hay resistencia importante cerca. Entro con poca convicción. Si no funciona en el primer movimiento, cierro.",
    ],
    "revenge": [
        "Acabo de tener un stop. Vuelvo a entrar buscando recuperar lo perdido. Sé que no es lo correcto pero el impulso es muy fuerte.",
        "Dos pérdidas seguidas hoy. Entro con más tamaño para recuperar antes del cierre. No debería hacer esto pero lo hago igualmente.",
        "El mercado me sacó por el stop y luego fue en mi dirección. Entro de nuevo para demostrar que mi análisis era correcto.",
        "En modo revenge. El setup no es el mejor pero necesito recuperar. Soy consciente del error psicológico que estoy cometiendo.",
    ],
}


def d(value: float, decimals: int) -> Decimal:
    q = "0." + "0" * decimals if decimals > 0 else "0"
    return Decimal(str(value)).quantize(Decimal(q), rounding=ROUND_HALF_UP)


def asset_price(asset: str, dt: datetime) -> float:
    cfg = ASSETS[asset]
    ref = datetime(2024, 1, 1, tzinfo=timezone.utc)
    days = (dt - ref).days
    drift = (1 + cfg["annual_drift"]) ** (days / 365)
    base = cfg["base_price"] * drift
    day_seed = int(dt.strftime("%Y%m%d")) + hash(asset) % 10_000
    noise = random.Random(day_seed).gauss(0, cfg["volatility"])
    return max(base * (1 + noise), cfg["base_price"] * 0.3)


def exit_price_for(asset: str, entry: float, direction: str, win: bool, emotion: str) -> float:
    move_pct = (
        random.uniform(0.009, 0.030) if (win and emotion == "confident")
        else random.uniform(0.005, 0.018) if win
        else random.uniform(0.012, 0.035) if emotion in ("fomo", "revenge")
        else random.uniform(0.006, 0.018)
    )
    move = entry * move_pct
    if direction == "long":
        return max(entry + move if win else entry - move, entry * 0.1)
    return max(entry - move if win else entry + move, entry * 0.1)


def quantity_for(asset: str) -> float:
    cfg = ASSETS[asset]
    qty = random.uniform(cfg["qty_min"], cfg["qty_max"])
    return round(qty) if cfg["qty_decimals"] == 0 else round(qty, cfg["qty_decimals"])


def pick_emotion(consecutive_losses: int) -> str:
    dist = (
        [("confident", 0.20), ("fomo", 0.25), ("fearful", 0.22), ("revenge", 0.33)]
        if consecutive_losses >= 2
        else EMOTION_DIST
    )
    emotions, weights = zip(*dist)
    return random.choices(emotions, weights=weights)[0]


def resolve_win(emotion: str, is_tuesday: bool, consecutive_losses: int) -> bool:
    rate = WIN_RATE[emotion]
    if is_tuesday:
        rate *= 0.74
    if consecutive_losses >= 3:
        rate *= 0.68
    elif consecutive_losses == 2:
        rate *= 0.85
    return random.random() < rate


def render_reason(emotion: str, entry: float) -> str:
    tmpl = random.choice(REASONS[emotion])
    try:
        return tmpl.format(price=entry)
    except (KeyError, ValueError):
        return tmpl


def main() -> None:
    logger.info("═══════════════════════════════════")
    logger.info("  Tradalyst — trade top-up")
    logger.info("═══════════════════════════════════")

    trader = CustomUser.objects.get(email=TRADER_EMAIL)
    last_trade = Trade.objects.filter(user=trader).order_by("-entry_time").first()

    if not last_trade:
        logger.error("No trades found — run seed_demo.py first.")
        sys.exit(1)

    start_dt = last_trade.entry_time.replace(
        hour=0, minute=0, second=0, microsecond=0
    ) + timedelta(days=1)
    end_dt = datetime.now(timezone.utc).replace(
        hour=23, minute=59, second=59, microsecond=0
    )

    gap_days = (end_dt - start_dt).days
    logger.info(f"  Gap: {start_dt.date()} → {end_dt.date()} ({gap_days} days)")

    if gap_days <= 0:
        logger.info("  No gap to fill.")
        return

    # Build timestamps across the gap (2–4 trades per trading day)
    timestamps: list[datetime] = []
    day = start_dt
    while day <= end_dt:
        if day.weekday() in (5, 6) and random.random() > 0.30:
            day += timedelta(days=1)
            continue
        n_day = random.choices([1, 2, 3, 4], weights=[0.20, 0.42, 0.28, 0.10])[0]
        for _ in range(n_day):
            ts = day.replace(
                hour=random.randint(8, 21),
                minute=random.randint(0, 59),
                second=random.randint(0, 59),
            )
            if ts <= end_dt:
                timestamps.append(ts)
        day += timedelta(days=1)

    timestamps.sort()
    logger.info(f"  Generating {len(timestamps)} trades…")

    # Get the consecutive-loss state at the point of the last trade
    consecutive_losses = 0
    recent = list(Trade.objects.filter(user=trader).order_by("-entry_time")[:5])
    for t in recent:
        if t.result == "loss":
            consecutive_losses += 1
        else:
            break

    new_trades: list[Trade] = []
    for entry_time in timestamps:
        asset     = random.choices(ASSET_NAMES, weights=ASSET_WEIGHTS)[0]
        direction = random.choices(["long", "short"], weights=[0.60, 0.40])[0]
        emotion   = pick_emotion(consecutive_losses)
        win       = resolve_win(emotion, entry_time.weekday() == 1, consecutive_losses)

        ep  = asset_price(asset, entry_time)
        xp  = exit_price_for(asset, ep, direction, win, emotion)
        qty = quantity_for(asset)
        cfg = ASSETS[asset]

        entry_d = d(ep, cfg["price_decimals"])
        exit_d  = d(xp, cfg["price_decimals"])
        qty_d   = d(qty, cfg["qty_decimals"])

        if direction == "long":
            pnl_d = (exit_d - entry_d) * qty_d
        else:
            pnl_d = (entry_d - exit_d) * qty_d
        pnl_d = pnl_d.quantize(Decimal("0.01"))

        result = "win" if pnl_d > 0 else ("loss" if pnl_d < 0 else "breakeven")

        if emotion == "confident":
            rr = d(random.uniform(1.8, 3.2), 2)
        elif emotion in ("fomo", "revenge"):
            rr = d(random.uniform(0.8, 1.5), 2)
        else:
            rr = d(random.uniform(1.2, 2.2), 2)

        new_trades.append(Trade(
            user=trader,
            pair=asset,
            direction=direction,
            entry_price=entry_d,
            exit_price=exit_d,
            quantity=qty_d,
            entry_time=entry_time,
            exit_time=entry_time + timedelta(hours=random.uniform(0.3, 10.0)),
            pnl=pnl_d,
            risk_reward_ratio=rr,
            result=result,
            emotion=emotion,
            notes=render_reason(emotion, ep),
        ))

        consecutive_losses = 0 if result == "win" else consecutive_losses + 1

    Trade.objects.bulk_create(new_trades)

    total = Trade.objects.filter(user=trader).count()
    wins = Trade.objects.filter(user=trader, result="win").count()
    wr = wins / total * 100 if total else 0

    logger.info(f"  Added {len(new_trades)} trades")
    logger.info(f"  New total: {total} trades  /  {wr:.1f}% win rate overall")
    logger.info(f"  Last trade: {Trade.objects.filter(user=trader).order_by('-entry_time').first().entry_time.date()}")
    logger.info("═══════════════════════════════════")


if __name__ == "__main__":
    main()
