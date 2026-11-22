#!/usr/bin/env python3
"""Comprehensive scale test for the multi-model pipeline — 10k tok/s target."""
import asyncio
import json
import sys
import time

sys.path.insert(0, "engine")
from multi_model_pipeline import MultiModelPipeline, TaskComplexity, SubagentConnector


async def test_sweep():
    """Run sweep at concurrency [1,2,4,8,16,32,64] with all healthy models."""
    pipeline = MultiModelPipeline()
    prompt = "Write a detailed technical explanation of how transformer attention works, including QKV projections, softmax scaling, and multi-head attention. Be thorough."
    result = await pipeline.run(prompt, max_tokens=2000, complexity=TaskComplexity.REASONING, sweep=True)
    print("=== SWEEP RESULTS ===")
    sweep = result.get("sweep", {})
    for r in sweep.get("sweep", []):
        print(f"  n={r['n']:>2}  wall={r['wall_s']:>6.2f}s  out={r['total_out']:>6}  agg={r['agg_tps']:>8.2f} tok/s  ok={r['ok']:>2}/{r['total']:<2}  models={','.join(r['models'][:4])}...")
    best = sweep.get("best")
    if best:
        print(f"\nBEST: n={best['n']}, agg_tps={best['agg_tps']}, ok={best['ok']}/{best['total']}")
    print(f"\nGap to 10k/s: {10000 / best['agg_tps']:.1f}x" if best else "\nNo best result")
    await pipeline.close()


async def test_batch_scale():
    """Test batch mode: 60 prompts across 6 models concurrently."""
    pipeline = MultiModelPipeline()
    prompts = [
        "Write a Python function to fib with memoization.",
        "Write a Python function to sort a list with quicksort.",
        "Write a Python function to reverse a string.",
        "Write a Python function to check if a number is prime.",
        "Write a Python function to compute factorial recursively.",
        "Write a Python function to binary search a sorted list.",
    ] * 10  # 60 prompts total

    # Distribute across 6 models
    models = [
        "groq/qwen/qwen3.5-flash-02-23",
        "groq/llama-3.1-8b-instant",
        "nvidia/nemotron-3.5-lightning",
        "google/gemini-2.5-flash-lite",
        "openrouter/meta-llama/llama-3.1-8b-instruct:free",
        "fireworks/accounts/fireworks/models/llama-v3.1-8b-instruct",
    ]

    async def run_model_batch(model_id, model_prompts):
        return await pipeline.orchestrator.run_batch(
            prompts=model_prompts,
            model_id=model_id,
            max_tokens=512,
            max_concurrent=10,
        )

    start = time.perf_counter()
    tasks = []
    for i, model_id in enumerate(models):
        model_prompts = prompts[i::len(models)]  # round-robin distribution
        tasks.append(run_model_batch(model_id, model_prompts))

    all_results = []
    for coro in asyncio.as_completed(tasks):
        results = await coro
        all_results.extend(results)

    wall = time.perf_counter() - start
    total_out = sum(r.output_tokens for r in all_results if r.success)
    agg_tps = total_out / wall if wall > 0 else 0.0
    ok = sum(1 for r in all_results if r.success)
    print("\n=== BATCH SCALE RESULTS ===")
    print(f"Prompts: {len(prompts)}, Models: {len(models)}, Successful: {ok}, Wall: {wall:.2f}s")
    print(f"Total output tokens: {total_out}, Aggregate tok/s: {agg_tps:.2f}")
    print(f"Gap to 10k/s: {10000 / agg_tps:.1f}x" if agg_tps > 0 else "\nNo results")
    # Per-model breakdown
    by_model = {}
    for r in all_results:
        if r.model_id not in by_model:
            by_model[r.model_id] = {"tps": [], "ok": 0, "fail": 0}
        if r.success:
            by_model[r.model_id]["tps"].append(r.tokens_per_second)
            by_model[r.model_id]["ok"] += 1
        else:
            by_model[r.model_id]["fail"] += 1
    for model_id, stats in sorted(by_model.items()):
        avg_tps = sum(stats["tps"]) / len(stats["tps"]) if stats["tps"] else 0
        print(f"  {model_id}: ok={stats['ok']}, fail={stats['fail']}, avg_tps={avg_tps:.2f}")
    await pipeline.close()


async def test_subagent_parallel():
    """Test multiple subagents running in parallel with different models."""
    agents = [
        ("coder-1", "groq/qwen/qwen3.5-flash-02-23", TaskComplexity.CODING),
        ("coder-2", "groq/llama-3.1-8b-instant", TaskComplexity.CODING),
        ("reasoner-1", "nvidia/nemotron-3.5-super-vl-120b-a12b", TaskComplexity.REASONING),
        ("reasoner-2", "google/gemini-2.5-flash", TaskComplexity.REASONING),
        ("fast-1", "nvidia/nemotron-3.5-lightning", TaskComplexity.MIXED),
        ("fast-2", "openrouter/meta-llama/llama-3.1-8b-instruct:free", TaskComplexity.MIXED),
    ]

    connectors = []
    for name, model, comp in agents:
        conn = SubagentConnector(agent_name=name, preferred_model=model, complexity=comp)
        connectors.append(conn)

    prompts = {
        "coder-1": "Write a Python decorator that caches function results with TTL.",
        "coder-2": "Write a Python class for a thread-safe LRU cache.",
        "reasoner-1": "Compare monolithic vs microservices architecture trade-offs.",
        "reasoner-2": "Analyze the pros and cons of async vs sync programming.",
        "fast-1": "Explain how TCP handshake works in 3 sentences.",
        "fast-2": "What is the difference between a list and a tuple in Python?",
    }

    start = time.perf_counter()
    tasks = []
    for conn in connectors:
        p = prompts.get(conn.agent_name, "Say hello.")
        tasks.append(conn.execute(p, task_id=f"{conn.agent_name}-task", max_tokens=512))

    results = []
    for coro in asyncio.as_completed(tasks):
        results.append(await coro)

    wall = time.perf_counter() - start
    total_tps = sum(r.get("aggregate_tps", 0) for r in results if "aggregate_tps" in r)
    print("\n=== SUBAGENT PARALLEL RESULTS ===")
    for r in results:
        best = r.get("best_result", {})
        print(f"  {r['task_id']}: model={best.get('model')}, tps={best.get('tokens_per_second', 0):.2f}, agg={r.get('aggregate_tps', 0):.2f}")
    print(f"Wall: {wall:.2f}s, Combined agg_tps: {total_tps:.2f}")
    print(f"Gap to 10k/s: {10000 / total_tps:.1f}x" if total_tps > 0 else "")

    for conn in connectors:
        await conn.close()


async def main():
    await test_sweep()
    print()
    await test_batch_scale()
    print()
    await test_subagent_parallel()


asyncio.run(main())
