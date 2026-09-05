"""
Tasks router — /tasks

Thin router that accepts an email, calls the task extractor, and returns
the extracted tasks list in a validated response.

Business logic lives in app/llm/ — this router is intentionally thin.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, status

from app.llm.groq_client import GroqClientError, GroqCompletionError
from app.llm.summarizer import extract_tasks
from app.models.schemas import TaskExtractionRequest, TaskExtractionResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post(
    "/extract",
    response_model=TaskExtractionResponse,
    summary="Extract actionable tasks from an email",
    description=(
        "Analyses the provided email and returns a list of actionable tasks. "
        "Each task includes a description, optional deadline, and optional assignee. "
        "Returns an empty list if no tasks are found."
    ),
    status_code=status.HTTP_200_OK,
)
def extract_tasks_endpoint(request: TaskExtractionRequest) -> TaskExtractionResponse:
    """Extract tasks from the email in *request*.

    Returns an empty task list rather than raising if the model finds no tasks.
    Raises HTTP 503 on Groq client/API errors.
    """
    try:
        tasks = extract_tasks(request.email)
    except GroqClientError as exc:
        logger.error("Groq client not configured: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="LLM service is not configured. Please contact the administrator.",
        ) from exc
    except GroqCompletionError as exc:
        logger.error("Groq completion error in /tasks/extract: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="LLM service is temporarily unavailable. Please try again later.",
        ) from exc
    except ValueError as exc:
        logger.warning("Task extraction parse error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The LLM returned an unexpected response. Please try again.",
        ) from exc

    return TaskExtractionResponse(
        email_id=request.email.id,
        tasks=tasks,
    )
