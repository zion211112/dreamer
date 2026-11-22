#!/usr/bin/env python3
"""
Multi-Model 10k tokens/s Pipeline — Production Engine (DSH Agent Orchestrator).

Architecture:
  TaskIn -> ComplexityRouter -> ModelRegistry (auto-sort by measured tok/s)
        -> BatchOrchestrator (parallel calls + batch prompts per model)
        -> ResultAggregator -> TaskOut

Throughput-first: max aggregate tok/s, accept slow starters.
Quality-aware: complex tasks route to stronger models even if slower.

Key optimizations for 10k/s target:
- Batching: multiple prompts per model call reduces HTTP overhead
- Connection pooling: persistent httpx client with keep-alive
- Circuit breaking: failing models are tripped and excluded
- Auto-scaling: concurrency scales to measured healthy model count
- Subagent parallel: each subagent runs its own pipeline instance
"""

from __future__ import annotations

import asyncio
import json
import time
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Any


class TaskComplexity(Enum):
    CODING = "coding"
    REASONING = "reasoning"
    MIXED = "mixed"


@dataclass
class ModelEntry:
    id: str
    provider: str
    base_url: str
    display_name: str
    max_tokens: int
    reasoning: str
    measured_tps: float = 0.0
    measured_latency: float = 0.0
    success_count: int = 0
    failure_count: int = 0
    last_used: float = 0.0
    circuit_open: bool = False
    circuit_tripped_at: float = 0.0
    quality_tier: int = 1


@dataclass
class TaskResult:
    task_id: str
    model_id: str
    provider: str
    output: str
    output_tokens: int
    total_seconds: float
    tokens_per_second: float
    success: bool
    error: str | None = None


class ComplexityRouter:
    CODING_KEYWORDS = [
        "code", "function", "class", "import", "def ", "async", "await",
        "refactor", "debug", "bug", "fix", "implement", "script", "api",
        "endpoint", "database", "sql", "test", "typescript", "python",
        "javascript", "vue", "react", "component", "hook",
    ]
    REASONING_KEYWORDS = [
        "analyze", "reason", "compare", "evaluate", "decide", "strategy",
        "plan", "architecture", "design", "explain why", "pros and cons",
        "trade-off", "synthesize", "deduce", "infer", "conclude",
        "mathematical", "proof", "theorem", "logic", "puzzle",
    ]

    def classify(self, prompt: str, hint: TaskComplexity | None = None) -> TaskComplexity:
        if hint is not None:
            return hint
        text = prompt.lower()
        coding_score = sum(1 for k in self.CODING_KEYWORDS if k in text)
        reasoning_score = sum(1 for k in self.REASONING_KEYWORDS if k in text)
        if coding_score > reasoning_score:
            return TaskComplexity.CODING
        if reasoning_score > coding_score:
            return TaskComplexity.REASONING
        return TaskComplexity.MIXED


