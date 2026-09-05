"""
Draft router — /draft

Thin router that accepts an email plus optional style examples (from the
RAG teammate) and returns a suggested reply draft.

Business logic lives in app/llm/ — this router is intentionally thin.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, status

from app.llm.drafter import generate_draft
from app.llm.groq_client import GroqClientError, GroqCompletionError
from app.models.schemas import DraftRequest, DraftResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/draft", tags=["draft"])


@router.post(
    "/generate",
    response_model=DraftResponse,
    summary="Generate a suggested reply draft for an email",
    description=(
        "Generates a professional, concise reply to the provided email. "
        "If optional style_examples are supplied (from the RAG teammate), "
        "the draft will mimic the user's writing style. "
        "Returns an empty string for newsletters, promotions, or automated messages."
    ),
    status_code=status.HTTP_200_OK,
)
def generate_draft_endpoint(request: DraftRequest) -> DraftResponse:
    """Generate a reply draft for the email in *request*.

    Style examples are consumed but retrieval is NOT performed here;
    that is the RAG teammate's responsibility.

    Returns an empty draft string if no reply is warranted.
    Raises HTTP 503 on Groq client/API errors.
    """
    try:
        draft_text = generate_draft(
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
        logger.error("Groq completion error in /draft/generate: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="LLM service is temporarily unavailable. Please try again later.",
        ) from exc
    except ValueError as exc:
        logger.warning("Draft generation parse error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The LLM returned an unexpected response. Please try again.",
        ) from exc

    return DraftResponse(
        email_id=request.email.id,
        draft=draft_text,
    )
