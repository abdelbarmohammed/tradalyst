import logging
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsTraderOrMentor
from .services.coingecko import CoinGeckoService, SYMBOL_TO_ID
from .services.finnhub import FinnhubService

logger = logging.getLogger(__name__)

_CRYPTO_SYMBOLS = frozenset(SYMBOL_TO_ID.keys())


class PriceView(APIView):
    """
    GET /api/prices/?symbols=BTC,ETH,OANDA:EUR_USD,AAPL
    Routes crypto tickers to CoinGecko; everything else to Finnhub.
    """

    permission_classes = [IsTraderOrMentor]

    def get(self, request: Request) -> Response:
        raw = request.query_params.get("symbols", "")
        if not raw:
            return Response({"detail": "symbols query param is required."}, status=400)

        symbols = [s.strip().upper() for s in raw.split(",") if s.strip()]
        crypto = [s for s in symbols if s in _CRYPTO_SYMBOLS]
        other = [s for s in symbols if s not in _CRYPTO_SYMBOLS]

        prices: dict = {}
        if crypto:
            prices.update(CoinGeckoService().get_prices(crypto))
        if other:
            prices.update(FinnhubService().get_prices(other))

        return Response(prices)
