import React from 'react';

export const MethodologyView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-1">
        <h2 className="text-xl font-bold text-slate-900">
          Scoring Methodology & Mathematical Transparency
        </h2>
        <p className="text-xs text-slate-500">
          Documentation of the rule-based multi-factor model and dynamic weight renormalization algorithm.
        </p>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
            1. Deterministic Rules
          </span>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every score is calculated deterministically from explicit mathematical formulations without black-box ML opacity or ungrounded return promises.
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
            2. Zero ≠ Missing
          </span>
          <p className="text-xs text-slate-600 leading-relaxed">
            Missing financial metrics are never imputed with artificial zeroes. When a factor cannot be calculated, weights are dynamically renormalized across available factors.
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
            3. Decision Support
          </span>
          <p className="text-xs text-slate-600 leading-relaxed">
            Scores (0–100) and signals (Buy / Hold / Sell) are comparative indicators for screening and research, not personalized financial advice or guaranteed predictions.
          </p>
        </div>
      </div>

      {/* Formula Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Dynamic Weight Renormalization Formula
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          When one or more factors are absent (for instance, negative earnings yielding no P/E or incomplete balance sheet disclosures), the effective weight of active factors scales proportionally:
        </p>

        <div className="bg-slate-50 p-4 rounded border border-slate-200 font-mono text-xs text-slate-800 space-y-1.5">
          <div>{'W_i* = W_i / ∑_{k ∈ Available} W_k'}</div>
          <div>{'Final Composite Score = ∑_{i ∈ Available} ( Factor_Score_i × W_i* )'}</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded bg-blue-50 border border-blue-200">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">
              1. Technical Trend (30%)
            </span>
            <p className="text-xs text-slate-600 mt-1">
              Price vs SMA 20, Price vs SMA 50, and Golden Cross moving average crossover alignment.
            </p>
          </div>

          <div className="p-3.5 rounded bg-purple-50 border border-purple-200">
            <span className="text-xs font-bold text-purple-900 uppercase tracking-wider block">
              2. Momentum (20%)
            </span>
            <p className="text-xs text-slate-600 mt-1">
              14-period Wilder-smoothed RSI evaluating overbought (&gt;70) and oversold (&lt;30) zones.
            </p>
          </div>

          <div className="p-3.5 rounded bg-emerald-50 border border-emerald-200">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
              3. Fundamentals (30%)
            </span>
            <p className="text-xs text-slate-600 mt-1">
              P/E ratio, P/B multiple, operating margin profitability, ROE, and debt-to-equity solvency.
            </p>
          </div>

          <div className="p-3.5 rounded bg-amber-50 border border-amber-200">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
              4. Risk Profile (20%)
            </span>
            <p className="text-xs text-slate-600 mt-1">
              Annualized historical price volatility (σ × √252) and peak-to-trough maximum drawdown.
            </p>
          </div>
        </div>
      </div>

      {/* Thresholds Table */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-base font-bold text-slate-900">Classification Thresholds</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Score Range</th>
                <th className="py-2.5 px-4">Indicator Signal</th>
                <th className="py-2.5 px-4">Analytical Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              <tr>
                <td className="py-3 px-4 font-bold text-emerald-700">70 – 100</td>
                <td className="py-3 px-4">
                  <span className="badge-buy px-2 py-0.5 rounded text-[10px] font-bold">Buy Signal</span>
                </td>
                <td className="py-3 px-4 font-sans text-slate-700">
                  Constructive technical alignment, healthy financial margins, and controlled historical risk.
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-amber-700">50 – 69</td>
                <td className="py-3 px-4">
                  <span className="badge-hold px-2 py-0.5 rounded text-[10px] font-bold">Hold Signal</span>
                </td>
                <td className="py-3 px-4 font-sans text-slate-700">
                  Mixed indicators, fair valuation multiples, or consolidating technical trend.
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-red-700">0 – 49</td>
                <td className="py-3 px-4">
                  <span className="badge-sell px-2 py-0.5 rounded text-[10px] font-bold">Sell Signal</span>
                </td>
                <td className="py-3 px-4 font-sans text-slate-700">
                  Downtrend pressure, high volatility, negative operating margins, or elevated leverage.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
