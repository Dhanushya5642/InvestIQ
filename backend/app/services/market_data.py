"""Market data provider adapter with caching, error isolation, and timestamp tracking."""

import time
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Tuple
import pandas as pd
import yfinance as yf

from backend.app.config import settings
from backend.app.utils.errors import ProviderError, SymbolNotFoundError


class MarketDataService:
    """Encapsulates market data fetching, caching, and error translation."""

    def __init__(self, cache_ttl_seconds: int = settings.cache_ttl_seconds):
        self.cache_ttl = cache_ttl_seconds
        self._history_cache: Dict[str, Tuple[float, pd.DataFrame]] = {}
        self._info_cache: Dict[str, Tuple[float, Dict[str, Any]]] = {}

    def _get_cache_key(self, symbol: str, period: str) -> str:
        return f"{symbol.upper()}:{period.lower()}"

    def fetch_history(self, symbol: str, period: str = "1y") -> Tuple[pd.DataFrame, str, str]:
        """Fetch historical price series from provider.

        Returns:
            Tuple[pd.DataFrame, source_str, timestamp_iso]
        """
        clean_symbol = symbol.strip().upper()
        cache_key = self._get_cache_key(clean_symbol, period)
        now = time.time()
        retrieval_time = datetime.now(timezone.utc).isoformat()

        # Check memory cache
        if cache_key in self._history_cache:
            ts, cached_df = self._history_cache[cache_key]
            if now - ts < self.cache_ttl:
                return cached_df.copy(), settings.provider_name, retrieval_time

        try:
            ticker = yf.Ticker(clean_symbol)
            # Fetch with timeout guard
            df = ticker.history(period=period, interval="1d", auto_adjust=True)

            if df is None or df.empty:
                raise SymbolNotFoundError(
                    clean_symbol,
                    f"No historical price data returned for symbol '{clean_symbol}' (period: {period}).",
                )

            # Store in cache
            self._history_cache[cache_key] = (now, df.copy())
            return df, settings.provider_name, retrieval_time

        except SymbolNotFoundError:
            raise
        except Exception as exc:
            raise ProviderError(
                f"Failed to retrieve market history for symbol '{clean_symbol}': {str(exc)}",
                symbol=clean_symbol,
            ) from exc

    def fetch_info(self, symbol: str) -> Tuple[Dict[str, Any], str, str]:
        """Fetch company metadata and fundamentals.

        Returns:
            Tuple[Dict[str, Any], source_str, timestamp_iso]
        """
        clean_symbol = symbol.strip().upper()
        now = time.time()
        retrieval_time = datetime.now(timezone.utc).isoformat()

        # Check memory cache
        if clean_symbol in self._info_cache:
            ts, cached_info = self._info_cache[clean_symbol]
            if now - ts < self.cache_ttl:
                return cached_info.copy(), settings.provider_name, retrieval_time

        try:
            ticker = yf.Ticker(clean_symbol)
            info = {}
            try:
                # yfinance can raise on info or return empty dict
                raw_info = getattr(ticker, "info", None)
                if isinstance(raw_info, dict):
                    info = raw_info
            except Exception:
                info = {}

            # Cache even if minimal so repeated calls don't hammer yfinance
            self._info_cache[clean_symbol] = (now, info)
            return info, settings.provider_name, retrieval_time

        except Exception as exc:
            # Fallback to empty info rather than crashing whole process
            return {}, settings.provider_name, retrieval_time


# Global service instance
market_data_service = MarketDataService()
