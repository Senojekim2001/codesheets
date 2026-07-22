---
type: "entry"
domain: "python"
file: "debugging-profiling"
section: "cpu-profiling"
id: "cprofile-deterministic"
title: "cProfile — stdlib deterministic profiler"
category: "CPU Profilers"
subtitle: "cProfile.run, cProfile.Profile, pstats.Stats, sort_stats, snakeviz, gprof2dot, deterministic vs sampling tradeoffs"
signature_short: "with cProfile.Profile() as p: main()   # then p.dump_stats(\"out.prof\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "cProfile — stdlib deterministic profiler"
  - "cprofile-deterministic"
tags:
  - "python"
  - "python/debugging-profiling"
  - "python/debugging-profiling/cpu-profiling"
  - "category/cpu-profilers"
  - "tier/tiered"
---

# cProfile — stdlib deterministic profiler

> cProfile.run, cProfile.Profile, pstats.Stats, sort_stats, snakeviz, gprof2dot, deterministic vs sampling tradeoffs

## Overview

cProfile is the stdlib deterministic profiler — it instruments every Python function call, recording exact call counts and self/cumulative time. Because every call is instrumented, fast functions get more relative overhead than slow ones; heavily-called small functions look hotter than they really are. The output (.prof) is consumable by pstats, snakeviz (browser flame graph), and gprof2dot (callgraph PNG). Use cProfile when you can run the workload offline — tests, batch scripts, reproducible benchmarks. For live production processes, reach for py-spy. The three examples solve the SAME concrete task — find which functions consume the most CPU time in a slow script — at three depths: one-shot cProfile.run() → context-managed profile + sorted pstats → scoped profiling of just the suspect region + .prof file + visualization toolchain.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Find which functions consume the most CPU time in a slow script.
- **Junior** — SAME — but save profile to disk; sort multiple ways; trim noise (library frames, stdlib internals).
- **Senior** — SAME — production-grade: profile only the suspect region, save to .prof for snakeviz / gprof2dot, decide whether cProfile's bias is distorting the result.

## Signature

```python
with cProfile.Profile() as p: main()   # then p.dump_stats("out.prof")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Find which functions consume the most CPU time in a slow script.
# APPROACH  - cProfile.run("expr") prints sorted stats to stdout.
# STRENGTHS - Zero setup; one line; included in stdlib.
# WEAKNESSES- Profiles the WHOLE program; output is ASCII; small functions
#             look hotter than they are because of per-call overhead.
import cProfile

def slow_function(n):
    return sum(i * i for i in range(n))

def main():
    return [slow_function(10_000) for _ in range(100)]

cProfile.run("main()", sort="cumulative")

# Output (typical):
#          1003 function calls in 0.612 seconds
#    Ordered by: cumulative time
#    ncalls  tottime  percall  cumtime  percall filename:lineno(function)
#         1    0.000    0.000    0.612    0.612 <string>:1(<module>)
#         1    0.001    0.001    0.612    0.612 script.py:7(main)
#       100    0.611    0.006    0.611    0.006 script.py:3(slow_function)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but save profile to disk; sort multiple ways; trim
#             noise (library frames, stdlib internals).
# APPROACH  - cProfile.Profile() as a context manager; pstats.Stats for
#             flexible reporting; strip_dirs() and filters narrow output.
# STRENGTHS - Reusable artifact (.prof) you can load later or share;
#             multiple reports from one run; targeted views.
# WEAKNESSES- Still profiles everything; small-function bias persists.
import cProfile, pstats

def slow_function(n):
    return sum(i * i for i in range(n))

def main():
    return [slow_function(10_000) for _ in range(100)]

with cProfile.Profile() as profiler:
    main()

# Save the raw profile so you can analyze it later.
profiler.dump_stats("main.prof")

# Sort and print top 20 by cumulative time.
stats = pstats.Stats(profiler).strip_dirs()
stats.sort_stats(pstats.SortKey.CUMULATIVE).print_stats(20)

# Multiple sorts on the same data:
stats.sort_stats(pstats.SortKey.TIME).print_stats(10)         # tottime — self time
stats.sort_stats(pstats.SortKey.CALLS).print_stats(10)        # most-called

# Narrow to a specific module's frames.
stats.print_stats("myapp/")                                    # regex match on filename

# Callers / callees of a specific function.
stats.print_callers("slow_function")
stats.print_callees("main")

# Reload from disk later (no need to re-run the workload):
#   $ python -m pstats main.prof
#   % sort cumulative
#   % stats 20
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production-grade: profile only the suspect region,
#             save to .prof for snakeviz / gprof2dot, decide whether
#             cProfile's bias is distorting the result.
# APPROACH  - Decorator + contextmanager for scoped profiling; .prof
#             saved per-region; visualization commands documented;
#             deterministic-vs-sampling decision rule baked in.
# STRENGTHS - Profile only what's interesting; flame graph in 30s;
#             reproducible artifact; comparison-friendly across runs.
# WEAKNESSES- For very tight loops over hot small functions, cProfile
#             will overstate overhead — corroborate with py-spy on the
#             same workload before optimizing.
import cProfile, pstats, time
from contextlib import contextmanager
from functools import wraps
from pathlib import Path
from typing import Callable

PROFILES = Path("./profiles")
PROFILES.mkdir(exist_ok=True)

@contextmanager
def profile_region(name: str):
    """Profile ONLY the code inside this with-block; save to PROFILES/name.prof."""
    p = cProfile.Profile()
    p.enable()
    try:
        yield p
    finally:
        p.disable()
        out = PROFILES / f"{name}.prof"
        p.dump_stats(out)
        # Quick top-10 to stdout for fast feedback.
        pstats.Stats(p).strip_dirs().sort_stats("cumulative").print_stats(10)
        print(f"saved profile -> {out}")

def profiled(name: str | None = None):
    """Decorator form for one-call-deep profiling."""
    def deco(fn: Callable) -> Callable:
        @wraps(fn)
        def wrapper(*a, **kw):
            with profile_region(name or fn.__name__):
                return fn(*a, **kw)
        return wrapper
    return deco

# Usage: scope to the bit you suspect.
@profiled("ingest")
def ingest_records(records):
    return [process(r) for r in records]

def process(record):
    time.sleep(0)                                     # placeholder
    return record

with profile_region("hot_loop"):
    for i in range(1000):
        process({"i": i})

# Visualize: pip install snakeviz
#   $ snakeviz profiles/hot_loop.prof
# Or callgraph PNG: pip install gprof2dot graphviz
#   $ gprof2dot -f pstats profiles/hot_loop.prof | dot -Tpng -o callgraph.png

# Decision rule:
#   reproducible script / batch job   -> cProfile is the right tool
#   live production process            -> py-spy (sampling, attaches to PID)
#   need line-level + memory           -> scalene (line-level CPU + Python/native split + memory)
#   tight inner loop, small functions  -> cProfile OVERSTATES; cross-check with py-spy
#   isolate one region                 -> profile_region("name") ctx; not the whole program
#   share a profile with a teammate    -> dump_stats to .prof; they snakeviz it locally
#   visualize hotspots                 -> snakeviz (interactive); gprof2dot (static PNG)
#   asyncio-heavy code                 -> cProfile shows event-loop overhead as hot; use py-spy
#   compare two runs / regression test -> snakeviz can't diff; export pstats and diff manually
#
# Anti-pattern: profiling the whole program when you already know which
# function is slow. cProfile's per-call overhead distorts everything below
# the function you care about — small helpers look hotter than they are,
# and you waste an afternoon optimizing the noise. Scope the profiler to
# the suspect region; let the rest of the program run at full speed.
```

