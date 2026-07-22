---
type: "entry"
domain: "python"
file: "debugging-profiling"
section: "cpu-profiling"
id: "scalene-line"
title: "scalene — line-level CPU + memory + GPU profiler"
category: "CPU Profilers"
subtitle: "scalene script.py, --html, --cli, --profile-only, scalene_profiler.start/stop, Python vs native time, --reduced-profile"
signature_short: "scalene script.py     # or: scalene --html report.html --outfile out.json script.py"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "scalene — line-level CPU + memory + GPU profiler"
  - "scalene-line"
tags:
  - "python"
  - "python/debugging-profiling"
  - "python/debugging-profiling/cpu-profiling"
  - "category/cpu-profilers"
  - "tier/tiered"
---

# scalene — line-level CPU + memory + GPU profiler

> scalene script.py, --html, --cli, --profile-only, scalene_profiler.start/stop, Python vs native time, --reduced-profile

## Overview

scalene is a sampling profiler with three innovations over cProfile and py-spy: LINE-level granularity (not just functions), per-line attribution of Python vs native vs system time, and integrated memory + GPU tracking. The output answers "which LINE is slow, and is it slow because of Python overhead or a native library or memory allocation?" — questions that function-level profilers cannot. Overhead is comparable to py-spy (a few percent) but with much richer signal. The three examples solve the SAME concrete task — narrow down a slow numpy/pandas pipeline to the actual bottleneck line — at three depths: terminal output → HTML report + targeted module filtering → programmatic API for CI / regression tests, plus the comparison rubric against cProfile and py-spy.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Narrow down a slow data pipeline to the line that's actually slow.
- **Junior** — SAME — focus on YOUR code only; produce an HTML report you can share or attach to a PR.
- **Senior** — SAME — programmatic API for scoped profiling in CI; regression test that fails the build if a critical function gets slower than a baseline.

## Signature

