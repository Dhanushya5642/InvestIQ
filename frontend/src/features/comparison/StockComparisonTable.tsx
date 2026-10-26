import React from 'react';
import type { RankedStock } from '../../types';

interface StockComparisonTableProps {
  stocks: RankedStock[];
  onSelectStock: (symbol: string) => void;
  onExportCsv: () => void;
}

export const StockComparisonTable: React.FC<StockComparisonTableProps> = ({
  stocks,
  onSelectStock,
  onExportCsv,
}) => {
  if (stocks.length === 0) {
    return (
      <div className="bg-white rounded-xl p-10 text-center border border-slate-200 max-w-md mx-auto my-8 space-y-2">
        <h3 className="text-base font-bold text-slate-900">No Stocks Available for Comparison</h3>
        <p className="text-xs text-slate-500">
          Run an analysis on multiple symbols from the Overview tab to view side-by-side rankings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Header Controls */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Side-by-Side Stock Comparison & Ranking
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked deterministically by explainable multi-factor score (highest to lowest).
          </p>
        </div>

        <button
          id="export-csv-table-btn"
          onClick={onExportCsv}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-xs transition-colors self-end sm:self-auto"
        >
          Export Comparison CSV
        </button>
      </div>

      {/* Comparison Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Symbol</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Latest Price</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Signal</th>
                <th className="py-3 px-4">Tech Score</th>
                <th className="py-3 px-4">Momentum</th>
                <th className="py-3 px-4">Fundamentals</th>
                <th className="py-3 px-4">Risk Profile</th>
                <th className="py-3 px-4">P/E</th>
                <th className="py-3 px-4">Op. Margin</th>
                <th className="py-3 px-4">Ann. Vol</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {stocks.map((stock) => {
                const labelClass =
                  stock.label === 'Buy'
                    ? 'badge-buy'
                    : stock.label === 'Hold'
                    ? 'badge-hold'
                    : 'badge-sell';

                return (
                  <tr
                    key={stock.symbol}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => onSelectStock(stock.symbol)}
                  >
                    <td className="py-3 px-4 font-bold text-slate-700">
                      <span className="w-6 h-6 rounded bg-slate-100 border border-slate-200 inline-flex items-center justify-center text-[11px] text-slate-800">
                        #{stock.rank}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {stock.symbol}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-sans max-w-[140px] truncate">
                      {stock.company_name || stock.symbol}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {stock.latest_price !== null && stock.latest_price !== undefined
                        ? `${stock.currency || 'USD'} ${stock.latest_price.toFixed(2)}`
                        : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-base font-black text-slate-900">
                        {stock.score}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${labelClass}`}>
                        {stock.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-blue-700">
                      {stock.factor_scores.technical_trend !== null
                        ? `${stock.factor_scores.technical_trend}`
                        : <span className="text-slate-400">N/A</span>}
                    </td>
                    <td className="py-3 px-4 text-purple-700">
                      {stock.factor_scores.momentum !== null
                        ? `${stock.factor_scores.momentum}`
                        : <span className="text-slate-400">N/A</span>}
                    </td>
                    <td className="py-3 px-4 text-emerald-700">
                      {stock.factor_scores.fundamentals !== null
                        ? `${stock.factor_scores.fundamentals}`
                        : <span className="text-slate-400">N/A</span>}
                    </td>
                    <td className="py-3 px-4 text-amber-700">
                      {stock.factor_scores.risk !== null
                        ? `${stock.factor_scores.risk}`
                        : <span className="text-slate-400">N/A</span>}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {stock.metrics_summary.pe_ratio != null
                        ? stock.metrics_summary.pe_ratio
                        : <span className="text-slate-400">N/A</span>}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {stock.metrics_summary.operating_margin != null
                        ? `${(stock.metrics_summary.operating_margin * 100).toFixed(1)}%`
                        : <span className="text-slate-400">N/A</span>}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {stock.metrics_summary.annualized_volatility != null
                        ? `${(stock.metrics_summary.annualized_volatility * 100).toFixed(1)}%`
                        : <span className="text-slate-400">N/A</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStock(stock.symbol);
                        }}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
