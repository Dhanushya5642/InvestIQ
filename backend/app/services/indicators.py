"""Technical indicators and risk measures calculation."""

from typing import Dict, Optional, Tuple
import numpy as np
import pandas as pd


def calculate_sma(series: pd.Series, window: int) -> pd.Series:
    """Compute Simple Moving Average with exact warm-up window.

    Bars before 'window' will strictly evaluate to NaN.
    Future observations are never used.
    """
    return series.rolling(window=window, min_periods=window).mean()


def calculate_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    """Compute Relative Strength Index using Wilder's Exponential Smoothing.

    Formula:
    RS = Smoothed Gain / Smoothed Loss
    RSI = 100 - (100 / (1 + RS))
    Guaranteed output in [0, 100], strictly non-leaking.
    """
    delta = series.diff()
    gain = delta.clip(lower=0.0)
    loss = (-delta).clip(lower=0.0)

    # Wilder's smoothing alpha = 1 / period
    avg_gain = gain.ewm(alpha=1.0 / period, min_periods=period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1.0 / period, min_periods=period, adjust=False).mean()

    rs = avg_gain / avg_loss.replace(0, np.nan)
    rsi = 100.0 - (100.0 / (1.0 + rs))

    # Boundary cases: When avg_loss is 0 and avg_gain > 0, RSI = 100. When both 0, RSI = 50.
    rsi = rsi.where(avg_loss != 0, 100.0)
    rsi = rsi.where((avg_loss != 0) | (avg_gain != 0), 50.0)

    return rsi.clip(lower=0.0, upper=100.0)


def calculate_daily_returns(series: pd.Series) -> pd.Series:
    """Calculate percentage daily return: (P_t - P_{t-1}) / P_{t-1}."""
    return series.pct_change()


def calculate_annualized_volatility(
    returns: pd.Series, trading_days: int = 252
) -> Optional[float]:
    """Calculate annualized historical volatility: std(daily_returns) * sqrt(252).

    Returns None if fewer than 5 valid return bars exist or std is non-finite.
    """
    valid_returns = returns.dropna()
    if len(valid_returns) < 5:
        return None
    vol = float(valid_returns.std() * np.sqrt(trading_days))
    return vol if np.isfinite(vol) else None


def calculate_max_drawdown(series: pd.Series) -> Optional[float]:
    """Compute historical maximum peak-to-trough drawdown from Close prices.

    Returns a negative float (e.g., -0.18 for -18%) or None if invalid.
    """
    clean_series = series.dropna()
    if len(clean_series) < 2:
        return None
    cumulative_max = clean_series.cummax()
    drawdowns = (clean_series - cumulative_max) / cumulative_max
    mdd = float(drawdowns.min())
    return mdd if np.isfinite(mdd) else None


def enrich_with_indicators(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Optional[float]]]:
    """Compute all indicators and append to the DataFrame.

    Returns:
    - enriched_df: DataFrame with 'sma_20', 'sma_50', 'rsi', 'daily_return'
    - summary: Snapshot dict of latest metrics and risk indicators.
    """
    enriched = df.copy()

    close = enriched["close"]
    enriched["daily_return"] = calculate_daily_returns(close)
    enriched["sma_20"] = calculate_sma(close, window=20)
    enriched["sma_50"] = calculate_sma(close, window=50)
    enriched["rsi"] = calculate_rsi(close, period=14)

    latest_close = float(close.iloc[-1]) if not close.empty else None
    latest_sma_20 = (
        float(enriched["sma_20"].iloc[-1])
        if pd.notna(enriched["sma_20"].iloc[-1])
        else None
    )
    latest_sma_50 = (
        float(enriched["sma_50"].iloc[-1])
        if pd.notna(enriched["sma_50"].iloc[-1])
        else None
    )
    latest_rsi = (
        float(enriched["rsi"].iloc[-1])
        if pd.notna(enriched["rsi"].iloc[-1])
        else None
    )

    annualized_vol = calculate_annualized_volatility(enriched["daily_return"])
    max_dd = calculate_max_drawdown(close)

    summary = {
        "latest_close": round(latest_close, 2) if latest_close is not None else None,
        "sma_20": round(latest_sma_20, 2) if latest_sma_20 is not None else None,
        "sma_50": round(latest_sma_50, 2) if latest_sma_50 is not None else None,
        "rsi_14": round(latest_rsi, 2) if latest_rsi is not None else None,
        "annualized_volatility": round(annualized_vol, 4) if annualized_vol is not None else None,
        "max_drawdown": round(max_dd, 4) if max_dd is not None else None,
    }

    return enriched, summary
