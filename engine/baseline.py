"""Baseline streaming benchmark against FCC /v1/messages (Anthropic Messages API)."""
from __future__ import annotations

import asyncio
import json
import time
from dataclasses import dataclass
from typing import Optional

import httpx

BASE_URL = "http://127.0.0.1:8082"
DEFAULT_MODEL = "groq/qwen/qwen3.8-27b"


@dataclass
class BaselineResult:
    model: str
    ok: bool
    first_token_s: Optional[float]
    total_s: Optional[float]
    output_chars: int
    output_tokens_approx: int
    tokens_per_s: Optional[float]
    error: Optional[str] = None


def count_tokens(text: str) -> int:
    return len(text.split())


async def stream_once(
    client: httpx.AsyncClient,
    model: str,
    prompt: str,
    max_tokens: int = 2048,
    timeout: float = 180.0,
) -> BaselineResult:
    t_start = time.monotonic()
    t_first: Optional[float] = None
    chunks: list[str] = []
    try:
        async with client.stream(
            "POST",
            f"{BASE_URL}/v1/messages",
            json={
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": max_tokens,
                "stream": True,
                "temperature": 0.3,
            },
            timeout=timeout,
        ) as resp:
            if resp.status_code >= 400:
                body = (await resp.aread()).decode(errors="replace")
                return BaselineResult(
                    model=model, ok=False, first_token_s=None, total_s=None,
                    output_chars=0, output_tokens_approx=0, tokens_per_s=None,
                    error=f"HTTP {resp.status_code}: {body[:300]}",
                )
            async for raw in resp.aiter_lines():
                if not raw.strip():
                    continue
                if raw.startswith("data:"):
                    payload = raw[5:].strip()
                    try:
                        data = json.loads(payload)
                    except json.JSONDecodeError:
                        continue
                    delta = data.get("delta", {})
                    content = delta.get("text")
                    if content:
                        if t_first is None:
                            t_first = time.monotonic() - t_start
                        chunks.append(content)
                    if data.get("type") == "message_stop":
                        break
    except Exception as exc:  # noqa: BLE001
        text = "".join(chunks)
        return BaselineResult(
            model=model, ok=False, first_token_s=t_first,
            total_s=time.monotonic() - t_start, output_chars=len(text),
            output_tokens_approx=count_tokens(text), tokens_per_s=None,
            error=f"{type(exc).__name__}: {exc}",
        )

    total_s = time.monotonic() - t_start
    text = "".join(chunks)
    output_tokens = count_tokens(text)
    tokens_per_s = (output_tokens / total_s) if total_s > 0 else None
    return BaselineResult(
        model=model, ok=True, first_token_s=t_first, total_s=total_s,
        output_chars=len(text), output_tokens_approx=output_tokens,
        tokens_per_s=tokens_per_s,
    )


async def main() -> None:
    model = DEFAULT_MODEL
    prompt = (
        "Write a detailed technical design document for an asynchronous multi-model "
        "LLM execution engine targeting 10,000 aggregate output tokens/second using "
        "free inference only. Cover architecture, async HTTP execution, bounded "
        "concurrent request scheduling, per-model worker pools, task classification "
        "and routing, adaptive concurrency control, streaming token aggregation, "
        "retry/backoff with jitter, circuit breakers, request cancellation, "
        "structured task contracts, result validation, and persistent execution "
        "metrics. Include example JSON schemas for task contracts and results, and "
        "pseudocode for the scheduler loop, adaptive controller, and circuit breaker. "
        "Be thorough and concrete."
    )
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        res = await stream_once(client, model, prompt)
    out = {
        "model": res.model,
        "ok": res.ok,
        "first_token_s": round(res.first_token_s, 4) if res.first_token_s is not None else None,
        "total_s": round(res.total_s, 4) if res.total_s is not None else None,
        "output_chars": res.output_chars,
        "output_tokens_approx": res.output_tokens_approx,
        "tokens_per_s_approx": round(res.tokens_per_s, 2) if res.tokens_per_s is not None else None,
        "error": res.error,
    }
    print(json.dumps(out, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
