"""Multi-factor scoring engine with weight renormalization and plain-language explanations."""

from typing import Any, Dict, List, Optional, Tuple
from backend.app.schemas.stocks import (
    CustomWeightsInput,
    Explanations,
    FactorScores,
    FactorWeights,
)
from backend.app.utils.errors import InvestIQException


def score_technical_trend(
    latest_close: Optional[float],
    sma_20: Optional[float],
    sma_50: Optional[float],
) -> Tuple[Optional[float], List[str], List[str]]:
    """Score technical price trend on 0-100 scale."""
    if latest_close is None or (sma_20 is None and sma_50 is None):
        return None, [], []

    strengths: List[str] = []
    risks: List[str] = []
    points = 10.0  # Base floor

    if sma_20 is not None:
        if latest_close >= sma_20:
            points += 35.0
            strengths.append(f"Price ({latest_close:.2f}) trades above 20-day SMA ({sma_20:.2f}).")
        else:
            risks.append(f"Price ({latest_close:.2f}) trades below 20-day SMA ({sma_20:.2f}).")

    if sma_50 is not None:
        if latest_close >= sma_50:
            points += 35.0
            strengths.append(f"Price ({latest_close:.2f}) trades above 50-day SMA ({sma_50:.2f}).")
        else:
            risks.append(f"Price ({latest_close:.2f}) trades below 50-day SMA ({sma_50:.2f}).")

    if sma_20 is not None and sma_50 is not None:
        if sma_20 >= sma_50:
            points += 20.0
            strengths.append("Moving averages in bullish alignment (SMA 20 >= SMA 50).")
        else:
            risks.append("Moving averages in bearish alignment (SMA 20 < SMA 50).")
    else:
        # Scale remaining points if 50-day warm up not fully reached
        points = min(100.0, points * (90.0 / 45.0) if points > 10 else 20.0)

    score = max(0.0, min(100.0, points))
    return round(score, 1), strengths, risks


def score_momentum(rsi: Optional[float]) -> Tuple[Optional[float], List[str], List[str]]:
    """Score momentum using 14-period RSI on 0-100 scale."""
    if rsi is None:
        return None, [], []

    strengths: List[str] = []
    risks: List[str] = []

    if 45.0 <= rsi <= 60.0:
        score = 92.0
        strengths.append(f"Optimal healthy momentum with RSI at {rsi:.1f}.")
    elif 60.0 < rsi <= 70.0:
        score = 78.0
        strengths.append(f"Constructive upward momentum with RSI at {rsi:.1f} (approaching overbought).")
    elif 35.0 <= rsi < 45.0:
        score = 65.0
        risks.append(f"Muted momentum with RSI at {rsi:.1f}.")
    elif 70.0 < rsi <= 80.0:
        score = 45.0
        risks.append(f"Overbought condition: RSI is elevated at {rsi:.1f}.")
    elif rsi > 80.0:
        score = 25.0
        risks.append(f"Extreme overbought exhaustion: RSI reached {rsi:.1f}.")
    elif 25.0 <= rsi < 35.0:
        score = 45.0
        risks.append(f"Oversold territory: RSI at {rsi:.1f} signals selling pressure.")
    else:  # rsi < 25.0
        score = 25.0
        risks.append(f"Deep oversold weakness: RSI depressed at {rsi:.1f}.")

    return round(score, 1), strengths, risks


