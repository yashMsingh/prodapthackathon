"""
Analyse router — /analyse

The PRIMARY integration point for the RAG/backend teammate.

Accepts the RAG layer's output JSON (email + optional style examples)
and runs the full two-tier LLM pipeline, returning priority, summary,
tasks, and draft in a single response.

Input contract (matches RAG teammate's output format):
    {
        "email": {
            "id": "...",
            "sender": "...",
            "subject": "...",
            "body": "..."
        },
        "style_examples": [
            { "subject": "...", "body": "..." },
            ...
        ]
    }

Output:
    {
        "email_id": "...",
        "priority": { "priority": "high|medium|low", "reason": "..." },
        "summary": "...",       # null for low-priority
        "tasks": [...],         # empty for low-priority
        "draft": "..."          # null for low-priority
    }

Business/LLM logic lives in app/llm/ — this router is intentionally thin.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, status

from app.llm.groq_client import GroqClientError, GroqCompletionError
from app.llm.task_extractor import run_pipeline
from app.models.schemas import AnalyseRequest, AnalyseResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analyse", tags=["analyse"])


@router.post(
    "",
    response_model=AnalyseResponse,
    summary="Full two-tier email analysis (primary RAG integration endpoint)",
    description=(
        "Accepts the RAG teammate's output JSON (email + optional style examples) "
        "and runs the complete two-tier LLM pipeline.\n\n"
        "**Tier 1** (fast model): Priority classification on every email.\n\n"
        "**Tier 2** (smart model, ONE combined call): Summary + tasks + draft — "
        "only for medium/high priority emails.\n\n"
        "**LOW priority emails** return immediately after Tier 1 with "
        "summary=null, tasks=[], draft=null.\n\n"
        "Style examples are consumed for tone/greeting/sign-off inference only. "
        "Facts, names, and dates from examples are never carried into the draft."
    ),
    status_code=status.HTTP_200_OK,
)
def analyse_email(request: AnalyseRequest) -> AnalyseResponse:
    """Run the full two-tier pipeline on the email provided by the RAG layer.

    The RAG teammate calls this endpoint with their retrieved context.
    No retrieval is performed here.

    Args:
        request: AnalyseRequest containing email + optional style_examples.

    Returns:
        AnalyseResponse with priority, summary, tasks, and draft.

    Raises:
        HTTP 503: Groq API unavailable or not configured.
        HTTP 422: Invalid input (handled by FastAPI/Pydantic automatically).
    """
    try:
        result = run_pipeline(
            request.email,
            style_examples=request.style_examples or None,
        )
    except GroqClientError as exc:
        logger.error("Groq client not configured: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="LLM service is not configured. Please contact the administrator.",
        ) from exc
    except GroqCompletionError as exc:
        logger.error("Groq completion error in /analyse: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="LLM service is temporarily unavailable. Please try again later.",
        ) from exc

    return AnalyseResponse(
        email_id=result.email_id,
        priority=result.priority,
        summary=result.summary,
        tasks=result.tasks,
        draft=result.draft,
    )
