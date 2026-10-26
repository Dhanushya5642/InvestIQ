"""Invest IQ Configuration Settings."""

import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with environment variable support."""

    app_name: str = "Invest IQ API"
    version: str = "0.1.0"
    debug: bool = True
    host: str = "127.0.0.1"
    port: int = 8000
    cors_origins: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Data Provider & Cache Settings
    provider_name: str = "yfinance"
    cache_ttl_seconds: int = 300  # 5 minutes
    request_timeout_seconds: int = 15

    # Scoring Defaults (Illustrative Rule-Based Weights)
    default_weight_technical: float = 0.30
    default_weight_momentum: float = 0.20
    default_weight_fundamentals: float = 0.30
    default_weight_risk: float = 0.20

    model_config = SettingsConfigDict(
        env_prefix="INVEST_IQ_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
