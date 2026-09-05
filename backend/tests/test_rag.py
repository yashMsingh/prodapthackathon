"""
BE-2 (RAG) Vectorstore, Retrieval, and Search Test Suite.

Verifies Phase 1 (Embedder), Phase 2 (Chroma Client), Phase 3 (Retriever),
and Phase 4 (Search Router) per the Build, Verification & Testing Plan.
"""

from __future__ import annotations

import os
import shutil
import tempfile
import pytest
from fastapi.testclient import TestClient

from app.config import get_settings
from app.main import app
from app.models.schemas import Email, SearchResult
from app.storage import cache
from app.vectorstore import chroma_client, embedder, retriever


@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """Use a temporary directory for Chroma during test runs."""
    test_dir = tempfile.mkdtemp(prefix="chroma_test_")
    os.environ["CHROMA_PERSIST_DIR"] = test_dir
    get_settings.cache_clear()
    chroma_client.reset_client()
    embedder._get_model.cache_clear()

    yield test_dir

    # Cleanup test dir
    shutil.rmtree(test_dir, ignore_errors=True)


@pytest.fixture(autouse=True)
def clean_collection():
    """Ensure clean collection and cache before each test."""
    cache.clear_cache()
    chroma_client.reset_client()
    client = chroma_client.get_client()
    try:
        client.delete_collection(chroma_client.COLLECTION_NAME)
    except Exception:
        pass
    yield


# ===========================================================================
# Phase 1: Embedder Tests
# ===========================================================================

class TestPhase1Embedder:
    def test_embedding_dimension_consistent(self):
        """Every output vector has the same length regardless of input text length."""
        v_short = embedder.embed_text("Hi")
        v_long = embedder.embed_text(
            "This is a substantially longer email body discussing quarterly project deliverables and timelines."
        )
        assert len(v_short) > 0
        assert len(v_short) == len(v_long)

    def test_embedder_is_singleton(self):
        """Model is not reloaded per call — same singleton instance returned."""
        inst1 = embedder._get_model()
        inst2 = embedder._get_model()
        assert inst1 is inst2

    def test_batch_matches_individual(self):
        """embed_batch([a, b])[0] is equivalent to embed_text(a)."""
        text_a = "Quarterly business review meeting"
        text_b = "Budget approval request for engineering"

        batch = embedder.embed_batch([text_a, text_b])
        single_a = embedder.embed_text(text_a)

        assert len(batch) == 2
        # Check high cosine/dot similarity between batch[0] and single_a
        assert len(batch[0]) == len(single_a)
        diff = sum(abs(x - y) for x, y in zip(batch[0], single_a))
        assert diff < 1e-3


# ===========================================================================
# Phase 2: Chroma Client Tests
# ===========================================================================