class ModelRegistry:
    def __init__(self, config_path: str | Path | None = None):
        self.models: dict[str, ModelEntry] = {}
        self.config_path = config_path
        self._lock = asyncio.Lock()
        self._load_builtin()

    def _load_builtin(self) -> None:
        seeded = [
            # Coding-optimized (fast, low reasoning)
            ModelEntry("groq/qwen/qwen3.8-27b", "groq", "https://api.groq.com/openai/v1",
                       "Qwen 3.8 27B", 32768, "low", quality_tier=2),
            ModelEntry("groq/qwen/qwen3.5-flash-02-23", "groq", "https://api.groq.com/openai/v1",
                       "Qwen 3.5 Flash", 32768, "low", quality_tier=3),
            ModelEntry("groq/llama-3.1-8b-instant", "groq", "https://api.groq.com/openai/v1",
                       "Llama 3.1 8B Instant", 8192, "low", quality_tier=3),
            ModelEntry("groq/llama-3.3-70b-versatile", "groq", "https://api.groq.com/openai/v1",
                       "Llama 3.3 70B Versatile", 32768, "medium", quality_tier=2),
            # NVIDIA NIM (current primary model + variants)
            ModelEntry("nvidia/nemotron-3.5-super-vl-120b-a12b", "nvidia_nim",
                       "https://integrate.api.nvidia.com/v1",
                       "Nemotron 3.5 Super VL 120B", 4096, "medium", quality_tier=1),
            ModelEntry("nvidia/nemotron-3.5-lightning", "nvidia_nim",
                       "https://integrate.api.nvidia.com/v1",
                       "Nemotron 3.5 Lightning", 4096, "low", quality_tier=2),
            ModelEntry("nvidia/nemotron-3-ultra-550b-a55b", "nvidia_nim",
                       "https://integrate.api.nvidia.com/v1",
                       "Nemotron 3 Ultra 550B", 4096, "high", quality_tier=1),
            # Gemini
            ModelEntry("google/gemini-2.5-flash-lite", "gemini",
                       "https://generativelanguage.googleapis.com/v1",
                       "Gemini 2.5 Flash Lite", 8192, "low", quality_tier=3),
            ModelEntry("google/gemini-2.5-flash", "gemini",
                       "https://generativelanguage.googleapis.com/v1",
                       "Gemini 2.5 Flash", 8192, "medium", quality_tier=2),
            ModelEntry("google/gemini-2.5-pro", "gemini",
                       "https://generativelanguage.googleapis.com/v1",
                       "Gemini 2.5 Pro", 32768, "high", quality_tier=1),
            # SambaNova
            ModelEntry("sambanova/minimax-m3.1-flash", "sam",
                       "https://api.sambanova.ai/v1",
                       "Minimax M3.1 Flash", 8192, "low", quality_tier=3),
            # DeepSeek
            ModelEntry("deepseek/deepseek-chat", "deepseek",
                       "https://api.deepseek.com/v1",
                       "DeepSeek Chat", 32768, "medium", quality_tier=1),
            ModelEntry("deepseek/deepseek-coder", "deepseek",
                       "https://api.deepseek.com/v1",
                       "DeepSeek Coder", 32768, "low", quality_tier=2),
            # Kilo
            ModelEntry("kilo/nvidia/nemotron-3.5-super-vl", "kilo",
                       "https://api.kilo.chat/v1",
                       "Nemotron 3.5 Super VL (Kilo)", 4096, "medium", quality_tier=2),
            ModelEntry("kilo/nvidia/nemotron-3-ultra-550b-a55b", "kilo",
                       "https://api.kilo.chat/v1",
                       "Nemotron 3 Ultra 550B (Kilo)", 4096, "high", quality_tier=1),
            # Agnes
            ModelEntry("agnes/agnes-3.0-flash", "agnes",
                       "https://api.agnes.ai/v1",
                       "Agnes 3.0 Flash", 4096, "low", quality_tier=3),
            ModelEntry("agnes/agnes-2.5-flash", "agnes",
                       "https://api.agnes.ai/v1",
                       "Agnes 2.5 Flash", 4096, "low", quality_tier=3),
            # LLM7
            ModelEntry("llm7/deepseek-v4-pro", "llm7",
                       "https://api.llm7.ai/v1",
                       "DeepSeek V4 Pro (LLM7)", 32768, "medium", quality_tier=1),
            ModelEntry("llm7/glm-5.3", "llm7",
                       "https://api.llm7.ai/v1",
                       "GLM 5.3 (LLM7)", 8192, "medium", quality_tier=2),
            # Zenmux
            ModelEntry("zenmux/z-ai/glm-5.3-flash", "zenmux",
                       "https://api.zenmux.ai/v1",
                       "GLM 5.3 Flash (Zenmux)", 8192, "low", quality_tier=3),
            ModelEntry("zenmux/z-ai/glm-5.3", "zenmux",
                       "https://api.zenmux.ai/v1",
                       "GLM 5.3 (Zenmux)", 8192, "medium", quality_tier=2),
            # OpenCode
            ModelEntry("opencode/deepseek-v4-flash", "opencode",
                       "https://api.opencode.ai/v1",
                       "DeepSeek V4 Flash (OpenCode)", 32768, "low", quality_tier=2),
            ModelEntry("opencode/qwen3.8-max", "opencode",
                       "https://api.opencode.ai/v1",
                       "Qwen 3.8 Max (OpenCode)", 32768, "medium", quality_tier=2),
            # Alibaba Cloud DashScope
            ModelEntry("alibaba/qwen3-235b-a22b", "alibaba",
                       "https://dashscope.aliyuncs.com/compatible-mode/v1",
                       "Qwen 3 235B (Alibaba)", 32768, "medium", quality_tier=1),
            ModelEntry("alibaba/qwen-turbo", "alibaba",
                       "https://dashscope.aliyuncs.com/compatible-mode/v1",
                       "Qwen Turbo (Alibaba)", 8192, "low", quality_tier=3),
            # Gonka Proxy
            ModelEntry("gonka/default", "gonka",
                       "https://proxy.gonkabroker.com/v1",
                       "Gonka Default", 4096, "medium", quality_tier=3),
            # Synap
            ModelEntry("synap/default", "synap",
                       "https://synap402.com/v1",
                       "Synap Default", 4096, "medium", quality_tier=3),
            # OpenRouter (free models)
            ModelEntry("openrouter/meta-llama/llama-3.1-8b-instruct:free", "openrouter",
                       "https://openrouter.ai/api/v1",
                       "Llama 3.1 8B (OpenRouter Free)", 8192, "low", quality_tier=3),
            ModelEntry("openrouter/google/gemma-2-9b-it:free", "openrouter",
                       "https://openrouter.ai/api/v1",
                       "Gemma 2 9B (OpenRouter Free)", 8192, "low", quality_tier=3),
            ModelEntry("openrouter/microsoft/phi-3-medium-128k-instruct:free", "openrouter",
                       "https://openrouter.ai/api/v1",
                       "Phi-3 Medium (OpenRouter Free)", 8192, "low", quality_tier=3),
            # Together AI
            ModelEntry("together/meta-llama/Llama-3.3-70B-Instruct-Turbo", "together",
                       "https://api.together.xyz/v1",
                       "Llama 3.3 70B (Together)", 8192, "medium", quality_tier=2),
            ModelEntry("together/Qwen/Qwen2.5-72B-Instruct-Turbo", "together",
                       "https://api.together.xyz/v1",
                       "Qwen 2.5 72B (Together)", 8192, "medium", quality_tier=2),
            # Fireworks AI
            ModelEntry("fireworks/accounts/fireworks/models/llama-v3.1-8b-instruct", "fireworks",
                       "https://api.fireworks.ai/inference/v1",
                       "Llama 3.1 8B (Fireworks)", 8192, "low", quality_tier=3),
            ModelEntry("fireworks/accounts/fireworks/models/qwen2-p72b-instruct", "fireworks",
                       "https://api.fireworks.ai/inference/v1",
                       "Qwen 2 72B (Fireworks)", 8192, "medium", quality_tier=2),
            # Mistral AI
            ModelEntry("mistral/mistral-nemo", "mistral",
                       "https://api.mistral.ai/v1",
                       "Mistral Nemo", 8192, "medium", quality_tier=2),
            ModelEntry("mistral/mistral-small", "mistral",
                       "https://api.mistral.ai/v1",
                       "Mistral Small", 8192, "medium", quality_tier=2),
            # Perplexity
            ModelEntry("perplexity/llama-3.1-sonar-small-128k-online", "perplexity",
                       "https://api.perplexity.ai",
                       "Sonar Small (Perplexity)", 8192, "medium", quality_tier=2),
        ]
        for m in seeded:
            self.models[m.id] = m

    def register(self, model: ModelEntry) -> None:
        self.models[model.id] = model

    def get(self, model_id: str) -> ModelEntry | None:
        return self.models.get(model_id)

    def all_healthy(self) -> list[ModelEntry]:
        return [m for m in self.models.values() if not m.circuit_open]

    def record_result(self, model_id: str, result: TaskResult) -> None:
        m = self.models.get(model_id)
        if not m:
            return
        if result.success:
            m.success_count += 1
            m.measured_tps = result.tokens_per_second
            m.measured_latency = result.total_seconds
            m.last_used = time.time()
            m.circuit_open = False
        else:
            m.failure_count += 1
            if m.failure_count >= 3:
                m.circuit_open = True
                m.circuit_tripped_at = time.time()

    def reset_circuit(self, model_id: str) -> None:
        m = self.models.get(model_id)
        if m:
            m.circuit_open = False
            m.failure_count = 0

    def sort_by_tps(self, healthy_only: bool = True) -> list[ModelEntry]:
        candidates = self.all_healthy() if healthy_only else list(self.models.values())
        return sorted(candidates, key=lambda m: m.measured_tps, reverse=True)

    def select_for_complexity(self, complexity: TaskComplexity,
                              preferred: list[str] | None = None) -> list[ModelEntry]:
        healthy = self.all_healthy()

        if complexity == TaskComplexity.REASONING:
            candidates = [m for m in healthy if m.quality_tier <= 2]
        elif complexity == TaskComplexity.CODING:
            candidates = [m for m in healthy if m.quality_tier <= 3]
        else:
            candidates = healthy

        if not candidates:
            candidates = healthy

        pref_models: list[ModelEntry] = []
        if preferred:
            pref_by_id = {m.id: m for m in healthy if m.id in preferred}
            for pid in preferred:
                if pid in pref_by_id:
                    pref_models.append(pref_by_id[pid])
            rest = [m for m in candidates if m.id not in preferred]
        else:
            rest = candidates

        return pref_models + sorted(rest, key=lambda m: m.measured_tps, reverse=True)

    def healthy_count(self) -> int:
        return len(self.all_healthy())


