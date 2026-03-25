import logging
import requests
from django.conf import settings
from django.core.cache import cache
from core.constants import PRICE_CACHE_TTL

logger = logging.getLogger(__name__)


class FinnhubService:
    BASE_URL = "https://finnhub.io/api/v1"

    def get_quote(self, symbol: str) -> dict | None:
        """Fetch a real-time quote for a forex or stock symbol from Finnhub."""
        cache_key = f"finnhub_{symbol.upper()}"
        cached = cache.get(cache_key)
        if cached is not None:
            return cached

        try:
            response = requests.get(
                f"{self.BASE_URL}/quote",
                params={"symbol": symbol, "token": settings.FINNHUB_API_KEY},
                timeout=5,
            )
            response.raise_for_status()
            data: dict = response.json()
        except requests.RequestException as exc:
            logger.error("Finnhub request failed for %s: %s", symbol, exc)
            return None

        if not data.get("c"):
            return None

        result = {
            "price": data["c"],
            "change_24h": data.get("dp"),
            "high": data.get("h"),
            "low": data.get("l"),
            "source": "finnhub",
        }
        cache.set(cache_key, result, timeout=PRICE_CACHE_TTL)
        return result

    def get_prices(self, symbols: list[str]) -> dict[str, dict]:
        """Fetch quotes for multiple forex/stock symbols."""
        result = {}
        for symbol in symbols:
            quote = self.get_quote(symbol)
            if quote:
                result[symbol] = quote
        return result
