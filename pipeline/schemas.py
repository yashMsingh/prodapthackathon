from pydantic import BaseModel, Field
from typing import List, Optional

# These schemas exactly match what the LLM teammate must return
class TaskSchema(BaseModel):
    task: str
    owner: str
    deadline: Optional[str] = None
    status: str = "PENDING"

class CommitmentSchema(BaseModel):
    owner: str
    action: str
    deadline: Optional[str] = None
    status: str = "PENDING"
    confidence: Optional[float] = None

class WaitingOnSchema(BaseModel):
    person: str
    reason: str

class AIAnalysisResult(BaseModel):
    summary: str
    importance: str
    urgency: str
    priority_reason: str
    action_required: bool
    tasks: List[TaskSchema] = []
    commitments: List[CommitmentSchema] = []
    waiting_on: List[WaitingOnSchema] = []
    state: str = "PENDING"
    confidence: Optional[float] = None
