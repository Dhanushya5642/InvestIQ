import React, { useState } from 'react';
import type { CustomWeights } from '../types';

interface WeightConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeights: CustomWeights;
  onSaveWeights: (newWeights: CustomWeights) => void;
}

export const WeightConfigModal: React.FC<WeightConfigModalProps> = ({
  isOpen,
  onClose,
  currentWeights,
  onSaveWeights,
}) => {
  const [weights, setWeights] = useState<CustomWeights>({ ...currentWeights });

  if (!isOpen) return null;

  const totalRaw =
    weights.technical_trend +
    weights.momentum +
    weights.fundamentals +
    weights.risk;

  const normalized = {
    tech: totalRaw > 0 ? (weights.technical_trend / totalRaw) * 100 : 0,
    mom: totalRaw > 0 ? (weights.momentum / totalRaw) * 100 : 0,
    fund: totalRaw > 0 ? (weights.fundamentals / totalRaw) * 100 : 0,
    risk: totalRaw > 0 ? (weights.risk / totalRaw) * 100 : 0,
  };

  const handleReset = () => {
    setWeights({
      technical_trend: 0.3,
      momentum: 0.2,
      fundamentals: 0.3,
      risk: 0.2,
    });
  };

  const handleSave = () => {
    onSaveWeights(weights);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-300 rounded-xl w-full max-w-lg p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">Configure Factor Weights</h3>
            <p className="text-xs text-slate-500">Adjust the relative weighting for each factor pillar</p>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            Close
          </button>
        </div>

        {/* Weights Sliders */}
        <div className="py-4 space-y-4">
          {/* Technical Trend */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1 text-slate-800">
              <span>Technical Trend (SMA 20/50 Alignment)</span>
              <span className="font-mono text-slate-600">
                {(weights.technical_trend * 100).toFixed(0)}% (Effective: {normalized.tech.toFixed(1)}%)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.technical_trend}
              onChange={(e) =>
                setWeights({ ...weights, technical_trend: parseFloat(e.target.value) })
              }
              className="w-full accent-blue-600 bg-slate-200 rounded h-1.5 cursor-pointer"
            />
          </div>

          {/* Momentum */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1 text-slate-800">
              <span>Momentum (14-Period RSI)</span>
              <span className="font-mono text-slate-600">
                {(weights.momentum * 100).toFixed(0)}% (Effective: {normalized.mom.toFixed(1)}%)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.momentum}
              onChange={(e) =>
                setWeights({ ...weights, momentum: parseFloat(e.target.value) })
              }
              className="w-full accent-purple-600 bg-slate-200 rounded h-1.5 cursor-pointer"
            />
          </div>

          {/* Fundamentals */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1 text-slate-800">
              <span>Fundamentals & Valuation (P/E, Margins, ROE)</span>
              <span className="font-mono text-slate-600">
                {(weights.fundamentals * 100).toFixed(0)}% (Effective: {normalized.fund.toFixed(1)}%)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.fundamentals}
              onChange={(e) =>
                setWeights({ ...weights, fundamentals: parseFloat(e.target.value) })
              }
              className="w-full accent-emerald-600 bg-slate-200 rounded h-1.5 cursor-pointer"
            />
          </div>

          {/* Risk */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1 text-slate-800">
              <span>Risk & Volatility (Annualized Vol, Max DD)</span>
              <span className="font-mono text-slate-600">
                {(weights.risk * 100).toFixed(0)}% (Effective: {normalized.risk.toFixed(1)}%)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.risk}
              onChange={(e) =>
                setWeights({ ...weights, risk: parseFloat(e.target.value) })
              }
              className="w-full accent-amber-600 bg-slate-200 rounded h-1.5 cursor-pointer"
            />
          </div>
        </div>

        {/* Note */}
        <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs text-slate-600">
          <p className="font-medium text-slate-800 mb-0.5">Note on Dynamic Renormalization:</p>
          <p>
            When a metric is missing from the provider, its factor weight is automatically redistributed across available factors so that total weight always sums to 100%.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded hover:bg-slate-50"
          >
            Reset Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded shadow-sm"
            >
              Apply & Recompute
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