```python
scalene script.py     # or: scalene --html report.html --outfile out.json script.py
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Narrow down a slow data pipeline to the line that's actually slow.
# APPROACH  - Run 'scalene script.py'. Get per-line CPU% and memory in
#             the terminal, with Python time vs native time split.
# STRENGTHS - No code change; line-level signal; immediately actionable.
# WEAKNESSES- Default mode profiles EVERYTHING (your code + libraries) —
#             output can be noisy on first run.

# Install:
#   $ pip install scalene

# The slow script (a typical "Python loop where numpy would be 100x faster").
# script.py
import numpy as np

def slow(arr):
    out = []
    for x in arr:                                     # <- this loop is the bug
        out.append(x ** 2 + 2 * x + 1)
    return np.array(out)

def fast(arr):
    return arr ** 2 + 2 * arr + 1                    # <- vectorized

def main():
    arr = np.arange(1_000_000)
    s = slow(arr)
    f = fast(arr)
    return s.sum(), f.sum()

if __name__ == "__main__":
    main()

# Run with scalene:
#   $ scalene script.py
#
# Output (typical):
#                                Memory usage:  ▁▂▃▄▆█  (max:  76.4MB, growth rate:  91%)
#   Line   Time  CPU% Python  CPU% Native  Mem MB    Avg MB    Copy   Code
#      1                                                                  import numpy as np
#      3                                                                  def slow(arr):
#      4                                                                      out = []
#      5    96%  85%           5%          50.0      45.0       0%        for x in arr:
#      6                                                                          out.append(x**2 + 2*x + 1)
#      7                                                                      return np.array(out)
#      9                                                                  def fast(arr):
#     10     2%   0%          90%           7.6       7.6       0%            return arr ** 2 + 2 * arr + 1
#
# Line 5 is the bottleneck: 96% of time, mostly Python overhead (the for loop),
# and 50MB of memory churn. Line 10 (vectorized) is essentially free.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — focus on YOUR code only; produce an HTML report
#             you can share or attach to a PR.
# APPROACH  - --profile-only filters to module patterns; --html outputs
#             a rich interactive report; --reduced-profile drops lines
#             that consume <1% so the table is readable.
# STRENGTHS - Output narrowed to the code you can change; HTML report
#             survives the run and is shareable.
# WEAKNESSES- HTML is heavy; for grep-friendly output use --json.

# Run scalene with focused options:
#   $ scalene --html --outfile profile.html \
#             --profile-only "myapp" \
#             --reduced-profile \
#             script.py
#
# The HTML report shows:
#   - Per-file flame view with line-level CPU/memory bars
#   - Sortable columns: Time%, CPU%, Memory MB, Memory Copy %
#   - Click a line to see GPT-style optimization suggestions (when --ai is on)
#
# Other useful options:
#   --cpu-only            # skip memory tracking (faster)
#   --no-browser          # don't auto-open the HTML
#   --memory-leak-detector  # flags unbalanced alloc/free per line
#   --profile-interval 5  # report every 5s (continuous)

# JSON output for scripting / regression checks.
#   $ scalene --json --outfile profile.json script.py
#
# import json
# data = json.loads(open("profile.json").read())
# # data["files"]["script.py"]["functions"] -> list of per-function summaries
# # data["files"]["script.py"]["lines"] -> per-line CPU% / memory

# Show only YOUR module's lines, with reduced output:
#   $ scalene --profile-only "myapp\.transform" --reduced-profile script.py
#
# The 'profile-only' pattern is matched against the module name part of
# the filename; "myapp" matches anything under that package.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — programmatic API for scoped profiling in CI;
#             regression test that fails the build if a critical
#             function gets slower than a baseline.
# APPROACH  - scalene_profiler.start() / stop() bracket the region;
#             write JSON; assert against thresholds in pytest.
# STRENGTHS - Detects perf regressions in PR CI before they merge;
#             signal is line-level so you can blame the offending change.
# WEAKNESSES- Scalene's overhead is meaningful (~5-10%) — bench in
#             dedicated CI runners, not on contended shared agents.

# Programmatic profiling — bracket the region, write JSON, inspect.
import json
from pathlib import Path
from scalene import scalene_profiler

def benchmark_pipeline():
    import numpy as np
    arr = np.arange(1_000_000)
    return arr ** 2 + 2 * arr + 1

def profile_call(fn, *, out: Path) -> dict:
    scalene_profiler.start()
    try:
        fn()
    finally:
        scalene_profiler.stop()
    # Scalene writes its accumulated profile when the program exits OR
    # when stop() is called with --json. For programmatic use, the
    # cleanest path is the CLI subprocess (below) — the in-process API
    # is intended for "turn the profiler on partway through".
    return {}

# CI-friendly: subprocess invocation lets you capture exit code + JSON.
import subprocess
def run_scalene_subprocess(script: Path, out_json: Path) -> dict:
    subprocess.run(
        ["python", "-m", "scalene", "--cli", "--json",
         "--outfile", str(out_json), str(script)],
        check=True,
    )
    return json.loads(out_json.read_text())

# Regression check: fail if hot lines have grown.
def regression_test(profile: dict, baselines: dict[str, float]) -> None:
    """baselines = {'myapp/transform.py:42': 0.10}  -> 10% CPU max"""
    files = profile.get("files", {})
    for key, max_pct in baselines.items():
        path, line = key.rsplit(":", 1); line = int(line)
        rec = next((l for l in files.get(path, {}).get("lines", []) if l["lineno"] == line), None)
        actual = (rec or {}).get("n_cpu_percent_python", 0) + (rec or {}).get("n_cpu_percent_c", 0)
        assert actual <= max_pct * 100, (
            f"PERF REGRESSION at {path}:{line}: {actual:.1f}% > {max_pct*100:.1f}%"
        )

# Pytest example: run as part of a perf-test suite (separate marker, separate runner).
# def test_pipeline_perf(tmp_path):
#     out = tmp_path / "p.json"
#     prof = run_scalene_subprocess(Path("scripts/pipeline.py"), out)
#     regression_test(prof, {
#         "scripts/pipeline.py:42": 0.20,           # vectorized line < 20% CPU
#     })

# Decision rule:
#   "which LINE is slow"                     -> scalene
#   "Python overhead or native?" (numpy etc) -> scalene's Python% vs Native% columns
#   memory leak suspected                    -> scalene --memory-leak-detector
#   live prod process                        -> py-spy (scalene needs you to start the script under it)
#   reproducible script + line detail        -> scalene
#   reproducible script + function detail    -> cProfile (lower overhead than scalene)
#   GPU work (PyTorch, JAX)                  -> scalene (or NVIDIA Nsight for deep CUDA)
#   pre-merge perf regression in CI          -> scalene --json + threshold assertions
#   scaled, multi-process workers            -> py-spy on each worker; scalene is single-process
#   reduce noise on first run                -> --profile-only "yourpkg" + --reduced-profile
#
# Anti-pattern: running scalene under a dev shell that's also doing other
# work (build, indexing, language server). Sampling profilers attribute time
# to whatever was on-CPU when the sample fires; a noisy host produces
# noisy profiles. Use a dedicated terminal, close other heavy processes,
# and prefer a separate CI runner for regression tests over a shared
# build agent.
```

