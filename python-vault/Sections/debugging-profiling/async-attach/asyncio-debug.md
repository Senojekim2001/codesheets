---
type: "entry"
domain: "python"
file: "debugging-profiling"
section: "async-attach"
id: "asyncio-debug"
title: "asyncio debug mode — slow-callback and blocking-IO detection"
category: "Async Debugging"
subtitle: "asyncio.run(debug=True), loop.set_debug, loop.slow_callback_duration, asyncio.all_tasks, loop.set_exception_handler, PYTHONASYNCIODEBUG, aiomonitor"
signature_short: "asyncio.run(main(), debug=True)   # or: loop.set_debug(True); loop.slow_callback_duration = 0.05"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "asyncio debug mode — slow-callback and blocking-IO detection"
  - "asyncio-debug"
tags:
  - "python"
  - "python/debugging-profiling"
  - "python/debugging-profiling/async-attach"
  - "category/async-debugging"
  - "tier/tiered"
---

# asyncio debug mode — slow-callback and blocking-IO detection

> asyncio.run(debug=True), loop.set_debug, loop.slow_callback_duration, asyncio.all_tasks, loop.set_exception_handler, PYTHONASYNCIODEBUG, aiomonitor

## Overview

asyncio ships with a debug mode that catches the most common async bugs: a coroutine that synchronously blocks the event loop (e.g., requests.get instead of httpx.AsyncClient), a callback that takes too long (slow_callback_duration), a task that raised an exception nobody awaited, a coroutine returned from a function but never awaited. None of this is on by default. Beyond the built-in mode, aiomonitor exposes a curses TUI showing live tasks and a telnet REPL for live introspection. The three examples solve the SAME concrete task — a coroutine handler is mysteriously slow; identify the slow callback or hidden blocking call — at three depths: asyncio.run(debug=True) → tuned slow_callback_duration + all_tasks dump + exception handler → aiomonitor + signal-driven task dump + production diagnostics endpoint.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — A coroutine takes way longer than it should; find the slow callback or hidden blocking call.
- **Junior** — SAME — but tighten the threshold for sub-100ms stalls, dump every running task on demand, and capture exceptions that never get awaited.
- **Senior** — SAME — production-grade: live task introspection via aiomonitor, debug HTTP endpoint exposing /tasks, slow-callback warnings routed to structured logs, integration with prod log shipping.

## Signature

