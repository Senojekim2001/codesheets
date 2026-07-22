---
type: "entry"
domain: "python"
file: "debugging-profiling"
section: "memory-profiling"
id: "memray-allocs"
title: "memray — production-grade allocation tracker with flame graphs"
category: "Memory Profilers"
subtitle: "memray run, memray flamegraph, memray attach, --live, --trace-python-allocators, --native, memray summary, memray flamegraph --diff"
signature_short: "memray run -o out.bin script.py    # then: memray flamegraph out.bin"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "memray — production-grade allocation tracker with flame graphs"
  - "memray-allocs"
tags:
  - "python"
  - "python/debugging-profiling"
  - "python/debugging-profiling/memory-profiling"
  - "category/memory-profilers"
  - "tier/tiered"
---

# memray — production-grade allocation tracker with flame graphs

> memray run, memray flamegraph, memray attach, --live, --trace-python-allocators, --native, memray summary, memray flamegraph --diff

## Overview

memray (Bloomberg, 2022+) is the modern memory profiler for Python. Versus tracemalloc: it sees C-extension allocations (numpy/torch/PIL/PostgreSQL drivers all account correctly), produces flame graphs and tables out of the box, supports --live monitoring and PID attach for diagnosis without code change, and emits a binary file you can re-analyze with different reports. It costs more overhead than tracemalloc (~10-20%) but gives complete signal. The three examples solve the SAME concrete task — your image-processing service grows to 8GB RSS while serving requests; find the allocation sites — at three depths: memray run on a reproducible script → memray attach to a live process and live UI → reading flame graphs vs summary, comparing two runs, and CI leak detection.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Image-processing service grows RSS to 8GB; find allocation sites.
- **Junior** — SAME — but the service is already running; you don't want to stop or modify it. Attach by PID, watch live, dump on demand.
- **Senior** — SAME — production-grade: continuous capture in a sidecar, diff two runs to spot regressions, CI integration that fails a PR if peak RSS grows beyond a threshold.

## Signature

