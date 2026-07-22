---
type: "entry"
domain: "python"
file: "debugging-profiling"
section: "cpu-profiling"
id: "pyspy-sampling"
title: "py-spy — sampling profiler for live processes"
category: "CPU Profilers"
subtitle: "py-spy top --pid, py-spy record --pid -o flame.svg, --native, --duration, ptrace_scope, kubectl debug, container attach"
signature_short: "py-spy record --pid 12345 --duration 60 -o flame.svg   # attach, record 60s, write flame graph"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "py-spy — sampling profiler for live processes"
  - "pyspy-sampling"
tags:
  - "python"
  - "python/debugging-profiling"
  - "python/debugging-profiling/cpu-profiling"
  - "category/cpu-profilers"
  - "tier/tiered"
---

# py-spy — sampling profiler for live processes

> py-spy top --pid, py-spy record --pid -o flame.svg, --native, --duration, ptrace_scope, kubectl debug, container attach

## Overview

py-spy is a sampling profiler written in Rust that attaches to a running Python process via ptrace. No code change, no restart, no library to import — just py-spy record --pid <N>. Because it samples (typically 100Hz), overhead is ~1-2% on the target process; because it walks the C-level Python frame stack, it reads the live interpreter state without needing the GIL. The output formats — speedscope JSON, SVG flame graph, raw text top — are dev-tool standards. The three examples solve the SAME concrete task — your prod service is at 100% CPU and you need to know what it is doing — at three depths: top for live view → record for a flame graph → containerized / Kubernetes attach with security model and --native for C extension visibility.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — A running Python process is burning CPU; see what it's doing.
- **Junior** — SAME — but capture a SHARABLE flame graph for the slow window so you can analyze later or attach it to a ticket.
- **Senior** — SAME — but the process is in a Kubernetes pod, you don't have ptrace permission by default, and you need this to be a documented runbook step rather than ad-hoc.

## Signature

