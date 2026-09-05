"""
Tests for ingestion and email cache lookup.
"""

from app.models.schemas import Email
from app.storage import cache


def test_cache_storage_and_retrieval():
    email = Email(
        id="ingest_01",
        subject="Welcome to InboxAI",
        body="Getting started with AI inbox features.",
        sender="team@inboxai.com",
        thread_id="th_welcome",
    )
    cache.save_email(email)

    fetched = cache.get_email("ingest_01")
    assert fetched is not None
    assert fetched.subject == "Welcome to InboxAI"

    bulk = cache.get_emails_by_ids(["ingest_01", "non_existent"])
    assert len(bulk) == 1
    assert bulk[0].id == "ingest_01"