```python
memray run -o out.bin script.py    # then: memray flamegraph out.bin
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Image-processing service grows RSS to 8GB; find allocation sites.
# APPROACH  - 'memray run script.py' captures every alloc; 'memray flamegraph
#             output.bin' opens an interactive HTML flame graph.
# STRENGTHS - Sees Python AND C extensions; flame graph is the gold-standard
#             memory-attribution UI; binary output is reusable.
# WEAKNESSES- Capture has ~10-20% perf overhead; output file can be large
#             on long runs (many GB for hour-long captures).

# Install:
#   $ pip install memray   # Linux + macOS

# script.py — typical "load images and forget to free" pattern.
from PIL import Image
import io

def process_batch(paths):
    out = []
    for p in paths:
        img = Image.open(p).convert("RGB")           # opens AND keeps a buffer
        out.append(img.tobytes())                     # 100s of MB per image
    return out

if __name__ == "__main__":
    process_batch(["a.png", "b.png", "c.png"] * 100)

# Capture allocations.
#   $ memray run -o memray.bin script.py
#   Writing profile results into memray.bin
#   ⠹ Tracking allocations... 8/8 [00:01<00:00,  6.42it/s]
#   memray run -o memray.bin script.py
#
# Open the flame graph in your browser.
#   $ memray flamegraph memray.bin
#   Wrote memray-flamegraph-...html
#   $ open memray-flamegraph-*.html
#
# What the flame graph shows:
#   - X axis = total bytes allocated (NOT time)
#   - Width of a frame = how much memory passed through that call site
#   - Click any frame to zoom; search by function name in top-right
#   - Toggle "Show currently allocated only" to see what is HELD (vs churned)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but the service is already running; you don't want to
#             stop or modify it. Attach by PID, watch live, dump on demand.
# APPROACH  - 'memray attach <PID>' (Linux only) injects the tracker into
#             a running process. 'memray run --live' opens a TUI of live
#             allocations during a fresh run.
# STRENGTHS - Diagnosing a running service without restart or deploy;
#             live TUI surfaces hotspots without waiting for the run to end.
# WEAKNESSES- 'attach' is Linux-only and requires CAP_SYS_PTRACE (same
#             as py-spy). Live capture cannot start mid-allocation; you
#             attach, then watch what allocates AFTER attach time.

# 1) Live TUI during a run — useful for "what's allocating right now?"
#    $ memray run --live python script.py
#    (opens a curses-style TUI with top allocations updating in real time)

# 2) Attach to a running PID (Linux only).
#    $ pgrep -f myapp
#    12345
#    $ sudo memray attach 12345 -o live.bin --duration 60
#    Attached to PID 12345; recording for 60s...
#
#    The target process gains a tracker; existing allocations are NOT
#    re-traced (we don't have allocation history). New allocations from
#    attach time onward are captured.
#
#    $ memray flamegraph live.bin

# 3) Track Python allocator separately — useful when you want to attribute
#    Python obj overhead vs C extension buffers.
#    $ memray run --trace-python-allocators -o trace.bin script.py

# 4) Include native (C) frames in the flame graph — heavier capture.
#    $ memray run --native -o native.bin script.py
#    $ memray flamegraph native.bin
#    (frames now interleave Python and C call sites)

# 5) Tables / summaries you can grep:
#    $ memray summary out.bin
#    $ memray stats   out.bin       # totals, peaks, location of peak
#    $ memray tree    out.bin       # console tree of allocation sites

# 6) Pytest plugin — fail tests that allocate beyond a budget.
#    pip install pytest-memray
#    $ pytest --memray --memray-bin-path=test.bin
#    @pytest.mark.limit_memory("100 MB")
#    def test_keeps_memory_bounded():
#        process_batch(small_paths)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production-grade: continuous capture in a sidecar,
#             diff two runs to spot regressions, CI integration that fails
#             a PR if peak RSS grows beyond a threshold.
# APPROACH  - Periodic short captures (60s) shipped to S3; pytest-memray
#             markers in CI; flamegraph --diff for before/after attribution;
#             summary stats parsed for threshold checks.
# STRENGTHS - Catches memory regressions before they ship; binary outputs
#             are diff-able; --leaks mode finds objects never freed.
# WEAKNESSES- Capture overhead means you don't run with it 24/7; pick
#             windows (post-deploy, on alert, on schedule).

# 1) Diff two captures to attribute a regression.
#    $ memray run -o before.bin python script.py
#    (apply the suspect change)
#    $ memray run -o after.bin python script.py
#    $ memray flamegraph --diff after.bin --reverse before.bin -o diff.html
#
#    The diff flame graph colors frames RED for "more memory in 'after'"
#    and BLUE for "less". Find your regression in 30 seconds.

# 2) Leak detection — what objects are STILL alive at exit?
#    $ memray run --aggregate -o leaks.bin script.py
#    $ memray flamegraph --leaks leaks.bin
#
#    Reports allocations whose memory was never freed before the program
#    exited. Strong signal for "I forgot to del" or "this cache grows
#    forever".

# 3) CI integration — pytest plugin with memory budgets per test.
import pytest
from pytest_memray import limit_memory

# tests/test_pipeline.py
@limit_memory("500 MB")
def test_pipeline_stays_under_budget():
    import myapp
    myapp.process_batch(small_inputs)
# CI invocation:
#   $ pytest --memray --memray-bin-path=ci-prof.bin tests/

# 4) Programmatic capture — bracket the region without the CLI.
import memray
from pathlib import Path

OUT = Path("/var/log/memray")
OUT.mkdir(parents=True, exist_ok=True)

def captured(name: str):
    """Decorator that captures memory of one call to fn()."""
    def deco(fn):
        def wrapper(*a, **kw):
            with memray.Tracker(OUT / f"{name}.bin"):
                return fn(*a, **kw)
        return wrapper
    return deco

@captured("ingest")
def ingest_records(records):
    return [process(r) for r in records]

# 5) Threshold check from CI — parse 'memray stats' output.
import subprocess, json, re
def assert_peak_rss_below(bin_path: Path, max_mib: int) -> None:
    out = subprocess.check_output(
        ["memray", "stats", "--json", str(bin_path)], text=True,
    )
    data = json.loads(out)
    peak = data["metadata"]["peak_memory"] / (1024 * 1024)
    assert peak <= max_mib, f"peak RSS {peak:.1f}MiB > {max_mib} MiB budget"

# Decision rule:
#   need allocation site for native bufs   -> memray (tracemalloc is BLIND to C ext)
#   pure-Python heap, ultra-low overhead   -> tracemalloc
#   live process, no code change           -> memray attach <PID>  (Linux + ptrace)
#   diff two runs                          -> memray flamegraph --diff
#   "what is leaking?"                     -> memray flamegraph --leaks
#   pytest perf gate                       -> pytest-memray + @limit_memory
#   reference-cycle leak                    -> gc-debugging entry (gc / objgraph / weakref)
#   need flame graph UI                     -> memray flamegraph (HTML)
#   need to grep                            -> memray summary / stats / tree
#   continuous monitoring                   -> short windowed captures shipped to S3; not 24/7
#
# Anti-pattern: using memray on a CI runner that's also building wheels,
# tarring artifacts, or running other tests in parallel. The tracker
# attributes memory to the calling Python process correctly, but the
# capture file balloons (multi-GB for an hour-long run) and CI disk
# fills. Bound runs with --duration; capture short windows; or run on a
# dedicated perf runner.
```

