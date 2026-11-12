"""Structured task contracts for the LLM execution engine.

All models are Pydantic so contracts can be serialized to JSON, validated on
ingress, and persisted alongside execution metrics.
"""
from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional
from uuid import uuid4

from pydantic import BaseModel, Field, ConfigDict


class TaskStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TaskCategory(str, Enum):
    DESIGN = "design"
    CODE = "code"
    SUMMARY = "summary"
    ANALYSIS = "analysis"
    QA = "qa"


class Task(BaseModel):
    """A single unit of work routed to a model worker."""

    id: str = Field(default_factory=lambda: uuid4().hex)
    category: TaskCategory = TaskCategory.DESIGN
    prompt: str = Field(min_length=1)
    model: str = "groq/qwen/qwen3.8-27b"
    max_tokens: int = Field(default=1024, ge=1, le=8192)
    temperature: float = Field(default=0.3, ge=0.0, le=2.0)
    priority: int = Field(default=0, description="Higher runs first")
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    deadline_s: Optional[float] = Field(default=None, description="Soft deadline in seconds")
    metadata: dict[str, Any] = Field(default_factory=dict)

    model_config = ConfigDict(frozen=True)


class TaskResult(BaseModel):
    """Validated outcome of executing a task."""

    task_id: str
    model: str
    status: TaskStatus
    output: str = ""
    output_tokens_approx: int = 0
    first_token_s: Optional[float] = None
    total_s: Optional[float] = None
    tokens_per_s: Optional[float] = None
    error: Optional[str] = None
    attempts: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    completed_at: Optional[str] = None

    @property
    def ok(self) -> bool:
        return self.status == TaskStatus.COMPLETED and bool(self.output.strip())


class ExecutionRequest(BaseModel):
    """Client submission: one or more tasks with shared options."""

    tasks: list[Task]
    concurrency: Optional[int] = Field(default=None, ge=1)
    model: Optional[str] = Field(default=None, description="Override model for all tasks")
    max_tokens: Optional[int] = Field(default=None, ge=1)
    temperature: Optional[float] = Field(default=None, ge=0.0, le=2.0)
