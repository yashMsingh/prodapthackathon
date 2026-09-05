"""
Email cache and lookup store (BE-3 contract).
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Dict, List, Optional

from app.models.schemas import Email

# In-memory storage for fast lookup
_EMAIL_CACHE: Dict[str, Email] = {}
_CACHE_FILE = Path("./data/emails_cache.json")


def _load_from_disk_if_exists() -> None:
    if _CACHE_FILE.exists():
        try:
            with open(_CACHE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    for item in data:
                        email = Email(**item)
                        _EMAIL_CACHE[email.id] = email
                elif isinstance(data, dict):
                    for email_id, item in data.items():
                        email = Email(**item)
                        _EMAIL_CACHE[email_id] = email
        except Exception:
            pass


_load_from_disk_if_exists()


def save_email(email: Email) -> None:
    """Save or update an email in the cache."""
    _EMAIL_CACHE[email.id] = email


def save_emails(emails: List[Email]) -> None:
    """Save multiple emails in the cache."""
    for email in emails:
        _EMAIL_CACHE[email.id] = email


def get_email(email_id: str) -> Optional[Email]:
    """Retrieve an email by its unique ID."""
    return _EMAIL_CACHE.get(email_id)


def get_emails_by_ids(ids: List[str]) -> List[Email]:
    """Bulk email lookup by IDs (BE-2 consumed contract).

    Preserves the exact order of the requested IDs.
    Omits IDs that are not present in the cache.
    """
    resolved: List[Email] = []
    for email_id in ids:
        if email_id in _EMAIL_CACHE:
            resolved.append(_EMAIL_CACHE[email_id])
    return resolved


def clear_cache() -> None:
    """Clear in-memory cache (primarily for tests)."""
    _EMAIL_CACHE.clear()
