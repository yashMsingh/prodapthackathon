"""
Shared Groq client helper.

Centralises client initialisation, environment-variable loading,
and reusable completion logic so that each LLM module stays thin.

SECURITY NOTE:
  The API key is ONLY read from the environment variable GROQ_API_KEY.
  It is never hard-coded here or anywhere else in the codebase.
"""

from __future__ import annotations

import json
import logging
from typing import Any, Dict, List, Optional

from groq import Groq, APIConnectionError, APIStatusError, RateLimitError

from app.config import get_settings

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Exceptions
# ---------------------------------------------------------------------------

class GroqClientError(RuntimeError):
    """Raised when the Groq client cannot be initialised or encounters an
    unrecoverable error.  Safe message — no secrets leaked."""


class GroqCompletionError(RuntimeError):
    """Raised when a completion request fails after retries."""


# ---------------------------------------------------------------------------
# Client initialisation
# ---------------------------------------------------------------------------

def _get_client() -> Groq:
    """Return a configured Groq client.

    Raises GroqClientError if GROQ_API_KEY is missing.
    The key is never logged or surfaced in API responses.
    """
    settings = get_settings()
    if not settings.groq_api_key:
        raise GroqClientError(
            "GROQ_API_KEY environment variable is not set. "
            "Please configure it before starting the application."
        )
    return Groq(api_key=settings.groq_api_key)


# ---------------------------------------------------------------------------
# Completion helpers
# ---------------------------------------------------------------------------

def chat_completion(
    *,
    model: str,
    messages: List[Dict[str, str]],
    temperature: Optional[float] = None,
    response_format: Optional[Dict[str, str]] = None,
    max_retries: int = 2,
) -> str:
    """Execute a Groq chat completion and return the assistant message content.

    Args:
        model: The Groq model identifier to use.
        messages: OpenAI-style message list (role + content dicts).
        temperature: Override the global temperature if provided.
        response_format: e.g. {"type": "json_object"} for JSON mode.
        max_retries: Number of times to retry on transient errors.

    Returns:
        The raw assistant content string.

    Raises:
        GroqCompletionError: On non-retryable or exhausted-retry failure.
    """
    settings = get_settings()
    temp = temperature if temperature is not None else settings.llm_temperature
    client = _get_client()

    kwargs: Dict[str, Any] = {
        "model": model,
        "messages": messages,
        "temperature": temp,
    }
    if response_format:
        kwargs["response_format"] = response_format

    last_error: Optional[Exception] = None
    for attempt in range(1, max_retries + 2):  # +2 so attempt=1 is first try
        try:
            response = client.chat.completions.create(**kwargs)
            content = response.choices[0].message.content
            if content is None:
                raise GroqCompletionError("Groq returned an empty response.")
            return content
        except RateLimitError as exc:
            logger.warning("Groq rate limit hit (attempt %d/%d).", attempt, max_retries + 1)
            last_error = exc
        except APIConnectionError as exc:
            logger.warning("Groq connection error (attempt %d/%d): %s", attempt, max_retries + 1, exc)
            last_error = exc
        except APIStatusError as exc:
            # 4xx errors won't be fixed by retrying (except 429 handled above)
            logger.error("Groq API status error %s: %s", exc.status_code, exc.message)
            raise GroqCompletionError(
                f"Groq API returned an error (status {exc.status_code}). "
                "Check the service status and your configuration."
            ) from exc

    raise GroqCompletionError(
        f"Groq request failed after {max_retries + 1} attempts. "
        "The service may be temporarily unavailable."
    ) from last_error


def chat_completion_json(
    *,
    model: str,
    messages: List[Dict[str, str]],
    temperature: Optional[float] = None,
    max_retries: int = 2,
) -> Dict[str, Any]:
    """Like chat_completion but requests JSON Object mode and parses the result.

    Returns:
        Parsed JSON dict.

    Raises:
        GroqCompletionError: On API failure.
        ValueError: If the response is not valid JSON.
    """
    raw = chat_completion(
        model=model,
        messages=messages,
        temperature=temperature,
        response_format={"type": "json_object"},
        max_retries=max_retries,
    )
    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        logger.error("Groq returned non-JSON content: %s", raw[:200])
        raise ValueError(
            "The model did not return valid JSON. "
            f"Raw response (truncated): {raw[:200]}"
        ) from exc


# ---------------------------------------------------------------------------
# Model accessors (convenience wrappers)
# ---------------------------------------------------------------------------

def get_fast_model() -> str:
    """Return the configured fast model name (tier-1 priority classification)."""
    return get_settings().groq_fast_model


def get_smart_model() -> str:
    """Return the configured smart model name (tier-2 deep analysis)."""
    return get_settings().groq_smart_model