## Decision Rule

```text
"which LINE is slow"                     -> scalene
"Python overhead or native?" (numpy etc) -> scalene's Python% vs Native% columns
memory leak suspected                    -> scalene --memory-leak-detector
live prod process                        -> py-spy (scalene needs you to start the script under it)
reproducible script + line detail        -> scalene
reproducible script + function detail    -> cProfile (lower overhead than scalene)
GPU work (PyTorch, JAX)                  -> scalene (or NVIDIA Nsight for deep CUDA)
pre-merge perf regression in CI          -> scalene --json + threshold assertions
scaled, multi-process workers            -> py-spy on each worker; scalene is single-process
reduce noise on first run                -> --profile-only "yourpkg" + --reduced-profile
```

## Anti-Pattern

> [!warning] Anti-pattern
> running scalene under a dev shell that's also doing other
> work (build, indexing, language server). Sampling profilers attribute time
> to whatever was on-CPU when the sample fires; a noisy host produces
> noisy profiles. Use a dedicated terminal, close other heavy processes,
> and prefer a separate CI runner for regression tests over a shared
> build agent.

## Tips

- Scalene's most valuable column is "CPU% Python vs CPU% Native". A line at 80% Python time is a candidate for vectorization (numpy, polars); 80% native time means the bottleneck is in C and Python-side optimization will not help.
- Use --profile-only "pkg" to filter to your code. Without it, the output is dominated by stdlib/library frames and the signal-to-noise drops fast.
- --reduced-profile hides lines below ~1% — the table becomes readable on first scroll. Drop it once you have found the hot region and want detail.
- For memory work, --memory-leak-detector flags lines whose alloc/free balance is suspicious. Pair with --memory-only (skip CPU sampling) on memory-focused investigations.
- Scalene's overhead is meaningfully higher than py-spy's (call it 5-10% vs 1-2%). Do not use it as a continuous-profiling tool in production — it is a deep-investigation tool you reach for once you have narrowed down WHICH process to look at (often via py-spy first).
- The HTML report includes (with --ai) AI-generated optimization suggestions per line. They are hit-or-miss; treat them as starter ideas, not gospel.

## Common Mistake

> [!warning] Running scalene on a contended host alongside builds, indexing, language servers, or other heavy processes. Sampling profilers attribute time to whatever is on-CPU at the sample tick, so a noisy host gives noisy attribution — your hot line might just be the one that happened to be running while the indexer fired up. Use a dedicated terminal and close heavy processes; for CI, use a dedicated perf runner.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Function-level only — won't tell you WHICH LINE
cProfile.run("main()")
```

**Senior:**
```python
# Line-level CPU + memory + Python/native split
$ scalene --profile-only myapp script.py
```

## See Also

- [[Sections/debugging-profiling/cpu-profiling/cprofile-deterministic|cProfile — stdlib deterministic profiler (Debugging & Profiling)]]
- [[Sections/debugging-profiling/cpu-profiling/pyspy-sampling|py-spy — sampling profiler for live processes (Debugging & Profiling)]]
- [[Sections/debugging-profiling/cpu-profiling/_Index|Debugging & Profiling → CPU Profiling — cProfile, py-spy, scalene]]
- [[Sections/debugging-profiling/_Index|Debugging & Profiling index]]
- [[_Index|Vault index]]
