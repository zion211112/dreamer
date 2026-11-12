"""Metrics collection for the execution engine.

Persistent, append-only JSONL metrics plus in-memory aggregations. Designed to
be write-safe under concurrent async access (single event loop, no threads).
"""
from __future__ import annotations

import json
import os
import threading
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


@dataclass
class ModelAggregate:
    requests: int = 0
    successes: int = 0
    failures: int = 0
    cancellations: int = 0
    total_s: float = 0.0
    output_tokens: int = 0
    first_token_s_sum: float = 0.0
    first_token_count: int = 0


class MetricsRecorder:
    """Thread/loop-safe metrics recorder with JSONL persistence."""

    def __init__(self, path: str = "reports/metrics.jsonl") -> None:
        self.path = path
        self._lock = threading.Lock()
        self._by_model: dict[str, ModelAggregate] = defaultdict(ModelAggregate)
        self.total_requests = 0
        self.total_output_tokens = 0.0
        self.peak_concurrency = 0
        self._started_at = datetime.now(timezone.utc).isoformat()
        os.makedirs(os.path.dirname(path) or ".", exist_ok=True)

    def record_start(self, model: str) -> None:
        with self._lock:
            self.total_requests += 1
            self._by_model[model].requests += 1

    def record_success(
        self,
        model: str,
        total_s: float,
        output_tokens: int,
        first_token_s: float | None,
    ) -> None:
        with self._lock:
            agg = self._by_model[model]
            agg.successes += 1
            agg.total_s += total_s
            agg.output_tokens += output_tokens
            self.total_output_tokens += output_tokens
            if first_token_s is not None:
                agg.first_token_s_sum += first_token_s
                agg.first_token_count += 1

    def record_failure(self, model: str) -> None:
        with self._lock:
            self._by_model[model].failures += 1

    def record_cancellation(self, model: str) -> None:
        with self._lock:
            self._by_model[model].cancellations += 1

    def set_peak_concurrency(self, n: int) -> None:
        with self._lock:
            if n > self.peak_concurrency:
                self.peak_concurrency = n

    def snapshot(self) -> dict[str, Any]:
        with self._lock:
            per_model: dict[str, dict[str, Any]] = {}
            for model, agg in self._by_model.items():
                avg_tps = (agg.output_tokens / agg.total_s) if agg.total_s > 0 else 0.0
                avg_ftt = (agg.first_token_s_sum / agg.first_token_count) if agg.first_token_count else None
                per_model[model] = {
                    "requests": agg.requests,
                    "successes": agg.successes,
                    "failures": agg.failures,
                    "cancellations": agg.cancellations,
                    "success_rate": (agg.successes / agg.requests) if agg.requests else 0.0,
                    "total_s": round(agg.total_s, 4),
                    "output_tokens": agg.output_tokens,
                    "aggregate_tokens_per_s": round(avg_tps, 3),
                    "avg_first_token_s": round(avg_ftt, 4) if avg_ftt is not None else None,
                }
            return {
                "started_at": self._started_at,
                "total_requests": self.total_requests,
                "total_output_tokens": int(self.total_output_tokens),
                "peak_concurrency": self.peak_concurrency,
                "per_model": per_model,
            }

    def persist(self) -> None:
        with self._lock:
            snap = self.snapshot()
        with open(self.path, "a", encoding="utf-8") as fh:
            fh.write(json.dumps({"ts": datetime.now(timezone.utc).isoformat(), **snap}) + "\n")
