---
type: "entry"
domain: "python"
file: "debugging-profiling"
section: "memory-profiling"
id: "tracemalloc-stdlib"
title: "tracemalloc — stdlib heap snapshot profiler"
category: "Memory Profilers"
subtitle: "tracemalloc.start, take_snapshot, compare_to, statistics, Filter, get_traceback_limit, snapshot.dump"
signature_short: "tracemalloc.start(); ...work...; snap = tracemalloc.take_snapshot(); snap.statistics(\"lineno\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "tracemalloc — stdlib heap snapshot profiler"
  - "tracemalloc-stdlib"
tags:
  - "python"
  - "python/debugging-profiling"
  - "python/debugging-profiling/memory-profiling"
  - "category/memory-profilers"
  - "tier/tiered"
---

# tracemalloc — stdlib heap snapshot profiler

> tracemalloc.start, take_snapshot, compare_to, statistics, Filter, get_traceback_limit, snapshot.dump

## Overview

tracemalloc (stdlib since 3.4) records the allocation site of every Python object. By itself the snapshots are bulky; the value is in DIFFING two snapshots to see which lines allocated NEW memory between them — the surgical way to find a leak. It does not see C-extension allocations (numpy buffers, torch tensors, image buffers all read as small Python objects pointing at large native buffers); for those, reach for memray. The three examples solve the SAME concrete task — your service's RSS grows over a workload; find which lines allocated the new memory — at three depths: one snapshot + statistics → before/after diff with compare_to → production-grade periodic snapshots + Filter + persistent dumps for offline analysis.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Memory grows during a workload; find which lines allocated the most.
- **Junior** — SAME — but find what's GROWING (a leak), not just what's present. Take two snapshots and diff them.
- **Senior** — SAME — production-grade: long-running service that grows slowly over hours; periodic snapshots; per-window diffs; noise filter to drop library frames; persisted artifacts.

## Signature

