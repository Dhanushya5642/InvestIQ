"""API routes for historical stock data, metrics, multi-factor analysis, and ranking."""

from datetime import datetime, timezone
from typing import Any, List, Optional
from fastapi import APIRouter, Query

from backend.app.schemas.stocks import (
    AnalyzeRequest,
    AnalyzeResponse,
    CompareResponse,
    MetricsSummary,
    OHLCVDataPoint,
    StockAnalysisError,
    StockAnalysisResult,
    StockHistoryResponse,
    StockMetricsResponse,
)
from backend.app.services.fundamentals import normalize_fundamentals
from backend.app.services.indicators import enrich_with_indicators
from backend.app.services.market_data import market_data_service
from backend.app.services.matcher import rank_analyzed_stocks
from backend.app.services.preprocessing import preprocess_market_data
from backend.app.services.scoring import calculate_multi_factor_score
from backend.app.utils.errors import InvestIQException

router = APIRouter(prefix="/stocks", tags=["Stocks"])


@router.get("/{symbol}/history", response_model=StockHistoryResponse)
async def get_stock_history(
    symbol: str,
    period: str = Query(default="1y", pattern="^(1mo|3mo|6mo|1y|2y|5y)$"),
) -> StockHistoryResponse:
    """Retrieve historical market prices with computed technical indicators."""
    raw_df, source, timestamp = market_data_service.fetch_history(symbol, period=period)
    clean_df, warnings = preprocess_market_data(raw_df)
    enriched_df, _ = enrich_with_indicators(clean_df)

    history_points: List[OHLCVDataPoint] = []
    for dt, row in enriched_df.iterrows():
        date_str = dt.strftime("%Y-%m-%d") if hasattr(dt, "strftime") else str(dt)[:10]
        history_points.append(
            OHLCVDataPoint(
                date=date_str,
                open=round(float(row["open"]), 2) if not pd_isna(row["open"]) else 0.0,
                high=round(float(row["high"]), 2) if not pd_isna(row["high"]) else 0.0,
                low=round(float(row["low"]), 2) if not pd_isna(row["low"]) else 0.0,
                close=round(float(row["close"]), 2) if not pd_isna(row["close"]) else 0.0,
                volume=float(row["volume"]) if not pd_isna(row["volume"]) else 0.0,
                sma_20=round(float(row["sma_20"]), 2) if not pd_isna(row["sma_20"]) else None,
                sma_50=round(float(row["sma_50"]), 2) if not pd_isna(row["sma_50"]) else None,
                rsi=round(float(row["rsi"]), 2) if not pd_isna(row["rsi"]) else None,
                daily_return=round(float(row["daily_return"]), 4) if not pd_isna(row["daily_return"]) else None,
            )
        )

    # Get currency if available from info
    info, _, _ = market_data_service.fetch_info(symbol)
    currency = info.get("currency") or "USD"

    return StockHistoryResponse(
        symbol=symbol.upper(),
        period=period,
        source=source,
        retrieval_timestamp=timestamp,
        currency=currency,
        data_points=len(history_points),
        history=history_points,
        warnings=warnings,
    )


