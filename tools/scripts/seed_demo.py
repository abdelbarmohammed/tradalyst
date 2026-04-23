#!/usr/bin/env python3
"""
Tradalyst demo seed script.

Creates demo accounts and 90 days of realistic trades for the presentation.

Usage (run from repo root):
    cd /var/www/tradalyst/backend
    python ../tools/scripts/seed_demo.py

Or with explicit settings:
    DJANGO_SETTINGS_MODULE=tradalyst.settings.production python ../tools/scripts/seed_demo.py
"""

import os
import sys
import random
import logging
from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, timedelta, timezone

# ── Django setup ──────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "..", "..", "backend")
sys.path.insert(0, os.path.abspath(BACKEND_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "tradalyst.settings.production")

import django
django.setup()

from apps.users.models import CustomUser
from apps.trades.models import Trade
from apps.mentors.models import MentorAssignment, MentorAnnotation

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")
logger = logging.getLogger(__name__)

# ── Reproducible randomness ───────────────────────────────────────────────────
random.seed(42)

# ── Account definitions ───────────────────────────────────────────────────────
ACCOUNTS = [
    {
        "email": "admin@tradalyst.com",
        "password": "Demo1234!",
        "role": "admin",
        "display_name": "Admin",
        "is_staff": True,
    },
    {
        "email": "trader@tradalyst.com",
        "password": "Demo1234!",
        "role": "trader",
        "display_name": "Alex García",
    },
    {
        "email": "mentor@tradalyst.com",
        "password": "Demo1234!",
        "role": "mentor",
        "display_name": "Carlos Ruiz",
    },
]

# ── Asset configuration ───────────────────────────────────────────────────────
# Approximate 2024 annual averages. The script adds daily drift and noise.
ASSETS = {
    "BTC/USDT": {
        "base_price": 55_000.0,
        "annual_drift": 0.60,          # +60% over the year (BTC ~40k→97k in 2024)
        "volatility": 0.025,            # daily % vol
        "qty_min": 0.02,
        "qty_max": 0.15,
        "price_decimals": 2,
        "qty_decimals": 4,
    },
    "ETH/USDT": {
        "base_price": 2_800.0,
        "annual_drift": 0.45,
        "volatility": 0.028,
        "qty_min": 0.2,
        "qty_max": 4.0,
        "price_decimals": 2,
        "qty_decimals": 4,
    },
    "SOL/USDT": {
        "base_price": 130.0,
        "annual_drift": 0.90,
        "volatility": 0.035,
        "qty_min": 2.0,
        "qty_max": 40.0,
        "price_decimals": 3,
        "qty_decimals": 2,
    },
    "EUR/USD": {
        "base_price": 1.085,
        "annual_drift": -0.02,
        "volatility": 0.004,
        "qty_min": 1_000.0,
        "qty_max": 10_000.0,
        "price_decimals": 5,
        "qty_decimals": 0,
    },
    "AAPL": {
        "base_price": 185.0,
        "annual_drift": 0.25,
        "volatility": 0.012,
        "qty_min": 2.0,
        "qty_max": 25.0,
        "price_decimals": 2,
        "qty_decimals": 0,
    },
}

ASSET_NAMES = list(ASSETS.keys())
ASSET_WEIGHTS = [0.33, 0.27, 0.17, 0.13, 0.10]

# ── Emotion config ─────────────────────────────────────────────────────────────
EMOTION_DIST_NORMAL = [
    ("confident", 0.40),
    ("fomo",      0.25),
    ("fearful",   0.20),
    ("revenge",   0.15),
]

# After consecutive losses the distribution shifts toward revenge/fomo
EMOTION_DIST_TILT = [
    ("confident", 0.20),
    ("fomo",      0.25),
    ("fearful",   0.22),
    ("revenge",   0.33),
]

# Base win rates per emotion (before situational modifiers)
WIN_RATE = {
    "confident": 0.92,
    "fomo":      0.33,
    "fearful":   0.82,
    "revenge":   0.30,
}

# ── Spanish reasoning templates ────────────────────────────────────────────────
REASONS: dict[str, list[str]] = {
    "confident": [
        "Confirmación de soporte en {price:.0f}. RSI en zona neutral, MACD con cruce alcista reciente. "
        "La relación riesgo/beneficio es favorable y el contexto macro acompaña. Stop colocado bajo mínimo anterior.",

        "Patrón de bandera alcista perfectamente formado con reducción de volumen en la consolidación. "
        "Ruptura con vela de cuerpo amplio. Tendencia principal de largo plazo intacta. Entrada técnica limpia.",

        "Retroceso de Fibonacci al 61.8%% sobre tendencia alcista establecida. Confluencia con media móvil de 50 períodos. "
        "Volumen decreciente en la corrección confirma que es un pullback sano. Target en máximos previos.",

        "Divergencia alcista en RSI frente a los últimos mínimos de precio. Zona de demanda histórica bien identificada. "
        "El mercado ha absorbido la oferta en este nivel. Gestión del riesgo definida con precisión.",

        "Ruptura del nivel de resistencia clave con cierre semanal fuerte. Continuación de tendencia principal. "
        "Contexto macroeconómico positivo para activos de riesgo esta semana. RR calculado en 2.1.",

        "Acumulación en rango estrecho durante 4 velas seguida de breakout con volumen significativo. "
        "Las medias de 9 y 21 períodos han cruzado en positivo. Señal técnica de alta fiabilidad según mi historial.",

        "Estructura de mercado alcista respetada. Último higher low confirmado. El precio ha respetado la directriz "
        "de tendencia tres veces. Entrada en la cuarta prueba del nivel con stop ajustado.",

        "Setup de continuación de tendencia en timeframe H4 con alineación en diario. Volumen institucional detectado "
        "en la apertura europea. Sesgo positivo confirmado por datos macroeconómicos publicados esta mañana.",
    ],
    "fomo": [
        "El precio lleva cuatro velas consecutivas al alza sin apenas corrección. "
        "No quiero perder este movimiento aunque no sea mi setup ideal. Entro en momentum.",

        "Todo el mercado está alcista hoy. He visto a varios traders con ganancias importantes en este activo. "
        "Entro tarde en el movimiento pero creo que tiene más recorrido todavía.",

        "El activo ha subido un 6%% en las últimas dos horas. "
        "Sé que debería esperar un pullback pero el movimiento parece muy fuerte. Entro sin confirmación.",

        "Noticias positivas inesperadas. El precio ha saltado y no he esperado mi nivel de entrada. "
        "He entrado impulsivamente porque no quería quedarme fuera del movimiento de nuevo.",

        "Veo que el mercado está en modo risk-on. Todos los activos suben. "
        "Entro sin haber esperado mi setup porque temo que se me escape el movimiento principal del día.",

        "Después de ver tres operaciones perdidas por no entrar a tiempo, "
        "he decidido entrar sin esperar la confirmación habitual. El FOMO es muy difícil de gestionar.",
    ],
    "fearful": [
        "El setup es técnicamente válido pero el mercado está mostrando señales mixtas hoy. "
        "Entro con tamaño reducido al 50%% de lo habitual. Hay reunión de la Fed esta tarde.",

        "Zona de resistencia importante a {price:.0f}. El análisis técnico es positivo pero no tengo "
        "total convicción. Stop muy ajustado. Si no funciona a la primera, cierro sin dudarlo.",

        "Entro con incertidumbre. El nivel de soporte parece sólido históricamente pero las condiciones "
        "generales del mercado son negativas esta semana. Tamaño pequeño por precaución.",

        "Patrón técnico válido pero hay datos económicos importantes mañana. "
        "El riesgo de evento me hace reducir el tamaño a la mitad. Prefiero no sobreexponerme.",

        "Mercado muy volátil hoy con spreads amplios. El setup es bueno pero las condiciones de ejecución "
        "no son ideales. Entro de todas formas con stop muy ajustado y tamaño conservador.",

        "He tenido tres semanas complicadas y no estoy en mi mejor estado mental. "
        "El setup es válido pero entro con cautela. Si el trade no se mueve rápido en mi dirección, cierro.",
    ],
    "revenge": [
        "Acabo de perder en la operación anterior. El mercado se giró justo en mi stop. "
        "Vuelvo a entrar en la misma dirección para recuperar. Sé que no es lo correcto pero lo hago.",

        "Llevo dos pérdidas seguidas hoy. Necesito recuperar lo perdido antes del cierre de sesión. "
        "Entro con más tamaño del habitual para recuperar más rápido. No debería hacer esto.",

        "El mercado me sacó por el stop y luego fue exactamente en mi dirección durante 80 pips. "
        "Estoy muy frustrado. Entro de nuevo para demostrar que mi análisis era correcto.",

        "Tres stops consecutivos esta semana. Estoy en modo revenge. Aumento el tamaño "
        "aunque sé perfectamente que es un error psicológico clásico. Necesito parar pero no puedo.",

        "La operación anterior fue un error mío de gestión. Me prometí que no haría esto pero "
        "entro de nuevo para intentar recuperar. El análisis puede ser correcto pero el estado mental no.",

        "No acepto este resultado. El setup era perfecto y el mercado hizo una trampa alcista. "
        "Entro a la contra de lo habitual buscando revancha. Sé que esto es exactamente lo que no debo hacer.",
    ],
}

# ── Mentor annotation templates ────────────────────────────────────────────────
ANNOTATIONS = [
    (
        "He revisado este trade con detenimiento, Alex. La entrada fue impulsiva: {issue}. "
        "La gestión emocional fue claramente deficiente aquí. Para la próxima sesión quiero que analices "
        "cómo podrías haber esperado una señal de confirmación antes de ejecutar."
    ),
    (
        "Este es exactamente el patrón que discutimos la semana pasada: {issue}. "
        "El resultado era prácticamente predecible dado tu estado emocional en ese momento. "
        "Recuerda la regla: si no puedes describir el setup en dos frases sin mencionar lo que otros están haciendo, no entres."
    ),
    (
        "Revisando este trade veo que {issue}. Esto ya es la tercera vez en el mes que cometo este mismo error. "
        "Mi recomendación concreta: implementa una regla de pausa obligatoria de 20 minutos "
        "después de cada pérdida antes de poder ejecutar otra operación."
    ),
    (
        "La señal técnica era válida, pero la gestión del riesgo fue incorrecta: {issue}. "
        "Cuando el mercado te lleva la contraria el primer movimiento, la regla es cerrar y reevaluar, "
        "no aguantar esperando que el mercado vuelva a darte la razón."
    ),
    (
        "Este trade lo abriste después de dos pérdidas consecutivas, que es exactamente cuando "
        "no deberías estar operando. {issue}. "
        "El revenge trading es el patrón más destructivo que veo en tu diario. Necesitamos trabajarlo."
    ),
    (
        "Buen análisis técnico inicial, pero {issue}. "
        "El tamaño de la posición fue excesivo para el nivel de incertidumbre que tenías. "
        "Recuerda: un setup del 70%% de convicción merece el 70%% del tamaño normal, no el 150%%."
    ),
]

ANNOTATION_ISSUES = [
    "entraste con FOMO sin respetar tu nivel de entrada técnico",
    "no esperaste la confirmación del cierre de vela para ejecutar",
    "moviste el stop loss en contra de la posición cuando el mercado fue en tu contra",
    "sobredimensionaste la posición estando en una racha negativa",
    "operaste en modo revenge después de dos stops consecutivos esa misma mañana",
    "ignoraste la resistencia clave que habías marcado en tu análisis previo",
]

# ── Helper functions ───────────────────────────────────────────────────────────

def d(value: float, decimals: int = 8) -> Decimal:
    """Convert float to Decimal with the given precision."""
    quantize_str = "0." + "0" * decimals if decimals > 0 else "0"
    return Decimal(str(value)).quantize(Decimal(quantize_str), rounding=ROUND_HALF_UP)


def get_or_create_user(
    email: str, password: str, role: str, display_name: str, is_staff: bool = False
) -> CustomUser:
    """Get existing user or create new one. Always updates the password."""
    try:
        user = CustomUser.objects.get(email=email)
        user.set_password(password)
        user.display_name = display_name
        user.onboarding_completed = True
        user.save()
        logger.info(f"  Updated existing: {email}")
    except CustomUser.DoesNotExist:
        user = CustomUser.objects.create_user(
            email=email,
            password=password,
            role=role,
            display_name=display_name,
        )
        if is_staff:
            user.is_staff = True
        user.onboarding_completed = True
        user.save()
        logger.info(f"  Created: {email} ({role})")
    return user


def asset_price(asset: str, dt: datetime) -> float:
    """Generate a realistic price for the given asset at the given date."""
    cfg = ASSETS[asset]
    # Days offset from a fixed reference point (Jan 1 2024)
    ref = datetime(2024, 1, 1, tzinfo=timezone.utc)
    days = (dt - ref).days
    # Compound drift
    drift_factor = (1 + cfg["annual_drift"]) ** (days / 365)
    base = cfg["base_price"] * drift_factor
    # Add daily noise — use date-seeded noise for reproducibility
    day_seed = int(dt.strftime("%Y%m%d")) + hash(asset) % 10_000
    rng = random.Random(day_seed)
    noise_pct = rng.gauss(0, cfg["volatility"])
    price = base * (1 + noise_pct)
    return max(price, cfg["base_price"] * 0.3)


def exit_price_for(
    asset: str, entry: float, direction: str, win: bool, emotion: str
) -> float:
    """Calculate a realistic exit price."""
    cfg = ASSETS[asset]

    if win:
        if emotion == "confident":
            move_pct = random.uniform(0.009, 0.030)
        else:
            move_pct = random.uniform(0.005, 0.018)
    else:
        if emotion in ("fomo", "revenge"):
            move_pct = random.uniform(0.012, 0.035)  # bigger losses when emotional
        else:
            move_pct = random.uniform(0.006, 0.018)

    move = entry * move_pct
    if direction == "long":
        result = entry + move if win else entry - move
    else:
        result = entry - move if win else entry + move

    return max(result, entry * 0.1)


def quantity_for(asset: str) -> float:
    cfg = ASSETS[asset]
    qty = random.uniform(cfg["qty_min"], cfg["qty_max"])
    if cfg["qty_decimals"] == 0:
        return round(qty)
    return round(qty, cfg["qty_decimals"])


def pick_emotion(consecutive_losses: int) -> str:
    dist = EMOTION_DIST_TILT if consecutive_losses >= 2 else EMOTION_DIST_NORMAL
    emotions, weights = zip(*dist)
    return random.choices(emotions, weights=weights)[0]


def is_win(emotion: str, is_tuesday: bool, consecutive_losses: int) -> bool:
    """Determine trade outcome with situational modifiers."""
    rate = WIN_RATE[emotion]
    # Tuesday penalty — more losses mid-week (interesting AI pattern)
    if is_tuesday:
        rate *= 0.68
    # Tilt after losses
    if consecutive_losses >= 3:
        rate *= 0.60
    elif consecutive_losses == 2:
        rate *= 0.78
    return random.random() < rate


def render_reason(emotion: str, entry: float) -> str:
    template = random.choice(REASONS[emotion])
    try:
        return template.format(price=entry)
    except (KeyError, ValueError):
        return template


# ── Trade generation ───────────────────────────────────────────────────────────

def generate_trades(trader: CustomUser, n: int = 135) -> list[Trade]:
    """Generate n realistic trades spread over 90 days."""
    end_dt = datetime.now(timezone.utc).replace(hour=21, minute=0, second=0, microsecond=0)
    start_dt = end_dt - timedelta(days=90)

    # Build a list of timestamps distributed across trading days
    timestamps: list[datetime] = []
    day = start_dt.replace(hour=0, minute=0, second=0, microsecond=0)
    while day < end_dt and len(timestamps) < n * 2:
        weekday = day.weekday()  # 0=Mon … 6=Sun
        # Reduced weekend trading (crypto only trades on weekends)
        if weekday in (5, 6) and random.random() > 0.25:
            day += timedelta(days=1)
            continue
        n_trades = random.choices([1, 2, 3, 4], weights=[0.20, 0.42, 0.28, 0.10])[0]
        for _ in range(n_trades):
            hour = random.randint(8, 21)
            minute = random.randint(0, 59)
            second = random.randint(0, 59)
            ts = day.replace(hour=hour, minute=minute, second=second)
            if ts < end_dt:
                timestamps.append(ts)
        day += timedelta(days=1)

    timestamps = sorted(timestamps[:n])

    trades: list[Trade] = []
    consecutive_losses = 0

    for entry_time in timestamps:
        asset = random.choices(ASSET_NAMES, weights=ASSET_WEIGHTS)[0]
        direction = random.choices(["long", "short"], weights=[0.60, 0.40])[0]
        emotion = pick_emotion(consecutive_losses)
        tuesday = entry_time.weekday() == 1
        win = is_win(emotion, tuesday, consecutive_losses)

        ep = asset_price(asset, entry_time)
        xp = exit_price_for(asset, ep, direction, win, emotion)
        qty = quantity_for(asset)

        cfg = ASSETS[asset]
        entry_d = d(ep, cfg["price_decimals"])
        exit_d = d(xp, cfg["price_decimals"])
        qty_d = d(qty, cfg["qty_decimals"])

        # PNL — match Trade.save() logic
        if direction == "long":
            pnl_d = (exit_d - entry_d) * qty_d
        else:
            pnl_d = (entry_d - exit_d) * qty_d
        pnl_d = pnl_d.quantize(Decimal("0.01"))

        # Result based on actual PNL
        if pnl_d > 0:
            result = "win"
        elif pnl_d < 0:
            result = "loss"
        else:
            result = "breakeven"

        # Planned risk/reward ratio (set at entry, reflects planning quality)
        if emotion == "confident":
            rr = d(random.uniform(1.8, 3.2), 2)
        elif emotion in ("fomo", "revenge"):
            rr = d(random.uniform(0.8, 1.5), 2)
        else:
            rr = d(random.uniform(1.2, 2.2), 2)

        duration_h = random.uniform(0.3, 10.0)
        exit_time = entry_time + timedelta(hours=duration_h)

        notes = render_reason(emotion, ep)

        trades.append(Trade(
            user=trader,
            pair=asset,
            direction=direction,
            entry_price=entry_d,
            exit_price=exit_d,
            quantity=qty_d,
            entry_time=entry_time,
            exit_time=exit_time,
            pnl=pnl_d,
            risk_reward_ratio=rr,
            result=result,
            emotion=emotion,
            notes=notes,
        ))

        consecutive_losses = 0 if result == "win" else consecutive_losses + 1

    return trades


# ── Mentor annotations ─────────────────────────────────────────────────────────

def add_annotations(mentor: CustomUser, all_trades: list[Trade]) -> None:
    """Annotate the 6 worst trades (by PNL) with realistic mentor feedback."""
    worst = sorted(
        [t for t in all_trades if t.pnl is not None and t.pnl < 0],
        key=lambda t: float(t.pnl),
    )

    annotated = 0
    for i, trade in enumerate(worst[:6]):
        issue = ANNOTATION_ISSUES[i % len(ANNOTATION_ISSUES)]
        template = ANNOTATIONS[i % len(ANNOTATIONS)]
        try:
            body = template.format(issue=issue)
        except KeyError:
            body = template

        annotation = MentorAnnotation(
            trade=trade,
            mentor=mentor,
            body=body,
        )
        annotation.save()

        # Backdate the annotation to 1–3 days after the trade
        offset = timedelta(days=random.randint(1, 3))
        MentorAnnotation.objects.filter(pk=annotation.pk).update(
            created_at=trade.entry_time + offset,
            updated_at=trade.entry_time + offset,
        )
        annotated += 1

    logger.info(f"  Added {annotated} mentor annotations")


# ── Main ───────────────────────────────────────────────────────────────────────

def main() -> None:
    logger.info("═══════════════════════════════════")
    logger.info("  Tradalyst — demo seed")
    logger.info("═══════════════════════════════════")

    # 1 ── Accounts ──────────────────────────────────────────────────────────
    logger.info("\n[1/4] Accounts")
    users: dict[str, CustomUser] = {}
    for acc in ACCOUNTS:
        users[acc["role"]] = get_or_create_user(
            email=acc["email"],
            password=acc["password"],
            role=acc["role"],
            display_name=acc["display_name"],
            is_staff=acc.get("is_staff", False),
        )
    trader = users["trader"]
    mentor = users["mentor"]

    # 2 ── Mentor assignment ──────────────────────────────────────────────────
    logger.info("\n[2/4] Mentor assignment")
    assignment, created = MentorAssignment.objects.get_or_create(
        mentor=mentor, trader=trader, defaults={"is_active": True}
    )
    if created:
        logger.info("  Created: Carlos Ruiz → Alex García")
    else:
        assignment.is_active = True
        assignment.save()
        logger.info("  Already exists (ensured active)")

    # 3 ── Trades ─────────────────────────────────────────────────────────────
    logger.info("\n[3/4] Generating trades for Alex García")
    existing = Trade.objects.filter(user=trader).count()
    if existing:
        logger.info(f"  Removing {existing} existing trades…")
        Trade.objects.filter(user=trader).delete()

    trades = generate_trades(trader, n=135)
    # bulk_create skips save(), so we pre-calculated pnl already
    Trade.objects.bulk_create(trades)

    # Reload to get PKs for annotations
    saved = list(Trade.objects.filter(user=trader))

    wins = sum(1 for t in saved if t.result == "win")
    total = len(saved)
    win_rate = wins / total * 100 if total else 0
    total_pnl = sum(float(t.pnl) for t in saved if t.pnl is not None)

    logger.info(f"  Trades created : {total}")
    logger.info(f"  Win rate       : {win_rate:.1f}%  (target ~63%)")
    logger.info(f"  Total P&L      : {total_pnl:+,.2f} USD")

    # Breakdown by emotion
    for em in ("confident", "fomo", "fearful", "revenge"):
        em_trades = [t for t in saved if t.emotion == em]
        em_wins = sum(1 for t in em_trades if t.result == "win")
        em_wr = em_wins / len(em_trades) * 100 if em_trades else 0
        logger.info(f"    {em:<12} {len(em_trades):3d} trades  {em_wr:.0f}% WR")

    # Tuesday stats
    tuesday_trades = [t for t in saved if t.entry_time.weekday() == 1]
    tuesday_wins = sum(1 for t in tuesday_trades if t.result == "win")
    tuesday_wr = tuesday_wins / len(tuesday_trades) * 100 if tuesday_trades else 0
    logger.info(f"    Tuesday WR    : {tuesday_wr:.0f}%  (should be lower)")

    # 4 ── Annotations ─────────────────────────────────────────────────────────
    logger.info("\n[4/4] Mentor annotations (Carlos on Alex's worst trades)")
    add_annotations(mentor, saved)

    # ── Summary ───────────────────────────────────────────────────────────────
    logger.info("\n═══════════════════════════════════")
    logger.info("  Done! Demo credentials:")
    logger.info("  admin@tradalyst.com   / Demo1234!")
    logger.info("  trader@tradalyst.com  / Demo1234!  (Alex García)")
    logger.info("  mentor@tradalyst.com  / Demo1234!  (Carlos Ruiz)")
    logger.info("═══════════════════════════════════")


if __name__ == "__main__":
    main()
