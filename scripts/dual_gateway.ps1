#!/usr/bin/env pwsh
# =====================================================================
# dual_gateway.ps1 — repeatable per-session dual-gateway (Bifrost + FCC)
# setup for the APT-LABS multi-model pipeline.
#
# Run once at the start of every session:
#   .\scripts\dual_gateway.ps1
#
# What it does:
#   1. Confirms both gateways accept TCP (Bifrost :8080, FCC :8082)
#   2. Runs a live warmup + throughput sweep on BOTH gateways
#   3. Persists measured tok/s to engine/.model_profile.json (warm start)
#   4. Prints a per-gateway routing matrix you copy/paste into tasks
# =====================================================================
$ErrorActionPreference = "Continue"
$engine_py = "C:\Users\zION\Documents\dreamer\engine\.venv\Scripts\python.exe"
$ws      = "C:\Users\zION\Documents\dreamer"

Write-Host "== Step 0: gateway TCP check ==" -ForegroundColor Cyan
foreach ($port in 8080, 8082) {
    try {
        $s = New-Object System.Net.Sockets.TcpClient
        $iar = $s.BeginConnect("127.0.0.1", $port, $null, $null)
        $ok  = $iar.AsyncWaitHandle.WaitOne(2000, $false)
        if ($ok) { $s.EndConnect($iar); $s.Close() }
        Write-Host ("  :$port  " + (if ($ok) { "OPEN" } else { "TIMEOUT - not accepting" }))
    } catch {
        Write-Host ("  :$port  ERR: " + $_.Exception.Message)
    }
}

Write-Host "`n== Step 1: warmup + per-gateway sweep (may take 60-120s) ==" -ForegroundColor Cyan

$script = @'
import asyncio, json, sys
sys.path.insert(0, "C:\Users\zION\Documents\dreamer")
from engine.multi_model_pipeline import MultiModelPipeline, TaskComplexity

PROMPT = "Write a short Python function to calculate fibonacci with memoization. Return only code."

async def sweep(gateway):
    p = MultiModelPipeline()
    r = await p.run(PROMPT, max_tokens=512,
                    complexity=TaskComplexity.CODING,
                    warmup=True, gateway=gateway)
    await p.close()
    return {
        "gateway": gateway,
        "aggregate_tps": r.get("aggregate_tps"),
        "selected_model": r.get("selected_model"),
        "best_tps": (r.get("best_result") or {}).get("tokens_per_second"),
        "ok": r.get("error") is None,
        "error": r.get("error"),
        "n_models": len(r.get("all_results") or []),
    }

async def main():
    out = [await sweep("fcc"), await sweep("bifrost")]
    print(json.dumps(out, indent=2))

asyncio.run(main())
'@

$out = & $engine_py -c $script 2>&1
Write-Host $out

Write-Host "`n== Routing matrix (copy into your task) ==" -ForegroundColor Cyan
Write-Host @"
Task type        | Primary gateway | Model tier                    | Why
-----------------|-----------------|-------------------------------|-----------------------------------------
Coding / debug   | Bifrost (:8080) | qwen-coder, deepseek-coder    | code-gen throughput, low latency
Reasoning / plan | FCC (:8082)     | nemotron-ultra, gemini-pro    | best reasoning via fallback pool
Cheap-fast many  | Bifrost (:8080) | smallest healthy model        | aggregate tok/s via concurrency
Cross-review     | other gateway   | same model id                 | never verify your own work
"@

Write-Host "`nDone. engine/.model_profile.json now holds measured tok/s (warm start next session)." -ForegroundColor Green
