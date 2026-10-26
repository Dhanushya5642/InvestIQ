"""Ranking and side-by-side comparison engine for analyzed stocks."""

from typing import List
from backend.app.schemas.stocks import RankedStock, StockAnalysisResult


def rank_analyzed_stocks(stocks: List[StockAnalysisResult]) -> List[RankedStock]:
    """Sort analyzed stocks deterministically and assign 1-indexed ranks.

    Sorting rules:
    1. Score descending (-score).
    2. Symbol ascending (alphabetical tie-breaker for deterministic output).
    """
    sorted_stocks = sorted(
        stocks,
        key=lambda s: (-s.score, s.symbol.upper()),
    )

    ranked: List[RankedStock] = []
    for rank_idx, stock in enumerate(sorted_stocks, start=1):
        ranked.append(
            RankedStock(
                rank=rank_idx,
                symbol=stock.symbol,
                company_name=stock.company_name,
                currency=stock.currency,
                latest_price=stock.latest_price,
                score=stock.score,
                label=stock.label,
                applied_weights=stock.applied_weights,
                factor_scores=stock.factor_scores,
                missing_factors=stock.missing_factors,
                explanations=stock.explanations,
                metrics_summary=stock.metrics_summary,
                data_quality_warnings=stock.data_quality_warnings,
                source=stock.source,
                timestamp=stock.timestamp,
            )
        )

    return ranked