class TestPhase2ChromaClient:
    def test_index_and_query_roundtrip(self):
        """Index -> embed -> query returns the right email."""
        email1 = Email(
            id="em_001",
            subject="Urgent Security Alert",
            body="Password change requested for your account.",
            sender="security@company.com",
            thread_id="th_100",
            timestamp="2026-09-05T10:00:00Z",
        )
        email2 = Email(
            id="em_002",
            subject="Lunch in cafeteria",
            body="Join us for pizza at 12:30 PM.",
            sender="alex@company.com",
            thread_id="th_101",
            timestamp="2026-09-05T10:05:00Z",
        )
        chroma_client.index_emails([email1, email2])

        query_vec = embedder.embed_text("security password credentials")
        results = chroma_client.query_similar(query_vec, k=2)

        assert len(results) == 2
        assert results[0]["id"] == "em_001"
        assert "distance" in results[0]
        assert results[0]["metadata"]["thread_id"] == "th_100"

    def test_upsert_is_idempotent(self):
        """Re-running ingestion doesn't duplicate data (collection.count() stays constant)."""
        email = Email(
            id="em_dup",
            subject="Weekly Sync",
            body="Meeting notes from sync.",
            sender="lead@company.com",
            thread_id="th_sync",
        )
        chroma_client.index_email(email)
        col = chroma_client.get_collection()
        assert col.count() == 1

        # Re-index same email with updated body
        email_updated = Email(
            id="em_dup",
            subject="Weekly Sync",
            body="Meeting notes from sync - updated with action items.",
            sender="lead@company.com",
            thread_id="th_sync",
        )
        chroma_client.index_email(email_updated)
        assert col.count() == 1

    def test_query_respects_k(self):
        """Result count never exceeds requested k."""
        emails = [
            Email(
                id=f"em_{i}",
                subject=f"Notice #{i}",
                body=f"Body content {i}",
                sender=f"user{i}@test.com",
                thread_id=f"th_{i}",
            )
            for i in range(5)
        ]
        chroma_client.index_emails(emails)

        q_vec = embedder.embed_text("notice")
        results_1 = chroma_client.query_similar(q_vec, k=1)
        results_3 = chroma_client.query_similar(q_vec, k=3)

        assert len(results_1) == 1
        assert len(results_3) == 3

    def test_metadata_roundtrips(self):
        """thread_id and other metadata survive the index->query cycle intact."""
        email = Email(
            id="meta_test",
            subject="Design Review",
            body="Figma review link attached.",
            sender="design@test.com",
            thread_id="thread_design_42",
            timestamp="2026-09-05T09:00:00Z",
        )
        chroma_client.index_email(email)

        results = chroma_client.query_similar(embedder.embed_text("figma review"), k=1)
        assert len(results) == 1
        meta = results[0]["metadata"]
        assert meta["id"] == "meta_test"
        assert meta["thread_id"] == "thread_design_42"
        assert meta["sender"] == "design@test.com"
        assert meta["subject"] == "Design Review"


# ===========================================================================
# Phase 3: Retriever Tests (Shared Contract)
# ===========================================================================

class TestPhase3Retriever:
    @pytest.fixture
    def populated_emails(self):
        """Populate cache and index with a realistic email dataset."""
        emails = [
            Email(
                id="em_inv1",
                subject="Invoice #101 Payment Due",
                body="Please remit payment for invoice #101 by Friday.",
                sender="billing@vendor.com",
                thread_id="th_billing_1",
            ),
            Email(
                id="em_inv2",
                subject="Invoice #102 Reminder",
                body="Gentle reminder regarding pending invoice #102.",
                sender="billing@vendor.com",
                thread_id="th_billing_2",
            ),
            Email(
                id="em_inv_thread1_followup",
                subject="Re: Invoice #101 Payment Due",
                body="Following up on invoice #101 payment confirmation.",
                sender="finance@vendor.com",
                thread_id="th_billing_1",  # Same thread as em_inv1
            ),
            Email(
                id="em_standup",
                subject="Engineering Standup",
                body="Standup link is live on Google Meet.",
                sender="scrum@company.com",
                thread_id="th_eng",
            ),
        ]
        cache.save_emails(emails)
        chroma_client.index_emails(emails)
        return emails

    def test_self_exclusion(self, populated_emails):
        """Input email's own id never appears in retrieve_similar_emails results."""
        target_email = populated_emails[0]  # em_inv1
        results = retriever.retrieve_similar_emails(target_email, k=5)
        result_ids = [e.id for e in results]
        assert target_email.id not in result_ids

    def test_thread_exclusion(self, populated_emails):
        """No result shares thread_id when exclude_same_thread=True."""
        target_email = populated_emails[0]  # thread th_billing_1
        results = retriever.retrieve_similar_emails(
            target_email, k=5, exclude_same_thread=True
        )
        for r in results:
            assert r.thread_id != target_email.thread_id

    def test_thread_inclusion_when_disabled(self, populated_emails):
        """Same-thread results do appear when exclude_same_thread is False."""
        target_email = populated_emails[0]  # thread th_billing_1
        results = retriever.retrieve_similar_emails(
            target_email, k=5, exclude_same_thread=False
        )
        result_ids = [e.id for e in results]
        # em_inv_thread1_followup shares thread_id with em_inv1
        assert "em_inv_thread1_followup" in result_ids

    def test_retrieve_returns_email_objects(self, populated_emails):
        """Contract test for BE-1: return type is list[Email] with accessible attributes."""
        target = populated_emails[3]
        results = retriever.retrieve_similar_emails(target, k=2)
        for email in results:
            assert isinstance(email, Email)
            assert hasattr(email, "subject")
            assert hasattr(email, "body")
            assert hasattr(email, "sender")
            assert hasattr(email, "thread_id")

    def test_search_returns_search_result_schema(self, populated_emails):
        """Contract test for FE-2: response shape matches SearchResult schema."""
        results = retriever.search_emails(query="invoice payment reminder", k=2)
        assert len(results) > 0
        for item in results:
            assert isinstance(item, SearchResult)
            assert isinstance(item.email, Email)
            assert 0.0 <= item.score <= 1.0

    def test_search_result_ordering(self, populated_emails):
        """Results are ordered by relevance score descending."""
        results = retriever.search_emails(query="invoice due date", k=4)
        scores = [r.score for r in results]
        assert scores == sorted(scores, reverse=True)

    def test_k_boundary(self, populated_emails):
        """k=1 returns 1 result; k larger than available emails returns all available."""
        res_one = retriever.search_emails(query="invoice", k=1)
        assert len(res_one) == 1

        res_many = retriever.search_emails(query="invoice", k=100)
        assert len(res_many) <= len(populated_emails)


