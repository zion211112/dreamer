"""Quick end-to-end validation of the execution engine."""
from __future__ import annotations

import asyncio
import sys

sys.path.insert(0, "src")
from engine.core import Engine
from engine.contracts import Task


async def main() -> None:
    engine = Engine(models=["groq/qwen/qwen3.8-27b"], metrics_path="reports/metrics.jsonl")
    try:
        results = await asyncio.wait_for(
            engine.run([Task(prompt="What is bounded concurrency?", max_tokens=80)],
                       concurrency=1), timeout=60)
        for r in results:
            print(f"status={r.status.value} tps={r.tokens_per_s} "
                  f"first_token={r.first_token_s} total={r.total_s} "
                  f"tokens={r.output_tokens_approx} error={r.error}")
        print("snapshot:", engine.snapshot())
    finally:
        await engine.aclose()


if __name__ == "__main__":
    asyncio.run(main())