```python
asyncio.run(main(), debug=True)   # or: loop.set_debug(True); loop.slow_callback_duration = 0.05
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - A coroutine takes way longer than it should; find the slow
#             callback or hidden blocking call.
# APPROACH  - asyncio.run(main(), debug=True) emits warnings when callbacks
#             exceed loop.slow_callback_duration (default 0.1s) and prints
#             tracebacks for unhandled exceptions in tasks.
# STRENGTHS - One flag; surfaces several whole classes of bugs immediately.
# WEAKNESSES- Output is on stderr — make sure your logger captures it;
#             default 100ms threshold misses sub-millisecond stalls.
import asyncio
import time

async def good_handler():
    await asyncio.sleep(0.05)
    return "fast"

async def bad_handler():
    time.sleep(0.5)                                  # SYNC sleep — blocks the loop
    return "slow"

async def main():
    # Run both; the bad one will trigger a warning.
    return await asyncio.gather(good_handler(), bad_handler())

asyncio.run(main(), debug=True)
# Stderr (typical):
#   Executing <Task pending name='Task-3' coro=<bad_handler() running at ...>>
#   took 0.500 seconds
#
# That one line localizes the offending coroutine. Find time.sleep
# (or requests, or any sync I/O) inside it and replace.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but tighten the threshold for sub-100ms stalls,
#             dump every running task on demand, and capture exceptions
#             that never get awaited.
# APPROACH  - loop.slow_callback_duration tuned per workload; periodic
#             asyncio.all_tasks() dump triggered by signal; custom
#             exception_handler routes unhandled task errors to your log.
# STRENGTHS - Catches "task fired and forgot" bugs; pinpoints stalls
#             below the 100ms default; makes async tracebacks searchable.
# WEAKNESSES- Tighter slow_callback_duration produces more warnings;
#             tune to match your latency budget.
import asyncio, signal

def install_async_diagnostics(loop: asyncio.AbstractEventLoop) -> None:
    loop.set_debug(True)
    loop.slow_callback_duration = 0.02               # 20ms — adjust to your SLO

    def on_exception(loop, context):
        # context: dict with 'message', 'exception', 'task', 'future', etc.
        exc = context.get("exception")
        msg = context.get("message", "<no message>")
        task = context.get("task") or context.get("future")
        # Use your structured logger here in real code.
        print(f"[asyncio] {msg!r} task={task!r} exc={exc!r}")

    loop.set_exception_handler(on_exception)

def install_task_dump_signal() -> None:
    """SIGUSR1 -> dump every running task's stack. Linux/macOS only."""
    if not hasattr(signal, "SIGUSR1"):
        return
    def dump(*_):
        loop = asyncio.get_event_loop()
        for t in asyncio.all_tasks(loop):
            print(f"--- {t.get_name()} ({t._state}) ---")
            t.print_stack()
    signal.signal(signal.SIGUSR1, dump)

async def task_a():
    await asyncio.sleep(10)                          # long-running

async def task_b():
    raise ValueError("forgot to await me")           # exception, no awaiter

async def main():
    install_async_diagnostics(asyncio.get_running_loop())
    install_task_dump_signal()

    asyncio.create_task(task_a(), name="task_a")
    asyncio.create_task(task_b(), name="task_b")     # exception_handler catches this
    await asyncio.sleep(1)

asyncio.run(main())

# To dump pending tasks at any time:
#   $ kill -USR1 $(pgrep -f myapp)
# Stdout shows every task's stack — the asyncio equivalent of py-spy dump.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production-grade: live task introspection via aiomonitor,
#             debug HTTP endpoint exposing /tasks, slow-callback warnings
#             routed to structured logs, integration with prod log shipping.
# APPROACH  - aiomonitor for live curses + telnet REPL into the loop;
#             AdminAPI route returning live task summary; structured
#             logger for all asyncio diagnostics.
# STRENGTHS - Live diagnosis without restart; per-task wall-time + state
#             visible from a curl; survives container restarts via
#             stdout-shipped logs.
# WEAKNESSES- aiomonitor exposes a localhost telnet — never bind it to
#             a public interface; admin endpoints behind authentication.
import asyncio, logging, signal, traceback
from typing import Any
from contextlib import asynccontextmanager

# Use your real structlog/logging setup in production.
log = logging.getLogger("asyncio.diag")

# 1) Slow-callback + exception handler -> structured log (not print).
def diag_exception_handler(loop, context: dict[str, Any]) -> None:
    exc = context.get("exception")
    log.error(
        "asyncio_unhandled",
        extra={
            "message":   context.get("message"),
            "task_name": getattr(context.get("task"),   "get_name", lambda: None)(),
            "future":    repr(context.get("future")),
            "handle":    repr(context.get("handle")),
            "exc_type":  type(exc).__name__ if exc else None,
            "exc_msg":   str(exc) if exc else None,
            "traceback": "".join(traceback.format_exception(exc)) if exc else None,
        },
    )

# 2) Snapshot every task's state. Useful from a debug HTTP endpoint.
def snapshot_tasks(loop: asyncio.AbstractEventLoop | None = None) -> list[dict]:
    loop = loop or asyncio.get_event_loop()
    out = []
    for t in asyncio.all_tasks(loop):
        coro = t.get_coro()
        cr_frame = getattr(coro, "cr_frame", None) or getattr(coro, "ag_frame", None)
        out.append({
            "name":   t.get_name(),
            "state":  t._state,                       # PENDING / FINISHED / CANCELLED
            "done":   t.done(),
            "stack":  [
                f"{f.f_code.co_filename}:{f.f_lineno} in {f.f_code.co_name}"
                for f in _walk_frames(cr_frame)
            ] if cr_frame else [],
        })
    return out

def _walk_frames(frame):
    while frame is not None:
        yield frame
        frame = frame.f_back

# 3) FastAPI/aiohttp admin route exposing the snapshot.
# from fastapi import FastAPI
# app = FastAPI()
# @app.get("/admin/asyncio-tasks", dependencies=[Depends(require_admin)])
# async def list_tasks():
#     return {"tasks": snapshot_tasks()}

# 4) aiomonitor — live TUI / telnet REPL into the loop.
#    pip install aiomonitor
#    Once installed, wrap your run with:
#
#    import aiomonitor
#    async def main():
#        loop = asyncio.get_running_loop()
#        with aiomonitor.start_monitor(loop, host="127.0.0.1", port=50101):
#            await serve_forever()
#    asyncio.run(main())
#
#    Then from another shell:
#    $ python -m aiomonitor.cli                       # connect to localhost:50101
#    monitor> ps                                      # list tasks like 'top'
#    monitor> where TASK_NAME                         # show the task's stack
#    monitor> cancel TASK_ID                          # cancel a task

# 5) Bring it all together at startup.
async def main():
    loop = asyncio.get_running_loop()
    loop.set_debug(True)
    loop.slow_callback_duration = 0.02
    loop.set_exception_handler(diag_exception_handler)

    # SIGUSR1 -> dump tasks to log (Linux/macOS).
    if hasattr(signal, "SIGUSR1"):
        loop.add_signal_handler(
            signal.SIGUSR1,
            lambda: log.warning("asyncio_task_dump", extra={"tasks": snapshot_tasks(loop)}),
        )

    await serve_forever()

async def serve_forever():
    await asyncio.sleep(0)                            # placeholder

# asyncio.run(main())

# Decision rule:
#   coroutine handler is slow            -> asyncio.run(debug=True) + slow_callback_duration
#   "what tasks are running?"            -> asyncio.all_tasks(loop) snapshot
#   "show their stacks"                  -> for t in all_tasks: t.print_stack()
#   live REPL into the loop              -> aiomonitor start_monitor + telnet
#   debug HTTP endpoint                  -> /admin/tasks returning snapshot_tasks()
#   exception in fire-and-forget task    -> loop.set_exception_handler — never lose it
#   blocking I/O on the loop             -> debug=True warns; replace with async equivalent
#                                          (httpx.AsyncClient, aiofiles, asyncpg, etc.)
#   slow callback below 100ms threshold  -> loop.slow_callback_duration = 0.02 (your SLO)
#   "is this coroutine awaited?"         -> debug=True warns at GC time on un-awaited coros
#   PYTHONASYNCIODEBUG=1                 -> env-var alternative to debug=True; same effect
#
# Anti-pattern: leaving asyncio's debug mode off in development. Sync calls
# on the event loop (requests.get instead of httpx, time.sleep instead of
# asyncio.sleep, blocking DB drivers instead of asyncpg/aiosqlite) all run
# fine in tests but kneecap throughput in prod. debug=True is free; turn
# it on in dev + CI and the next time someone forgets an async equivalent,
# CI fails before the deploy.
```