# ===========================================================================
# Phase 4: Search Router & API Tests
# ===========================================================================

class TestPhase4SearchRouter:
    @pytest.fixture(autouse=True)
    def setup_data(self):
        emails = [
            Email(
                id="doc_1",
                subject="API Documentation v2",
                body="Swagger OpenAPI specs for v2 endpoints.",
                sender="dev@company.com",
                thread_id="th_api",
            ),
            Email(
                id="doc_2",
                subject="Design System Updates",
                body="Updated typography tokens and colors.",
                sender="ui@company.com",
                thread_id="th_ui",
            ),
        ]
        cache.save_emails(emails)
        chroma_client.index_emails(emails)

    def test_search_endpoint_smoke(self):
        """TestClient hits /api/search?q=... and gets 200 with SearchResult[] body."""
        client = TestClient(app)
        resp = client.get("/api/search?q=documentation")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) > 0
        first = data[0]
        assert "email" in first
        assert "score" in first
        assert first["email"]["id"] == "doc_1"

    def test_search_endpoint_respects_k_param(self):
        """?k=1 returns at most 1 result end-to-end through HTTP."""
        client = TestClient(app)
        resp = client.get("/api/search?q=tokens&k=1")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1

    def test_search_endpoint_empty_query_behavior(self):
        """Empty query or whitespace-only query returns 422 Unprocessable Entity."""
        client = TestClient(app)
        # Empty string
        resp = client.get("/api/search?q=")
        assert resp.status_code == 422

        # Whitespace-only string
        resp_ws = client.get("/api/search?q=%20%20")
        assert resp_ws.status_code == 422


# ===========================================================================
# Ingestion Sample Payload Integration Test
# ===========================================================================

class TestSamplePayloadIntegration:
    def test_sample_payload_ingestion_and_retrieval(self):
        """Test with user provided JSON payload."""
        sample_thread = {
            "thread_id": "gmail_123",
            "subject": "Project Deadline",
            "participants": [{"name": "Rahul", "email": "rahul@example.com"}],
            "messages": [
                {
                    "sender": "rahul@example.com",
                    "timestamp": "2026-09-05T10:30:00",
                    "body": "Can you send the revised report by Monday?",
                }
            ],
        }

        # Convert to Email entity per BE-3 contract
        msg = sample_thread["messages"][0]
        sample_email = Email(
            id="gmail_123_msg_0",
            subject=sample_thread["subject"],
            body=msg["body"],
            sender=msg["sender"],
            thread_id=sample_thread["thread_id"],
            timestamp=msg["timestamp"],
        )

        cache.save_email(sample_email)
        chroma_client.index_email(sample_email)

        # Search for it
        results = retriever.search_emails("revised report Monday deadline", k=1)
        assert len(results) == 1
        assert results[0].email.id == "gmail_123_msg_0"
        assert results[0].email.sender == "rahul@example.com"
        assert "Monday" in results[0].email.body
