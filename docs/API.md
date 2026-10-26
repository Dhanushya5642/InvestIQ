# Invest IQ API Specification

Base URL: `http://localhost:8000/api`

## Health Check
### `GET /api/health`
Checks backend service availability.

**Response `200 OK`**:
```json
{
  "status": "ok",
  "service": "Invest IQ API",
  "version": "0.1.0"
}
```

---

## Stock History
### `GET /api/stocks/{symbol}/history?period={period}`
Fetches historical OHLCV series, technical indicators, and provider metadata.

**Parameters**:
- `symbol` (path): Ticker symbol (e.g., `AAPL`, `MSFT`, `RELIANCE.NS`).
- `period` (query, optional, default: `1y`): Range (`1mo`, `3mo`, `6mo`, `1y`, `2y`, `5y`).

**Response `200 OK`**:
```json
{
  "symbol": "AAPL",
  "period": "1y",
  "source": "yfinance",
  "retrieval_timestamp": "2026-10-12T07:15:00Z",
  "currency": "USD",
  "data_points": 252,
  "history": [
    {
      "date": "2025-10-12",
      "open": 225.5,
      "high": 228.1,
      "low": 224.2,
      "close": 227.0,
      "volume": 45210000,
      "sma_20": 224.1,
      "sma_50": 220.5,
      "rsi": 58.4,
      "daily_return": 0.008
    }
  ]
}
```

---

## Stock Metrics
### `GET /api/stocks/{symbol}/metrics`
Returns company profile and available fundamental/valuation metrics. Missing fields return `null`.

**Response `200 OK`**:
```json
{
  "symbol": "AAPL",
  "company_name": "Apple Inc.",
  "sector": "Technology",
  "industry": "Consumer Electronics",
  "currency": "USD",
  "latest_price": 227.0,
  "pe_ratio": 32.5,
  "pb_ratio": 45.2,
  "ev_to_ebitda": 24.1,
  "profit_margin": 0.24,
  "operating_margin": 0.31,
  "return_on_equity": 1.45,
  "dividend_yield": 0.0045,
  "debt_to_equity": 1.4,
  "source": "yfinance",
  "retrieval_timestamp": "2026-10-12T07:15:00Z"
}
```

---

## Stock Multi-Factor Analysis
### `POST /api/stocks/analyze`
Analyzes one or more stock symbols and computes rule-based multi-factor scores, explanations, and risk metrics.

**Request Body**:
```json
{
  "symbols": ["AAPL", "MSFT", "INVALIDTICKER"],
  "period": "1y",
  "custom_weights": {
    "technical_trend": 0.30,
    "momentum": 0.20,
    "fundamentals": 0.30,
    "risk": 0.20
  }
}
```

**Response `200 OK`**:
```json
{
  "results": [
    {
      "symbol": "AAPL",
      "company_name": "Apple Inc.",
      "currency": "USD",
      "latest_price": 227.0,
      "score": 76.5,
      "label": "Buy",
      "applied_weights": {
        "technical_trend": 0.30,
        "momentum": 0.20,
        "fundamentals": 0.30,
        "risk": 0.20
      },
      "factor_scores": {
        "technical_trend": 85.0,
        "momentum": 72.0,
        "fundamentals": 75.0,
        "risk": 74.0
      },
      "missing_factors": [],
      "explanations": {
        "strengths": ["Bullish trend: Close above SMA 20 & SMA 50", "Healthy operating margins"],
        "risks": ["Elevated valuation multiple (P/E: 32.5)"],
        "missing_info": []
      },
      "metrics_summary": { ... },
      "data_quality_warnings": []
    }
  ],
  "errors": [
    {
      "symbol": "INVALIDTICKER",
      "error_code": "SYMBOL_NOT_FOUND",
      "message": "Market data could not be retrieved for symbol INVALIDTICKER."
    }
  ],
  "timestamp": "2026-10-12T07:15:00Z"
}
```

---

## Stock Comparison & Ranking
### `POST /api/stocks/compare`
Ranks analyzed stocks deterministically by composite score.

**Response `200 OK`**:
```json
{
  "rankings": [
    {
      "rank": 1,
      "symbol": "MSFT",
      "score": 81.2,
      "label": "Buy",
      ...
    },
    {
      "rank": 2,
      "symbol": "AAPL",
      "score": 76.5,
      "label": "Buy",
      ...
    }
  ],
  "errors": []
}
```
