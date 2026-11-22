import asyncio
from engine.multi_model_pipeline import MultiModelPipeline, TaskComplexity

async def test():
    pipeline = MultiModelPipeline()
    result = await pipeline.run(
        'Explain how transformer attention works in two paragraphs.',
        max_tokens=512,
        complexity=TaskComplexity.REASONING,
        warmup=False
    )
    print('Aggregate TPS:', result.get('aggregate_tps'))
    print('Best model:', result.get('selected_model'))
    aresults = result.get('all_results', [])
    for r in aresults[:3]:
        status = 'success' if r['success'] else 'failed'
        print(f'  {r["model"]}: {r["tokens_per_second"]} tok/s - {status}')
    await pipeline.close()

asyncio.run(test())