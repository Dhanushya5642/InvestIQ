# Invest IQ — Antigravity Project Master Brief

**Purpose:** This document is the source of truth for rebuilding Invest IQ from scratch in Antigravity. Read it fully before coding. Build in small phases, run tests, and keep the project status accurate.

## 1. Project Identity
- **Project name:** Invest IQ
- **Full title:** Invest IQ — Multi-Factor Investment Intelligence Platform
- **Purpose:** A financial analytics platform that combines stock market data, technical indicators, company fundamentals, valuation metrics, risk measures, and optional news sentiment in one explainable workflow.
- **Audience:** Students, researchers, and investors who want to compare stocks using visible evidence and a transparent methodology.
- **Important:** This is decision-support software, not personalized financial advice. Do not promise returns or describe experimental scores as guaranteed predictions.

## 2. Problem Statement
Investors often switch between different tools to inspect historical prices, technical indicators, financial ratios, valuation, news, and portfolio risk. Invest IQ aims to unify these workflows, make comparisons easier, and explain why a stock receives a particular score.
Do not claim existing financial platforms lack these features. The project's differentiator is its integrated, configurable, explainable workflow.

## 3. Main Objectives
1. Retrieve historical stock prices and available company information.
2. Validate, clean, and preprocess financial data.
3. Calculate technical, fundamental, valuation, and risk features.
4. Incorporate sentiment only when a suitable data source is configured.
5. Calculate a transparent multi-factor score on a 0–100 scale.
6. Rank and compare multiple stocks.
7. Explain factor scores and missing information in plain language.
8. Visualize historical prices, indicators, company metrics, and portfolio risk.
9. Export analysis results.
10. Evaluate the scoring system and document limitations.

## 4. Scope and Priorities
### Phase 1 — MVP
- Stock-symbol input and validation.
- Historical market data retrieval.
- Data cleaning and missing-value handling.
- Company metadata and available financial ratios.
- Technical indicators: SMA, RSI, returns, and volatility.
- Fundamentals and valuation metrics where available.
- Transparent weighted multi-factor score.
- Stock ranking and side-by-side comparison.
- Dashboard charts, metric cards, factor breakdown, and data warnings.
- CSV export.
- API documentation and automated tests.
- Data-source timestamp and a clear disclaimer.

### Phase 2 — Advanced analysis
- Additional valuation metrics such as P/B, EV/EBITDA, and dividend yield where available.
- More complete financial statement analysis.
- Configurable factor weights with validation and normalization.
- Portfolio holdings, allocations, historical performance, drawdown, and volatility.
- Benchmark comparison where data supports it.
- More detailed factor-contribution explanations.
- Caching, retries, rate-limit handling, and logging.

### Phase 3 — Optional
- News sentiment from a documented, suitable source.
- A trained ML model only if an appropriate dataset, target, leakage controls, baseline, and evaluation plan exist.
- SHAP only when a compatible trained model exists and the explanation is meaningful.
- User accounts, saved watchlists/portfolios, alerts, reports, and deployment hardening.

Track every feature as **Planned**, **In Progress**, **Implemented**, or **Tested**. Do not mark planned work as completed.

## 5. Non-Negotiable Modeling Rules
- A transparent weighted score is a **rule-based scoring system**, not machine learning.
- Do not claim sentiment analysis, portfolio optimization, SHAP, real-time data, or predictive accuracy until actually implemented and verified.
- Data providers may omit, delay, or change data. Handle failures gracefully.
- Never replace missing financial metrics with zero. Preserve null/missing values.
- Do not treat low P/E as automatically good; earnings, growth, debt, sector, and data quality matter.
- Avoid future-data leakage in historical signals and model evaluation.
- Scores and Buy/Hold/Sell labels are experimental indicators, not personalized financial advice.
- Display methodology, weights, thresholds, missing factors, source, and last-updated time.
- Do not promise or imply guaranteed investment returns.

## 6. Recommended Technology Stack
### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts for charts
- Lucide React for modern financial icons

### Backend
- Python 3.12+
- FastAPI
- Pydantic v2
- Pandas and NumPy
- yfinance as an initial market-data adapter
- pytest for testing

## 7. Initial API Design
- `GET /api/health`
- `GET /api/stocks/{symbol}/history?period=1y`
- `GET /api/stocks/{symbol}/metrics`
- `POST /api/stocks/analyze`
- `POST /api/stocks/compare`
- `POST /api/portfolio/analyze` (Phase 2)
