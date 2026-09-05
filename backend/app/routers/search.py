"""
Semantic Search Router (BE-2 Phase 4).

Exposes GET /api/search for frontend semantic search.
"""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, HTTPException, Query, status

from app.models.schemas import SearchResult
from app.vectorstore.retriever import search_emails

router = APIRouter(prefix="/api/search", tags=["Search"])


@router.get(
    "",
    response_model=List[SearchResult],
    summary="Semantic Email Search",
    description="Search emails using semantic vector similarity against indexed content.",
)
def semantic_search(
    q: str = Query(..., min_length=1, description="Free-text search query"),
    k: int = Query(default=10, ge=1, le=50, description="Maximum number of results"),
) -> List[SearchResult]:
    """Execute semantic search and return scored SearchResult items."""
    cleaned = q.strip()
    if not cleaned:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Search query 'q' cannot be empty or whitespace only.",
        )
    return search_emails(query=cleaned, k=k)