def score_fundamentals(
    pe_ratio: Optional[float],
    pb_ratio: Optional[float],
    op_margin: Optional[float],
    roe: Optional[float],
    debt_to_equity: Optional[float],
) -> Tuple[Optional[float], List[str], List[str]]:
    """Score fundamentals and valuation on 0-100 scale."""
    sub_scores: List[float] = []
    strengths: List[str] = []
    risks: List[str] = []

    # Valuation: P/E
    if pe_ratio is not None:
        if pe_ratio < 0:
            sub_scores.append(25.0)
            risks.append(f"Negative earnings reported (P/E: {pe_ratio:.1f}).")
        elif 0 < pe_ratio <= 22.0:
            sub_scores.append(90.0)
            strengths.append(f"Attractive valuation multiple with P/E at {pe_ratio:.1f}.")
        elif 22.0 < pe_ratio <= 35.0:
            sub_scores.append(70.0)
            strengths.append(f"Moderate valuation with P/E at {pe_ratio:.1f}.")
        elif 35.0 < pe_ratio <= 60.0:
            sub_scores.append(48.0)
            risks.append(f"Elevated valuation multiple (P/E: {pe_ratio:.1f}).")
        else:
            sub_scores.append(30.0)
            risks.append(f"High valuation premium (P/E: {pe_ratio:.1f}).")

    # Profitability: Operating Margin
    if op_margin is not None:
        pct = op_margin * 100.0 if abs(op_margin) < 1.5 else op_margin
        if pct >= 20.0:
            sub_scores.append(92.0)
            strengths.append(f"Robust operating profitability (margin: {pct:.1f}%).")
        elif 10.0 <= pct < 20.0:
            sub_scores.append(75.0)
            strengths.append(f"Stable operating margin ({pct:.1f}%).")
        elif 0.0 <= pct < 10.0:
            sub_scores.append(50.0)
            risks.append(f"Slim operating margins ({pct:.1f}%).")
        else:
            sub_scores.append(20.0)
            risks.append(f"Negative operating margin ({pct:.1f}%).")

    # Capital Efficiency: ROE
    if roe is not None:
        roe_pct = roe * 100.0 if abs(roe) < 1.5 else roe
        if roe_pct >= 18.0:
            sub_scores.append(95.0)
            strengths.append(f"High return on equity (ROE: {roe_pct:.1f}%).")
        elif 10.0 <= roe_pct < 18.0:
            sub_scores.append(75.0)
            strengths.append(f"Healthy return on equity (ROE: {roe_pct:.1f}%).")
        elif 0.0 <= roe_pct < 10.0:
            sub_scores.append(50.0)
            risks.append(f"Modest return on equity (ROE: {roe_pct:.1f}%).")
        else:
            sub_scores.append(20.0)
            risks.append(f"Negative return on equity (ROE: {roe_pct:.1f}%).")

    # Financial Solvency: Debt-to-Equity
    if debt_to_equity is not None:
        if debt_to_equity <= 0.6:
            sub_scores.append(92.0)
            strengths.append(f"Conservative balance sheet leverage (Debt/Equity: {debt_to_equity:.2f}).")
        elif 0.6 < debt_to_equity <= 1.8:
            sub_scores.append(72.0)
            strengths.append(f"Manageable debt load (Debt/Equity: {debt_to_equity:.2f}).")
        else:
            sub_scores.append(35.0)
            risks.append(f"Elevated debt-to-equity ratio ({debt_to_equity:.2f}).")

    if not sub_scores:
        return None, [], []

    avg_score = float(sum(sub_scores) / len(sub_scores))
    return round(max(0.0, min(100.0, avg_score)), 1), strengths, risks


def score_risk(
    volatility: Optional[float],
    max_drawdown: Optional[float],
) -> Tuple[Optional[float], List[str], List[str]]:
    """Score risk stability (higher score = lower risk / safer profile)."""
    sub_scores: List[float] = []
    strengths: List[str] = []
    risks: List[str] = []

    if volatility is not None:
        vol_pct = volatility * 100.0
        if vol_pct <= 18.0:
            sub_scores.append(92.0)
            strengths.append(f"Low annualized volatility ({vol_pct:.1f}%).")
        elif 18.0 < vol_pct <= 28.0:
            sub_scores.append(75.0)
            strengths.append(f"Moderate annualized volatility ({vol_pct:.1f}%).")
        elif 28.0 < vol_pct <= 42.0:
            sub_scores.append(50.0)
            risks.append(f"High annualized price volatility ({vol_pct:.1f}%).")
        else:
            sub_scores.append(25.0)
            risks.append(f"Elevated annualized volatility ({vol_pct:.1f}%).")

    if max_drawdown is not None:
        dd_pct = abs(max_drawdown) * 100.0
        if dd_pct <= 15.0:
            sub_scores.append(90.0)
            strengths.append(f"Resilient drawdown control (max drawdown: -{dd_pct:.1f}%).")
        elif 15.0 < dd_pct <= 28.0:
            sub_scores.append(72.0)
            strengths.append(f"Controlled historical peak-to-trough decline (-{dd_pct:.1f}%).")
        elif 28.0 < dd_pct <= 45.0:
            sub_scores.append(48.0)
            risks.append(f"Notable historical drawdown risk (-{dd_pct:.1f}%).")
        else:
            sub_scores.append(25.0)
            risks.append(f"Severe historical drawdown observed (-{dd_pct:.1f}%).")

    if not sub_scores:
        return None, [], []

    avg_score = float(sum(sub_scores) / len(sub_scores))
    return round(max(0.0, min(100.0, avg_score)), 1), strengths, risks


