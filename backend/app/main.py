"""
ProdApt Email Intelligence API — FastAPI application entry point.

Registers all routers.  Additional routers (emails, search, etc.) can be
registered here by other teammates when their branches are merged.
"""

from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import draft as draft_router
from app.routers import tasks as tasks_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description=(
        "AI-powered email intelligence layer: priority classification, "
        "summarisation, task extraction, and draft generation using Groq LLMs."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS — allow all origins in development; tighten for production
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(tasks_router.router, prefix="/api/v1")
app.include_router(draft_router.router, prefix="/api/v1")


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health", tags=["health"])
def health_check() -> dict:
    """Simple liveness check."""
    return {"status": "ok", "service": settings.app_name}
