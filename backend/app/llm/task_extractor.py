"""
Task extractor — thin re-export for backwards compatibility and clarity.

The actual implementation lives in summarizer.py (the combined deep-analysis
module) to avoid making a separate expensive LLM call.  This module re-exports
the standalone extract_tasks() function and also exposes the pipeline helper.

Usage:
    from app.llm.task_extractor import extract_tasks, run_pipeline

    # Standalone (single call):
    tasks = extract_tasks(email)

    # Full two-tier pipeline (preferred for the /analyse endpoint):
    result = run_pipeline(email, style_examples)
"""

from __future__ import annotations

import logging
from typing import List, Optional

from app.llm.groq_client import GroqCompletionError
from app.llm.priority_scorer import score_priority
from app.llm.summarizer import deep_analyse, extract_tasks
from app.models.schemas import (
    EmailAnalysisResult,
    EmailInput,
    PriorityResult,
    StyleExample,
    TaskItem,
)

logger = logging.getLogger(__name__)

# Re-export for direct import convenience
__all__ = ["extract_tasks", "run_pipeline"]


# ---------------------------------------------------------------------------
# Two-tier pipeline — the primary public interface for the LLM layer
# ---------------------------------------------------------------------------

def run_pipeline(
    email: EmailInput,
    style_examples: Optional[List[StyleExample]] = None,
) -> EmailAnalysisResult:
    """Execute the full two-tier email analysis pipeline.

    Tier 1 (fast model):
        Classify priority.

    Tier 2 (smart model) — ONLY for medium / high:
        One combined call returns summary + tasks + draft.

    LOW priority emails return immediately after Tier 1 without any
    further LLM calls, minimising API usage for large inboxes.

    Args:
        email: The email to process.
        style_examples: Optional sent-email style examples from the RAG
                        teammate for style-aware drafting.

    Returns:
        EmailAnalysisResult with populated fields depending on priority.
    """
    # --- Tier 1: Priority classification (always runs, cheap model) ----------
    priority_result: PriorityResult = score_priority(email)
    logger.info(
        "Email '%s' classified as %s: %s",
        email.id or email.subject[:40],
        priority_result.priority,
        priority_result.reason,
    )

    # --- Early exit for LOW priority -----------------------------------------
    if priority_result.priority == "low":
        logger.info("Skipping Tier-2 analysis for low-priority email.")
        return EmailAnalysisResult(
            email_id=email.id,
            priority=priority_result,
            summary=None,
            tasks=[],
            draft=None,
        )

    # --- Tier 2: Deep analysis (smart model, ONE combined call) --------------
    try:
        deep = deep_analyse(email, style_examples=style_examples)
    except (GroqCompletionError, ValueError) as exc:
        logger.error("Deep analysis failed for email '%s': %s", email.id, exc)
        # Return partial result rather than crashing — priority is still valid
        return EmailAnalysisResult(
            email_id=email.id,
            priority=priority_result,
            summary=None,
            tasks=[],
            draft=None,
        )

    return EmailAnalysisResult(
        email_id=email.id,
        priority=priority_result,
        summary=deep.summary,
        tasks=deep.tasks,
        draft=deep.draft,
    )