def calculate_multi_factor_score(
    indicators_summary: Dict[str, Any],
    fundamentals: Dict[str, Any],
    custom_weights: Optional[CustomWeightsInput] = None,
) -> Tuple[float, str, FactorScores, FactorWeights, List[str], Explanations]:
    """Aggregate individual factor pillars using dynamic weight renormalization.

    Formula:
    Available weights are renormalized such that:
    W_i* = W_i / sum(W_available)
    Final Score = sum(S_i * W_i*)
    """
    # 1. Base weights configuration
    w_tech = custom_weights.technical_trend if custom_weights and custom_weights.technical_trend is not None else 0.30
    w_mom = custom_weights.momentum if custom_weights and custom_weights.momentum is not None else 0.20
    w_fund = custom_weights.fundamentals if custom_weights and custom_weights.fundamentals is not None else 0.30
    w_risk = custom_weights.risk if custom_weights and custom_weights.risk is not None else 0.20

    raw_weights = {
        "technical_trend": w_tech,
        "momentum": w_mom,
        "fundamentals": w_fund,
        "risk": w_risk,
    }

    # Ensure total raw weight is positive
    if sum(raw_weights.values()) <= 0:
        raise InvestIQException(
            code="INVALID_WEIGHTS",
            message="Sum of factor weights must be strictly greater than 0.",
        )

    # 2. Compute individual pillar scores and qualitative notes
    s_tech, tech_str, tech_risk = score_technical_trend(
        latest_close=indicators_summary.get("latest_close"),
        sma_20=indicators_summary.get("sma_20"),
        sma_50=indicators_summary.get("sma_50"),
    )

    s_mom, mom_str, mom_risk = score_momentum(
        rsi=indicators_summary.get("rsi_14"),
    )

    s_fund, fund_str, fund_risk = score_fundamentals(
        pe_ratio=fundamentals.get("pe_ratio"),
        pb_ratio=fundamentals.get("pb_ratio"),
        op_margin=fundamentals.get("operating_margin"),
        roe=fundamentals.get("return_on_equity"),
        debt_to_equity=fundamentals.get("debt_to_equity"),
    )

    s_risk, risk_str, risk_risk = score_risk(
        volatility=indicators_summary.get("annualized_volatility"),
        max_drawdown=indicators_summary.get("max_drawdown"),
    )

    pillar_scores = {
        "technical_trend": s_tech,
        "momentum": s_mom,
        "fundamentals": s_fund,
        "risk": s_risk,
    }

    # 3. Dynamic Renormalization: identify available and missing factors
    available_factors = {k: v for k, v in pillar_scores.items() if v is not None}
    missing_factors = [k for k, v in pillar_scores.items() if v is None]

    if not available_factors:
        raise InvestIQException(
            code="DATA_INSUFFICIENT",
            message="No factor scores could be calculated due to missing data.",
        )

    available_weight_sum = sum(raw_weights[k] for k in available_factors.keys())
    if available_weight_sum <= 0:
        raise InvestIQException(
            code="INVALID_WEIGHTS",
            message="Sum of available factor weights is zero.",
        )

    # Renormalize active weights to sum exactly to 1.0
    normalized_weights: Dict[str, float] = {}
    weighted_score = 0.0
    for factor, score in available_factors.items():
        norm_w = raw_weights[factor] / available_weight_sum
        normalized_weights[factor] = round(norm_w, 4)
        weighted_score += score * norm_w

    # Non-available factors have 0.0 applied weight
    for missing in missing_factors:
        normalized_weights[missing] = 0.0

    final_score = round(max(0.0, min(100.0, weighted_score)), 1)

    # 4. Experimental Rule-Based Classification Label
    if final_score >= 70.0:
        label = "Buy"
    elif final_score >= 50.0:
        label = "Hold"
    else:
        label = "Sell"

    # 5. Explanations aggregation
    all_strengths = tech_str + mom_str + fund_str + risk_str
    all_risks = tech_risk + mom_risk + fund_risk + risk_risk

    missing_info_notes = [
        f"Missing data for factor: '{m.replace('_', ' ').capitalize()}'. Weight dynamically redistributed."
        for m in missing_factors
    ]

    summary_text = (
        f"Invest IQ Multi-Factor composite score: {final_score}/100 ({label} indicator). "
        f"Evaluation based on {len(available_factors)} active factor(s) "
        f"with renormalized weighting. This rule-based score is for decision support only."
    )

    factor_scores_obj = FactorScores(
        technical_trend=s_tech,
        momentum=s_mom,
        fundamentals=s_fund,
        risk=s_risk,
    )

    factor_weights_obj = FactorWeights(
        technical_trend=normalized_weights.get("technical_trend", 0.0),
        momentum=normalized_weights.get("momentum", 0.0),
        fundamentals=normalized_weights.get("fundamentals", 0.0),
        risk=normalized_weights.get("risk", 0.0),
    )

    explanations_obj = Explanations(
        strengths=all_strengths,
        risks=all_risks,
        missing_info=missing_info_notes,
        summary=summary_text,
    )

    return final_score, label, factor_scores_obj, factor_weights_obj, missing_factors, explanations_obj
