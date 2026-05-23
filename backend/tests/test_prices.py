import pytest
from unittest.mock import patch, MagicMock
from django.core.cache import cache

PRICES_URL = "/api/prices/"


def _mock_requests_get(data: dict, status_code: int = 200) -> MagicMock:
    mock_resp = MagicMock()
    mock_resp.json.return_value = data
    mock_resp.status_code = status_code
    if status_code >= 400:
        from requests.exceptions import HTTPError
        mock_resp.raise_for_status.side_effect = HTTPError("API error")
    else:
        mock_resp.raise_for_status = MagicMock()
    return mock_resp


@pytest.mark.django_db
class TestPricesView:
    def test_no_symbols_param_returns_400(self, trader_client):
        res = trader_client.get(PRICES_URL)
        assert res.status_code == 400

    def test_unauthenticated_blocked(self, api_client):
        res = api_client.get(PRICES_URL + "?symbols=BTC")
        assert res.status_code in (401, 403)

    def test_admin_cannot_access_prices(self, admin_client):
        res = admin_client.get(PRICES_URL + "?symbols=BTC")
        assert res.status_code == 403

    def test_crypto_symbol_routes_to_coingecko(self, trader_client):
        mock_prices = {"BTC": {"price": 50000, "change_24h": 2.5, "market_cap": 1e12, "source": "coingecko"}}
        with patch("apps.prices.views.CoinGeckoService.get_prices", return_value=mock_prices):
            res = trader_client.get(PRICES_URL + "?symbols=BTC")
        assert res.status_code == 200
        assert "BTC" in res.data
        assert res.data["BTC"]["price"] == 50000

    def test_non_crypto_symbol_routes_to_finnhub(self, trader_client):
        mock_prices = {"AAPL": {"price": 190.0, "change_24h": 1.1, "source": "finnhub"}}
        with patch("apps.prices.views.FinnhubService.get_prices", return_value=mock_prices):
            res = trader_client.get(PRICES_URL + "?symbols=AAPL")
        assert res.status_code == 200
        assert "AAPL" in res.data

    def test_mixed_symbols_route_to_correct_services(self, trader_client):
        crypto_prices = {"BTC": {"price": 50000, "source": "coingecko"}}
        fiat_prices = {"AAPL": {"price": 190.0, "source": "finnhub"}}
        with patch("apps.prices.views.CoinGeckoService.get_prices", return_value=crypto_prices):
            with patch("apps.prices.views.FinnhubService.get_prices", return_value=fiat_prices):
                res = trader_client.get(PRICES_URL + "?symbols=BTC,AAPL")
        assert res.status_code == 200
        assert "BTC" in res.data
        assert "AAPL" in res.data

    def test_unknown_symbol_returns_empty_data(self, trader_client):
        with patch("apps.prices.views.FinnhubService.get_prices", return_value={}):
            res = trader_client.get(PRICES_URL + "?symbols=UNKNOWN999")
        assert res.status_code == 200
        assert res.data == {}


@pytest.mark.django_db
class TestCoinGeckoServiceUnit:
    def setup_method(self):
        cache.clear()

    def test_get_prices_returns_formatted_data(self):
        from apps.prices.services.coingecko import CoinGeckoService
        api_data = {
            "bitcoin": {
                "usd": 50000,
                "usd_24h_change": 2.5,
                "usd_market_cap": 1_000_000_000,
            }
        }
        mock_resp = _mock_requests_get(api_data)

        with patch("apps.prices.services.coingecko.requests.get", return_value=mock_resp):
            result = CoinGeckoService().get_prices(["BTC"])

        assert "BTC" in result
        assert result["BTC"]["price"] == 50000
        assert result["BTC"]["change_24h"] == 2.5
        assert result["BTC"]["source"] == "coingecko"

    def test_api_error_returns_empty_dict(self):
        from apps.prices.services.coingecko import CoinGeckoService
        mock_resp = _mock_requests_get({}, status_code=500)

        with patch("apps.prices.services.coingecko.requests.get", return_value=mock_resp):
            result = CoinGeckoService().get_prices(["BTC"])

        assert result == {}

    def test_unknown_symbol_skipped(self):
        from apps.prices.services.coingecko import CoinGeckoService
        result = CoinGeckoService().get_prices(["NOTACRYPTO"])
        assert result == {}

    def test_cache_used_on_second_request(self):
        from apps.prices.services.coingecko import CoinGeckoService
        api_data = {
            "bitcoin": {
                "usd": 50000,
                "usd_24h_change": 2.5,
                "usd_market_cap": 1_000_000_000,
            }
        }
        mock_resp = _mock_requests_get(api_data)

        with patch("apps.prices.services.coingecko.requests.get", return_value=mock_resp) as mock_get:
            service = CoinGeckoService()
            service.get_prices(["BTC"])
            service.get_prices(["BTC"])

        mock_get.assert_called_once()


@pytest.mark.django_db
class TestFinnhubServiceUnit:
    def setup_method(self):
        cache.clear()

    def test_get_prices_returns_formatted_data(self):
        from apps.prices.services.finnhub import FinnhubService
        api_data = {"c": 190.5, "dp": 1.2, "h": 192.0, "l": 188.0}
        mock_resp = _mock_requests_get(api_data)

        with patch("apps.prices.services.finnhub.requests.get", return_value=mock_resp):
            result = FinnhubService().get_prices(["AAPL"])

        assert "AAPL" in result
        assert result["AAPL"]["price"] == 190.5
        assert result["AAPL"]["source"] == "finnhub"

    def test_missing_price_field_returns_empty(self):
        from apps.prices.services.finnhub import FinnhubService
        # Finnhub returns {"c": 0} when the symbol is not found
        mock_resp = _mock_requests_get({"c": 0})

        with patch("apps.prices.services.finnhub.requests.get", return_value=mock_resp):
            result = FinnhubService().get_prices(["NOSUCHSYMBOL"])

        assert result == {}

    def test_api_error_excluded_from_result(self):
        from apps.prices.services.finnhub import FinnhubService
        mock_resp = _mock_requests_get({}, status_code=500)

        with patch("apps.prices.services.finnhub.requests.get", return_value=mock_resp):
            result = FinnhubService().get_prices(["AAPL"])

        assert result == {}

    def test_cache_used_on_second_quote_request(self):
        from apps.prices.services.finnhub import FinnhubService
        api_data = {"c": 190.5, "dp": 1.2, "h": 192.0, "l": 188.0}
        mock_resp = _mock_requests_get(api_data)

        with patch("apps.prices.services.finnhub.requests.get", return_value=mock_resp) as mock_get:
            service = FinnhubService()
            service.get_quote("AAPL")
            service.get_quote("AAPL")

        mock_get.assert_called_once()
