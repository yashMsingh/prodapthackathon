"""Application configuration loaded from environment variables."""

from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime-configurable settings for the backend."""

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ------------------------------------------------------------------
    # Vectorstore / RAG
    # ------------------------------------------------------------------
    chroma_persist_dir: str = Field(
        default="./data/chroma",
        description="Directory where ChromaDB stores persistent collections",
    )
    embedding_model_name: str = Field(
        default="all-MiniLM-L6-v2",
        description="SentenceTransformer embedding model name",
    )

    # ------------------------------------------------------------------
    # Groq / LLM
    # ------------------------------------------------------------------
    groq_api_key: str = Field(
        default="",
        description="Groq API key — set via environment, never committed",
    )
    groq_fast_model: str = Field(
        default="llama-3.1-8b-instant",
        description="Model used for fast tier-1 priority classification",
    )
    groq_smart_model: str = Field(
        default="llama-3.1-8b-instant",
        description="Model used for deeper tier-2 analysis",
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
    return Settings()
