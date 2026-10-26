# Invest IQ — Multi-Factor Investment Intelligence Platform

Invest IQ is a financial analytics and decision-support platform that unifies stock market price histories, technical indicators, company fundamentals, valuation metrics, and risk assessments into a transparent, explainable workflow.

> **Important Disclaimer**: Invest IQ is a decision-support and educational tool, **not** personalized financial advice or automated algorithmic trading. Scores, metrics, and labels are rule-based heuristics and do not guarantee returns.

---

## Key Features
- **Historical Market Analytics**: Daily OHLCV data retrieval with automated missing-value handling, deduplication, and sanity checking.
- **Technical Indicators**: SMA 20, SMA 50, 14-period Wilder-smoothed RSI, daily log/simple returns, annualized historical volatility ($\sigma \times \sqrt{252}$), and historical maximum drawdown.
- **Fundamental Ratios**: Preserves missing values (never replaced with artificial zeroes); analyzes P/E, P/B, EV/EBITDA, operating margins, ROE, and debt-to-equity.
- **Explainable Multi-Factor Scoring**: Transparent 0–100 weighted scoring across 4 distinct pillars (Technical Trend, Momentum, Fundamentals, Risk) with dynamic weight renormalization for missing factors.
- **Stock Comparison & Ranking**: Side-by-side comparative analytics with deterministic sorting.
- **Modern Interactive Dashboard**: Sleek, high-contrast dark theme financial interface built with React, TypeScript, Tailwind CSS, and Recharts.
- **Data Freshness & Export**: Source attribution, retrieval timestamps, data quality warnings, and one-click CSV export.

---

## Architecture Overview
- **Backend**: FastAPI, Pydantic, Pandas, NumPy, yfinance, pytest.
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons.

Detailed documentation:
- [Architecture Specification](docs/ARCHITECTURE.md)
- [Scoring Methodology](docs/SCORING_METHODOLOGY.md)
- [API Documentation](docs/API.md)
- [Testing Guide](docs/TESTING.md)
- [Project Status](PROJECT_STATUS.md)

---

## Getting Started

### 1. Prerequisites
- Python 3.10+ (tested on Python 3.12)
- Node.js 18+ & npm

### 2. Backend Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn backend.app.main:app --reload --port 8000
```
Backend API docs will be live at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will be available at `http://localhost:5173`.

### 4. Running Backend Tests
```bash
python -m pytest backend/tests -v
```
