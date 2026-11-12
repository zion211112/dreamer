# LLM Execution Engine — Free Inference via FCC Gateway

Lightweight asynchronous multi-model API execution engine targeting high
aggregate output tokens/second using **free inference only** through the local
Free Claude Code (FCC) gateway.

## Gateway reconnaissance (Phase 1)

FCC runs locally on Windows at `http://127.0.0.1:8082`. Key findings:

- **API contract:** FCC exposes **`/v1/messages`** (Anthropic Messages API),
  NOT OpenAI `/v1/chat/completions`. Streaming uses SSE `data:` lines with
  `delta.text` and `message_stop`.
- **Working model:** `groq/qwen/qwen3.8-27b` streams successfully (~29–161
  output tokens/second, variable; first-token latency ~1–16 s).
- Most `kilo/*`-prefixed models return HTTP 200 but empty content; Groq falls
  back through `kilo/stealth/crouton-alpha` → `kilo/nvidia/nemotron-3.5-super-vl:free`.
- FCC config (`~/.fcc/.env`): `PROVIDER_MAX_CONCURRENCY=10`,
  `PROVIDER_RATE_LIMIT=100` per 60 s.

**The target (10,000 aggregate output T/s) is experimental and is NOT
represented as achieved performance.** Single-model measured throughput is in
the tens-to-low-hundreds of tokens/second.

## Engine (Phase 2)

Single event loop, no shared mutable worker context, bounded concurrency:

- `contracts.py` — structured task/result contracts (Pydantic)
- `core.py` — `Engine`: per-model worker pools, bounded concurrency,
  streaming token aggregation, retry/backoff with jitter, circuit breakers,
  request cancellation, result validation
- `adaptive.py` — adaptive concurrency control
- `circuit_breaker.py` — circuit breaker with half-open recovery
- `metrics.py` — persistent append-only JSONL execution metrics
- `cli.py` — CLI (`run`, `bench`, `sweep`)

## Usage

```powershell
$env:PYTHONPATH="src"
python -m engine.cli run "Your prompt here" --model groq/qwen/qwen3.8-27b --max-tokens 512 --concurrency 1
python -m engine.cli sweep --levels "1,2,4,8,16,32" --max-tokens 200
```

## Constraints honored

Free inference only, no paid API fallback, no heavyweight agent framework,
no unrestricted concurrency, no shared mutable worker context, no fake
benchmark results (all numbers are live measurements).