```python
py-spy record --pid 12345 --duration 60 -o flame.svg   # attach, record 60s, write flame graph
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - A running Python process is burning CPU; see what it's doing.
# APPROACH  - py-spy top --pid <PID>: top-style live view of hot functions.
# STRENGTHS - No code change; no restart; safe overhead (~1-2%); attaches
#             to a process that's already wedged.
# WEAKNESSES- top view is per-snapshot; you can't share or compare it later
#             (use 'record' for that).

# Install once:
#   $ pip install py-spy           # or: brew install py-spy

# Find the PID.
#   $ pgrep -f myapp
#   12345

# Live top — refreshes every second.
#   $ py-spy top --pid 12345

# What you'll see (typical):
#   Total Samples 1500
#   GIL: 89.40%, Active: 99.20%, Threads: 4
#
#   %Own   %Total  OwnTime  TotalTime  Function (filename)
#   65.0%   65.0%    8.45s     8.45s   transform (image_proc.py)
#   18.0%   83.0%    2.34s    10.79s   process_image (handler.py)
#    8.5%    8.5%    1.10s     1.10s   _decode (PIL/JpegImagePlugin.py)

# %Own = self time; %Total = inclusive (this fn + everything it called).
# Sort with j/k arrows; quit with q.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but capture a SHARABLE flame graph for the slow window
#             so you can analyze later or attach it to a ticket.
# APPROACH  - py-spy record writes a flame graph SVG (or speedscope JSON).
#             Bound the run with --duration; --rate raises sample frequency
#             when you need finer detail.
# STRENGTHS - Artifact survives the process; viewable in any browser; the
#             SVG flame graph is the gold standard for "where's the time?"
# WEAKNESSES- ptrace permission required (see senior tier for the model).

# Capture a 60-second flame graph.
#   $ py-spy record --pid 12345 --duration 60 -o flame.svg
#   Sampling process 100 times a second. Press Control-C to exit.
#   ......................................
#   Wrote flamegraph data to 'flame.svg'.

# Open flame.svg in any browser. Width = time, click a frame to zoom,
# search for a function name in the top-right.

# Output formats:
#   --format flamegraph   (default; SVG)
#   --format speedscope   (JSON; load at https://www.speedscope.app — better UX)
#   --format raw          (collapsed-stack lines; pipe into Brendan Gregg's flamegraph.pl)

# Sample finer with --rate (default 100Hz; 250Hz catches faster functions):
#   $ py-spy record --pid 12345 --rate 250 --duration 30 -o fast.svg

# See native (C extension) frames too — needs root or CAP_SYS_PTRACE.
#   $ sudo py-spy record --pid 12345 --native --duration 30 -o full.svg

# Quick stack-only diagnostics (no profile, just "what is each thread on RIGHT NOW?"):
#   $ py-spy dump --pid 12345
#   Thread 12345 (active+gil)
#       transform (image_proc.py:142)
#       process_image (handler.py:58)
#       handle_request (server.py:23)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — but the process is in a Kubernetes pod, you don't have
#             ptrace permission by default, and you need this to be a
#             documented runbook step rather than ad-hoc.
# APPROACH  - kubectl debug --target with an ephemeral container that has
#             py-spy and CAP_SYS_PTRACE; attach to PID 1; record to a
#             temporary volume; copy the SVG out. For non-K8s, sysctl
#             ptrace_scope and capability grants are documented.
# STRENGTHS - Production-safe diagnostic; takes ~2 minutes; the SVG is a
#             ticket attachment; no code change to the running pod.
# WEAKNESSES- Needs cluster RBAC for 'pods/ephemeralcontainers'; the
#             ephemeral container shares the target's PID namespace.

# 1) Linux host: by default, /proc/sys/kernel/yama/ptrace_scope=1 means
#    py-spy must run as root OR have CAP_SYS_PTRACE OR be the same UID
#    as the target.
#       $ sudo py-spy record --pid 12345 -o flame.svg
#    Or grant the capability once (no need to re-grant each run):
#       $ sudo setcap cap_sys_ptrace=ep $(which py-spy)
#    For dev hosts only, allow tracing same-UID processes without root:
#       $ sudo sysctl kernel.yama.ptrace_scope=0

# 2) Docker: --cap-add SYS_PTRACE on the OBSERVING container. If using
#    --pid=host you can target processes outside the container; otherwise
#    use --pid=container:<target_id> to share the target's PID namespace.
#       $ docker run --rm -it --pid=container:myapp \
#             --cap-add SYS_PTRACE \
#             benfred/py-spy py-spy record --pid 1 --duration 30 -o /out/flame.svg

# 3) Kubernetes: ephemeral debug container shares the target pod's PID
#    namespace. The target image doesn't need py-spy installed — the
#    debug container brings it.
#       $ kubectl debug -it myapp-pod-xxxx \
#             --target=myapp-container \
#             --image=benfred/py-spy \
#             --profile=general \
#             -- bash
#       (in the debug container)
#       $ py-spy record --pid 1 --duration 60 -o /tmp/flame.svg
#       (back on host)
#       $ kubectl cp myapp-pod-xxxx:/tmp/flame.svg ./flame.svg --container=debugger

# 4) Continuous profiling — run py-spy on a 5-minute interval, ship the
#    SVG to S3. Below is a sketch; in real systems use Pyroscope/Parca/
#    Datadog Continuous Profiler instead, all of which embed py-spy.
import subprocess
import time
from pathlib import Path
from datetime import datetime, timezone

def capture_profile(pid: int, *, duration: int = 30, out_dir: Path) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    out = out_dir / f"profile-{pid}-{ts}.svg"
    subprocess.run(
        ["py-spy", "record", "--pid", str(pid),
         "--duration", str(duration), "--rate", "100",
         "-o", str(out)],
        check=True,
    )
    return out

# Background loop (in real life: a separate sidecar; do NOT run from the
# target process itself).
def continuous(pid: int, interval_s: int = 300) -> None:
    out_dir = Path("/var/log/profiles")
    while True:
        try:
            p = capture_profile(pid, duration=30, out_dir=out_dir)
            print(f"captured {p}")
        except subprocess.CalledProcessError as e:
            print(f"profile failed: {e}")
        time.sleep(interval_s - 30)                    # one capture every 5 min

# Decision rule:
#   running prod process, no code change   -> py-spy top / record / dump
#   short-lived script you can rerun       -> cProfile (deterministic, reproducible)
#   need line-level CPU + memory           -> scalene
#   need allocation tracking               -> memray (Python heap) — different tool
#   ephemeral CPU spike (<5s)              -> py-spy --rate 250 + dump on a tight loop
#   K8s pod, no shell in image             -> kubectl debug ephemeral container
#   compare two runs / regression          -> py-spy record --format speedscope, diff in speedscope.app
#   continuous profiling in prod           -> Pyroscope / Parca / Datadog (all use py-spy underneath)
#   asyncio coroutines                     -> py-spy attributes time correctly across awaits
#   C-extension is hot                     -> add --native (needs root / CAP_SYS_PTRACE)
#
# Anti-pattern: importing cProfile inside a long-running production handler
# to "find what's slow". cProfile's per-call overhead changes the perf
# profile; the artifact is hard to extract from a running container; you
# have to deploy code to install it. py-spy attaches AT WILL to the
# already-running process — that's exactly what production diagnosis needs.
```

