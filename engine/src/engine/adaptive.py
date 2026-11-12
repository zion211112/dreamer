"""Adaptive concurrency controller.

Tracks in-flight requests and recent error/latency to raise or lower the
concurrency bound, converging on the highest safe concurrency for a model.
"""
from __future__ import annotations


class AdaptiveConcurrencyController:
    def __init__(
        self,
        min_concurrency: int = 1,
        max_concurrency: int = 64,
        initial_concurrency: int = 4,
        increase_interval_s: float = 10.0,
        decrease_interval_s: float = 5.0,
    ) -> None:
        self.min_concurrency = min_concurrency
        self.max_concurrency = max_concurrency
        self.concurrency = initial_concurrency
        self.increase_interval_s = increase_interval_s
        self.decrease_interval_s = decrease_interval_s
        self._last_change = 0.0
        self._in_flight = 0
        self._recent_errors = 0
        self._recent_successes = 0

    def begin(self) -> None:
        self._in_flight += 1

    def end(self, ok: bool) -> None:
        self._in_flight = max(0, self._in_flight - 1)
        if ok:
            self._recent_successes += 1
        else:
            self._recent_errors += 1

    def in_flight(self) -> int:
        return self._in_flight

    def maybe_adjust(self, now: float | None = None) -> int | None:
        """Return new concurrency if adjusted, else None."""
        now = now if now is not None else __import__("time").monotonic()
        total = self._recent_successes + self._recent_errors
        if total == 0:
            return None
        error_rate = self._recent_errors / total

        if error_rate > 0.25 and now - self._last_change >= self.decrease_interval_s:
            self.concurrency = max(self.min_concurrency, self.concurrency - 1)
            self._last_change = now
            self._recent_errors = 0
            self._recent_successes = 0
            return self.concurrency

        if error_rate < 0.05 and self._in_flight >= self.concurrency and now - self._last_change >= self.increase_interval_s:
            self.concurrency = min(self.max_concurrency, self.concurrency + 1)
            self._last_change = now
            self._recent_errors = 0
            self._recent_successes = 0
            return self.concurrency

        # decay counters periodically
        if now - self._last_change >= max(self.increase_interval_s, self.decrease_interval_s):
            self._recent_errors = max(0, self._recent_errors - 1)
            self._recent_successes = max(0, self._recent_successes - 1)
            self._last_change = now
        return None
