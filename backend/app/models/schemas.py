"""
Shared Pydantic schemas for the ProdApt Hackathon backend.

These schemas define the data contracts used across the LLM layer,
routers, and (eventually) other teammates' modules.
"""

from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Email input
# ---------------------------------------------------------------------------

class EmailInput(BaseModel):
    """Represents a single inbound email for LLM processing."""

    id: Optional[str] = Field(default=None, description="Unique email identifier")
    subject: str = Field(..., description="Email subject line")
    sender: str = Field(..., description="Sender email address or display name")
    recipient: Optional[str] = Field(default=None, description="Recipient email address")
    body: str = Field(..., description="Plain-text email body")
    date: Optional[str] = Field(default=None, description="ISO-8601 date string")
    thread_id: Optional[str] = Field(default=None, description="Gmail thread identifier")


class StyleExample(BaseModel):
    """A sent-email example used to infer the user's writing style.

    Provided by the RAG teammate — the LLM layer only consumes these.
    """

    subject: str = Field(..., description="Subject of the sent email")
    body: str = Field(..., description="Body of the sent email")


# ---------------------------------------------------------------------------
# Priority
# ---------------------------------------------------------------------------

class PriorityResult(BaseModel):
    """Result of the fast priority-classification tier."""

    priority: Literal["high", "medium", "low"] = Field(
        ..., description="Classified priority level"
    )
    reason: str = Field(..., description="Concise reason for the classification")


# ---------------------------------------------------------------------------
# Deep analysis (combined medium/high result)
# ---------------------------------------------------------------------------

class TaskItem(BaseModel):
    """A single actionable task extracted from an email."""

    task: str = Field(..., description="Description of the task")
    deadline: Optional[str] = Field(
        default=None, description="Deadline if explicitly stated; null otherwise"
    )
    assigned_to: Optional[str] = Field(
        default=None,
        description="'user' if assigned to the recipient, otherwise the entity name",
    )


class DeepAnalysisResult(BaseModel):
    """Combined result of the deeper LLM analysis for medium/high priority emails."""

    summary: str = Field(..., description="2–3 sentence factual summary of the email")
    tasks: List[TaskItem] = Field(
        default_factory=list, description="Extracted actionable tasks"
    )
    draft: str = Field(
        ...,
        description="Suggested reply draft; empty string if no reply is warranted",
    )


# ---------------------------------------------------------------------------
# Full pipeline result
# ---------------------------------------------------------------------------

class EmailAnalysisResult(BaseModel):
    """Complete LLM pipeline result for a single email."""

    email_id: Optional[str] = Field(default=None)
    priority: PriorityResult
    summary: Optional[str] = Field(
        default=None,
        description="Populated only for medium/high priority emails",
    )
    tasks: List[TaskItem] = Field(default_factory=list)
    draft: Optional[str] = Field(
        default=None,
        description="Populated only for medium/high priority emails",
    )


# ---------------------------------------------------------------------------
# Router request/response shapes
# ---------------------------------------------------------------------------

class TaskExtractionRequest(BaseModel):
    """Request body for the /tasks endpoint."""

    email: EmailInput


class TaskExtractionResponse(BaseModel):
    """Response body for the /tasks endpoint."""

    email_id: Optional[str] = None
    tasks: List[TaskItem]


class DraftRequest(BaseModel):
    """Request body for the /draft endpoint."""

    email: EmailInput
    style_examples: List[StyleExample] = Field(
        default_factory=list,
        description="Optional sent-email examples for style mimicry (from RAG teammate)",
    )


class DraftResponse(BaseModel):
    """Response body for the /draft endpoint."""

    email_id: Optional[str] = None
    draft: str
