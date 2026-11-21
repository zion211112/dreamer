#!/usr/bin/env python3
"""Measure REAL aggregate token throughput against the local FCC gateway.

Sequential-by-level sweep: for N in [1,4,8,12], fire N concurrent POST /v1/messages
requests, measure wall clock, sum usage.output_tokens, report aggregate tok/s.
"""
import json
import sys
import threading
import time
import urllib.error
import urllib.request

BASE = "http://127.0.0.1:8082"
URL = BASE + "/v1/messages"
HEADERS = {
    "anthropic-version": "2023-06-01",
    "x-api-key": "fcc",
    "content-type": "application/json",
}
MODEL = "claude-3-freecc-no-thinking/agnes/agnes-2.5-flash"
MAX_TOKENS = 200

# Fresh, fixed prompt per run -> output length comparable across runs.
PROMPT = (
    "Count from 1 to 40 and stop. Output only the numbers, "
    "space-separated, on a single line."
)

RESULTS = []
LOCK = threading.Lock()


def one_request(idx, barrier, results):
    body = json.dumps(
        {
            "model": MODEL,
            "max_tokens": MAX_TOKENS,
            "messages": [{"role": "user", "content": PROMPT}],
        }
    ).encode("utf-8")

    req = urllib.request.Request(URL, data=body, headers=HEADERS, method="POST")
    rec = {"idx": idx, "ok": False, "status": None, "out": 0, "err": None, "elapsed": 0.0}
    barrier.wait()  # release all threads at the same instant
    t0 = time.perf_counter()
    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            raw = resp.read().decode("utf-8", "replace")
            rec["status"] = resp.status
            try:
                data = json.loads(raw)
                rec["out"] = int((data.get("usage") or {}).get("output_tokens") or 0)
                rec["ok"] = True
            except Exception:
                rec["err"] = "unparseable body: " + raw[:200]
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", "replace")
        rec["status"] = e.code
        rec["err"] = "%d %s" % (e.code, raw[:300])
    except Exception as e:
        rec["err"] = "%s: %s" % (type(e).__name__, e)
    finally:
        rec["elapsed"] = time.perf_counter() - t0
    with LOCK:
        results.append(rec)


def run_level(n):
    barrier = threading.Barrier(n)
    results = []
    threads = [
        threading.Thread(target=one_request, args=(i, barrier, results), daemon=True)
        for i in range(n)
    ]
    wall0 = time.perf_counter()
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    wall = time.perf_counter() - wall0

    total_out = sum(r["out"] for r in results)
    ok = [r for r in results if r["ok"]]
    errs = [r for r in results if not r["ok"]]
    lat = sorted(r["elapsed"] for r in results)
    return {
        "n": n,
        "wall": wall,
        "total_out": total_out,
        "agg_tps": (total_out / wall) if wall > 0 else 0.0,
        "ok": len(ok),
        "errors": errs,
        "p50_lat": lat[len(lat) // 2] if lat else 0.0,
        "max_lat": lat[-1] if lat else 0.0,
        "per_req": [r["out"] for r in results],
    }


def main():
    # Warm the provider so the first level is not paying cold-start.
    print("warmup...", flush=True)
    try:
        run_level(1)
    except Exception as e:
        print("warmup failed:", e, flush=True)

    levels = [1, 4, 8, 12]
    rows = []
    for n in levels:
        print("running N=%d ..." % n, flush=True)
        try:
            r = run_level(n)
        except Exception as e:
            print("LEVEL N=%d FAILED to complete: %s" % (n, e), flush=True)
            rows.append({"n": n, "error": str(e)})
            continue
        rows.append(r)
        print(
            "  N=%2d  wall=%6.2fs  out=%5d  agg=%6.2f tok/s  ok=%2d/%2d  p50=%.2fs max=%.2fs"
            % (r["n"], r["wall"], r["total_out"], r["agg_tps"], r["ok"], n, r["p50_lat"], r["max_lat"]),
            flush=True,
        )
        for e in r["errors"]:
            print("    ERR idx=%d: %s" % (e["idx"], e["err"]), flush=True)

    with open("bench_results.json", "w", encoding="utf-8") as f:
        json.dump(rows, f, indent=2)

    print("\n=== TABLE ===")
    print("N\twall_s\ttotal_out\tagg_tok_s\tok\terrors\tp50_s\tmax_s")
    for r in rows:
        if "error" in r:
            print("%s\tFAILED\t%s" % (r["n"], r["error"]))
            continue
        print(
            "%d\t%.2f\t%d\t%.2f\t%d/%d\t%d\t%.2f\t%.2f"
            % (
                r["n"],
                r["wall"],
                r["total_out"],
                r["agg_tps"],
                r["ok"],
                r["n"],
                len(r["errors"]),
                r["p50_lat"],
                r["max_lat"],
            )
        )


if __name__ == "__main__":
    main()
