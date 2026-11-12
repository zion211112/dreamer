"""Core async execution engine.

Single event loop, bounded concurrency, per-model worker pools, adaptive
concurrency control, retry/backoff, circuit breakers, request cancellation,
streaming token aggregation, and persistent metrics.
"""
from __future__ import annotations

import asyncio
import json
import random
import time
from collections import defaultdict
from typing import Any

import httpx

from .adaptive import AdaptiveConcurrencyController
from .circuit_breaker import CircuitBreaker
from .contracts import Task, TaskResult, TaskStatus
from .metrics import MetricsRecorder

BASE_URL = "http://127.0.0.1:8082/v1/messages"


class ModelWorker:
    """Per-model worker: HTTP client + circuit breaker + adaptive concurrency."""

    def __init__(self, model: str, concurrency: int = 4) -> None:
        self.model = model
        self.circuit = CircuitBreaker()
        self.adaptive = AdaptiveConcurrencyController(
            min_concurrency=1, max_concurrency=64, initial_concurrency=concurrency
        )
        self._semaphore = asyncio.Semaphore(concurrency)
        self._client: httpx.AsyncClient | None = None
        self._lock = asyncio.Lock()

    async def client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(base_url="http://127.0.0.1:8082", timeout=180.0)
        return self._client

    async def aclose(self) -> None:
        if self._client is not None:
            await self._client.aclose()
            self._client = None

    async def set_concurrency(self, n: int) -> None:
        # Semaphore value can't be changed directly; recreate if different.
        if self._semaphore._value == n:
            return
        self._semaphore = asyncio.Semaphore(n)
        self.adaptive.concurrency = n

    def capacity(self) -> int:
        return self.adaptive.concurrency


