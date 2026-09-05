"""
app/vectorstore/chroma_client.py

BE-2 (RAG) — Phase 2

Purpose
-------
Owns the ChromaDB persistent collection: indexing email records and
querying by vector similarity. embedder.py is the only other module this
file talks to — nothing outside BE-2's scope should import chromadb
directly, and this file never imports sentence-transformers directly
either (that stays inside embedder.py).

Schema note
-----------
The project's shared schema (app/models/schemas.py) defines `EmailInput`
with id/subject/sender/recipient/body/date/thread_id. This module treats
EmailInput as the record type for indexing, since it's the schema with the
fields needed to build searchable text (subject + body) and filterable
metadata (thread_id).

Assumptions (per the "no fallbacks" ground rule)
-------------------------------------------------
- `email.id` is a non-null, unique string by the time it reaches this
  module. Whatever calls index_email()/index_emails() (ingestion, or a
  test) is responsible for guaranteeing this — this module does not
  generate, validate, or substitute a fallback id.
- `email.subject` and `email.body` are non-None strings. Pydantic's
  required fields on EmailInput already enforce this before it reaches
  here, so no re-validation happens in this file.
"""

import os
from functools import lru_cache

import chromadb

from app.models.schemas import Email, EmailInput
from app.vectorstore import embedder

DEFAULT_PERSIST_DIR = "./data/chroma"
COLLECTION_NAME = "emails"


def _persist_dir() -> str:
    return os.environ.get("CHROMA_PERSIST_DIR", DEFAULT_PERSIST_DIR)


@lru_cache(maxsize=None)
def _get_client(persist_dir: str):
    """
    One PersistentClient per distinct persist_dir, cached for the life of
    the process. Keyed by persist_dir (rather than a bare no-arg singleton)
    so tests can point at a fresh temp directory without fighting a global
    client tied to the default path.
    """
    return chromadb.PersistentClient(path=persist_dir)


def reset_client() -> None:
    """Clear cached client instances (primarily for testing with different dirs)."""
    _get_client.cache_clear()


def get_client() -> chromadb.ClientAPI:
    """Returns the persistent client for the configured persist dir."""
    return _get_client(_persist_dir())


def get_collection():
    """Returns the emails collection, creating it if it doesn't exist yet."""
    client = _get_client(_persist_dir())
    return client.get_or_create_collection(name=COLLECTION_NAME)


def _build_index_text(email: EmailInput) -> str:
    """
    The text that actually gets embedded for an email. Subject is placed
    first since it's usually the highest-signal part of an email, and we
    want it to weigh meaningfully even when the body is long.
    """
    return f"{email.subject}\n\n{email.body}"


def _build_metadata(email: EmailInput) -> dict:
    """
    Metadata stored alongside each vector — lets retriever.py (Phase 3)
    filter results (e.g. same-thread exclusion) without a second lookup
    against the email cache. Chroma metadata values must be str/int/float/
    bool, so None fields are omitted rather than stored as literal None.
    """
    metadata = {}
    if getattr(email, "thread_id", None) is not None:
        metadata["thread_id"] = email.thread_id
    if getattr(email, "sender", None) is not None:
        metadata["sender"] = email.sender
    date_val = getattr(email, "date", None) or getattr(email, "timestamp", None)
    if date_val is not None:
        metadata["date"] = date_val
    if getattr(email, "subject", None) is not None:
        metadata["subject"] = email.subject
    metadata["id"] = email.id
    return metadata


def index_email(email: Email | EmailInput) -> None:
    """
    Index a single email. Upsert semantics: calling this again with the
    same email.id overwrites the existing entry rather than duplicating it.
    """
    index_emails([email])


def index_emails(emails: list[Email] | list[EmailInput]) -> None:
    """
    Bulk-index emails in one call. Uses embed_batch() rather than looping
    index_email() one at a time — this is the path ingestion should call
    for anything beyond a single email.
    """
    if not emails:
        return

    ids = [email.id for email in emails]
    texts = [_build_index_text(email) for email in emails]
    vectors = embedder.embed_batch(texts)
    metadatas = [_build_metadata(email) for email in emails]

    collection = get_collection()
    collection.upsert(
        ids=ids,
        embeddings=vectors,
        documents=texts,
        metadatas=metadatas,
    )


def query_similar(query_vector: list[float], k: int) -> list[dict]:
    """
    Query the collection for the k most similar vectors.

    Parameters
    ----------
    query_vector : list[float]
        Already-embedded query (retriever.py calls embedder.embed_text()
        first, then passes the result here — this function never embeds
        text itself).
    k : int
        Max number of results to return. If fewer than k items are
        indexed, returns however many exist rather than erroring.

    Returns
    -------
    list[dict]
        One dict per result: {"id": str, "distance": float, "metadata": dict}.
        Ordered by similarity, closest (lowest distance) first — this is
        Chroma's native return order, not something this function re-sorts.
    """
    collection = get_collection()
    raw = collection.query(
        query_embeddings=[query_vector],
        n_results=k,
        include=["distances", "metadatas"],
    )

    ids = raw["ids"][0]
    distances = raw["distances"][0]
    metadatas = raw["metadatas"][0]

    return [
        {"id": ids[i], "distance": distances[i], "metadata": metadatas[i]}
        for i in range(len(ids))
    ]


def collection_count() -> int:
    """Total number of indexed emails. Used by tests and idempotency checks."""
    return get_collection().count()