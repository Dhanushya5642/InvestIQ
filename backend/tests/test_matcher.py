"""Tests for ranking and matcher logic."""

from backend.app.schemas.stocks import (
    Explanations,
    FactorScores,
    FactorWeights,
    MetricsSummary,
    StockAnalysisResult,
)
from backend.app.services.matcher import rank_analyzed_stocks


def create_mock_analysis_result(symbol: str, score: float) -> StockAnalysisResult:
    return StockAnalysisResult(
        symbol=symbol,
        company_name=f"{symbol} Corp",
        currency="USD",
        latest_price=100.0,
        score=score,
        label="Buy" if score >= 70 else "Hold",
        applied_weights=FactorWeights(
            technical_trend=0.3, momentum=0.2, fundamentals=0.3, risk=0.2
        ),
        factor_scores=FactorScores(
            technical_trend=score, momentum=score, fundamentals=score, risk=score
        ),
        missing_factors=[],
        explanations=Explanations(
            strengths=["Strong"],
            risks=[],
            missing_info=[],
            summary="Summary",
        ),
        metrics_summary=MetricsSummary(latest_close=100.0),
        data_quality_warnings=[],
        source="test",
        timestamp="2026-10-12T00:00:00Z",
    )


def test_ranking_descending_and_tie_breaking():
    """Higher score gets rank 1. Ties break deterministically by symbol alphabetical order."""
    stocks = [
        create_mock_analysis_result("TSLA", 65.0),
        create_mock_analysis_result("AAPL", 85.0),
        create_mock_analysis_result("MSFT", 85.0),
        create_mock_analysis_result("NVDA", 72.0),
    ]

    ranked = rank_analyzed_stocks(stocks)

    # AAPL and MSFT both have 85.0 -> AAPL before MSFT
    assert ranked[0].symbol == "AAPL"
    assert ranked[0].rank == 1
    assert ranked[1].symbol == "MSFT"
    assert ranked[1].rank == 2

    # NVDA is 3rd with 72.0
    assert ranked[2].symbol == "NVDA"
    assert ranked[2].rank == 3

    # TSLA is 4th with 65.0
    assert ranked[3].symbol == "TSLA"
    assert ranked[3].rank == 4
