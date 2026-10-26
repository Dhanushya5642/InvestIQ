# Invest IQ Architecture Specification

## Overview
Invest IQ is a multi-factor investment intelligence platform built with a decoupled architecture:
- **Backend**: Python 3.12, FastAPI, Pydantic, Pandas, NumPy, yfinance.
- **Frontend**: React 18 / 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons.

```
                      ┌───────────────────────────────────────────────┐
                      │              React + Vite Frontend            │
                      │   (Dashboard, Analysis, Comparison, Charts)   │
                      └───────────────────────┬───────────────────────┘
                                              │ HTTP JSON
                                              ▼
                      ┌───────────────────────────────────────────────┐
                      │                 FastAPI App                   │
                      │         (CORS, Validation, Error Handler)     │
                      └──────────────┬─────────────────┬──────────────┘
                                     │                 │
                      ┌──────────────▼──────┐   ┌──────▼──────────────┐
                      │ /api/stocks/history │   │ /api/stocks/analyze │
                      │ /api/stocks/metrics │   │ /api/stocks/compare │
                      └──────────────┬──────┘   └──────┬──────────────┘
                                     │                 │
                      ┌──────────────▼─────────────────▼──────────────┐
                      │                  Services Layer               │
                      │  ┌─────────────────┐   ┌───────────────────┐  │
                      │  │ market_data.py  │──▶│ preprocessing.py  │  │
                      │  └─────────────────┘   └─────────┬─────────┘  │
                      │                                  │            │
                      │  ┌─────────────────┐   ┌─────────▼─────────┐  │
                      │  │ fundamentals.py │◀──│   indicators.py   │  │
                      │  └────────┬────────┘   └─────────┬─────────┘  │
                      │           │                      │            │
                      │           └───────────┬──────────┘            │
                      │                       ▼                       │
                      │             ┌───────────────────┐             │
                      │             │    scoring.py     │             │
                      │             └─────────┬─────────┘             │
                      │                       ▼                       │
                      │             ┌───────────────────┐             │
                      │             │    matcher.py     │             │
                      │             └───────────────────┘             │
                      └───────────────────────────────────────────────┘
```

## Backend Modular Design
1. **`app/config.py`**: Pydantic `BaseSettings` reading environment variables with secure defaults.
2. **`app/schemas/stocks.py`**: Strictly typed request/response schemas.
3. **`app/services/market_data.py`**: Provider adapter abstracting yfinance, caching responses with in-memory TTL, timeout protection, error translation.
4. **`app/services/preprocessing.py`**: Timestamp validation, ordering, duplicate elimination, non-positive price cleaning, explicit null preservation.
5. **`app/services/indicators.py`**:
   - SMA 20, SMA 50
   - RSI (14-period Wilder-smoothed)
   - Daily returns
   - Annualized historical volatility ($\sigma \times \sqrt{252}$)
   - Historical maximum drawdown
6. **`app/services/fundamentals.py`**: Normalization of P/E, P/B, EV/EBITDA, profit margin, ROE, dividend yield, debt-to-equity. Missing values remain null.
7. **`app/services/scoring.py`**:
   - Transparent rule-based 0-100 factor scoring.
   - 4 Factors: Technical Trend (30%), Momentum (20%), Fundamentals (30%), Risk (20%).
   - Missing factors are excluded, and weights are dynamically renormalized: $W_i^* = \frac{W_i}{\sum_{j \in \text{available}} W_j}$.
   - Plain-language explanations generated for strengths, risks, and missing factors.
8. **`app/services/matcher.py`**: Deterministic ranking and comparative cross-stock aggregation.
9. **`app/api/routes/stocks.py` & `health.py`**: Safe REST endpoints with standard error envelopes.

## Non-Negotiable Constraints
- **Rule-based**: No false claims of AI/ML or guaranteed profit.
- **Null Safety**: Missing financial data is never defaulted to zero.
- **Fail Gracefully**: Provider failure on one ticker does not crash multi-symbol batches.
- **Financial Disclaimer**: Decision support software; not personalized financial advice.
