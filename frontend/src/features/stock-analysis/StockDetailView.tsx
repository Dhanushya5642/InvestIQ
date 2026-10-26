import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import type { RankedStock, StockHistoryResponse, StockMetricsResponse } from '../../types';
import { fetchStockHistory, fetchStockMetrics } from '../../api/client';

interface StockDetailViewProps {
  stock: RankedStock;
  onBack: () => void;
  period: string;
}

export const StockDetailView: React.FC<StockDetailViewProps> = ({
  stock,
  onBack,
  period,
}) => {
  const [historyData, setHistoryData] = useState<StockHistoryResponse | null>(null);
  const [metricsData, setMetricsData] = useState<StockMetricsResponse | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Chart line toggles
  const [showSma20, setShowSma20] = useState(true);
  const [showSma50, setShowSma50] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingHistory(true);
    setHistoryError(null);

    Promise.all([
      fetchStockHistory(stock.symbol, period),
      fetchStockMetrics(stock.symbol),
    ])
      .then(([hist, met]) => {
        if (isMounted) {
          setHistoryData(hist);
          setMetricsData(met);
          setIsLoadingHistory(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setHistoryError(err.message || 'Failed to load historical charts');
          setIsLoadingHistory(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [stock.symbol, period]);

  const labelBadge =
    stock.label === 'Buy'
      ? 'badge-buy'
      : stock.label === 'Hold'
      ? 'badge-hold'
      : 'badge-sell';

  return (
    <div className="space-y-6">
      {/* Back button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            id="back-to-dashboard-btn"
            onClick={onBack}
            className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors border border-slate-200"
          >
            ← Back to Overview
          </button>

          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-900 font-mono">{stock.symbol}</h2>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${labelBadge}`}>
                {stock.label} Signal
              </span>
              <span className="text-xs text-slate-500 font-mono">Rank #{stock.rank}</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              <span>{stock.company_name || metricsData?.company_name || stock.symbol}</span>
              {metricsData?.sector && (
                <span className="text-slate-400"> • Sector: {metricsData.sector}</span>
              )}
            </p>
          </div>
        </div>

        {/* Score and Price Pill */}
        <div className="flex items-center gap-6 self-end sm:self-auto">
          <div>
            <span className="text-[11px] text-slate-500 uppercase font-semibold">Latest Close</span>
            <div className="text-xl font-bold text-slate-900 font-mono">
              {stock.latest_price !== null && stock.latest_price !== undefined
                ? `${stock.currency || 'USD'} ${stock.latest_price.toFixed(2)}`
                : '—'}
            </div>
          </div>

          <div className="text-right pl-6 border-l border-slate-200">
            <span className="text-[11px] text-slate-500 uppercase font-semibold">Composite Score</span>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {stock.score} <span className="text-xs text-slate-400">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Historical Price Chart */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Historical Market Price & Moving Averages
            </h3>
            <p className="text-xs text-slate-500">
              {period.toUpperCase()} timeframe daily bars ({historyData?.data_points || 0} bars recorded)
            </p>
          </div>

          {/* Toggle Controls */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setShowSma20(!showSma20)}
              className={`px-3 py-1 rounded border font-mono transition-colors text-xs font-semibold ${
                showSma20
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}
            >
              SMA 20
            </button>
            <button
              onClick={() => setShowSma50(!showSma50)}
              className={`px-3 py-1 rounded border font-mono transition-colors text-xs font-semibold ${
                showSma50
                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}
            >
              SMA 50
            </button>
          </div>
        </div>

        {/* Chart View */}
        {isLoadingHistory ? (
          <div className="h-72 flex items-center justify-center text-slate-500 text-sm">
            Loading historical OHLCV chart...
          </div>
        ) : historyError ? (
          <div className="h-48 flex items-center justify-center text-amber-700 text-xs">
            {historyError}
          </div>
        ) : historyData && historyData.history.length > 0 ? (
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData.history} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  minTickGap={30}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  domain={['auto', 'auto']}
                  tickLine={false}
                  orientation="right"
                  tickFormatter={(v) => Number(v).toFixed(1)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#0f172a',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                  }}
                  formatter={(val: any) => [Number(val).toFixed(2), '']}
                  labelFormatter={(lbl) => `Date: ${lbl}`}
                />
                <Line
                  type="monotone"
                  dataKey="close"
                  name="Close Price"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
                {showSma20 && (
                  <Line
                    type="monotone"
                    dataKey="sma_20"
                    name="SMA 20"
                    stroke="#d97706"
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                    dot={false}
                  />
                )}
                {showSma50 && (
                  <Line
                    type="monotone"
                    dataKey="sma_50"
                    name="SMA 50"
                    stroke="#9333ea"
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                    dot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : null}

        {/* Secondary RSI Oscillator Chart */}
        {historyData && historyData.history.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-800">
                RSI 14-Period Momentum Oscillator
              </span>
              <span className="text-slate-500 font-mono text-[11px]">
                Current: {stock.metrics_summary?.rsi_14 ?? '—'}
              </span>
            </div>
            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData.history} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" hide />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[30, 50, 70]}
                    stroke="#94a3b8"
                    fontSize={10}
                    orientation="right"
                    tickLine={false}
                  />
                  <ReferenceLine y={70} stroke="#dc2626" strokeDasharray="3 3" label={{ value: '70 Overbought', fill: '#dc2626', fontSize: 10 }} />
                  <ReferenceLine y={30} stroke="#059669" strokeDasharray="3 3" label={{ value: '30 Oversold', fill: '#059669', fontSize: 10 }} />
                  <Line
                    type="monotone"
                    dataKey="rsi"
                    name="RSI (14)"
                    stroke="#7c3aed"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* 4 Factor Pillars Deep-Dive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pillar 1: Technical Trend */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm">Technical Trend</h4>
            <div className="text-right">
              <span className="text-base font-bold text-blue-700 font-mono">
                {stock.factor_scores.technical_trend !== null ? `${stock.factor_scores.technical_trend}/100` : 'N/A'}
              </span>
              <span className="text-[11px] text-slate-400 block font-mono">
                Weight: {(stock.applied_weights.technical_trend * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-2.5 rounded border border-slate-100 font-mono">
            <div>
              <span className="text-slate-400 text-[10px] block font-sans">Price</span>
              <span className="text-slate-800 font-semibold">
                {stock.latest_price?.toFixed(2) ?? '—'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block font-sans">SMA 20</span>
              <span className="text-slate-800 font-semibold">
                {stock.metrics_summary.sma_20?.toFixed(2) ?? '—'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block font-sans">SMA 50</span>
              <span className="text-slate-800 font-semibold">
                {stock.metrics_summary.sma_50?.toFixed(2) ?? '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Pillar 2: Momentum */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm">Momentum</h4>
            <div className="text-right">
              <span className="text-base font-bold text-purple-700 font-mono">
                {stock.factor_scores.momentum !== null ? `${stock.factor_scores.momentum}/100` : 'N/A'}
              </span>
              <span className="text-[11px] text-slate-400 block font-mono">
                Weight: {(stock.applied_weights.momentum * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded border border-slate-100 font-mono">
            <div>
              <span className="text-slate-400 text-[10px] block font-sans">RSI 14-Period</span>
              <span className="text-slate-800 font-semibold">
                {stock.metrics_summary.rsi_14?.toFixed(1) ?? '—'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block font-sans">Momentum State</span>
              <span className="text-slate-800 font-semibold font-sans">
                {stock.metrics_summary.rsi_14
                  ? stock.metrics_summary.rsi_14 > 70
                    ? 'Overbought'
                    : stock.metrics_summary.rsi_14 < 30
                    ? 'Oversold'
                    : 'Optimal Band'
                  : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Pillar 3: Fundamentals */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm">Fundamentals & Valuation</h4>
            <div className="text-right">
              <span className="text-base font-bold text-emerald-700 font-mono">
                {stock.factor_scores.fundamentals !== null ? `${stock.factor_scores.fundamentals}/100` : 'N/A'}
              </span>
              <span className="text-[11px] text-slate-400 block font-mono">
                Weight: {(stock.applied_weights.fundamentals * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs bg-slate-50 p-2.5 rounded border border-slate-100 font-mono">
            <div>
              <span className="text-slate-400 text-[10px] block font-sans">P/E</span>
              <span className="text-slate-800 font-semibold">
                {stock.metrics_summary.pe_ratio !== null ? stock.metrics_summary.pe_ratio : '—'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block font-sans">P/B</span>
              <span className="text-slate-800 font-semibold">
                {stock.metrics_summary.pb_ratio !== null ? stock.metrics_summary.pb_ratio : '—'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block font-sans">Op. Margin</span>
              <span className="text-slate-800 font-semibold">
                {stock.metrics_summary.operating_margin != null
                  ? `${(stock.metrics_summary.operating_margin * 100).toFixed(1)}%`
                  : '—'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block font-sans">ROE</span>
              <span className="text-slate-800 font-semibold">
                {stock.metrics_summary.roe != null
                  ? `${(stock.metrics_summary.roe * 100).toFixed(1)}%`
                  : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Pillar 4: Risk Profile */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm">Risk & Volatility</h4>
            <div className="text-right">
              <span className="text-base font-bold text-amber-700 font-mono">
                {stock.factor_scores.risk !== null ? `${stock.factor_scores.risk}/100` : 'N/A'}
              </span>
              <span className="text-[11px] text-slate-400 block font-mono">
                Weight: {(stock.applied_weights.risk * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded border border-slate-100 font-mono">
            <div>
              <span className="text-slate-400 text-[10px] block font-sans">Ann. Volatility</span>
              <span className="text-slate-800 font-semibold">
                {stock.metrics_summary.annualized_volatility != null
                  ? `${(stock.metrics_summary.annualized_volatility * 100).toFixed(1)}%`
                  : '—'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block font-sans">Max Drawdown</span>
              <span className="text-red-700 font-semibold">
                {stock.metrics_summary.max_drawdown != null
                  ? `${(stock.metrics_summary.max_drawdown * 100).toFixed(1)}%`
                  : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Plain-Language Explanations Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Explainable Factor Analysis & Evidence Summary
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          {stock.explanations.summary}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Strengths */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Observed Strengths ({stock.explanations.strengths.length})
            </span>
            <ul className="space-y-1 text-xs text-slate-700">
              {stock.explanations.strengths.map((s, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span>{s}</span>
                </li>
              ))}
              {stock.explanations.strengths.length === 0 && (
                <li className="text-slate-400 italic">No significant bullish signals met.</li>
              )}
            </ul>
          </div>

          {/* Risks */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
            <span className="text-xs font-bold text-red-800 uppercase tracking-wider block">
              Identified Risks & Headwinds ({stock.explanations.risks.length})
            </span>
            <ul className="space-y-1 text-xs text-slate-700">
              {stock.explanations.risks.map((r, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-red-700 font-bold">•</span>
                  <span>{r}</span>
                </li>
              ))}
              {stock.explanations.risks.length === 0 && (
                <li className="text-slate-400 italic">No elevated risk indicators detected.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Missing information redistribution note */}
        {stock.missing_factors.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
            <span className="font-bold">Missing Metrics Handled Deterministically: </span>
            <span>
              Factors ({stock.missing_factors.join(', ')}) were omitted without penalty.
              Active factor weights were dynamically scaled to sum to 100%.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
