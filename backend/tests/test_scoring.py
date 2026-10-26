"""Tests for multi-factor rule-based scoring engine."""

import pytest
from backend.app.schemas.stocks import CustomWeightsInput
from backend.app.services.scoring import (
    calculate_multi_factor_score,
    score_fundamentals,
    score_momentum,
    score_risk,
    score_technical_trend,
)
from backend.app.utils.errors import InvestIQException


def test_score_technical_trend():
    """Verify technical scoring logic."""
    # Bullish: price > sma20, price > sma50, sma20 > sma50
    score, str_notes, risk_notes = score_technical_trend(
        latest_close=150.0, sma_20=140.0, sma_50=130.0
    )
    assert score is not None
    assert score >= 80.0
    assert len(str_notes) > 0
    assert len(risk_notes) == 0

    # Bearish: price < sma20, price < sma50, sma20 < sma50
    score_b, str_b, risk_b = score_technical_trend(
        latest_close=100.0, sma_20=110.0, sma_50=120.0
    )
    assert score_b <= 30.0
    assert len(risk_b) > 0


def test_score_momentum():
    """Verify RSI momentum scoring."""
    # Optimal zone
    s_opt, _, _ = score_momentum(52.0)
    assert s_opt >= 90.0

    # Overbought
    s_ob, _, risks_ob = score_momentum(78.0)
    assert s_ob <= 50.0
    assert any("Overbought" in r for r in risks_ob)

    # Oversold
    s_os, _, risks_os = score_momentum(22.0)
    assert s_os <= 30.0


def test_score_fundamentals_null_preservation():
    """Missing fundamental metrics are never treated as zeros."""
    # When all fundamentals are None -> factor is None
    s_none, _, _ = score_fundamentals(None, None, None, None, None)
    assert s_none is None

    # Healthy partial fundamentals
    s_partial, str_p, _ = score_fundamentals(
        pe_ratio=18.5,
        pb_ratio=None,
        op_margin=0.25,
        roe=None,
        debt_to_equity=0.4,
    )
    assert s_partial is not None
    assert s_partial >= 80.0


def test_dynamic_weight_renormalization():
    """When a factor is missing, remaining weights renormalize to sum to 1.0."""
    indicators_summary = {
        "latest_close": 150.0,
        "sma_20": 140.0,
        "sma_50": 130.0,
        "rsi_14": 55.0,
        "annualized_volatility": 0.16,
        "max_drawdown": -0.10,
    }
    # Completely missing fundamentals
    empty_fundamentals = {
        "pe_ratio": None,
        "pb_ratio": None,
        "operating_margin": None,
        "return_on_equity": None,
        "debt_to_equity": None,
    }

    score, label, f_scores, f_weights, missing, explanations = calculate_multi_factor_score(
        indicators_summary=indicators_summary,
        fundamentals=empty_fundamentals,
    )

    assert "fundamentals" in missing
    assert f_scores.fundamentals is None
    assert f_weights.fundamentals == 0.0

    # Remaining weights must sum to 1.0
    active_weight_sum = (
        f_weights.technical_trend + f_weights.momentum + f_weights.risk
    )
    assert active_weight_sum == pytest.approx(1.0, abs=1e-3)
    assert 0.0 <= score <= 100.0
    assert label in ["Buy", "Hold", "Sell"]


def test_custom_weights_validation():
    """Reject non-positive total weights."""
    indicators_summary = {"latest_close": 100.0, "sma_20": 90.0}
    fundamentals = {}

    with pytest.raises(InvestIQException) as exc_info:
        calculate_multi_factor_score(
            indicators_summary=indicators_summary,
            fundamentals=fundamentals,
            custom_weights=CustomWeightsInput(
                technical_trend=0.0,
                momentum=0.0,
                fundamentals=0.0,
                risk=0.0,
            ),
        )
    assert exc_info.value.code == "INVALID_WEIGHTS"