class BatchOrchestrator:
    def __init__(self, registry: ModelRegistry,
                 bifrost_url: str = "http://127.0.0.1:8080",
                 fcc_url: str = "http://127.0.0.1:8082"):
        self.registry = registry
        self.bifrost_url = bifrost_url
        self.fcc_url = fcc_url
        self._session: Any = None

    async def _get_client(self):
        if self._session is None:
            import httpx
            self._session = httpx.AsyncClient(
                timeout=httpx.Timeout(120.0),
                limits=httpx.Limits(max_keepalive_connections=20, max_connections=100),
            )
        return self._session

    async def run_parallel(self, task: TaskRequest,
                           models: list[ModelEntry],
                           max_concurrent: int = 8) -> list[TaskResult]:
        semaphore = asyncio.Semaphore(max_concurrent)
        results: list[TaskResult] = []

        async def call_one(m: ModelEntry) -> TaskResult:
            async with semaphore:
                return await self._call_model(task, m)

        tasks = [asyncio.create_task(call_one(m)) for m in models]
        for coro in asyncio.as_completed(tasks):
            result = await coro
            results.append(result)
            self.registry.record_result(result.model_id, result)
        return results

    async def run_batch(self, prompts: list[str],
                        model_id: str,
                        max_tokens: int = 1024,
                        temperature: float = 0.3,
                        complexity: TaskComplexity = TaskComplexity.MIXED,
                        max_concurrent: int = 8) -> list[TaskResult]:
        """Send multiple prompts to the same model concurrently (batching).
        
        Each prompt gets its own model call; they run concurrently over a
        shared connection pool for maximum throughput.
        """
        model = self.registry.get(model_id)
        if not model:
            return [TaskResult(task_id="batch", model_id=model_id, provider="",
                              output="", output_tokens=0, total_seconds=0.0,
                              tokens_per_second=0.0, success=False,
                              error=f"Model {model_id} not found")]

        semaphore = asyncio.Semaphore(max_concurrent)
        results: list[TaskResult] = []

        async def call_one(idx: int, prompt: str) -> TaskResult:
            async with semaphore:
                task = TaskRequest(
                    id=f"batch-{idx}",
                    prompt=prompt,
                    complexity=complexity,
                    max_tokens=max_tokens,
                    temperature=temperature,
                )
                return await self._call_model(task, model)

        tasks = [asyncio.create_task(call_one(i, p)) for i, p in enumerate(prompts)]
        for coro in asyncio.as_completed(tasks):
            result = await coro
            results.append(result)
            self.registry.record_result(result.model_id, result)
        return results

    async def run_throughput_sweep(self, task: TaskRequest,
                                   concurrency_levels: list[int] = [1, 2, 4, 8, 16, 32, 64],
                                   models_per_level: int | None = None) -> dict:
        sorted_models = self.registry.sort_by_tps()
        if not sorted_models:
            return {"error": "no healthy models"}

        if models_per_level is None:
            models_per_level = len(sorted_models)

        sweep_results = []
        for n in concurrency_levels:
            selected = sorted_models[:min(n, models_per_level)]
            if not selected:
                continue
            start = time.perf_counter()
            results = await self.run_parallel(task, selected, max_concurrent=len(selected))
            wall = time.perf_counter() - start
            total_out = sum(r.output_tokens for r in results if r.success)
            agg_tps = total_out / wall if wall > 0 else 0.0
            ok = sum(1 for r in results if r.success)
            sweep_results.append({
                "n": n,
                "wall_s": round(wall, 3),
                "total_out": total_out,
                "agg_tps": round(agg_tps, 2),
                "ok": ok,
                "total": len(selected),
                "models": [r.model_id for r in results],
            })

        best = max(sweep_results, key=lambda r: r["agg_tps"]) if sweep_results else None
        return {"sweep": sweep_results, "best": best}

    async def health_check(self, max_concurrent: int = 16) -> dict[str, bool]:
        """Probe every model once with a tiny request; mark unhealthy ones circuit-open."""
        semaphore = asyncio.Semaphore(max_concurrent)
        results: dict[str, bool] = {}

        async def probe_one(m: ModelEntry) -> None:
            async with semaphore:
                task = TaskRequest(
                    id=f"health-{m.id}",
                    prompt="hi",
                    complexity=TaskComplexity.CODING,
                    max_tokens=5,
                )
                result = await self._call_model(task, m)
                results[m.id] = result.success
                if not result.success:
                    m.failure_count += 1
                    m.circuit_open = True
                else:
                    m.circuit_open = False
                    m.failure_count = 0

        await asyncio.gather(*[probe_one(m) for m in self.registry.models.values()])
        return results

    async def _call_model(self, task: TaskRequest, model: ModelEntry) -> TaskResult:
        t0 = time.perf_counter()
        client = await self._get_client()

        url = f"{self.bifrost_url}/anthropic/v1/messages"
        payload = {
            "model": model.id,
            "max_tokens": task.max_tokens,
            "temperature": task.temperature,
            "messages": [{"role": "user", "content": task.prompt}],
        }
        headers = {
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }

        try:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code >= 400:
                return await self._call_fcc(task, model, t0)
            data = resp.json()
            output = data.get("content", "")
            if isinstance(output, list):
                output = "".join(block.get("text", "") for block in output)
            output_tokens = data.get("usage", {}).get("output_tokens", len(output.split()))
            total_s = time.perf_counter() - t0
            return TaskResult(
                task_id=task.id, model_id=model.id, provider=model.provider,
                output=output, output_tokens=output_tokens,
                total_seconds=total_s,
                tokens_per_second=round(output_tokens / total_s, 2) if total_s > 0 else 0.0,
                success=True,
            )
        except Exception as exc:
            return await self._call_fcc(task, model, t0)

    async def _call_fcc(self, task: TaskRequest, model: ModelEntry, t0: float) -> TaskResult:
        client = await self._get_client()
        url = f"{self.fcc_url}/v1/messages"
        payload = {
            "model": model.id,
            "max_tokens": task.max_tokens,
            "messages": [{"role": "user", "content": task.prompt}],
        }
        headers = {
            "anthropic-version": "2023-06-01",
            "x-api-key": "fcc",
            "content-type": "application/json",
        }
        try:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code >= 400:
                return TaskResult(task_id=task.id, model_id=model.id, provider=model.provider,
                                  output="", output_tokens=0, total_seconds=0.0,
                                  tokens_per_second=0.0, success=False,
                                  error=f"FCC HTTP {resp.status_code}")
            data = resp.json()
            output = data.get("content", "")
            if isinstance(output, list):
                output = "".join(block.get("text", "") for block in output)
            output_tokens = data.get("usage", {}).get("output_tokens", len(output.split()))
            total_s = time.perf_counter() - t0
            return TaskResult(
                task_id=task.id, model_id=model.id, provider=model.provider,
                output=output, output_tokens=output_tokens,
                total_seconds=total_s,
                tokens_per_second=round(output_tokens / total_s, 2) if total_s > 0 else 0.0,
                success=True,
            )
        except Exception as exc:
            return TaskResult(task_id=task.id, model_id=model.id, provider=model.provider,
                              output="", output_tokens=0, total_seconds=0.0,
                              tokens_per_second=0.0, success=False, error=str(exc))

    async def close(self):
        if self._session:
            await self._session.aclose()
            self._session = None


