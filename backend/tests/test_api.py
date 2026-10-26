"""API integration tests with mocked market data provider."""

from unittest.mock import patch
import pandas as pd
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.utils.errors import SymbolNotFoundError

client = TestClient(app)


def test_health_check_endpoint():
    """Verify health endpoint response."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "Invest IQ" in data["service"]


def test_get_history_endpoint(sample_ohlcv_df):
    """Verify history endpoint returns correct schema with indicators."""
    with patch(
        "backend.app.services.market_data.market_data_service.fetch_history",
        return_value=(sample_ohlcv_df, "mock_provider", "2026-10-12T00:00:00Z"),
    ), patch(
        "backend.app.services.market_data.market_data_service.fetch_info",
        return_value=({"currency": "USD"}, "mock_provider", "2026-10-12T00:00:00Z"),
    ):
        response = client.get("/api/stocks/AAPL/history?period=1y")
        assert response.status_code == 200
        data = response.json()
        assert data["symbol"] == "AAPL"
        assert data["data_points"] == len(sample_ohlcv_df)
        assert len(data["history"]) > 0
        latest_point = data["history"][-1]
        assert "close" in latest_point
        assert "rsi" in latest_point
        assert "sma_20" in latest_point


def test_get_metrics_endpoint(sample_ohlcv_df, sample_raw_info):
    """Verify metrics endpoint returns normalized fundamentals."""
    with patch(
        "backend.app.services.market_data.market_data_service.fetch_info",
        return_value=(sample_raw_info, "mock_provider", "2026-10-12T00:00:00Z"),
    ), patch(
        "backend.app.services.market_data.market_data_service.fetch_history",
        return_value=(sample_ohlcv_df, "mock_provider", "2026-10-12T00:00:00Z"),
    ):
        response = client.get("/api/stocks/AAPL/metrics")
        assert response.status_code == 200
        data = response.json()
        assert data["symbol"] == "AAPL"
        assert data["company_name"] == "Test Tech Corp"
        assert data["pe_ratio"] == 24.5
        assert data["pb_ratio"] == 4.2


def test_analyze_stocks_endpoint(sample_ohlcv_df, sample_raw_info):
    """Verify multi-stock analysis with mixed valid and invalid symbols."""
    def mock_fetch_history(sym, period="1y"):
        if sym.upper() == "BADTICKER":
            raise SymbolNotFoundError("BADTICKER")
        return sample_ohlcv_df, "mock_provider", "2026-10-12T00:00:00Z"

    with patch(
        "backend.app.services.market_data.market_data_service.fetch_history",
        side_effect=mock_fetch_history,
    ), patch(
        "backend.app.services.market_data.market_data_service.fetch_info",
        return_value=(sample_raw_info, "mock_provider", "2026-10-12T00:00:00Z"),
    ):
        payload = {
            "symbols": ["AAPL", "BADTICKER"],
            "period": "1y",
        }
        response = client.post("/api/stocks/analyze", json=payload)
        assert response.status_code == 200
        data = response.json()

        # AAPL succeeded
        assert len(data["results"]) == 1
        aapl = data["results"][0]
        assert aapl["symbol"] == "AAPL"
        assert 0.0 <= aapl["score"] <= 100.0
        assert aapl["label"] in ["Buy", "Hold", "Sell"]
        assert "explanations" in aapl

        # BADTICKER isolated in errors without crashing request
        assert len(data["errors"]) == 1
        assert data["errors"][0]["symbol"] == "BADTICKER"
        assert data["errors"][0]["error_code"] == "SYMBOL_NOT_FOUND"


def test_compare_stocks_endpoint(sample_ohlcv_df, sample_raw_info):
    """Verify compare endpoint returns ranked array."""
    with patch(
        "backend.app.services.market_data.market_data_service.fetch_history",
        return_value=(sample_ohlcv_df, "mock_provider", "2026-10-12T00:00:00Z"),
    ), patch(
        "backend.app.services.market_data.market_data_service.fetch_info",
        return_value=(sample_raw_info, "mock_provider", "2026-10-12T00:00:00Z"),
    ):
        payload = {"symbols": ["MSFT", "AAPL"], "period": "1y"}
        response = client.post("/api/stocks/compare", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert len(data["rankings"]) == 2
        assert data["rankings"][0]["rank"] == 1
        assert data["rankings"][1]["rank"] == 2
