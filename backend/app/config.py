"""
Application configuration loaded from environment variables.

Uses pydantic-settings so that values can be overridden via .env files
or the process environment without any code changes.
"""

from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """All runtime-configurable settings for the backend."""

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ------------------------------------------------------------------
    # Groq
    # ------------------------------------------------------------------
    groq_api_key: str = Field(
        default="",
        description="Groq API key — MUST be set in environment, never committed",
    )
    groq_fast_model: str = Field(
        default="llama-3.1-8b-instant",
        description="Model used for fast/cheap tier-1 priority classification",
    )
    groq_smart_model: str = Field(
        default="llama-3.1-8b-instant",
        description="Model used for deeper tier-2 analysis (summary, tasks, draft)",
    )
    llm_temperature: float = Field(
        default=0.2,
        ge=0.0,
        le=2.0,
        description="Sampling temperature for LLM completions",
    )

    # ------------------------------------------------------------------
    # General
    # ------------------------------------------------------------------
    app_name: str = "ProdApt Email Intelligence API"
    debug: bool = False


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached Settings instance.  Call this everywhere instead of
    instantiating Settings() directly so that env is parsed only once."""
    return Settings()
