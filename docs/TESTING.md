# Invest IQ Testing Strategy

## Philosophy
- **Isolated Unit Tests**: Financial calculation logic (RSI, SMA, volatility, max drawdown, score aggregation, renormalization) must be tested deterministically with static mock fixtures. No dependency on live internet or unstable external data providers during automated test suites.
- **Provider Error Isolation**: Tests simulate HTTP timeouts, empty responses, malformed records, and delisted symbols.
- **API Contract Tests**: FastAPI endpoint schemas, error envelopes, and CORS headers are validated using `httpx.AsyncClient` / `TestClient`.

---

## Test Execution Commands

### Run all backend unit and API tests:
```bash
python -m pytest backend/tests -v
```

### Run specific test suites:
```bash
# Test indicator calculations
python -m pytest backend/tests/test_indicators.py -v

# Test multi-factor scoring & weight renormalization
python -m pytest backend/tests/test_scoring.py -v

# Test ranking and matcher logic
python -m pytest backend/tests/test_matcher.py -v

# Test FastAPI endpoints and error shapes
python -m pytest backend/tests/test_api.py -v
```

---

## Live Smoke Test Checklist
When external network is available, smoke test live provider access:
1. `GET /api/stocks/AAPL/history` -> Returns valid historical series.
2. `GET /api/stocks/RELIANCE.NS/metrics` -> Returns INR currency and Indian equity metadata.
3. `POST /api/stocks/analyze` with `["AAPL", "NVDA", "NON_EXISTENT_XYZ_123"]` -> Check that valid symbols analyze while invalid symbol produces structured error in `errors` list.