## Decision Rule

```text
running prod process, no code change   -> py-spy top / record / dump
short-lived script you can rerun       -> cProfile (deterministic, reproducible)
need line-level CPU + memory           -> scalene
need allocation tracking               -> memray (Python heap) — different tool
ephemeral CPU spike (<5s)              -> py-spy --rate 250 + dump on a tight loop
K8s pod, no shell in image             -> kubectl debug ephemeral container
compare two runs / regression          -> py-spy record --format speedscope, diff in speedscope.app
continuous profiling in prod           -> Pyroscope / Parca / Datadog (all use py-spy underneath)
asyncio coroutines                     -> py-spy attributes time correctly across awaits
C-extension is hot                     -> add --native (needs root / CAP_SYS_PTRACE)
```

## Anti-Pattern

> [!warning] Anti-pattern
> importing cProfile inside a long-running production handler
> to "find what's slow". cProfile's per-call overhead changes the perf
> profile; the artifact is hard to extract from a running container; you
> have to deploy code to install it. py-spy attaches AT WILL to the
> already-running process — that's exactly what production diagnosis needs.

## Tips

- Sampling rate (--rate) defaults to 100Hz — fine for most workloads. Bump to 250Hz when investigating sub-millisecond functions; lower to 50Hz on a production pod to halve the (already tiny) overhead.
- py-spy dump --pid <PID> is the fastest "what is each thread doing RIGHT NOW?" — no profile, no time pressure. Run it three times in a row to see if a thread is making progress or stuck.
- Use --format speedscope and load the JSON at speedscope.app — the UI is far better than the raw SVG flame graph for navigation and search. SVG is good for sharing in a ticket.
- In containers, --pid=container:<target> is usually what you want — same PID namespace as the target, so PID 1 inside the debug container is the app process. --pid=host only works for host-namespace processes.
- The error "Permission denied" from py-spy is almost always the kernel's yama ptrace policy. Either run as root, grant CAP_SYS_PTRACE (setcap cap_sys_ptrace=ep $(which py-spy)), or for dev hosts: sysctl kernel.yama.ptrace_scope=0.
- Continuous-profiling tools (Pyroscope, Parca, Grafana Phlare, Datadog) all use py-spy under the hood for Python — install one of them rather than rolling your own loop. They handle batching, deduplication, and search.

## Common Mistake

> [!warning] Reaching for cProfile to diagnose a live production process by adding it to running code. cProfile requires either an import-time hook or a deploy with a profiling decorator, and its per-call overhead changes the very performance you're trying to measure. py-spy attaches to the running PID with no code change and ~1-2% sampling overhead — that's exactly the right tool for production diagnosis.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Add cProfile to deploy, restart pod, hope to reproduce
@profiled("handle_request")
def handle_request(req): ...
```

**Senior:**
```python
# Attach to the already-running process
$ py-spy record --pid $(pgrep -f myapp) --duration 60 -o flame.svg
```

## See Also

- [[Sections/debugging-profiling/cpu-profiling/cprofile-deterministic|cProfile — stdlib deterministic profiler (Debugging & Profiling)]]
- [[Sections/debugging-profiling/cpu-profiling/scalene-line|scalene — line-level CPU + memory + GPU profiler (Debugging & Profiling)]]
- [[Sections/debugging-profiling/cpu-profiling/_Index|Debugging & Profiling → CPU Profiling — cProfile, py-spy, scalene]]
- [[Sections/debugging-profiling/_Index|Debugging & Profiling index]]
- [[_Index|Vault index]]