class Engine:
    def __init__(
        self,
        models: list[str] | None = None,
        metrics_path: str = "reports/metrics.jsonl",
        default_concurrency: int = 4,
    ) -> None:
        self.models = models or ["groq/qwen/qwen3.8-27b"]
        self.workers: dict[str, ModelWorker] = {
            m: ModelWorker(m, default_concurrency) for m in self.models
        }
        self.default_model = self.models[0]
        self.metrics = MetricsRecorder(metrics_path)
        self._cancelled: set[str] = set()
        self._tasks: dict[str, asyncio.Task[Any]] = {}
        self._running = 0
        self._peak_running = 0

    async def aclose(self) -> None:
        for w in self.workers.values():
            await w.aclose()

    def cancel(self, task_id: str) -> None:
        self._cancelled.add(task_id)
        t = self._tasks.get(task_id)
        if t is not None:
            t.cancel()

    def is_cancelled(self, task_id: str) -> bool:
        return task_id in self._cancelled

    def _strip_cancel(self, task_id: str) -> None:
        self._cancelled.discard(task_id)

    async def _execute_single(
        self,
        worker: ModelWorker,
        task: Task,
        attempt: int,
    ) -> TaskResult:
        """One streaming attempt against /v1/messages."""
        worker.adaptive.begin()
        self._running += 1
        if self._running > self._peak_running:
            self._peak_running = self._running
        t_start = time.monotonic()
        t_first: float | None = None
        chunks: list[str] = []
        status = TaskStatus.FAILED
        error: str | None = None
        try:
            if self.is_cancelled(task.id):
                status = TaskStatus.CANCELLED
                raise asyncio.CancelledError()
            client = await worker.client()
            async with client.stream(
                "POST",
                "/v1/messages",
                json={
                    "model": task.model,
                    "messages": [{"role": "user", "content": task.prompt}],
                    "max_tokens": task.max_tokens,
                    "stream": True,
                    "temperature": task.temperature,
                },
            ) as resp:
                if resp.status_code >= 400:
                    body = (await resp.aread()).decode(errors="replace")
                    raise RuntimeError(f"HTTP {resp.status_code}: {body[:200]}")
                async for raw in resp.aiter_lines():
                    if self.is_cancelled(task.id):
                        status = TaskStatus.CANCELLED
                        raise asyncio.CancelledError()
                    if not raw.strip():
                        continue
                    if raw.startswith("data:"):
                        payload = raw[5:].strip()
                        try:
                            data = json.loads(payload)
                        except json.JSONDecodeError:
                            continue
                        content = data.get("delta", {}).get("text")
                        if content:
                            if t_first is None:
                                t_first = time.monotonic() - t_start
                            chunks.append(content)
                        if data.get("type") == "message_stop":
                            break
            output = "".join(chunks)
            if not output.strip():
                raise RuntimeError("empty model output")
            status = TaskStatus.COMPLETED
        except asyncio.CancelledError:
            status = TaskStatus.CANCELLED
            raise
        except Exception as exc:  # noqa: BLE001
            error = f"{type(exc).__name__}: {exc}"
            status = TaskStatus.FAILED
        finally:
            total_s = time.monotonic() - t_start
            output_tokens = len("".join(chunks).split())
            self._running -= 1
            worker.adaptive.end(status == TaskStatus.COMPLETED)
            if status == TaskStatus.COMPLETED:
                worker.circuit.record_success()
                self.metrics.record_success(
                    task.model, total_s, output_tokens, t_first
                )
            elif status == TaskStatus.CANCELLED:
                worker.circuit.record_success()  # not an infra failure
                self.metrics.record_cancellation(task.model)
            else:
                worker.circuit.record_failure()
                self.metrics.record_failure(task.model)

        return TaskResult(
            task_id=task.id,
            model=task.model,
            status=status,
            output="".join(chunks),
            output_tokens_approx=output_tokens,
            first_token_s=t_first,
            total_s=total_s,
            tokens_per_s=(output_tokens / total_s) if total_s > 0 else None,
            error=error,
            attempts=attempt,
        )

    async def execute(self, task: Task, max_attempts: int = 3) -> TaskResult:
        """Execute a task with retry/backoff, circuit breaker, and cancellation."""
        worker = self.workers.get(task.model)
        if worker is None:
            worker = ModelWorker(task.model)
            self.workers[task.model] = worker
        self.metrics.record_start(task.model)

        last_result: TaskResult | None = None
        for attempt in range(1, max_attempts + 1):
            if self.is_cancelled(task.id):
                return TaskResult(
                    task_id=task.id, model=task.model, status=TaskStatus.CANCELLED,
                    attempts=attempt - 1,
                )
            if not worker.circuit.allow():
                # circuit open; wait briefly then retry (counts as an attempt)
                await asyncio.sleep(min(2.0, 0.5 * attempt))
                last_result = TaskResult(
                    task_id=task.id, model=task.model, status=TaskStatus.FAILED,
                    error="circuit breaker open", attempts=attempt,
                )
                continue
            async with worker._semaphore:
                try:
                    result = await self._execute_single(worker, task, attempt)
                except asyncio.CancelledError:
                    return TaskResult(
                        task_id=task.id, model=task.model, status=TaskStatus.CANCELLED,
                        attempts=attempt,
                    )
            last_result = result
            if result.status == TaskStatus.COMPLETED:
                return result
            if result.status == TaskStatus.CANCELLED:
                return result
            # backoff with jitter before retry
            backoff = min(8.0, 0.5 * (2 ** (attempt - 1))) + random.uniform(0, 0.5)
            await asyncio.sleep(backoff)
        if last_result is None:
            last_result = TaskResult(
                task_id=task.id, model=task.model, status=TaskStatus.FAILED,
                error="no attempts executed", attempts=max_attempts,
            )
        return last_result

    async def run(self, tasks: list[Task], concurrency: int | None = None) -> list[TaskResult]:
        """Run many tasks with bounded global concurrency and per-model pools."""
        if concurrency is not None:
            # Apply to default worker as baseline
            await self.workers[self.default_model].set_concurrency(
                max(1, min(concurrency, 64))
            )
        sem = asyncio.Semaphore(concurrency or self.workers[self.default_model].capacity())

        async def bound(task: Task) -> TaskResult:
            async with sem:
                return await self.execute(task)

        self._tasks = {t.id: asyncio.create_task(bound(t)) for t in tasks}
        results: list[TaskResult] = []
        for coro in asyncio.as_completed(list(self._tasks.values())):
            try:
                results.append(await coro)
            except asyncio.CancelledError:
                results.append(
                    TaskResult(task_id="unknown", model=self.default_model,
                               status=TaskStatus.CANCELLED)
                )
        self.metrics.persist()
        # order results to match input task order
        by_id = {r.task_id: r for r in results}
        return [by_id.get(t.id, TaskResult(task_id=t.id, model=t.model,
                                           status=TaskStatus.FAILED,
                                           error="missing result")) for t in tasks]

    def snapshot(self) -> dict[str, Any]:
        return {
            "models": {m: {"capacity": w.capacity(), "circuit": w.circuit.state.value,
                           "in_flight": w.adaptive.in_flight()}
                       for m, w in self.workers.items()},
            "running": self._running,
            "peak_running": self._peak_running,
            "metrics": self.metrics.snapshot(),
        }
