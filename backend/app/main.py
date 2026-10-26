"""Invest IQ - FastAPI Main Application Entrypoint."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.routes import health, stocks
from backend.app.config import settings
from backend.app.utils.errors import InvestIQException, invest_iq_exception_handler

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Explainable multi-factor financial intelligence and decision-support platform.",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
app.add_exception_handler(InvestIQException, invest_iq_exception_handler)

# Include API Routers
app.include_router(health.router, prefix="/api")
app.include_router(stocks.router, prefix="/api")


@app.get("/")
async def root():
    """Root redirect / discovery response."""
    return {
        "service": settings.app_name,
        "version": settings.version,
        "docs": "/docs",
        "health": "/api/health",
    }
