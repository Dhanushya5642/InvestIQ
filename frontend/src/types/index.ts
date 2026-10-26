export interface OHLCVDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma_20?: number | null;
  sma_50?: number | null;
  rsi?: number | null;
  daily_return?: number | null;
}

export interface StockHistoryResponse {
  symbol: string;
  period: string;
  source: string;
  retrieval_timestamp: string;
  currency: string;
  data_points: number;
  history: OHLCVDataPoint[];
  warnings: string[];
}

export interface StockMetricsResponse {
  symbol: string;
  company_name?: string | null;
  sector?: string | null;
  industry?: string | null;
  currency: string;
  latest_price?: number | null;
  pe_ratio?: number | null;
  pb_ratio?: number | null;
  ev_to_ebitda?: number | null;
  profit_margin?: number | null;
  operating_margin?: number | null;
  return_on_equity?: number | null;
  dividend_yield?: number | null;
  debt_to_equity?: number | null;
  market_cap?: number | null;
  fifty_two_week_high?: number | null;
  fifty_two_week_low?: number | null;
  beta?: number | null;
  source: string;
  retrieval_timestamp: string;
}

export interface FactorScores {
  technical_trend?: number | null;
  momentum?: number | null;
  fundamentals?: number | null;
  risk?: number | null;
}

export interface FactorWeights {
  technical_trend: number;
  momentum: number;
  fundamentals: number;
  risk: number;
}

export interface Explanations {
  strengths: string[];
  risks: string[];
  missing_info: string[];
  summary: string;
}

export interface MetricsSummary {
  latest_close?: number | null;
  sma_20?: number | null;
  sma_50?: number | null;
  rsi_14?: number | null;
  annualized_volatility?: number | null;
  max_drawdown?: number | null;
  pe_ratio?: number | null;
  pb_ratio?: number | null;
  operating_margin?: number | null;
  roe?: number | null;
  debt_to_equity?: number | null;
}

export interface StockAnalysisResult {
  symbol: string;
  company_name?: string | null;
  currency?: string;
  latest_price?: number | null;
  score: number;
  label: 'Buy' | 'Hold' | 'Sell';
  applied_weights: FactorWeights;
  factor_scores: FactorScores;
  missing_factors: string[];
  explanations: Explanations;
  metrics_summary: MetricsSummary;
  data_quality_warnings: string[];
  source: string;
  timestamp: string;
}

export interface StockAnalysisError {
  symbol: string;
  error_code: string;
  message: string;
}

export interface AnalyzeResponse {
  results: StockAnalysisResult[];
  errors: StockAnalysisError[];
  timestamp: string;
}

export interface RankedStock extends StockAnalysisResult {
  rank: number;
}

export interface CompareResponse {
  rankings: RankedStock[];
  errors: StockAnalysisError[];
  timestamp: string;
}

export interface CustomWeights {
  technical_trend: number;
  momentum: number;
  fundamentals: number;
  risk: number;
}
