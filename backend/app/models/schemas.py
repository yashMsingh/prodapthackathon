"""
Shared Pydantic schemas for the ProdApt Hackathon backend.
"""

from __future__ import annotations

from typing import List, Literal, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Core Ingestion / RAG Email Schemas (BE-3 & BE-2 contracts)
# ---------------------------------------------------------------------------

class Email(BaseModel):
    """Core Email entity schema as produced by ingestion (BE-3) and consumed by RAG (BE-2)."""

    id: str = Field(..., description="Unique email identifier")
    subject: str = Field(..., description="Email subject line")
    body: str = Field(..., description="Plain-text email body content")
    sender: str = Field(..., description="Sender email or display name")
    thread_id: str = Field(..., description="Thread identifier")
    timestamp: Optional[str] = Field(default=None, description="ISO-8601 timestamp string")


class SearchResult(BaseModel):
    """Search result schema consumed by frontend / routers."""

    email: Email = Field(..., description="Matched email object")
    score: float = Field(..., description="Similarity/relevance score between 0.0 and 1.0")


# ---------------------------------------------------------------------------
# LLM Schemas (BE-1 compatibility)
# ---------------------------------------------------------------------------

class EmailInput(BaseModel):
    """Inbound email schema for LLM processing."""

    id: Optional[str] = Field(default=None, description="Unique email identifier")
    subject: str = Field(..., description="Email subject line")
    sender: str = Field(..., description="Sender email address or display name")
    recipient: Optional[str] = Field(default=None, description="Recipient email address")
    body: str = Field(..., description="Plain-text email body")
    date: Optional[str] = Field(default=None, description="ISO-8601 date string")
    thread_id: Optional[str] = Field(default=None, description="Gmail thread identifier")


class StyleExample(BaseModel):
    """Sent email example for style mimicry."""

    subject: str = Field(..., description="Subject of the sent email")
    body: str = Field(..., description="Body of the sent email")


class PriorityResult(BaseModel):
    priority: Literal["high", "medium", "low"] = Field(..., description="Classified priority")
    reason: str = Field(..., description="Reason for classification")


class TaskItem(BaseModel):
    task: str = Field(..., description="Task description")
    deadline: Optional[str] = Field(default=None, description="Task deadline")
    assigned_to: Optional[str] = Field(default=None, description="Assignee")


class DeepAnalysisResult(BaseModel):
    summary: str = Field(..., description="Summary")
    tasks: List[TaskItem] = Field(default_factory=list)
    draft: str = Field(..., description="Draft reply")


class EmailAnalysisResult(BaseModel):
    email_id: Optional[str] = None
    priority: PriorityResult
    summary: Optional[str] = None
    tasks: List[TaskItem] = Field(default_factory=list)
    draft: Optional[str] = None


class AnalyseRequest(BaseModel):
    email: EmailInput
    style_examples: List[StyleExample] = Field(default_factory=list)


class AnalyseResponse(BaseModel):
    email_id: Optional[str] = None
    priority: PriorityResult
    summary: Optional[str] = None
    tasks: List[TaskItem] = Field(default_factory=list)
    draft: Optional[str] = None


class TaskExtractionRequest(BaseModel):
    email: EmailInput


class TaskExtractionResponse(BaseModel):
    email_id: Optional[str] = None
    tasks: List[TaskItem]


class DraftRequest(BaseModel):
    email: EmailInput
    style_examples: List[StyleExample] = Field(default_factory=list)


class DraftResponse(BaseModel):
    email_id: Optional[str] = None
    draft: str