## Decision Rule

```text
reproducible script / batch job   -> cProfile is the right tool
live production process            -> py-spy (sampling, attaches to PID)
need line-level + memory           -> scalene (line-level CPU + Python/native split + memory)
tight inner loop, small functions  -> cProfile OVERSTATES; cross-check with py-spy
isolate one region                 -> profile_region("name") ctx; not the whole program
share a profile with a teammate    -> dump_stats to .prof; they snakeviz it locally
visualize hotspots                 -> snakeviz (interactive); gprof2dot (static PNG)
asyncio-heavy code                 -> cProfile shows event-loop overhead as hot; use py-spy
compare two runs / regression test -> snakeviz can't diff; export pstats and diff manually
```

## Anti-Pattern

> [!warning] Anti-pattern
> profiling the whole program when you already know which
> function is slow. cProfile's per-call overhead distorts everything below
> the function you care about — small helpers look hotter than they are,
> and you waste an afternoon optimizing the noise. Scope the profiler to
> the suspect region; let the rest of the program run at full speed.

## Tips

- Use cProfile.Profile() as a context manager (Python 3.8+) — much cleaner than the older enable()/disable() calls and impossible to forget to stop.
- Save to .prof with profiler.dump_stats(path) — that artifact is reusable. python -m pstats path.prof gives an interactive REPL; snakeviz path.prof opens an interactive flame graph in the browser.
- pstats.SortKey constants are the safe way to sort: SortKey.CUMULATIVE, SortKey.TIME (self time), SortKey.CALLS. Strings work too but are easy to typo.
- stats.print_stats("regex") filters to filenames matching the regex — the easiest way to focus on your code and hide framework/stdlib frames.
- Be skeptical of cProfile output for tight loops over tiny functions. The per-call instrumentation cost is comparable to the function bodies, so small functions appear hotter than they are. Cross-check with a sampling profiler (py-spy).
- For asyncio code, cProfile attributes time to the event loop's internal callbacks. Use py-spy in async-aware mode (it tags awaiting coroutines correctly) or scalene with --profile-only.

## Common Mistake

> [!warning] Profiling the whole program when you already know which function is slow. cProfile's per-call instrumentation overhead distorts the picture — small helpers look hotter than they are, and you spend the day micro-optimizing noise instead of the actual hotspot. Scope the profiler to the suspect region with a contextmanager or decorator.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Profile the entire program — noisy, distorted
cProfile.run("main()", sort="cumulative")
```

**Senior:**
```python
# Profile only the suspect region
with profile_region("ingest"):
    ingest_records(records)
```

## See Also

- [[Sections/debugging-profiling/cpu-profiling/pyspy-sampling|py-spy — sampling profiler for live processes (Debugging & Profiling)]]
- [[Sections/debugging-profiling/cpu-profiling/scalene-line|scalene — line-level CPU + memory + GPU profiler (Debugging & Profiling)]]
- [[Sections/debugging-profiling/cpu-profiling/_Index|Debugging & Profiling → CPU Profiling — cProfile, py-spy, scalene]]
- [[Sections/debugging-profiling/_Index|Debugging & Profiling index]]
- [[_Index|Vault index]]
