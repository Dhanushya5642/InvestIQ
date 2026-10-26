"""Health check route."""

from datetime import datetime, timezone
from fastapi import APIRouter
from backend.app.config import settings
from backend.app.schemas.stocks import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Return API status and version information."""
    return HealthResponse(
        status="ok",
        service=settings.app_name,
        version=settings.version,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
