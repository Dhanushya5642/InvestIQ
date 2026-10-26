import React from 'react';

interface NavbarProps {
  activeTab: 'dashboard' | 'analysis' | 'comparison' | 'methodology';
  setActiveTab: (tab: 'dashboard' | 'analysis' | 'comparison' | 'methodology') => void;
  isBackendHealthy: boolean | null;
  onOpenWeightsModal: () => void;
  onExportCsv?: () => void;
  hasDataToExport?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isBackendHealthy,
  onOpenWeightsModal,
  onExportCsv,
  hasDataToExport,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Invest IQ
              </span>
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
                v0.1.0 MVP
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Multi-Factor Investment Intelligence Platform
            </p>
          </div>

          {/* Status on mobile */}
          <div className="md:hidden">
            <span
              className={`text-xs font-mono font-medium px-2 py-0.5 rounded border ${
                isBackendHealthy === true
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : isBackendHealthy === false
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {isBackendHealthy === true ? 'API Connected' : isBackendHealthy === false ? 'API Offline' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Navigation Tabs - Clean Text without any icons */}
        <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start md:self-auto overflow-x-auto max-w-full">
          <button
            id="tab-dashboard-btn"
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Overview
          </button>

          <button
            id="tab-analysis-btn"
            onClick={() => setActiveTab('analysis')}
            className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'analysis'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Stock Analysis
          </button>

          <button
            id="tab-comparison-btn"
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'comparison'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Comparison & Rankings
          </button>

          <button
            id="tab-methodology-btn"
            onClick={() => setActiveTab('methodology')}
            className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'methodology'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Methodology
          </button>
        </nav>

        {/* Right Actions - Text-only */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Weights Config Button */}
          <button
            id="open-weights-btn"
            onClick={onOpenWeightsModal}
            className="px-3 py-1.5 rounded text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors shadow-sm"
          >
            Factor Weights
          </button>

          {/* Export CSV Button */}
          {hasDataToExport && onExportCsv && (
            <button
              id="export-csv-nav-btn"
              onClick={onExportCsv}
              className="px-3 py-1.5 rounded text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-sm"
            >
              Export CSV
            </button>
          )}

          {/* Backend Status indicator for desktop */}
          <div className="hidden md:block">
            <span
              className={`text-xs font-mono font-medium px-2 py-1 rounded border ${
                isBackendHealthy === true
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : isBackendHealthy === false
                  ? 'bg-red-50 text-red-800 border-red-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {isBackendHealthy === true ? 'API Connected' : isBackendHealthy === false ? 'API Offline' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
