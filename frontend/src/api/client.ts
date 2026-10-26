import type {
  AnalyzeResponse,
  CompareResponse,
  CustomWeights,
  StockHistoryResponse,
  StockMetricsResponse,
} from '../types';

const API_BASE = '/api';

export async function checkHealth(): Promise<{ status: string; service: string; version: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchStockHistory(
  symbol: string,
  period: string = '1y'
): Promise<StockHistoryResponse> {
  const res = await fetch(`${API_BASE}/stocks/${encodeURIComponent(symbol)}/history?period=${period}`);
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    const message = errorJson.detail?.message || `Failed to fetch history for ${symbol}`;
    throw new Error(message);
  }
  return res.json();
}

export async function fetchStockMetrics(symbol: string): Promise<StockMetricsResponse> {
  const res = await fetch(`${API_BASE}/stocks/${encodeURIComponent(symbol)}/metrics`);
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    const message = errorJson.detail?.message || `Failed to fetch metrics for ${symbol}`;
    throw new Error(message);
  }
  return res.json();
}

export async function analyzeStocks(
  symbols: string[],
  period: string = '1y',
  customWeights?: CustomWeights
): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_BASE}/stocks/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      symbols,
      period,
      custom_weights: customWeights,
    }),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    const message = errorJson.detail?.message || 'Failed to analyze stocks';
    throw new Error(message);
  }
  return res.json();
}

export async function compareStocks(
  symbols: string[],
  period: string = '1y',
  customWeights?: CustomWeights
): Promise<CompareResponse> {
  const res = await fetch(`${API_BASE}/stocks/compare`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      symbols,
      period,
      custom_weights: customWeights,
    }),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    const message = errorJson.detail?.message || 'Failed to rank stocks';
    throw new Error(message);
  }
  return res.json();
}