```python
tracemalloc.start(); ...work...; snap = tracemalloc.take_snapshot(); snap.statistics("lineno")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Memory grows during a workload; find which lines allocated the most.
# APPROACH  - tracemalloc.start(); run; take_snapshot(); statistics("lineno")
#             returns top allocators in descending order.
# STRENGTHS - Stdlib; one snapshot is enough for a static peak;
#             reports actual file:line of every allocation site.
# WEAKNESSES- Single snapshot tells you the TOTAL state, not what GREW;
#             does not see C-extension internal allocations (numpy buffers).
import tracemalloc

tracemalloc.start()                                  # arm BEFORE the work

# Workload that allocates a lot.
big_list = [bytes(1024) for _ in range(10_000)]      # ~10 MB
big_dict = {i: "x" * 100 for i in range(10_000)}     # ~1 MB

snap = tracemalloc.take_snapshot()
top = snap.statistics("lineno")
for stat in top[:5]:
    print(stat)

# Output (typical):
#   /script.py:7: size=10240 KiB, count=10000, average=1024 B
#   /script.py:8: size=1172 KiB, count=10000, average=120 B
#   ...

# Total snapshot size:
print(f"total: {sum(s.size for s in top) / 1024 / 1024:.1f} MB")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but find what's GROWING (a leak), not just what's
#             present. Take two snapshots and diff them.
# APPROACH  - take_snapshot() before the suspect operation; again after;
#             compare_to() returns per-line size_diff sorted descending.
# STRENGTHS - Pinpoints lines that allocated NEW memory between checkpoints;
#             group_by="traceback" shows the full call stack for each.
# WEAKNESSES- Diff resolution is per-line; for cross-call attribution
#             (which CALLER added the memory), use group_by="traceback".
import tracemalloc

tracemalloc.start(25)                                # 25 = stack-frame depth retained per alloc

def warmup():
    return [object() for _ in range(1000)]

def suspect(n: int):
    """The function we suspect of leaking."""
    cache = []
    for i in range(n):
        cache.append({"id": i, "data": "x" * 1000})
    return cache

# Take snapshot before the suspect work.
warmup()                                             # one-time setup
snap_before = tracemalloc.take_snapshot()

# Do the suspect work.
result = suspect(5_000)

snap_after = tracemalloc.take_snapshot()

# Diff: what got bigger?
diffs = snap_after.compare_to(snap_before, "lineno")
print("Top growth (line):")
for stat in diffs[:5]:
    print(f"  {stat}")

# Diff with full traceback (better attribution when one line is called from many places).
diffs_tb = snap_after.compare_to(snap_before, "traceback")
print("\nTop growth (traceback):")
for stat in diffs_tb[:3]:
    print(f"  +{stat.size_diff/1024:.1f} KiB / +{stat.count_diff} allocs")
    for frame in stat.traceback:
        print(f"    {frame.filename}:{frame.lineno}")

# Hold on to result so it's not collected before we read it.
del result
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production-grade: long-running service that grows
#             slowly over hours; periodic snapshots; per-window diffs;
#             noise filter to drop library frames; persisted artifacts.
# APPROACH  - tracemalloc.start(25) at startup; rotate snapshots every
#             N minutes to disk; offline analysis script diffs
#             snapshot[t-1] vs snapshot[t] to find the growing site.
# STRENGTHS - Catches slow leaks that a single-snapshot run can't see;
#             dumps survive process restarts; Filter removes stdlib noise.
# WEAKNESSES- ~5-10% memory overhead for the trace metadata; not zero-cost.
#             For C-extension memory (numpy/torch/PIL), tracemalloc is
#             blind — use memray instead.
import tracemalloc, time, threading, pickle
from pathlib import Path

SNAPSHOT_DIR = Path("/var/log/myapp/heap")
SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)

# 1) Filters: drop noise so the diff highlights YOUR code.
NOISE_FILTERS = [
    tracemalloc.Filter(False, tracemalloc.__file__),       # tracemalloc itself
    tracemalloc.Filter(False, "<frozen importlib._bootstrap>"),
    tracemalloc.Filter(False, "*/site-packages/*"),        # library code
]

def install_periodic_snapshots(interval_s: int = 600) -> None:
    """Call from service entrypoint. One snapshot every N seconds."""
    tracemalloc.start(25)

    def loop():
        while True:
            time.sleep(interval_s)
            try:
                snap = tracemalloc.take_snapshot().filter_traces(NOISE_FILTERS)
                ts = time.strftime("%Y%m%dT%H%M%SZ", time.gmtime())
                out = SNAPSHOT_DIR / f"snap-{ts}.pkl"
                with out.open("wb") as f:
                    pickle.dump(snap, f)
                # Trim old: keep last 24.
                files = sorted(SNAPSHOT_DIR.glob("snap-*.pkl"))
                for old in files[:-24]:
                    old.unlink()
            except Exception as e:
                print(f"snapshot failed: {e}")

    t = threading.Thread(target=loop, daemon=True, name="tracemalloc-snapshots")
    t.start()

# 2) Offline analysis script — load two snapshots, diff, report top growth.
def analyze(before_path: Path, after_path: Path, *, top_n: int = 20) -> None:
    with before_path.open("rb") as f: before = pickle.load(f)
    with after_path.open("rb") as f:  after  = pickle.load(f)

    print(f"=== {before_path.name} -> {after_path.name} ===")

    # Per-traceback diff — best attribution.
    diffs = after.compare_to(before, "traceback")
    print(f"\nTop {top_n} growth sites:")
    for stat in diffs[:top_n]:
        if stat.size_diff <= 0:
            continue
        print(f"  +{stat.size_diff/1024:.1f} KiB ({stat.count_diff:+d} allocs)")
        for frame in stat.traceback[-3:]:                 # last 3 frames = innermost
            print(f"      {frame.filename}:{frame.lineno}")

# 3) On-demand snapshot — exposed via signal or admin endpoint.
import signal, os
def _on_signal(*_):
    snap = tracemalloc.take_snapshot().filter_traces(NOISE_FILTERS)
    ts = time.strftime("%Y%m%dT%H%M%SZ", time.gmtime())
    out = SNAPSHOT_DIR / f"snap-ondemand-{os.getpid()}-{ts}.pkl"
    with out.open("wb") as f:
        pickle.dump(snap, f)
    print(f"on-demand snapshot -> {out}")

if hasattr(signal, "SIGUSR2"):
    signal.signal(signal.SIGUSR2, _on_signal)            # 'kill -USR2 <PID>' to dump

# Decision rule:
#   Python-side memory growth          -> tracemalloc — sees alloc lines
#   numpy/torch buffer growth          -> tracemalloc is BLIND — use memray
#   "what's the heap right now?"       -> single take_snapshot + statistics
#   "what GREW since last check?"      -> two snapshots + compare_to
#   slow leak over hours/days          -> periodic snapshots to disk; offline diff
#   stack-frame attribution            -> tracemalloc.start(N) with N=10-25; Filter library noise
#   leaked object kept alive by what?  -> gc-debugging entry (gc.get_referrers + objgraph)
#   need C-extension allocator info    -> memray --trace-python-allocators
#   on-demand dump in production       -> SIGUSR2 handler + pickle the snapshot
#   too much overhead                  -> turn off OR sample every Nth alloc with custom filter
#
# Anti-pattern: calling tracemalloc.start() AFTER the suspect code has run.
# Allocations made before start() are invisible to the snapshot — they
# look like 0 bytes. The diff against a "before" snapshot taken at startup
# is the only reliable way to see growth. Always start() at the very top
# of your entrypoint, then take a baseline snapshot once warm.
```