## Decision Rule

```text
need allocation site for native bufs   -> memray (tracemalloc is BLIND to C ext)
pure-Python heap, ultra-low overhead   -> tracemalloc
live process, no code change           -> memray attach <PID>  (Linux + ptrace)
diff two runs                          -> memray flamegraph --diff
"what is leaking?"                     -> memray flamegraph --leaks
pytest perf gate                       -> pytest-memray + @limit_memory
reference-cycle leak                    -> gc-debugging entry (gc / objgraph / weakref)
need flame graph UI                     -> memray flamegraph (HTML)
need to grep                            -> memray summary / stats / tree
continuous monitoring                   -> short windowed captures shipped to S3; not 24/7
```

## Anti-Pattern

> [!warning] Anti-pattern
> using memray on a CI runner that's also building wheels,
> tarring artifacts, or running other tests in parallel. The tracker
> attributes memory to the calling Python process correctly, but the
> capture file balloons (multi-GB for an hour-long run) and CI disk
> fills. Bound runs with --duration; capture short windows; or run on a
> dedicated perf runner.

## Tips

- memray sees C-extension allocations natively — numpy buffers, torch tensors, PIL images all account correctly. tracemalloc cannot. If your suspect is a native library, start with memray.
- The flame graph default view shows TOTAL bytes allocated (including freed). Toggle "Show currently allocated only" to see what is held — much better signal for "what's leaking?".
- `memray flamegraph --diff after.bin --reverse before.bin` colors frames red for "more in after". Catching a regression by clicking the biggest red frame takes seconds.
- For pytest, `pytest-memray` adds `@limit_memory("100 MB")` and `--memray` to fail tests that exceed a budget — the CI gate that prevents memory regressions from merging.
- memray attach is Linux-only and needs CAP_SYS_PTRACE (the same model as py-spy). For containerized prod, bring memray in via an ephemeral debug container.
- For very short scripts where startup dominates, memray's overhead can dominate. Use it on workloads >5 seconds; for tiny snippets, tracemalloc.start()+take_snapshot() is fine.

## Common Mistake

> [!warning] Running memray on a CI runner that also builds wheels, tars artifacts, or runs other tests in parallel. The tracker attributes correctly to the Python process, but the capture file balloons (multi-GB for an hour) and CI disk fills. Bound runs with --duration, capture short windows, and prefer a dedicated perf runner over a shared build agent.

## Shorthand (Junior → Senior)

**Junior:**
```python
# tracemalloc miss native buffers entirely
tracemalloc.start()                  # only sees Python objects
do_image_processing()                # numpy/PIL allocations look like ~1KB
```

**Senior:**
```python
# memray sees Python AND C buffers
$ memray run -o out.bin script.py
$ memray flamegraph out.bin
```

## See Also

- [[Sections/debugging-profiling/memory-profiling/tracemalloc-stdlib|tracemalloc — stdlib heap snapshot profiler (Debugging & Profiling)]]
- [[Sections/debugging-profiling/memory-profiling/gc-debugging|gc / weakref — diagnose reference cycles and stuck objects (Debugging & Profiling)]]
- [[Sections/debugging-profiling/memory-profiling/_Index|Debugging & Profiling → Memory Profiling — tracemalloc, memray, gc]]
- [[Sections/debugging-profiling/_Index|Debugging & Profiling index]]
- [[_Index|Vault index]]
