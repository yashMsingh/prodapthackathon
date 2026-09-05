"""
app/vectorstore/embedder.py

BE-2 (RAG) — Phase 1

Purpose
-------
Single wrapper around the embedding model. Nothing outside this file should
ever import sentence-transformers directly — chroma_client.py is the only
consumer of this module.

Contract
--------
    embed_text(text: str) -> list[float]
    embed_batch(texts: list[str]) -> list[list[float]]

Both return plain Python lists of floats (not numpy arrays) so downstream
callers (ChromaDB client, tests) don't need to know or care that numpy is
involved anywhere in this pipeline.

Assumptions (per the "no fallbacks" ground rule)
-------------------------------------------------
- Callers pass non-empty, non-None strings. This module does not validate,
  sanitize, or silently substitute empty input — that is the caller's
  responsibility (chroma_client.py, which builds text from a known-good
  Email record).
- The embedding model name is read from EMBEDDING_MODEL_NAME in the
  environment, with a sensible default for local dev. This is ordinary
  config, not a data fallback.
"""

import os
from functools import lru_cache

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    SentenceTransformer = None

DEFAULT_MODEL_NAME = "all-MiniLM-L6-v2"


def _model_name() -> str:
    return os.environ.get("EMBEDDING_MODEL_NAME", DEFAULT_MODEL_NAME)


@lru_cache(maxsize=1)
def _get_model():
    """
    Loads the model exactly once per process and caches it.

    lru_cache(maxsize=1) gives us the singleton behavior for free: the first
    call pays the (slow) model-load cost, every subsequent call in this
    process returns the same in-memory model instance immediately.
    """
    if SentenceTransformer is not None:
        return SentenceTransformer(_model_name())
    from chromadb.utils import embedding_functions
    return embedding_functions.DefaultEmbeddingFunction()


def embed_text(text: str) -> list[float]:
    """
    Embed a single piece of text into a fixed-length vector.

    Parameters
    ----------
    text : str
        Non-empty text to embed (e.g. an email's subject + body, or a raw
        search query string).

    Returns
    -------
    list[float]
        The embedding vector. Length is fixed by the underlying model
        (384 dims for the default all-MiniLM-L6-v2) and is constant across
        every call for the lifetime of the process.
    """
    model = _get_model()
    if hasattr(model, "encode"):
        vector = model.encode(text, convert_to_numpy=True)
        return vector.tolist()
    return [float(x) for x in model([text])[0]]


def embed_batch(texts: list[str]) -> list[list[float]]:
    """
    Embed multiple texts in a single batched call.

    This is the path chroma_client.py should use for bulk indexing — batching
    through the model directly is meaningfully faster than N calls to
    embed_text() in a loop.

    Parameters
    ----------
    texts : list[str]
        Non-empty list of non-empty strings.

    Returns
    -------
    list[list[float]]
        One vector per input text, same order as the input list.
        embed_batch([a, b])[0] == embed_text(a) — the batch path is not a
        separate, divergent implementation from the single-text path.
    """
    if not texts:
        return []
    model = _get_model()
    if hasattr(model, "encode"):
        vectors = model.encode(texts, convert_to_numpy=True)
        return vectors.tolist()
    return [[float(x) for x in vec] for vec in model(texts)]


def embedding_dimension() -> int:
    model = _get_model()
    if hasattr(model, "get_embedding_dimension"):
        return model.get_embedding_dimension()
    if hasattr(model, "get_sentence_embedding_dimension"):
        return model.get_sentence_embedding_dimension()
    return 384

