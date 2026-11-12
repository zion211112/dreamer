"""Probe one model ID on the FCC gateway for streaming support."""
from __future__ import annotations

import asyncio
import json
import sys
import time

import httpx

BASE_URL = "http://127.0.0.1:8082/v1"


async def probe(model: str) -> None:
    t0 = time.monotonic()
    first = None
    n_chars = 0
    status = None
    try:
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=20.0) as client:
            async with client.stream(
                "POST",
                f"{BASE_URL}/chat/completions",
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": "Say hello in one short sentence."}],
                    "stream": True,
                    "max_tokens": 40,
                },
                timeout=20.0,
            ) as resp:
                status = resp.status_code
                if status >= 400:
                    body = (await resp.aread()).decode(errors="replace")
                    print(json.dumps({"model": model, "status": status, "ok": False, "error": body[:200]}))
                    return
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
        print(json.dumps({"model": model, "ok": False, "error": f"{type(exc).__name__}: {exc}", "elapsed": round(time.monotonic() - t0, 3)}))
        return
    print(json.dumps({
        "model": model, "status": status, "ok": True,
        "first_token_s": round(first, 3) if first is not None else None,
        "elapsed_s": round(time.monotonic() - t0, 3), "chars": n_chars,
    }))


if __name__ == "__main__":
    asyncio.run(probe(sys.argv[1]))
