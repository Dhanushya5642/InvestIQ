"""Error definitions and exception handlers for Invest IQ."""

from typing import Any, Dict, Optional
from fastapi import Request, status
from fastapi.responses import JSONResponse


class InvestIQException(Exception):
    """Base exception for Invest IQ domain errors."""

    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}


class SymbolNotFoundError(InvestIQException):
    """Raised when a ticker symbol cannot be resolved or has no data."""

    def __init__(self, symbol: str, message: Optional[str] = None):
        super().__init__(
            code="SYMBOL_NOT_FOUND",
            message=message or f"Symbol '{symbol}' was not found or has no available market data.",
            status_code=status.HTTP_404_NOT_FOUND,
            details={"symbol": symbol},
        )


class ProviderError(InvestIQException):
    """Raised when the upstream market data provider encounters an error or timeout."""

    def __init__(self, message: str, symbol: Optional[str] = None):
        super().__init__(
            code="DATA_UNAVAILABLE",
            message=message,
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            details={"symbol": symbol} if symbol else {},
        )


class DataQualityError(InvestIQException):
    """Raised when data preprocessing detects corrupted or insufficient history."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            code="DATA_QUALITY_ERROR",
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details,
        )


async def invest_iq_exception_handler(request: Request, exc: InvestIQException) -> JSONResponse:
    """Format domain exceptions to consistent API error envelope."""
    payload = {
        "detail": {
            "code": exc.code,
            "message": exc.message,
            **exc.details,
        }
    }
    return JSONResponse(status_code=exc.status_code, content=payload)
