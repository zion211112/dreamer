#!/usr/bin/env python3
"""
engine_http_server.py — OpenAI-compatible HTTP wrapper around the
APT-LABS multi-model engine (FCC + Bifrost dual-gateway).

Endpoints:
  POST /v1/chat/completions   -> routes through MultiModelPipeline (FCC primary, Bifrost fallback)
  GET  /v1/models             -> lists engine-registered models
  GET  /health                -> liveness

Run:
  engine/.venv/Scripts/python.exe engine/engine_http_server.py --port 9000

DSH cordis provider config (cordis.patch.yml):
  providers:
    engine:
      displayName: Multi-Model Engine (FCC+Bifrost)
      api: openai-compatible
      baseURL: http://127.0.0.1:9000/v1
      models:
        - id: engine/multi-model
          name: Engine (FCC+Bifrost)
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
import time
import uuid
from pathlib import Path
from typing import Any

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from engine.multi_model_pipeline import (  # noqa: E402
    MultiModelPipeline,
    TaskComplexity,
)

app = FastAPI(title="APT-LABS Multi-Model Engine HTTP Wrapper")

_pipeline: MultiModelPipeline | None = None
_pipeline_lock = asyncio.Lock()


async def get_pipeline() -> MultiModelPipeline:
    global _pipeline
    async with _pipeline_lock:
        if _pipeline is None:
            _pipeline = MultiModelPipeline()
        return _pipeline


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatCompletionRequest(BaseModel):
    model: str = "engine/multi-model"
    messages: list[ChatMessage]
    temperature: float | None = 0.3
    max_tokens: int | None = 1024
    stream: bool = False
    complexity: str | None = None
    gateway: str | None = "fcc"
    preferred_models: list[str] | None = None


class ModelInfo(BaseModel):
    id: str
    object: str = "model"
    created: int = 0
    owned_by: str = "apt-labs"


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "apt-labs-engine"}


@app.get("/v1/models")
async def list_models() -> dict[str, Any]:
    pipeline = await get_pipeline()
    leaderboard = pipeline.get_leaderboard()
    models = [{"id": e["model"], "object": "model", "created": 0, "owned_by": e["provider"]} for e in leaderboard]
    models.insert(0, {"id": "engine/multi-model", "object": "model", "created": 0, "owned_by": "apt-labs"})
    return {"object": "list", "data": models}


@app.post("/v1/chat/completions")
async def chat_completions(req: ChatCompletionRequest) -> dict[str, Any]:
    pipeline = await get_pipeline()
    prompt = "\n".join(f"{m.role}: {m.content}" for m in req.messages)
    comp = None
    if req.complexity:
        try:
            comp = TaskComplexity(req.complexity)
        except ValueError:
            comp = None
    gateway = req.gateway or "fcc"

    try:
        result = await pipeline.run(
            prompt=prompt,
            max_tokens=req.max_tokens or 1024,
            complexity=comp,
            gateway=gateway,
            preferred_models=req.preferred_models,
            warmup=True,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    if result.get("error"):
        raise HTTPException(status_code=502, detail=result["error"])

    created = int(time.time())
    model_id = result.get("selected_model", "engine/multi-model")

    if not req.stream:
        return {
            "id": f"chatcmpl-{uuid.uuid4().hex[:24]}",
            "object": "chat.completion",
            "created": created,
            "model": model_id,
            "choices": [
                {
                    "index": 0,
                    "message": {"role": "assistant", "content": result.get("result", "")},
                    "finish_reason": "stop",
                }
            ],
            "usage": {
                "prompt_tokens": len(prompt.split()),
                "completion_tokens": len(result.get("result", "").split()),
                "total_tokens": len(prompt.split()) + len(result.get("result", "").split()),
            },
            "engine_meta": {
                "gateway": result.get("gateway"),
                "aggregate_tps": result.get("aggregate_tps"),
                "best_model": result.get("selected_model"),
                "all_results": result.get("all_results"),
            },
        }

    async def stream_generator():
        output = result.get("result", "")
        chunk_size = 40
        for i in range(0, len(output), chunk_size):
            chunk = output[i:i + chunk_size]
            data = {
                "id": f"chatcmpl-{uuid.uuid4().hex[:24]}",
                "object": "chat.completion.chunk",
                "created": created,
                "model": model_id,
                "choices": [{"index": 0, "delta": {"content": chunk}, "finish_reason": None}],
            }
            yield f"data: {json.dumps(data)}\n\n"
            await asyncio.sleep(0.01)
        yield "data: [DONE]\n\n"

    return StreamingResponse(stream_generator(), media_type="text/event-stream")


def main() -> None:
    parser = argparse.ArgumentParser(description="APT-LABS Engine HTTP Wrapper")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=9000)
    args = parser.parse_args()
    uvicorn.run(app, host=args.host, port=args.port, log_level="info")


if __name__ == "__main__":
    main()