## Decision Rule

```text
Python-side memory growth          -> tracemalloc — sees alloc lines
numpy/torch buffer growth          -> tracemalloc is BLIND — use memray
"what's the heap right now?"       -> single take_snapshot + statistics
"what GREW since last check?"      -> two snapshots + compare_to
slow leak over hours/days          -> periodic snapshots to disk; offline diff
stack-frame attribution            -> tracemalloc.start(N) with N=10-25; Filter library noise
leaked object kept alive by what?  -> gc-debugging entry (gc.get_referrers + objgraph)
need C-extension allocator info    -> memray --trace-python-allocators
on-demand dump in production       -> SIGUSR2 handler + pickle the snapshot
too much overhead                  -> turn off OR sample every Nth alloc with custom filter
```

## Anti-Pattern

> [!warning] Anti-pattern
> calling tracemalloc.start() AFTER the suspect code has run.
> Allocations made before start() are invisible to the snapshot — they
> look like 0 bytes. The diff against a "before" snapshot taken at startup
> is the only reliable way to see growth. Always start() at the very top
> of your entrypoint, then take a baseline snapshot once warm.

## Tips

- Call tracemalloc.start(N) where N is the stack-frame depth retained per allocation. N=25 is generous; N=1 (default) only gives the immediate file:line — not enough to disambiguate when a hot helper is called from many places.
- Use snapshot.compare_to(other, "traceback") rather than "lineno" when you need to know WHICH CALLER allocated the memory — same line called from two places shows as one row otherwise.
- Filter noise with tracemalloc.Filter(False, "*/site-packages/*") so the diff highlights YOUR code rather than library internals. Apply before .compare_to() with .filter_traces([filters]).
- tracemalloc cannot see C-extension internal allocations. If your "leak" is in a numpy array, torch tensor, or PIL image buffer, the snapshot will undercount by orders of magnitude — use memray instead.
- For long-running services, take periodic snapshots and diff window N vs window N-1 — slow leaks (50KB/hour) won't show up in a one-shot run but stand out clearly in hourly diffs.
- tracemalloc adds ~5-10% memory overhead for its trace metadata. Acceptable for diagnostic windows; turn off (tracemalloc.stop()) once the leak is found.

## Common Mistake

> [!warning] Calling tracemalloc.start() AFTER the suspect code has run. Allocations made before start() are invisible to every snapshot taken later — they appear as 0 bytes. Compare against a snapshot taken AFTER start() but BEFORE the workload, and the diff will show only what the workload added. Start at the very top of the entrypoint.

## Shorthand (Junior → Senior)

**Junior:**
```python
# start() too late — pre-existing allocs invisible
do_suspect_work()
tracemalloc.start()
snap = tracemalloc.take_snapshot()
```

**Senior:**
```python
# start() at the top; baseline; work; diff
tracemalloc.start(25)
baseline = tracemalloc.take_snapshot()
do_suspect_work()
diffs = tracemalloc.take_snapshot().compare_to(baseline, "traceback")
```

## See Also

- [[Sections/debugging-profiling/memory-profiling/memray-allocs|memray — production-grade allocation tracker with flame graphs (Debugging & Profiling)]]
- [[Sections/debugging-profiling/memory-profiling/gc-debugging|gc / weakref — diagnose reference cycles and stuck objects (Debugging & Profiling)]]
- [[Sections/debugging-profiling/memory-profiling/_Index|Debugging & Profiling → Memory Profiling — tracemalloc, memray, gc]]
- [[Sections/debugging-profiling/_Index|Debugging & Profiling index]]
- [[_Index|Vault index]]
