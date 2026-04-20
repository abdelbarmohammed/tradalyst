import logging
import requests
from django.core.cache import cache
from core.constants import PRICE_CACHE_TTL

logger = logging.getLogger(__name__)

SYMBOL_TO_ID: dict[str, str] = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "BNB": "binancecoin",
    "SOL": "solana",
    "XRP": "ripple",
    "ADA": "cardano",
    "AVAX": "avalanche-2",
    "DOT": "polkadot",
    "MATIC": "matic-network",
    "LINK": "chainlink",
    "UNI": "uniswap",
    "LTC": "litecoin",
    "DOGE": "dogecoin",
    "SHIB": "shiba-inu",
    "ATOM": "cosmos",
    "NEAR": "near",
    "APT": "aptos",
    "ARB": "arbitrum",
    "OP": "optimism",
}


class CoinGeckoService:
    BASE_URL = "https://api.coingecko.com/api/v3"

    def get_prices(self, symbols: list[str]) -> dict[str, dict]:
        """Fetch USD prices for the given crypto ticker symbols via CoinGecko."""
        symbol_to_id = {s: SYMBOL_TO_ID[s] for s in symbols if s in SYMBOL_TO_ID}
        if not symbol_to_id:
            return {}

        cache_key = f"coingecko_{'_'.join(sorted(symbol_to_id.values()))}"
        cached = cache.get(cache_key)
        if cached is not None:
            return {s: cached[cid] for s, cid in symbol_to_id.items() if cid in cached}

        try:
            response = requests.get(
                f"{self.BASE_URL}/simple/price",
                params={
                    "ids": ",".join(symbol_to_id.values()),
                    "vs_currencies": "usd",
                    "include_24hr_change": "true",
                    "include_market_cap": "true",
                },
                timeout=5,
            )
            response.raise_for_status()
            data: dict = response.json()
        except requests.RequestException as exc:
            logger.error("CoinGecko request failed: %s", exc)
            return {}

        cache.set(cache_key, data, timeout=PRICE_CACHE_TTL)
        return {
            symbol: {
                "price": data[coin_id]["usd"],
                "change_24h": data[coin_id].get("usd_24h_change"),
                "market_cap": data[coin_id].get("usd_market_cap"),
                "source": "coingecko",
            }
            for symbol, coin_id in symbol_to_id.items()
            if coin_id in data
        }
