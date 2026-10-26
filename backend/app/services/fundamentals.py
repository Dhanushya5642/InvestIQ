"""Normalization of company profile, valuation metrics, and fundamentals."""

from typing import Any, Dict, Optional


def safe_float(val: Any) -> Optional[float]:
    """Convert value to float if valid and finite, else return None.

    Never replaces missing values with zero.
    """
    if val is None:
        return None
    try:
        f = float(val)
        import math
        return f if math.isfinite(f) else None
    except (ValueError, TypeError):
        return None


def normalize_fundamentals(raw_info: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize raw provider info dictionary to standard Invest IQ schema.

    Rules:
    - Missing metrics remain None.
    - Zero is preserved only if it is a genuine numeric zero.
    - P/E, P/B, EV/EBITDA ratios are checked for valid finiteness.
    - Preserves provider reported currency.
    """
    if not isinstance(raw_info, dict):
        raw_info = {}

    pe = safe_float(raw_info.get("trailingPE") or raw_info.get("forwardPE"))
    pb = safe_float(raw_info.get("priceToBook"))
    ev_ebitda = safe_float(raw_info.get("enterpriseToEbitda"))

    profit_margin = safe_float(raw_info.get("profitMargins"))
    operating_margin = safe_float(raw_info.get("operatingMargins"))
    roe = safe_float(raw_info.get("returnOnEquity"))
    dividend_yield = safe_float(raw_info.get("dividendYield"))
    debt_to_equity = safe_float(raw_info.get("debtToEquity"))
    if debt_to_equity is not None and debt_to_equity > 10.0:
        # Some providers report D/E as percentage (e.g., 85.0 instead of 0.85)
        # Normalize to standard ratio if > 10.0
        debt_to_equity = round(debt_to_equity / 100.0, 4)

    return {
        "company_name": raw_info.get("shortName") or raw_info.get("longName") or raw_info.get("symbol"),
        "sector": raw_info.get("sector"),
        "industry": raw_info.get("industry"),
        "currency": raw_info.get("currency") or "USD",
        "market_cap": safe_float(raw_info.get("marketCap")),
        "fifty_two_week_high": safe_float(raw_info.get("fiftyTwoWeekHigh")),
        "fifty_two_week_low": safe_float(raw_info.get("fiftyTwoWeekLow")),
        "beta": safe_float(raw_info.get("beta")),
        "pe_ratio": round(pe, 2) if pe is not None else None,
        "pb_ratio": round(pb, 2) if pb is not None else None,
        "ev_to_ebitda": round(ev_ebitda, 2) if ev_ebitda is not None else None,
        "profit_margin": round(profit_margin, 4) if profit_margin is not None else None,
        "operating_margin": round(operating_margin, 4) if operating_margin is not None else None,
        "return_on_equity": round(roe, 4) if roe is not None else None,
        "dividend_yield": round(dividend_yield, 4) if dividend_yield is not None else None,
        "debt_to_equity": round(debt_to_equity, 4) if debt_to_equity is not None else None,
    }
