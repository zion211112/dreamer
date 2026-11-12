"""Independent single-request throughput benchmark across candidate models."""
from __future__ import annotations

import asyncio
import json
import sys
import time

import httpx

BASE_URL = "http://127.0.0.1:8082"
PROMPT = (
    "Write a detailed technical design document for an asynchronous multi-model "
    "LLM execution engine targeting 10,000 aggregate output tokens/second using "
    "free inference only. Cover architecture, async HTTP execution, bounded "
    "concurrent request scheduling, per-model worker pools, task classification "
    "and routing, adaptive concurrency control, streaming token aggregation, "
    "retry/backoff with jitter, circuit breakers, request cancellation, "
    "structured task contracts, result validation, and persistent execution "
    "metrics. Include example JSON schemas and pseudocode. Be thorough."
)
MAX_TOKENS = 1024

MODELS = [
    "groq/qwen/qwen3.8-27b",
    "anthropic/kilo/google/gemini-2.5-flash-lite",
    "anthropic/kilo/google/gemini-2.5-flash",
    "anthropic/kilo/google/gemini-2.5-pro",
    "anthropic/kilo/qwen/qwen3.5-flash-02-23",
    "anthropic/kilo/minimax/minimax-m3.1-flash",
    "anthropic/kilo/qwen/qwen3.8-flash",
    "anthropic/kilo/nvidia/nemotron-3.5-lightning:free",
]


def count_tokens(text: str) -> int:
    return len(text.split())


async def bench_one(client: httpx.AsyncClient, model: str) -> dict:
    t0 = time.monotonic()
    first = None
    chunks: list[str] = []
    status = None
    try:
        async with client.stream(
            "POST",
            f"{BASE_URL}/v1/messages",
            json={
                "model": model,
                "messages": [{"role": "user", "content": PROMPT}],
                "max_tokens": MAX_TOKENS,
                "stream": True,
                "temperature": 0.3,
            },
            timeout=180.0,
        ) as resp:
            status = resp.status_code
            if status >= 400:
                body = (await resp.aread()).decode(errors="replace")
                return {"model": model, "ok": False, "status": status, "error": body[:200]}
            async for raw in resp.aiter_lines():
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
                        if first is None:
                            first = time.monotonic() - t0
                        chunks.append(content)
                    if data.get("type") == "message_stop":
                        break
    except Exception as exc:  # noqa: BLE001
        text = "".join(chunks)
        return {"model": model, "ok": False, "error": f"{type(exc).__name__}: {exc}", "elapsed": round(time.monotonic() - t0, 3)}
    total = time.monotonic() - t0
    text = "".join(chunks)
    ntok = count_tokens(text)
    return {
        "model": model, "ok": True, "status": status,
        "first_token_s": round(first, 3) if first is not None else None,
        "total_s": round(total, 3),
        "output_chars": len(text), "output_tokens_approx": ntok,
        "tokens_per_s": round(ntok / total, 2) if total > 0 else None,
    }


async def main() -> None:
    results = []
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        for m in MODELS:
            r = await bench_one(client, m)
            results.append(r)
            print(json.dumps(r))
    # summary line
    ok = [r for r in results if r.get("ok")]
    if ok:
        best = max(ok, key=lambda r: r["tokens_per_s"])
        print(json.dumps({"summary": {"best_model": best["model"], "best_tps": best["tokens_per_s"], "tested": len(MODELS), "succeeded": len(ok)}}))


if __name__ == "__main__":
    asyncio.run(main())
