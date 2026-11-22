#!/usr/bin/env python3
"""Quick throughput verification for the optimized multi-model pipeline."""
import asyncio
import sys
sys.path.insert(0, "engine")
from multi_model_pipeline import MultiModelPipeline, TaskComplexity

async def main():
    pipeline = MultiModelPipeline()
    
    # Test 1: Quick run without warmup
    print("=== TEST 1: Quick pipeline run (no warmup) ===")
    result = await pipeline.run(
        'Explain how transformer attention works in two paragraphs.',
        max_tokens=512,
        complexity=TaskComplexity.REASONING,
        warmup=False
    )
    agg_tps = result.get('aggregate_tps', 0)
    best_model = result.get('selected_model', 'None')
    print(f"Aggregate TPS: {agg_tps:.2f}")
    print(f"Best model: {best_model}")
    print(f"Gap to 2k/s: {10000 / agg_tps:.1f}x" if agg_tps > 0 else "Cannot calculate")
    
    # Show top 3 results
    aresults = result.get('all_results', [])
    successful = [r for r in aresults if r['success']]
    print(f"\nTop {min(3, len(successful))} model results:")
    for r in sorted(successful, key=lambda x: x['tokens_per_second'], reverse=True)[:3]:
        print(f"  {r['model']}: {r['tokens_per_second']:.2f} tok/s ({r['provider']})")
    
    # Test 2: With warmup
    print("\n=== TEST 2: Pipeline run WITH warmup ===")
    result2 = await pipeline.run(
        'Explain how transformer attention works in two paragraphs.',
        max_tokens=512,
        complexity=TaskComplexity.REASONING,
        warmup=True
    )
    agg_tps2 = result2.get('aggregate_tps', 0)
    best_model2 = result2.get('selected_model', 'None')
    print(f"Aggregate TPS: {agg_tps2:.2f}")
    print(f"Best model: {best_model2}")
    
    # Test 3: Subagent simulation
    print("\n=== TEST 3: Subagent simulation (6 agents) ===")
    result3 = await pipeline.simulate_subagents(
        n_agents=6,
        prompts_per_agent=3,
        max_tokens=512,
        complexity=TaskComplexity.MIXED,
        max_concurrent=64,
    )
    print(f"Agents: {result3['n_agents']}")
    print(f"Total prompts: {result3['total_prompts']}")
    print(f"Wall time: {result3['wall_s']:.2f}s")
    print(f"Aggregate TPS: {result3['aggregate_tps']:.2f}")
    print(f"Successful: {result3['successful']}/{result3['total_prompts']}")
    print(f"Gap to 2k/s: {result3['gap_to_10k']:.1f}x")
    
    await pipeline.close()

asyncio.run(main())