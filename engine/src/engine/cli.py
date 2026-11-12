"""CLI for the LLM execution engine."""
from __future__ import annotations

import argparse
import asyncio
import json
import sys
from typing import Optional

from .contracts import Task, TaskCategory
from .core import Engine


def _build_tasks(args: list[str], model: str, max_tokens: int, temperature: float,
                 category: TaskCategory) -> list[Task]:
    tasks: list[Task] = []
    for i, prompt in enumerate(args):
        tasks.append(
            Task(
                prompt=prompt,
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                category=category,
                metadata={"index": i},
            )
        )
    return tasks


async def _run_benchmark(args: argparse.Namespace) -> None:
    model = args.model or "groq/qwen/qwen3.8-27b"
    prompts = args.prompt or [
        "Write a detailed technical design document for an async multi-model LLM "
        "execution engine targeting 10,000 aggregate output tokens/second using "
        "free inference only.",
    ]
    tasks = _build_tasks(prompts, model, args.max_tokens, args.temperature,
                         TaskCategory.DESIGN)
    engine = Engine(models=[model], metrics_path=args.metrics)
    try:
        results = await engine.run(tasks, concurrency=args.concurrency)
    finally:
        await engine.aclose()
    for r in results:
        print(json.dumps({
            "task_id": r.task_id,
            "status": r.status.value,
            "model": r.model,
            "output_tokens_approx": r.output_tokens_approx,
            "first_token_s": r.first_token_s,
            "total_s": r.total_s,
            "tokens_per_s": r.tokens_per_s,
            "attempts": r.attempts,
            "error": r.error,
        }))
    print(json.dumps(engine.snapshot()["metrics"]))


async def _run_concurrency_sweep(args: argparse.Namespace) -> None:
    model = args.model or "groq/qwen/qwen3.8-27b"
    prompt = args.prompt or (
        "Explain the architecture of a high-throughput asynchronous LLM execution "
        "engine, covering scheduling, concurrency control, streaming aggregation, "
        "retry, circuit breakers, and metrics. Be thorough."
    )
    levels = [int(x) for x in args.levels.split(",")]
    summary = []
    for level in levels:
        tasks = [
            Task(prompt=prompt, model=model, max_tokens=args.max_tokens,
                 temperature=args.temperature, category=TaskCategory.DESIGN)
            for _ in range(level)
        ]
        engine = Engine(models=[model], metrics_path=args.metrics)
        try:
            results = await engine.run(tasks, concurrency=level)
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


def main(argv: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(prog="llm-exec", description="LLM execution engine CLI")
    sub = parser.add_subparsers(dest="command", required=True)

    p_run = sub.add_parser("run", help="Run one or more tasks")
    p_run.add_argument("prompt", nargs="*", help="Prompt text(s)")
    p_run.add_argument("--model", default=None)
    p_run.add_argument("--max-tokens", type=int, default=1024)
    p_run.add_argument("--temperature", type=float, default=0.3)
    p_run.add_argument("--category", default="design")
    p_run.add_argument("--concurrency", type=int, default=None)
    p_run.add_argument("--metrics", default="reports/metrics.jsonl")
    p_run.set_defaults(func=lambda a: asyncio.run(_run_benchmark(a)))

    p_bench = sub.add_parser("bench", help="Single-model throughput benchmark")
    p_bench.add_argument("--prompt", default=None)
    p_bench.add_argument("--model", default=None)
    p_bench.add_argument("--max-tokens", type=int, default=1024)
    p_bench.add_argument("--temperature", type=float, default=0.3)
    p_bench.add_argument("--concurrency", type=int, default=1)
    p_bench.add_argument("--metrics", default="reports/metrics.jsonl")
    p_bench.set_defaults(func=lambda a: asyncio.run(_run_benchmark(a)))

    p_sweep = sub.add_parser("sweep", help="Concurrency sweep benchmark")
    p_sweep.add_argument("--levels", default="1,2,4,8,16,32")
    p_sweep.add_argument("--prompt", default=None)
    p_sweep.add_argument("--model", default=None)
    p_sweep.add_argument("--max-tokens", type=int, default=1024)
    p_sweep.add_argument("--temperature", type=float, default=0.3)
    p_sweep.add_argument("--metrics", default="reports/metrics.jsonl")
    p_sweep.set_defaults(func=lambda a: asyncio.run(_run_concurrency_sweep(a)))

    args = parser.parse_args(argv)
    return args.func(args) or 0


if __name__ == "__main__":
    sys.exit(main())
