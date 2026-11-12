"""Run concurrency sweep as a standalone script."""
from __future__ import annotations

import asyncio
import json
import sys

sys.path.insert(0, "src")
from engine.core import Engine
from engine.contracts import Task, TaskCategory


async def main() -> None:
    model = "groq/qwen/qwen3.8-27b"
    prompt = (
        "Explain the architecture of a high-throughput asynchronous LLM execution "
        "engine, covering scheduling, concurrency control, streaming aggregation, "
        "retry, circuit breakers, and metrics. Be thorough."
    )
    levels = [1, 2, 4, 8, 16]
    summary = []
    for level in levels:
        tasks = [
            Task(prompt=prompt, model=model, max_tokens=200,
                 temperature=0.3, category=TaskCategory.DESIGN)
            for _ in range(level)
        ]
        engine = Engine(models=[model], metrics_path="reports/metrics.jsonl")
        try:
            results = await asyncio.wait_for(
                engine.run(tasks, concurrency=level), timeout=120
            )
        except asyncio.TimeoutError:
            summary.append({"concurrency": level, "error": "timeout"})
            await engine.aclose()
            continue
        finally:
            await engine.aclose()
        ok = [r for r in results if r.status.value == "completed"]
        total_tps = sum(r.tokens_per_s or 0 for r in ok)
        total_tokens = sum(r.output_tokens_approx for r in ok)
        wall = max((r.total_s or 0) for r in results) if results else 0
        summary.append({
            "concurrency": level,
            "requests": len(tasks),
            "successes": len(ok),
            "failures": len(results) - len(ok),
            "aggregate_tokens_per_s": round(total_tps, 3),
            "total_output_tokens": total_tokens,
            "wall_s": round(wall, 3),
            "useful_tokens_per_s": round(total_tokens / wall, 3) if wall > 0 else 0,
        })
    print(json.dumps({"model": model, "sweep": summary}, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