## Decision Rule

```text
coroutine handler is slow            -> asyncio.run(debug=True) + slow_callback_duration
"what tasks are running?"            -> asyncio.all_tasks(loop) snapshot
"show their stacks"                  -> for t in all_tasks: t.print_stack()
live REPL into the loop              -> aiomonitor start_monitor + telnet
debug HTTP endpoint                  -> /admin/tasks returning snapshot_tasks()
exception in fire-and-forget task    -> loop.set_exception_handler — never lose it
blocking I/O on the loop             -> debug=True warns; replace with async equivalent
                                       (httpx.AsyncClient, aiofiles, asyncpg, etc.)
slow callback below 100ms threshold  -> loop.slow_callback_duration = 0.02 (your SLO)
"is this coroutine awaited?"         -> debug=True warns at GC time on un-awaited coros
PYTHONASYNCIODEBUG=1                 -> env-var alternative to debug=True; same effect
```

## Anti-Pattern

> [!warning] Anti-pattern
> leaving asyncio's debug mode off in development. Sync calls
> on the event loop (requests.get instead of httpx, time.sleep instead of
> asyncio.sleep, blocking DB drivers instead of asyncpg/aiosqlite) all run
> fine in tests but kneecap throughput in prod. debug=True is free; turn
> it on in dev + CI and the next time someone forgets an async equivalent,
> CI fails before the deploy.

## Tips

- asyncio.run(main(), debug=True) is the one-flag fix to enable every built-in async diagnostic. Equivalent: PYTHONASYNCIODEBUG=1 or loop.set_debug(True).
- loop.slow_callback_duration defaults to 0.1s — fine for batch workloads, far too lax for low-latency services. Set to your p99 latency budget (often 0.01-0.05s).
- asyncio.all_tasks(loop) returns every Task currently scheduled. Pair with t.print_stack() for the asyncio equivalent of py-spy dump — invaluable when "the request is hanging".
- loop.set_exception_handler catches errors in fire-and-forget tasks (asyncio.create_task without await). Without it, the exception is logged at GC time with a confusing "Task exception was never retrieved" warning and you may miss it entirely.
- aiomonitor is a one-line dev/staging install for live introspection — `start_monitor(loop)` opens a telnet REPL where you can ps / cancel / where on tasks. Never bind to a public interface in prod.
- Common blocking calls that asyncio debug mode exposes: requests, time.sleep, file I/O, DB drivers like psycopg2 (use psycopg 3 async), socket.recv. Replace with asyncio equivalents.

## Common Mistake

> [!warning] Leaving asyncio debug mode off in development. Sync calls on the event loop (requests, time.sleep, blocking DB drivers) work fine in unit tests but tank throughput in production. debug=True is free at dev time and would catch every one of these. Enable in dev + CI; CI fails before the deploy when someone forgets an async equivalent.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Default mode — silent on blocking I/O
asyncio.run(main())
```

**Senior:**
```python
# Debug mode — warns on slow callbacks, blocking I/O, unhandled exceptions
asyncio.run(main(), debug=True)
```

## See Also

- [[Sections/debugging-profiling/async-attach/_Index|Debugging & Profiling → Async Debugging & Production Attach]]
- [[Sections/debugging-profiling/_Index|Debugging & Profiling index]]
- [[_Index|Vault index]]