@router.get("/{symbol}/metrics", response_model=StockMetricsResponse)
async def get_stock_metrics(symbol: str) -> StockMetricsResponse:
    """Retrieve company metadata and available valuation/fundamental metrics."""
    raw_info, source, timestamp = market_data_service.fetch_info(symbol)
    norm = normalize_fundamentals(raw_info)

    # Try fetching latest close price
    latest_price = None
    try:
        raw_df, _, _ = market_data_service.fetch_history(symbol, period="1mo")
        if not raw_df.empty:
            clean_df, _ = preprocess_market_data(raw_df, min_bars=1)
            latest_price = round(float(clean_df["close"].iloc[-1]), 2)
    except Exception:
        latest_price = norm.get("latest_price")

    return StockMetricsResponse(
        symbol=symbol.upper(),
        company_name=norm.get("company_name"),
        sector=norm.get("sector"),
        industry=norm.get("industry"),
        currency=norm.get("currency") or "USD",
        latest_price=latest_price,
        pe_ratio=norm.get("pe_ratio"),
        pb_ratio=norm.get("pb_ratio"),
        ev_to_ebitda=norm.get("ev_to_ebitda"),
        profit_margin=norm.get("profit_margin"),
        operating_margin=norm.get("operating_margin"),
        return_on_equity=norm.get("return_on_equity"),
        dividend_yield=norm.get("dividend_yield"),
        debt_to_equity=norm.get("debt_to_equity"),
        market_cap=norm.get("market_cap"),
        fifty_two_week_high=norm.get("fifty_two_week_high"),
        fifty_two_week_low=norm.get("fifty_two_week_low"),
        beta=norm.get("beta"),
        source=source,
        retrieval_timestamp=timestamp,
    )


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_stocks(payload: AnalyzeRequest) -> AnalyzeResponse:
    """Run full explainable multi-factor analysis on requested symbols."""
    results: List[StockAnalysisResult] = []
    errors: List[StockAnalysisError] = []

    for sym in payload.symbols:
        try:
            # 1. Market history & indicators
            raw_df, source, timestamp = market_data_service.fetch_history(sym, period=payload.period)
            clean_df, data_warnings = preprocess_market_data(raw_df)
            _, ind_summary = enrich_with_indicators(clean_df)

            # 2. Fundamentals
            raw_info, _, _ = market_data_service.fetch_info(sym)
            fund_data = normalize_fundamentals(raw_info)

            # 3. Multi-factor scoring
            (
                final_score,
                label,
                factor_scores,
                applied_weights,
                missing_factors,
                explanations,
            ) = calculate_multi_factor_score(
                indicators_summary=ind_summary,
                fundamentals=fund_data,
                custom_weights=payload.custom_weights,
            )

            metrics_summary = MetricsSummary(
                latest_close=ind_summary.get("latest_close"),
                sma_20=ind_summary.get("sma_20"),
                sma_50=ind_summary.get("sma_50"),
                rsi_14=ind_summary.get("rsi_14"),
                annualized_volatility=ind_summary.get("annualized_volatility"),
                max_drawdown=ind_summary.get("max_drawdown"),
                pe_ratio=fund_data.get("pe_ratio"),
                pb_ratio=fund_data.get("pb_ratio"),
                operating_margin=fund_data.get("operating_margin"),
                roe=fund_data.get("return_on_equity"),
                debt_to_equity=fund_data.get("debt_to_equity"),
            )

            result = StockAnalysisResult(
                symbol=sym.upper(),
                company_name=fund_data.get("company_name") or sym.upper(),
                currency=fund_data.get("currency") or "USD",
                latest_price=ind_summary.get("latest_close"),
                score=final_score,
                label=label,
                applied_weights=applied_weights,
                factor_scores=factor_scores,
                missing_factors=missing_factors,
                explanations=explanations,
                metrics_summary=metrics_summary,
                data_quality_warnings=data_warnings,
                source=source,
                timestamp=timestamp,
            )
            results.append(result)

        except InvestIQException as e:
            errors.append(
                StockAnalysisError(
                    symbol=sym.upper(),
                    error_code=e.code,
                    message=e.message,
                )
            )
        except Exception as exc:
            errors.append(
                StockAnalysisError(
                    symbol=sym.upper(),
                    error_code="PROCESSING_ERROR",
                    message=f"Failed to analyze symbol '{sym}': {str(exc)}",
                )
            )

    return AnalyzeResponse(
        results=results,
        errors=errors,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@router.post("/compare", response_model=CompareResponse)
async def compare_stocks(payload: AnalyzeRequest) -> CompareResponse:
    """Analyze and rank multiple stocks side-by-side."""
    analysis = await analyze_stocks(payload)
    rankings = rank_analyzed_stocks(analysis.results)
    return CompareResponse(
        rankings=rankings,
        errors=analysis.errors,
        timestamp=analysis.timestamp,
    )


def pd_isna(val: Any) -> bool:
    """Helper to detect pandas / numpy NaN values."""
    import math
    if val is None:
        return True
    try:
        return math.isnan(float(val))
    except (TypeError, ValueError):
        return False
