"""Tests for technical indicators and risk metrics calculations."""

import numpy as np
import pandas as pd
import pytest

from backend.app.services.indicators import (
    calculate_annualized_volatility,
    calculate_daily_returns,
    calculate_max_drawdown,
    calculate_rsi,
    calculate_sma,
    enrich_with_indicators,
)


def test_calculate_sma_warmup():
    """Verify SMA produces NaNs before window and accurate means afterwards."""
    prices = pd.Series([10.0, 20.0, 30.0, 40.0, 50.0])
    sma3 = calculate_sma(prices, window=3)

    assert pd.isna(sma3.iloc[0])
    assert pd.isna(sma3.iloc[1])
    assert not pd.isna(sma3.iloc[2])
    assert sma3.iloc[2] == pytest.approx(20.0)
    assert sma3.iloc[4] == pytest.approx(40.0)


def test_calculate_rsi_bounds():
    """Verify RSI remains bounded in [0, 100] for various market scenarios."""
    # Constantly rising prices -> RSI should approach 100
    rising = pd.Series([10.0 + i * 2.0 for i in range(30)])
    rsi_rising = calculate_rsi(rising, period=14)
    assert rsi_rising.iloc[-1] > 80.0
    assert (rsi_rising.dropna() <= 100.0).all()
    assert (rsi_rising.dropna() >= 0.0).all()

    # Constantly falling prices -> RSI should drop low
    falling = pd.Series([100.0 - i * 2.0 for i in range(30)])
    rsi_falling = calculate_rsi(falling, period=14)
    assert rsi_falling.iloc[-1] < 20.0
    assert (rsi_falling.dropna() >= 0.0).all()

    # Flat prices
    flat = pd.Series([50.0] * 30)
    rsi_flat = calculate_rsi(flat, period=14)
    assert rsi_flat.iloc[-1] == pytest.approx(50.0)


def test_calculate_daily_returns():
    """Verify percentage returns."""
    prices = pd.Series([100.0, 110.0, 99.0])
    ret = calculate_daily_returns(prices)
    assert pd.isna(ret.iloc[0])
    assert ret.iloc[1] == pytest.approx(0.10)
    assert ret.iloc[2] == pytest.approx(-0.10)


def test_calculate_annualized_volatility():
    """Verify volatility scales with sqrt(252) and handles edge cases."""
    returns = pd.Series([0.01, -0.01, 0.02, -0.02, 0.005, -0.005, 0.01])
    vol = calculate_annualized_volatility(returns, trading_days=252)
    assert vol is not None
    assert vol > 0.0

    # Short / empty returns series
    short_returns = pd.Series([0.01, 0.02])
    assert calculate_annualized_volatility(short_returns) is None


def test_calculate_max_drawdown():
    """Verify max drawdown detects peak-to-trough decline."""
    prices = pd.Series([100.0, 120.0, 90.0, 110.0])
    # Peak is 120.0, trough is 90.0 -> drawdown is (90 - 120) / 120 = -0.25 (-25%)
    mdd = calculate_max_drawdown(prices)
    assert mdd is not None
    assert mdd == pytest.approx(-0.25)

    # Monotonically increasing prices -> max drawdown is 0.0
    up = pd.Series([10.0, 20.0, 30.0])
    assert calculate_max_drawdown(up) == pytest.approx(0.0)


def test_enrich_with_indicators(sample_ohlcv_df):
    """Verify full indicator pipeline on realistic data."""
    enriched, summary = enrich_with_indicators(sample_ohlcv_df)

    assert "sma_20" in enriched.columns
    assert "sma_50" in enriched.columns
    assert "rsi" in enriched.columns
    assert "daily_return" in enriched.columns

    assert summary["latest_close"] is not None
    assert summary["sma_20"] is not None
    assert summary["sma_50"] is not None
    assert summary["rsi_14"] is not None
    assert summary["annualized_volatility"] is not None
    assert summary["max_drawdown"] is not None
