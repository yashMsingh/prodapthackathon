"""
Retriever Service (BE-2 Phase 3).

Provides the unified retrieval capability for:
- BE-1 LLM Drafter (`retrieve_similar_emails`)
- FE-2 Semantic Search Router (`search_emails`)
"""

from __future__ import annotations

import logging
from typing import List

from app.models.schemas import Email, SearchResult
from app.storage.cache import get_emails_by_ids
from app.vectorstore import chroma_client, embedder

logger = logging.getLogger(__name__)


def retrieve_similar_emails(
    email: Email,
    k: int = 5,
    exclude_same_thread: bool = True,
) -> List[Email]:
    """Retrieve similar emails for RAG context in reply drafting (BE-1 contract).

    Args:
        email: The source Email object to find similar examples for.
        k: Maximum number of similar emails to return (default: 5).
        exclude_same_thread: If True, filters out emails sharing the same thread_id (default: True).

    Returns:
        List of resolved Email objects ordered by similarity (closest first).
    """
    if k <= 0:
        return []

    # 1. Build query text
    query_text = f"{email.subject} {email.body}".strip()
    if not query_text:
        return []

    # 2. Embed text
    vector = embedder.embed_text(query_text)

    # 3. Query chroma with a buffer to survive filtering
    fetch_k = max(k + 10, k * 2)
    raw_results = chroma_client.query_similar(vector, k=fetch_k)

    # 4. Filter out self and optionally same thread
    surviving_ids: List[str] = []
    for item in raw_results:
        doc_id = item["id"]
        meta = item.get("metadata", {})

        # Self-exclusion: an email is never similar to itself
        if doc_id == email.id:
            continue

        # Thread exclusion
        if exclude_same_thread and meta.get("thread_id") == email.thread_id:
            continue

        surviving_ids.append(doc_id)
        if len(surviving_ids) == k:
            break

    # 5. Resolve ids to full Email objects via BE-3 storage cache
    emails_by_id = {e.id: e for e in get_emails_by_ids(surviving_ids)}

    # 6. Preserve exact similarity order
    return [emails_by_id[eid] for eid in surviving_ids if eid in emails_by_id]


def search_emails(query: str, k: int = 10) -> List[SearchResult]:
    """Semantic free-text email search (FE-2 & search router contract).

    Args:
        query: Free-text search string.
        k: Maximum number of search results to return (default: 10).

    Returns:
        List of SearchResult objects ordered by relevance score descending.
    """
    cleaned_query = query.strip()
    if not cleaned_query or k <= 0:
        return []

    # 1. Embed query
    vector = embedder.embed_text(cleaned_query)

    # 2. Query chroma
    raw_results = chroma_client.query_similar(vector, k=k)
    if not raw_results:
        return []

    # 3. Resolve IDs via BE-3 cache
    ids = [r["id"] for r in raw_results]
    resolved_emails = {e.id: e for e in get_emails_by_ids(ids)}

    # 4. Wrap with normalized relevance score
    results: List[SearchResult] = []
    for r in raw_results:
        doc_id = r["id"]
        if doc_id not in resolved_emails:
            continue

        # Distance to similarity score (0.0 to 1.0)
        dist = r.get("distance", 1.0)
        # Chroma L2 squared distance conversion: 1 / (1 + dist)
        score = 1.0 / (1.0 + max(0.0, dist))

        results.append(
            SearchResult(
                email=resolved_emails[doc_id],
                score=round(score, 4),
            )
        )

    # Sort descending by score
    results.sort(key=lambda s: s.score, reverse=True)
    return results[:k]
