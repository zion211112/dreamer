#!/usr/bin/env python3
"""Comprehensive scale test for the multi-model pipeline — 10k tok/s target."""
import asyncio
import json
import sys
import time

sys.path.insert(0, "engine")
from multi_model_pipeline import MultiModelPipeline, TaskComplexity, SubagentConnector


async def test_health():
    """Probe all models once, mark unhealthy ones circuit-open."""
    pipeline = MultiModelPipeline()
    print("=== HEALTH CHECK ===")
    results = await pipeline.orchestrator.health_check(max_concurrent=16)
    healthy = sum(1 for v in results.values() if v)
    total = len(results)
    print(f"Healthy: {healthy}/{total} models")
    for model_id, ok in sorted(results.items()):
        status = "OK" if ok else "DEAD"
        print(f"  {model_id}: {status}")
    print(f"Healthy count for batching: {pipeline.registry.healthy_count()}")
    await pipeline.close()
    return healthy


async def test_sweep():
    """Run sweep at concurrency [1,2,4,8,16,32,64] with all healthy models."""
    pipeline = MultiModelPipeline()
    prompt = "Write a detailed technical explanation of how transformer attention works, including QKV projections, softmax scaling, and multi-head attention. Be thorough."
    result = await pipeline.run(prompt, max_tokens=2000, complexity=TaskComplexity.REASONING, sweep=True)
    print("\n=== SWEEP RESULTS ===")
    sweep = result.get("sweep", {})
    for r in sweep.get("sweep", []):
        print(f"  n={r['n']:>2}  wall={r['wall_s']:>6.2f}s  out={r['total_out']:>6}  agg={r['agg_tps']:>8.2f} tok/s  ok={r['ok']:>2}/{r['total']:<2}")
    best = sweep.get("best")
    if best:
        print(f"\nBEST SWEEP: n={best['n']}, agg_tps={best['agg_tps']}, ok={best['ok']}/{best['total']}")
        print(f"Gap to 10k/s: {10000 / best['agg_tps']:.1f}x")
    await pipeline.close()


async def test_subagent_sim(n_agents: int = 6, prompts_per_agent: int = 3):
    """Simulate N subagents in parallel, each running its own pipeline."""
    pipeline = MultiModelPipeline()
    print(f"\n=== SUBAGENT SIMULATION: {n_agents} agents, {prompts_per_agent} prompts each ===")
    result = await pipeline.simulate_subagents(
        n_agents=n_agents,
        prompts_per_agent=prompts_per_agent,
        max_tokens=512,
        complexity=TaskComplexity.MIXED,
        max_concurrent=64,
    )
    if "error" in result:
        print(f"  ERROR: {result['error']}")
        await pipeline.close()
        return
    print(f"  Agents: {result['n_agents']}, Total prompts: {result['total_prompts']}")
    print(f"  Wall: {result['wall_s']:.2f}s")
    print(f"  Aggregate TPS: {result['aggregate_tps']:.2f}")
    print(f"  Successful: {result['successful']}/{result['total_prompts']}")
    print(f"  Gap to 10k/s: {result['gap_to_10k']:.1f}x")
    print(f"  Per-agent:")
    for pa in result["per_agent"]:
        print(f"    Agent {pa['agent']} ({pa['model']}): {pa['tps']} tok/s, wall={pa['wall_s']:.2f}s")
    await pipeline.close()


async def test_subagent_sweep():
    """Run subagent simulation at 6, 12, 24, 48 agents to find the scaling curve."""
    pipeline = MultiModelPipeline()
    await pipeline.orchestrator.health_check(max_concurrent=16)
    healthy = pipeline.registry.healthy_count()
    print(f"\n=== SUBAGENT SCALING SWEEP ({healthy} healthy models) ===")
    for n_agents in [6, 12, 24, 48]:
        result = await pipeline.simulate_subagents(
            n_agents=n_agents,
            prompts_per_agent=2,
            max_tokens=512,
            complexity=TaskComplexity.MIXED,
            max_concurrent=64,
        )
        if "error" in result:
            print(f"  n={n_agents}: ERROR {result['error']}")
            continue
        print(f"  n={n_agents:>2} agents: {result['aggregate_tps']:>8.2f} tok/s, gap={result['gap_to_10k']:.1f}x, successful={result['successful']}/{result['total_prompts']}")
    await pipeline.close()


async def test_batch_scale():
    """Test batch mode: many prompts across models concurrently."""
    pipeline = MultiModelPipeline()
    prompts = [
        "Write a Python function to fib with memoization.",
        "Write a Python function to sort a list with quicksort.",
        "Write a Python function to reverse a string.",
        "Write a Python function to check if a number is prime.",
        "Write a Python function to compute factorial recursively.",
    ] * 10  # 50 prompts total

    models = [
        "groq/qwen/qwen3.5-flash-02-23",
        "groq/llama-3.1-8b-instant",
        "nvidia/nemotron-3.5-lightning",
        "google/gemini-2.5-flash-lite",
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
        model_prompts = prompts[i::len(models)]
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
    for r in all_results[:5]:
        print(f"  {r.model_id}: {r.tokens_per_second} tok/s, success={r.success}, error={r.error}")
    await pipeline.close()


async def main():
    healthy = await test_health()
    await test_sweep()
    await test_subagent_sim(n_agents=6, prompts_per_agent=3)
    await test_subagent_sweep()
    await test_batch_scale()


asyncio.run(main())