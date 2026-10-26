import { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { WeightConfigModal } from './components/WeightConfigModal';
import { DashboardOverview } from './features/dashboard/DashboardOverview';
import { StockDetailView } from './features/stock-analysis/StockDetailView';
import { StockComparisonTable } from './features/comparison/StockComparisonTable';
import { MethodologyView } from './features/methodology/MethodologyView';
import type { CustomWeights, RankedStock, StockAnalysisError } from './types';
import { checkHealth, compareStocks } from './api/client';

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analysis' | 'comparison' | 'methodology'>('dashboard');
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);

  const [analyzedStocks, setAnalyzedStocks] = useState<RankedStock[]>([]);
  const [errors, setErrors] = useState<StockAnalysisError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1y');
  const [lastUpdated, setLastUpdated] = useState<string | undefined>();

  // Custom factor weights state
  const [isWeightsModalOpen, setIsWeightsModalOpen] = useState(false);
  const [customWeights, setCustomWeights] = useState<CustomWeights>({
    technical_trend: 0.3,
    momentum: 0.2,
    fundamentals: 0.3,
    risk: 0.2,
  });

  // Check backend health on mount
  useEffect(() => {
    checkHealth()
      .then(() => setIsBackendHealthy(true))
      .catch(() => setIsBackendHealthy(false));
  }, []);

  // Run analysis on startup with default tech leaders
  useEffect(() => {
    handleRunAnalysis(['AAPL', 'MSFT', 'NVDA', 'GOOGL'], '1y', customWeights);
  }, []);

  const handleRunAnalysis = async (
    symbols: string[],
    period: string = selectedPeriod,
    weights: CustomWeights = customWeights
  ) => {
    setIsLoading(true);
    try {
      const response = await compareStocks(symbols, period, weights);
      setAnalyzedStocks(response.rankings);
      setErrors(response.errors);
      setLastUpdated(response.timestamp);

      // If a selected stock was already chosen, keep it if present, otherwise set to top stock
      if (response.rankings.length > 0) {
        if (!selectedStockSymbol || !response.rankings.some((s) => s.symbol === selectedStockSymbol)) {
          setSelectedStockSymbol(response.rankings[0].symbol);
        }
      } else {
        setSelectedStockSymbol(null);
      }
    } catch (err: any) {
      setErrors([
        {
          symbol: 'API',
          error_code: 'REQUEST_FAILED',
          message: err.message || 'Failed to connect to backend service',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectStock = (symbol: string) => {
    setSelectedStockSymbol(symbol);
    setActiveTab('analysis');
  };

  const handleSaveWeights = (newWeights: CustomWeights) => {
    setCustomWeights(newWeights);
    const symbols = analyzedStocks.map((s) => s.symbol);
    if (symbols.length > 0) {
      handleRunAnalysis(symbols, selectedPeriod, newWeights);
    }
  };

  // CSV Export utility
  const handleExportCsv = () => {
    if (analyzedStocks.length === 0) return;

    const headers = [
      'Rank',
      'Symbol',
      'Company Name',
      'Currency',
      'Latest Price',
      'Composite Score',
      'Signal Label',
      'Technical Score',
      'Momentum Score',
      'Fundamentals Score',
      'Risk Score',
      'P/E Ratio',
      'P/B Ratio',
      'Operating Margin',
      'ROE',
      'Annualized Volatility',
      'Max Drawdown',
      'Timestamp',
    ];

    const rows = analyzedStocks.map((s) => [
      s.rank,
      `"${s.symbol}"`,
      `"${s.company_name || s.symbol}"`,
      s.currency || 'USD',
      s.latest_price ?? '',
      s.score,
      s.label,
      s.factor_scores.technical_trend ?? '',
      s.factor_scores.momentum ?? '',
      s.factor_scores.fundamentals ?? '',
      s.factor_scores.risk ?? '',
      s.metrics_summary.pe_ratio ?? '',
      s.metrics_summary.pb_ratio ?? '',
      s.metrics_summary.operating_margin ?? '',
      s.metrics_summary.roe ?? '',
      s.metrics_summary.annualized_volatility ?? '',
      s.metrics_summary.max_drawdown ?? '',
      s.timestamp,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `invest_iq_analysis_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedStock = analyzedStocks.find((s) => s.symbol === selectedStockSymbol) || analyzedStocks[0];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBackendHealthy={isBackendHealthy}
        onOpenWeightsModal={() => setIsWeightsModalOpen(true)}
        onExportCsv={handleExportCsv}
        hasDataToExport={analyzedStocks.length > 0}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Transparent Disclaimer Banner */}
        <DisclaimerBanner lastUpdated={lastUpdated} />

        {/* Tab Views */}
        {activeTab === 'dashboard' && (
          <DashboardOverview
            analyzedStocks={analyzedStocks}
            errors={errors}
            isLoading={isLoading}
            onAnalyze={(symbols, period) => handleRunAnalysis(symbols, period, customWeights)}
            onSelectStock={handleSelectStock}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
          />
        )}

        {activeTab === 'analysis' && selectedStock && (
          <StockDetailView
            stock={selectedStock}
            onBack={() => setActiveTab('dashboard')}
            period={selectedPeriod}
          />
        )}

        {activeTab === 'analysis' && !selectedStock && (
          <div className="bg-white rounded-xl p-10 text-center border border-slate-200 max-w-md mx-auto my-8 space-y-3">
            <h3 className="text-base font-bold text-slate-900">No Stock Selected</h3>
            <p className="text-xs text-slate-500">
              Run an analysis on the Overview tab and click a stock to view detailed technical charts and factor breakdowns.
            </p>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold"
            >
              Go to Overview
            </button>
          </div>
        )}

        {activeTab === 'comparison' && (
          <StockComparisonTable
            stocks={analyzedStocks}
            onSelectStock={handleSelectStock}
            onExportCsv={handleExportCsv}
          />
        )}

        {activeTab === 'methodology' && <MethodologyView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Invest IQ — Multi-Factor Investment Intelligence Platform
          </p>
          <p className="text-slate-400">
            Rule-Based Analytical Heuristics • Educational Decision Support Only
          </p>
        </div>
      </footer>

      {/* Weights Tuning Modal */}
      <WeightConfigModal
        isOpen={isWeightsModalOpen}
        onClose={() => setIsWeightsModalOpen(false)}
        currentWeights={customWeights}
        onSaveWeights={handleSaveWeights}
      />
    </div>
  );
}

export default App;
