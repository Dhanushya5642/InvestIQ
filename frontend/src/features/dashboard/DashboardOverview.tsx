import React, { useState } from 'react';
import type { RankedStock, StockAnalysisError } from '../../types';

interface DashboardOverviewProps {
  analyzedStocks: RankedStock[];
  errors: StockAnalysisError[];
  isLoading: boolean;
  onAnalyze: (symbols: string[], period: string) => void;
  onSelectStock: (symbol: string) => void;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  analyzedStocks,
  errors,
  isLoading,
  onAnalyze,
  onSelectStock,
  selectedPeriod,
  setSelectedPeriod,
}) => {
  const [inputSymbols, setInputSymbols] = useState('AAPL, MSFT, NVDA, GOOGL');

  const periods = [
    { label: '1M', value: '1mo' },
    { label: '3M', value: '3mo' },
    { label: '6M', value: '6mo' },
    { label: '1Y', value: '1y' },
    { label: '2Y', value: '2y' },
    { label: '5Y', value: '5y' },
  ];

  const presets = [
    { name: 'US Tech Leaders', tickers: 'AAPL, MSFT, NVDA, GOOGL' },
    { name: 'Indian Equities', tickers: 'RELIANCE.NS, TCS.NS, INFY.NS' },
    { name: 'Global Value & Growth', tickers: 'TSLA, AMZN, JNJ, BRK-B' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const symbols = inputSymbols
      .split(/[,\s]+/)
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s.length > 0);

    if (symbols.length > 0) {
      onAnalyze(symbols, selectedPeriod);
    }
  };

  const handleApplyPreset = (tickers: string) => {
    setInputSymbols(tickers);
    const symbols = tickers
      .split(/[,\s]+/)
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s.length > 0);
    onAnalyze(symbols, selectedPeriod);
  };

  // Summary stats
  const totalAnalyzed = analyzedStocks.length;
  const buyCount = analyzedStocks.filter((s) => s.label === 'Buy').length;
  const holdCount = analyzedStocks.filter((s) => s.label === 'Hold').length;
  const sellCount = analyzedStocks.filter((s) => s.label === 'Sell').length;
  const topStock = analyzedStocks[0];
  const avgScore =
    totalAnalyzed > 0
      ? (analyzedStocks.reduce((acc, s) => acc + s.score, 0) / totalAnalyzed).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      {/* Search & Configuration Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Multi-Factor Stock Intelligence
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare equities using explainable rule-based metrics across Technicals, Momentum, Fundamentals, and Risk.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="flex-1">
              <input
                id="stock-symbol-input"
                type="text"
                value={inputSymbols}
                onChange={(e) => setInputSymbols(e.target.value)}
                placeholder="Enter stock symbols separated by comma (e.g. AAPL, MSFT, RELIANCE.NS)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-800 text-sm font-medium"
              />
            </div>

            {/* Period Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
              {periods.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  id={`period-btn-${p.value}`}
                  onClick={() => {
                    setSelectedPeriod(p.value);
                    const symbols = inputSymbols
                      .split(/[,\s]+/)
                      .map((s) => s.trim().toUpperCase())
                      .filter((s) => s.length > 0);
                    if (symbols.length > 0) {
                      onAnalyze(symbols, p.value);
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded text-xs font-semibold transition-colors ${
                    selectedPeriod === p.value
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              id="analyze-submit-btn"
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors shrink-0 disabled:opacity-50"
            >
              {isLoading ? 'Analyzing...' : 'Run Analysis'}
            </button>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-500 font-medium">Quick Presets:</span>
            {presets.map((pr) => (
              <button
                key={pr.name}
                type="button"
                onClick={() => handleApplyPreset(pr.tickers)}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors font-medium"
              >
                {pr.name}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Errors Banner (isolated per-symbol failures) */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 space-y-2">
          <div className="text-red-800 text-xs font-bold uppercase tracking-wider">
            Market Data Warnings ({errors.length})
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {errors.map((err) => (
              <div
                key={err.symbol}
                className="bg-white p-2.5 rounded border border-red-200 text-slate-700 flex items-start gap-2"
              >
                <span className="font-mono font-bold text-red-700">{err.symbol}:</span>
                <span className="text-slate-600">{err.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary KPI Cards (When stocks are analyzed) */}
      {totalAnalyzed > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Universe Count
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-slate-900">{totalAnalyzed}</span>
              <span className="text-xs text-slate-500">stocks</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Top Ranked Ticker
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-slate-900 font-mono">
                {topStock ? topStock.symbol : '—'}
              </span>
              <span className="text-xs text-emerald-700 font-semibold font-mono">
                {topStock ? `${topStock.score}/100` : ''}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Universe Average
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-slate-900 font-mono">{avgScore}</span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Signal Distribution
            </span>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold">
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {buyCount} Buy
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                {holdCount} Hold
              </span>
              <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                {sellCount} Sell
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Stock Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-5 border border-slate-200 space-y-3 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="w-20 h-5 bg-slate-200 rounded" />
                <div className="w-16 h-5 bg-slate-200 rounded" />
              </div>
              <div className="w-28 h-7 bg-slate-200 rounded" />
              <div className="space-y-1.5">
                <div className="w-full h-2 bg-slate-200 rounded" />
                <div className="w-full h-2 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : analyzedStocks.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Ranked by multi-factor score (descending)</span>
            <span>Click any card for full chart and factor review</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyzedStocks.map((stock) => {
              const labelColor =
                stock.label === 'Buy'
                  ? 'badge-buy'
                  : stock.label === 'Hold'
                  ? 'badge-hold'
                  : 'badge-sell';

              return (
                <div
                  key={stock.symbol}
                  id={`stock-card-${stock.symbol}`}
                  onClick={() => onSelectStock(stock.symbol)}
                  className="bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-400 cursor-pointer transition-all shadow-xs space-y-4"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          #{stock.rank}
                        </span>
                        <h3 className="font-bold text-base text-slate-900 font-mono">
                          {stock.symbol}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 truncate max-w-[170px] mt-0.5">
                        {stock.company_name || stock.symbol}
                      </p>
                    </div>

                    {/* Composite Score & Signal Badge */}
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-2xl font-black text-slate-900 font-mono">
                          {stock.score}
                        </span>
                        <span className="text-[11px] text-slate-400">/100</span>
                      </div>
                      <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded ${labelColor}`}>
                        {stock.label}
                      </span>
                    </div>
                  </div>

                  {/* Price & Primary stats */}
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">Price</span>
                      <p className="text-sm font-semibold text-slate-800 font-mono mt-0.5">
                        {stock.latest_price !== null && stock.latest_price !== undefined
                          ? `${stock.currency || 'USD'} ${stock.latest_price.toFixed(2)}`
                          : 'N/A'}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">RSI (14)</span>
                      <p className="text-sm font-semibold text-slate-800 font-mono mt-0.5">
                        {stock.metrics_summary?.rsi_14 !== null && stock.metrics_summary?.rsi_14 !== undefined
                          ? stock.metrics_summary.rsi_14.toFixed(1)
                          : 'N/A'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">Ann. Vol</span>
                      <p className="text-sm font-semibold text-slate-800 font-mono mt-0.5">
                        {stock.metrics_summary?.annualized_volatility !== null && stock.metrics_summary?.annualized_volatility !== undefined
                          ? `${(stock.metrics_summary.annualized_volatility * 100).toFixed(1)}%`
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* 4 Pillars Progress Bars */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex justify-between">
                      <span>Pillar Scores</span>
                      <span>Weight</span>
                    </div>

                    {/* Technical Trend */}
                    <div>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-slate-700 font-medium">Technical</span>
                        <span className="text-slate-600 font-mono text-[11px]">
                          {stock.factor_scores.technical_trend !== null ? `${stock.factor_scores.technical_trend}` : 'Missing'}
                          <span className="text-slate-400 ml-1">
                            ({(stock.applied_weights.technical_trend * 100).toFixed(0)}%)
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${stock.factor_scores.technical_trend || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Momentum */}
                    <div>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-slate-700 font-medium">Momentum</span>
                        <span className="text-slate-600 font-mono text-[11px]">
                          {stock.factor_scores.momentum !== null ? `${stock.factor_scores.momentum}` : 'Missing'}
                          <span className="text-slate-400 ml-1">
                            ({(stock.applied_weights.momentum * 100).toFixed(0)}%)
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                        <div
                          className="bg-purple-600 h-1.5 rounded-full"
                          style={{ width: `${stock.factor_scores.momentum || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Fundamentals */}
                    <div>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-slate-700 font-medium">Fundamentals</span>
                        <span className="text-slate-600 font-mono text-[11px]">
                          {stock.factor_scores.fundamentals !== null ? `${stock.factor_scores.fundamentals}` : 'Missing'}
                          <span className="text-slate-400 ml-1">
                            ({(stock.applied_weights.fundamentals * 100).toFixed(0)}%)
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                        <div
                          className="bg-emerald-600 h-1.5 rounded-full"
                          style={{ width: `${stock.factor_scores.fundamentals || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Risk */}
                    <div>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-slate-700 font-medium">Risk</span>
                        <span className="text-slate-600 font-mono text-[11px]">
                          {stock.factor_scores.risk !== null ? `${stock.factor_scores.risk}` : 'Missing'}
                          <span className="text-slate-400 ml-1">
                            ({(stock.applied_weights.risk * 100).toFixed(0)}%)
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                        <div
                          className="bg-amber-600 h-1.5 rounded-full"
                          style={{ width: `${stock.factor_scores.risk || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Missing factor note */}
                  {stock.missing_factors.length > 0 && (
                    <div className="text-[11px] text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                      Missing factor excluded; weights renormalized.
                    </div>
                  )}

                  {/* View Details Link */}
                  <div className="pt-2 border-t border-slate-100 text-xs font-semibold text-slate-700 hover:text-slate-900 flex justify-between items-center">
                    <span>Inspect Evidence</span>
                    <span>→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-xl p-10 text-center border border-slate-200 max-w-md mx-auto my-8 space-y-3">
          <h3 className="text-base font-bold text-slate-900">No Stocks Analyzed Yet</h3>
          <p className="text-xs text-slate-500">
            Enter stock symbols in the input above or choose a preset to generate explainable factor scores.
          </p>
          <div className="pt-2">
            <button
              onClick={() => handleApplyPreset('AAPL, MSFT, NVDA, GOOGL')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded"
            >
              Load US Tech Leaders Preset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
