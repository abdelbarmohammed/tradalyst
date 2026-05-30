AI_INSIGHT_MIN_TRADES = 5      # Minimum trades before AI analysis activates
PRICE_CACHE_TTL = 60           # Seconds to cache CoinGecko/Finnhub responses
CHAT_HISTORY_LIMIT = 10        # Last N messages sent to Claude as context
TRADE_SUMMARY_DAYS = 90        # Days of trade history included in AI chat context
WATCHLIST_MAX_ASSETS = 8       # Maximum pinned assets per user

ACCESS_TOKEN_LIFETIME_MINUTES = 15
REFRESH_TOKEN_LIFETIME_DAYS = 7

CSV_IMPORT_MAX_ROWS = 1000          # Maximum rows per CSV import
CSV_IMPORT_MAX_SIZE_BYTES = 5242880  # 5 MB

PASSWORD_RESET_TOKEN_EXPIRY_HOURS = 1   # Reset link valid for this many hours
PASSWORD_RESET_MAX_REQUESTS_PER_HOUR = 3  # Max reset requests per email per hour

EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS = 24   # Verification link valid for 24 hours
EMAIL_VERIFICATION_MAX_REQUESTS_PER_HOUR = 3  # Max resend requests per email per hour
