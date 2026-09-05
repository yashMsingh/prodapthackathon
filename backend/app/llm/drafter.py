"""
Drafter — thin re-export for backwards compatibility and clarity.

The actual draft generation logic lives in summarizer.py (the combined
deep-analysis module).  This module re-exports generate_draft() so that
teammates can import it from the expected location.

Usage:
    from app.llm.drafter import generate_draft

    draft_text = generate_draft(email, style_examples=examples)
"""

from app.llm.summarizer import generate_draft  # noqa: F401 — re-export

__all__ = ["generate_draft"]
