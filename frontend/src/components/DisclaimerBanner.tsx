import React from 'react';

interface DisclaimerBannerProps {
  lastUpdated?: string;
  source?: string;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  lastUpdated,
  source = 'yfinance',
}) => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs text-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
      <div>
        <span className="font-bold text-amber-900 uppercase tracking-wider text-[11px] mr-1">
          Research Notice:
        </span>
        <span className="text-slate-700">
          Invest IQ is an analytical decision-support tool, not personalized financial advice.
          Scores (0–100) and signals (Buy / Hold / Sell) are rule-based multi-factor heuristics and do not guarantee investment returns.
        </span>
      </div>

      <div className="flex items-center gap-3 text-[11px] text-slate-600 shrink-0 self-end md:self-auto font-mono bg-white px-2.5 py-1 rounded border border-amber-200/80">
        <span>Provider: <strong className="text-slate-900">{source}</strong></span>
        {lastUpdated && (
          <span>Updated: {new Date(lastUpdated).toLocaleTimeString()}</span>
        )}
      </div>
    </div>
  );
};
