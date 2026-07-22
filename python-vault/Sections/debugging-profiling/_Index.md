---
type: "file-index"
domain: "python"
file: "debugging-profiling"
title: "Debugging & Profiling"
tags:
  - "python"
  - "python/debugging-profiling"
  - "index"
---

# Debugging & Profiling

> 12 entries across 4 sections.

## Built-in Debugging — pdb, traceback, faulthandler, inspect · 4

- [[Sections/debugging-profiling/builtin-debugging/pdb-breakpoint|pdb / breakpoint() — interactive Python debugger]] — Drop into a debugger to inspect state at a chosen point. breakpoint() is the modern entry; PYTHONBREAKPOINT swaps the implementation; post-mortem catches state at the moment an exception was raised.
- [[Sections/debugging-profiling/builtin-debugging/traceback-formatting|traceback — capture, format, and chain exceptions]] — Turn an exception into something an operator can debug from a log: full traceback, locals, cause chain. Stdlib alone is fine; rich.traceback / structlog elevate it.
- [[Sections/debugging-profiling/builtin-debugging/faulthandler-segfault|faulthandler — Python traceback on segfault / hang]] — Stdlib module that installs C-level signal handlers so SIGSEGV / SIGFPE / hangs print a Python traceback to stderr. Essential when a C extension crashes or a process locks up.
- [[Sections/debugging-profiling/builtin-debugging/inspect-introspection|inspect — programmatic signature introspection]] — Read the structure of a function or class at runtime: parameter names, types, defaults, kinds. The foundation for CLI generators (typer), DI containers, and decorator factories.

## CPU Profiling — cProfile, py-spy, scalene · 3

- [[Sections/debugging-profiling/cpu-profiling/cprofile-deterministic|cProfile — stdlib deterministic profiler]] — Stdlib deterministic profiler: instruments every Python function call and records exact counts and times. Works offline; pairs with snakeviz / gprof2dot for visualization. Heavy on small functions.
- [[Sections/debugging-profiling/cpu-profiling/pyspy-sampling|py-spy — sampling profiler for live processes]] — Sampling profiler that attaches to a running Python process by PID. No code change, no restart, no per-call overhead. Sees through the GIL; produces flame graphs from production workloads.
- [[Sections/debugging-profiling/cpu-profiling/scalene-line|scalene — line-level CPU + memory + GPU profiler]] — Sampling profiler with LINE-level granularity that separates Python time from native time and tracks memory allocations and GPU usage. Output is rich enough to drive optimization without guesswork.

## Memory Profiling — tracemalloc, memray, gc · 3

- [[Sections/debugging-profiling/memory-profiling/tracemalloc-stdlib|tracemalloc — stdlib heap snapshot profiler]] — Stdlib module that records the file/line of every Python allocation. Diff two snapshots to see what GREW between them; the canonical way to find Python-side memory bloat.
- [[Sections/debugging-profiling/memory-profiling/memray-allocs|memray — production-grade allocation tracker with flame graphs]] — Bloomberg's allocation profiler: tracks every malloc (Python AND C extensions), produces interactive flame graphs, supports live monitoring and PID attach. The right tool when tracemalloc misses native allocations.
- [[Sections/debugging-profiling/memory-profiling/gc-debugging|gc / weakref — diagnose reference cycles and stuck objects]] — When an object should be released but isn't, the gc module finds the references holding it. weakref.ref tells you when something is finally freed. objgraph visualizes the reference graph.

## Async Debugging & Production Attach · 2

- [[Sections/debugging-profiling/async-attach/asyncio-debug|asyncio debug mode — slow-callback and blocking-IO detection]] — Built-in asyncio diagnostics: warnings on slow callbacks, never-awaited coroutines, blocking I/O on the event loop, and unhandled exceptions in tasks. Free signal you almost never enable.
- [[Sections/debugging-profiling/async-attach/post-mortem-attach|Production attach — inspect a live process without restart]] — Connect to a misbehaving production process and inspect state without code change or restart: py-spy dump for stacks, aiomonitor for asyncio REPL, debugpy for full IDE attach, manhole for in-process Python REPL.
