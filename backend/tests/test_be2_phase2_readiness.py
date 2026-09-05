"""
BE-2 Phase 2 Readiness and Contract Integration Tests.
"""

import os
import tempfile
import pytest
from fastapi.testclient import TestClient

from app.config import get_settings
from app.main import app
from app.models.schemas import Email, SearchResult
from app.storage import cache
from app.vectorstore import chroma_client, embedder, retriever


@pytest.fixture(scope="module", autouse=True)
def setup_readiness_env():
    test_dir = tempfile.mkdtemp(prefix="chroma_readiness_")
    os.environ["CHROMA_PERSIST_DIR"] = test_dir
    get_settings.cache_clear()
    chroma_client.reset_client()
    yield
    import shutil
    shutil.rmtree(test_dir, ignore_errors=True)


class TestBE2ContractReadiness:
    def test_embedder_contract_signatures(self):
        v = embedder.embed_text("Sample contract text")
        assert isinstance(v, list)
        assert isinstance(v[0], float)
        assert len(v) == 384

        batch = embedder.embed_batch(["text1", "text2"])
        assert len(batch) == 2
        assert len(batch[0]) == 384

    def test_chroma_and_retriever_contract(self):
        email = Email(
            id="readiness_01",
            subject="Budget Approval",
            body="Approved budget for Q3 project initiatives.",
            sender="cfo@company.com",
            thread_id="th_readiness",
        )
        cache.save_email(email)
        chroma_client.index_email(email)

        # BE-1 Drafter Contract: retrieve_similar_emails returns list[Email]
        similars = retriever.retrieve_similar_emails(email, k=1, exclude_same_thread=False)
        assert isinstance(similars, list)
        if len(similars) > 0:
            assert isinstance(similars[0], Email)

        # FE-2 Search Contract: search_emails returns list[SearchResult]
        searches = retriever.search_emails("Q3 budget approval", k=1)
        assert len(searches) == 1
        assert isinstance(searches[0], SearchResult)
        assert searches[0].email.id == "readiness_01"

    def test_search_router_registered(self):
        client = TestClient(app)
        resp = client.get("/api/search?q=budget")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)
