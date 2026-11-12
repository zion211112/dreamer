"""Probe candidate model IDs on the FCC gateway for streaming support."""
from __future__ import annotations

import asyncio
import json
import time

import httpx

BASE_URL = "http://127.0.0.1:8082/v1"

CANDIDATES = [
    "groq/qwen3.8-27b",
    "groq/qwen/qwen3.8-27b",
    "anthropic/kilo/qwen/qwen3.8-27b",
    "claude-3-freecc-no-thinking/kilo/qwen/qwen3.8-27b",
    "anthropic/kilo/google/gemini-2.5-flash-lite",
    "anthropic/kilo/qwen/qwen3.5-flash-02-23",
    "anthropic/kilo/qwen/qwen3.8-flash",
    "anthropic/kilo/minimax/minimax-m3.1-flash",
]


async def probe(client: httpx.AsyncClient, model: str) -> dict:
    t0 = time.monotonic()
    first = None
    n_chars = 0
    status: int | None = None
    try:
        async with client.stream(
            "POST",
            f"{BASE_URL}/chat/completions",
            json={
                "model": model,
                "messages": [{"role": "user", "content": "Say hello in one short sentence."}],
                "stream": True,
                "max_tokens": 64,
            },
            timeout=60.0,
        ) as resp:
            status = resp.status_code
            if status >= 400:
                body = (await resp.aread()).decode(errors="replace")
                return {"model": model, "status": status, "ok": False, "error": body[:200]}
            async for line in resp.aiter_lines():
                if not line.strip() or not line.startswith("data:"):
                    continue
                payload = line[5:].strip()
                if payload == "[DONE]":
                    break
                try:
                    data = json.loads(payload)
                except json.JSONDecodeError:
                    continue
                content = data.get("choices", [{}])[0].get("delta", {}).get("content")
                if content:
                    if first is None:
                        first = time.monotonic() - t0
                    n_chars += len(content)
    except Exception as exc:  # noqa: BLE001
        return {"model": model, "ok": False, "error": f"{type(exc).__name__}: {exc}", "elapsed": round(time.monotonic() - t0, 3)}
    return {
        "model": model,
        "status": status,
        "ok": True,
        "first_token_s": round(first, 3) if first is not None else None,
        "elapsed_s": round(time.monotonic() - t0, 3),
        "chars": n_chars,
    }


async def main() -> None:
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        for m in CANDIDATES:
            print(json.dumps(await probe(client, m)))


if __name__ == "__main__":
    asyncio.run(main())
