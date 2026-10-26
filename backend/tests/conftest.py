"""Pytest fixtures for Invest IQ tests with synthetic deterministic market data."""

import numpy as np
import pandas as pd
import pytest


@pytest.fixture
def sample_ohlcv_df() -> pd.DataFrame:
    """Generate 100 days of synthetic trading bars."""
    dates = pd.date_range(start="2025-01-01", periods=100, freq="B")
    np.random.seed(42)

    # Drift upward price walk
    returns = np.random.normal(loc=0.001, scale=0.015, size=100)
    price_series = 100.0 * np.cumprod(1 + returns)

    df = pd.DataFrame(
        {
            "open": price_series * 0.995,
            "high": price_series * 1.015,
            "low": price_series * 0.985,
            "close": price_series,
            "volume": np.random.randint(100000, 5000000, size=100),
        },
        index=dates,
    )
    return df


@pytest.fixture
def sample_raw_info() -> dict:
    """Sample company profile and fundamental metrics."""
    return {
        "shortName": "Test Tech Corp",
        "symbol": "TEST",
        "sector": "Technology",
        "industry": "Software",
        "currency": "USD",
        "trailingPE": 24.5,
        "priceToBook": 4.2,
        "operatingMargins": 0.22,
        "returnOnEquity": 0.18,
        "debtToEquity": 0.45,
        "marketCap": 50000000000,
        "beta": 1.15,
    }