class ResultAggregator:
    @staticmethod
    def select_best(results: list[TaskResult]) -> TaskResult | None:
        successful = [r for r in results if r.success]
        if not successful:
            return None
        return max(successful, key=lambda r: (r.tokens_per_second, -r.total_seconds))

    @staticmethod
    def merge(results: list[TaskResult]) -> str:
        parts = []
        for r in results:
            if r.success and r.output.strip():
                parts.append(f"### {r.model_id} ({r.provider}) — {r.tokens_per_second} tok/s\n{r.output}")
        return "\n\n".join(parts) if parts else "All models failed."


class SubagentConnector:
    def __init__(self, agent_name: str, preferred_model: str | None = None,
                 complexity: TaskComplexity | None = None,
                 config_path: str | Path | None = None):
        self.agent_name = agent_name
        self.preferred_model = preferred_model
        self.default_complexity = complexity
        self.pipeline = MultiModelPipeline(config_path)

    async def execute(self, prompt: str, task_id: str | None = None,
                      max_tokens: int = 1024,
                      override_model: str | None = None,
                      override_complexity: TaskComplexity | None = None) -> dict:
        model = override_model or self.preferred_model
        comp = override_complexity or self.default_complexity
        preferred = [model] if model else None
        return await self.pipeline.run(
            prompt=prompt,
            task_id=task_id or f"{self.agent_name}-{int(time.time()*1000)}",
            complexity=comp,
            max_tokens=max_tokens,
            preferred_models=preferred,
        )

    async def close(self):
        await self.pipeline.close()


