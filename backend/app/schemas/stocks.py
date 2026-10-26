"""Pydantic schemas for Invest IQ API contracts."""

from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = "ok"
    service: str = "Invest IQ API"
    version: str = "0.1.0"
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")


class OHLCVDataPoint(BaseModel):
    """Single historical daily market bar with computed indicators."""

    date: str
    open: float
    high: float
    low: float
    close: float
    volume: float
    sma_20: Optional[float] = None
    sma_50: Optional[float] = None
    rsi: Optional[float] = None
    daily_return: Optional[float] = None


class StockHistoryResponse(BaseModel):
    """Historical stock market price time-series."""

    symbol: str
    period: str
    source: str
    retrieval_timestamp: str
    currency: Optional[str] = "USD"
    data_points: int
    history: List[OHLCVDataPoint]
    warnings: List[str] = Field(default_factory=list)


class StockMetricsResponse(BaseModel):
    """Company profile and fundamental valuation metrics."""

    symbol: str
    company_name: Optional[str] = None
    sector: Optional[str] = None
    industry: Optional[str] = None
    currency: Optional[str] = "USD"
    latest_price: Optional[float] = None
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    ev_to_ebitda: Optional[float] = None
    profit_margin: Optional[float] = None
    operating_margin: Optional[float] = None
    return_on_equity: Optional[float] = None
    dividend_yield: Optional[float] = None
    debt_to_equity: Optional[float] = None
    market_cap: Optional[float] = None
    fifty_two_week_high: Optional[float] = None
    fifty_two_week_low: Optional[float] = None
    beta: Optional[float] = None
    source: str
    retrieval_timestamp: str


class CustomWeightsInput(BaseModel):
    """Custom factor weights with validation."""

    technical_trend: Optional[float] = Field(default=0.30, ge=0.0, le=1.0)
    momentum: Optional[float] = Field(default=0.20, ge=0.0, le=1.0)
    fundamentals: Optional[float] = Field(default=0.30, ge=0.0, le=1.0)
    risk: Optional[float] = Field(default=0.20, ge=0.0, le=1.0)

    @field_validator("technical_trend", "momentum", "fundamentals", "risk")
    @classmethod
    def validate_weight_range(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and (v < 0 or v > 1.0):
            raise ValueError("Weight must be between 0.0 and 1.0")
        return v


class AnalyzeRequest(BaseModel):
    """Request payload for multi-factor stock analysis."""

    symbols: List[str] = Field(..., min_length=1, max_length=20)
    period: str = Field(default="1y")
    custom_weights: Optional[CustomWeightsInput] = None

    @field_validator("symbols")
    @classmethod
    def clean_symbols(cls, symbols: List[str]) -> List[str]:
        cleaned = [s.strip().upper() for s in symbols if s and s.strip()]
        if not cleaned:
            raise ValueError("At least one non-empty stock symbol must be provided.")
        # Remove duplicates while preserving order
        return list(dict.fromkeys(cleaned))

    @field_validator("period")
    @classmethod
    def validate_period(cls, period: str) -> str:
        valid_periods = {"1mo", "3mo", "6mo", "1y", "2y", "5y"}
        cleaned = period.strip().lower()
        if cleaned not in valid_periods:
            raise ValueError(f"Period must be one of {sorted(valid_periods)}")
        return cleaned


class FactorScores(BaseModel):
    """Individual 0-100 pillar scores."""

    technical_trend: Optional[float] = None
    momentum: Optional[float] = None
    fundamentals: Optional[float] = None
    risk: Optional[float] = None


class FactorWeights(BaseModel):
    """Applied normalized factor weights (sum to 1.0)."""

    technical_trend: float
    momentum: float
    fundamentals: float
    risk: float


class Explanations(BaseModel):
    """Plain-language explanations of drivers and limitations."""

    strengths: List[str] = Field(default_factory=list)
    risks: List[str] = Field(default_factory=list)
    missing_info: List[str] = Field(default_factory=list)
    summary: str


class MetricsSummary(BaseModel):
    """Snapshot of primary computed metrics for the stock."""

    latest_close: Optional[float] = None
    sma_20: Optional[float] = None
    sma_50: Optional[float] = None
    rsi_14: Optional[float] = None
    annualized_volatility: Optional[float] = None
    max_drawdown: Optional[float] = None
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    operating_margin: Optional[float] = None
    roe: Optional[float] = None
    debt_to_equity: Optional[float] = None


class StockAnalysisResult(BaseModel):
    """Full explainable multi-factor result for a single stock."""

    symbol: str
    company_name: Optional[str] = None
    currency: Optional[str] = "USD"
    latest_price: Optional[float] = None
    score: float
    label: str  # "Buy", "Hold", "Sell" (Experimental Indicator)
    applied_weights: FactorWeights
    factor_scores: FactorScores
    missing_factors: List[str]
    explanations: Explanations
    metrics_summary: MetricsSummary
    data_quality_warnings: List[str] = Field(default_factory=list)
    source: str
    timestamp: str


class StockAnalysisError(BaseModel):
    """Per-symbol failure details."""

    symbol: str
    error_code: str
    message: str


class AnalyzeResponse(BaseModel):
    """Response containing successfully analyzed stocks and isolated errors."""

    results: List[StockAnalysisResult]
    errors: List[StockAnalysisError]
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")


class RankedStock(StockAnalysisResult):
    """Analyzed stock result augmented with ordinal rank."""

    rank: int


class CompareResponse(BaseModel):
    """Ranked side-by-side comparison response."""

    rankings: List[RankedStock]
    errors: List[StockAnalysisError]
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