class MultiModelPipeline:
    def __init__(self, config_path: str | Path | None = None):
        self.router = ComplexityRouter()
        self.registry = ModelRegistry(config_path)
        self.orchestrator = BatchOrchestrator(self.registry)
        self.aggregator = ResultAggregator()

    async def run(self, prompt: str, task_id: str | None = None,
                  complexity: TaskComplexity | None = None,
                  max_tokens: int = 1024,
                  preferred_models: list[str] | None = None,
                  sweep: bool = False) -> dict:
        task_id = task_id or f"task-{int(time.time()*1000)}"
        comp = self.router.classify(prompt, complexity)
        task = TaskRequest(id=task_id, prompt=prompt, complexity=comp,
                           max_tokens=max_tokens, preferred_models=preferred_models)

        if sweep:
            sweep_data = await self.orchestrator.run_throughput_sweep(task)
            best = sweep_data.get("best")
            best_model_id = best["models"][0] if best and best["models"] else None
            best_model = self.registry.get(best_model_id) if best_model_id else None
            return {
                "task_id": task_id,
                "complexity": comp.value,
                "sweep": sweep_data,
                "selected_model": best_model.id if best_model else None,
            }

        candidates = self.registry.select_for_complexity(comp, preferred_models)
        if not candidates:
            return {"task_id": task_id, "error": "no healthy models available"}

        selected = candidates[:3]
        results = await self.orchestrator.run_parallel(task, selected, max_concurrent=len(selected))
        best = self.aggregator.select_best(results)
        merged = self.aggregator.merge(results)

        agg_tps = sum(r.tokens_per_second for r in results if r.success)

        return {
            "task_id": task_id,
            "complexity": comp.value,
            "selected_model": best.model_id if best else None,
            "result": merged,
            "best_result": {
                "model": best.model_id if best else None,
                "tokens_per_second": best.tokens_per_second if best else 0,
                "total_seconds": best.total_seconds if best else 0,
            } if best else None,
            "all_results": [
                {
                    "model": r.model_id,
                    "provider": r.provider,
                    "tokens_per_second": r.tokens_per_second,
                    "success": r.success,
                    "error": r.error,
                } for r in results
            ],
            "aggregate_tps": round(agg_tps, 2),
        }

    async def simulate_subagents(self, n_agents: int = 6,
                                 prompts_per_agent: int = 1,
                                 max_tokens: int = 512,
                                 complexity: TaskComplexity | None = None,
                                 max_concurrent: int = 64) -> dict:
        healthy = self.registry.all_healthy()
        if not healthy:
            return {"error": "no healthy models", "n_agents": n_agents}

        models = self.registry.sort_by_tps()
        agent_models = [models[i % len(models)] for i in range(n_agents)]

        prompts = [
            "Write a Python function to calculate fibonacci with memoization.",
            "Explain how transformer attention works in two paragraphs.",
            "Compare monolithic vs microservices architecture trade-offs.",
            "Write a SQL query to find the second-highest salary per department.",
            "Analyze the pros and cons of async vs sync programming.",
        ][:prompts_per_agent]

        async def run_subagent(idx: int, model: ModelEntry) -> dict:
            connector = SubagentConnector(
                agent_name=f"subagent-{idx}",
                preferred_model=model.id,
                complexity=complexity,
            )
            agent_start = time.perf_counter()
            agent_results = []
            for j, prompt in enumerate(prompts):
                result = await connector.execute(
                    prompt,
                    task_id=f"subagent-{idx}-task-{j}",
                    max_tokens=max_tokens,
                )
                agent_results.append(result)
            agent_wall = time.perf_counter() - agent_start
            agent_tps = sum(r.get("aggregate_tps", 0) for r in agent_results)
            await connector.close()
            return {
                "agent": idx,
                "model": model.id,
                "provider": model.provider,
                "wall_s": round(agent_wall, 3),
                "tps": round(agent_tps, 2),
                "results": agent_results,
            }

        semaphore = asyncio.Semaphore(max_concurrent)
        async def run_with_sem(idx: int, model: ModelEntry) -> dict:
            async with semaphore:
                return await run_subagent(idx, model)

        overall_start = time.perf_counter()
        agent_results = await asyncio.gather(
            *[run_with_sem(i, m) for i, m in enumerate(agent_models)]
        )
        overall_wall = time.perf_counter() - overall_start

        total_tps = sum(r["tps"] for r in agent_results)
        total_prompts = n_agents * prompts_per_agent
        successful = sum(
            1 for r in agent_results
            for ar in r["results"]
            if ar.get("best_result") and ar["best_result"].get("model")
        )

        return {
            "n_agents": n_agents,
            "prompts_per_agent": prompts_per_agent,
            "total_prompts": total_prompts,
            "wall_s": round(overall_wall, 3),
            "aggregate_tps": round(total_tps, 2),
            "successful": successful,
            "gap_to_10k": round(10000 / total_tps, 1) if total_tps > 0 else None,
            "per_agent": agent_results,
        }

    def get_leaderboard(self) -> list[dict]:
        return [
            {
                "model": m.id,
                "provider": m.provider,
                "tps": round(m.measured_tps, 2),
                "quality_tier": m.quality_tier,
                "reasoning": m.reasoning,
                "success": m.success_count,
                "failures": m.failure_count,
                "circuit_open": m.circuit_open,
            } for m in self.registry.sort_by_tps()
        ]

    async def close(self):
        await self.orchestrator.close()


async def _main():
    import sys
    pipeline = MultiModelPipeline()
    prompt = sys.argv[1] if len(sys.argv) > 1 else "Write a Python function to fib with memoization."
    result = await pipeline.run(prompt, max_tokens=512)
    print(json.dumps(result, indent=2))
    await pipeline.close()


if __name__ == "__main__":
    asyncio.run(_main())