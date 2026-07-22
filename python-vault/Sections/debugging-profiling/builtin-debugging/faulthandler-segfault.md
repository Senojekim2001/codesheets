---
type: "entry"
domain: "python"
file: "debugging-profiling"
section: "builtin-debugging"
id: "faulthandler-segfault"
title: "faulthandler — Python traceback on segfault / hang"
category: "Error Handling"
subtitle: "faulthandler.enable, dump_traceback_later, register, all_threads, SIGUSR1, file=stderr"
signature_short: "import faulthandler; faulthandler.enable()   # at process startup"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "faulthandler — Python traceback on segfault / hang"
  - "faulthandler-segfault"
tags:
  - "python"
  - "python/debugging-profiling"
  - "python/debugging-profiling/builtin-debugging"
  - "category/error-handling"
  - "tier/tiered"
---

# faulthandler — Python traceback on segfault / hang

> faulthandler.enable, dump_traceback_later, register, all_threads, SIGUSR1, file=stderr

## Overview

When a C extension segfaults or a thread deadlocks, Python's normal exception machinery is bypassed — you get a SIGSEGV with no traceback, or a hung process with no clue what each thread is doing. `faulthandler` (stdlib since 3.3) hooks the fatal signals at C level and dumps a Python traceback for every thread before the process dies. It can also dump traceback after a timeout (catch hangs) or on a chosen signal (operator-triggered diagnostics). The three examples solve the SAME concrete task — your numpy/torch/protobuf code segfaults intermittently in production; you need a Python traceback at the crash — at three depths: enable() at startup → add hang-detection via `dump_traceback_later` → operator-triggered SIGUSR1 dump and integration with the entrypoint.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — A C extension is segfaulting; get a Python traceback at the crash.
- **Junior** — SAME — and also catch HANGS: if the process is stuck for >30s, dump a traceback so you can see WHERE every thread is blocked.
- **Senior** — SAME — production-grade: enabled in entrypoint, SIGUSR1 dumps on demand for live triage, log file rotated by the orchestrator, coordinated with py-spy for non-fatal investigation.

## Signature

```python
import faulthandler; faulthandler.enable()   # at process startup
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - A C extension is segfaulting; get a Python traceback at the crash.
# APPROACH  - Call faulthandler.enable() at process startup. SIGSEGV /
#             SIGFPE / SIGABRT now print a Python traceback before exit.
# STRENGTHS - Stdlib; one line; works for every fatal signal Python catches.
# WEAKNESSES- Output goes to stderr by default — make sure that's collected.
import faulthandler
faulthandler.enable()                                # before anything else risky

# Now if a C extension segfaults, you get something like:
# Fatal Python error: Segmentation fault
#
# Current thread 0x... (most recent call first):
#   File "/app/process_image.py", line 142 in transform
#   File "/app/handler.py", line 58 in handle_request
#   File "/app/server.py", line 23 in main

# Run the offending code (a deliberately-crashing example).
def crash_via_ctypes():
    import ctypes
    ctypes.string_at(0)                               # null deref -> SIGSEGV

# crash_via_ctypes()      # uncomment to test (will exit the process)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — and also catch HANGS: if the process is stuck for >30s,
#             dump a traceback so you can see WHERE every thread is blocked.
# APPROACH  - dump_traceback_later(timeout) arms a watchdog. When it fires,
#             every thread's traceback is dumped to stderr, then the timer
#             resets so it keeps firing every 30s until cancel_dump.
# STRENGTHS - Diagnoses deadlocks, slow loops, GIL contention, blocking IO
#             without modifying the running code.
# WEAKNESSES- Adds steady-state overhead from the timer (small but nonzero);
#             cancel before doing intentional long blocks.
import faulthandler
import time

# Open a file we control so prod log shippers pick it up.
fault_log = open("/var/log/myapp/fault.log", "a", buffering=1)
faulthandler.enable(file=fault_log, all_threads=True)

# Watch for hangs. Repeat=True keeps re-arming so you see continued hangs.
faulthandler.dump_traceback_later(
    timeout=30,
    repeat=True,
    file=fault_log,
    exit=False,                                       # just dump; don't kill
)

# Some long work...
def long_running_task():
    # If this loop hangs for >30s, fault.log gets every thread's traceback.
    for _ in range(10):
        time.sleep(5)

long_running_task()

# Cancel before doing legitimately long work (or at clean shutdown).
faulthandler.cancel_dump_traceback_later()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production-grade: enabled in entrypoint, SIGUSR1 dumps
#             on demand for live triage, log file rotated by the orchestrator,
#             coordinated with py-spy for non-fatal investigation.
# APPROACH  - faulthandler.enable() + register(SIGUSR1) + dump_traceback_later
#             on a long timeout to catch true hangs only; written to a file
#             a logrotate config can roll. Operator runs 'kill -USR1 <pid>'
#             to dump all threads without killing the process.
# STRENGTHS - Three orthogonal triage signals (crash, hang, on-demand) all
#             land in one searchable log; production-safe, near-zero overhead.
# WEAKNESSES- SIGUSR1 conflicts with some libraries (uwsgi); pick SIGUSR2 if so.
import os
import signal
import sys
import faulthandler
from pathlib import Path

FAULT_LOG = Path(os.environ.get("FAULT_LOG", "/var/log/myapp/fault.log"))
FAULT_LOG.parent.mkdir(parents=True, exist_ok=True)
_fault_file = open(FAULT_LOG, "a", buffering=1)

def install_faulthandler() -> None:
    """Idempotent setup. Call from your service entrypoint, before any work."""
    # 1) Crash handler — fatal signals dump every thread to the log.
    faulthandler.enable(file=_fault_file, all_threads=True)

    # 2) Hang detector — long timeout so legitimate slow ops don't trigger.
    #    The orchestrator's healthcheck is the real "stuck" detector; this
    #    just gives us a traceback when that healthcheck eventually fails.
    faulthandler.dump_traceback_later(
        timeout=120, repeat=True, file=_fault_file, exit=False,
    )

    # 3) On-demand: 'kill -USR1 <pid>' prints all threads to the log
    #    without killing the process. Useful for "the worker is slow but
    #    not yet stuck" — operator can dump multiple times to spot a loop.
    if hasattr(signal, "SIGUSR1"):                    # Windows lacks it
        faulthandler.register(signal.SIGUSR1, file=_fault_file, all_threads=True)

def main():
    install_faulthandler()
    # ... your service ...
    serve_forever()

if __name__ == "__main__":
    main()

# Verify it works:
#   $ kill -USR1 $(pgrep -f myapp)
#   $ tail -n 50 /var/log/myapp/fault.log
# You'll see one block per thread with file/line/function for every frame.

# Decision rule:
#   C extension segfaults             -> faulthandler.enable() — no other tool catches this
#   process hangs unpredictably        -> dump_traceback_later(timeout=N, repeat=True)
#   "what is each worker doing now?"   -> faulthandler.register(SIGUSR1) + kill -USR1
#   live-attach without code change    -> py-spy dump --pid <PID>  (needs ptrace permission)
#   asyncio coroutines hang             -> asyncio.run(debug=True) + slow_callback_duration
#   file= must persist across restart   -> open in append mode, line-buffered (buffering=1)
#   prod log shipping                   -> point file= at a path your log shipper already tails
#   Windows                             -> faulthandler works for SIGSEGV; SIGUSR* don't exist
#
# Anti-pattern: turning on faulthandler ONLY in dev. The whole point is
# production crashes — when a C extension segfaults at 4am, you have one
# chance to capture a traceback and the dev-only build has lost it. Enable
# faulthandler in EVERY environment; it's cheap and only fires on disaster.
# The dual mistake: pointing file=stderr in a containerized service that
# discards stderr on crash. Use a real file the host preserves.
```

## Decision Rule

```text
C extension segfaults             -> faulthandler.enable() — no other tool catches this
process hangs unpredictably        -> dump_traceback_later(timeout=N, repeat=True)
"what is each worker doing now?"   -> faulthandler.register(SIGUSR1) + kill -USR1
live-attach without code change    -> py-spy dump --pid <PID>  (needs ptrace permission)
asyncio coroutines hang             -> asyncio.run(debug=True) + slow_callback_duration
file= must persist across restart   -> open in append mode, line-buffered (buffering=1)
prod log shipping                   -> point file= at a path your log shipper already tails
Windows                             -> faulthandler works for SIGSEGV; SIGUSR* don't exist
```

## Anti-Pattern

> [!warning] Anti-pattern
> turning on faulthandler ONLY in dev. The whole point is
> production crashes — when a C extension segfaults at 4am, you have one
> chance to capture a traceback and the dev-only build has lost it. Enable
> faulthandler in EVERY environment; it's cheap and only fires on disaster.
> The dual mistake: pointing file=stderr in a containerized service that
> discards stderr on crash. Use a real file the host preserves.

## Tips

- `faulthandler.enable()` is cheap and idempotent — call it as the FIRST thing in your service entrypoint. Enable in every environment, not just dev.
- For services that run inside containers, write the fault log to a path the host preserves (a mounted volume, a shipped log file). stderr is often lost when the process crashes.
- Pair `dump_traceback_later(repeat=True)` with the orchestrator's healthcheck timeout — 60-120s is typical. Shorter values trigger on legitimate slow operations.
- Use `register(SIGUSR1)` for live triage of slow-but-not-crashed processes: `kill -USR1 <pid>` dumps all threads. SIGUSR2 is the alternative if uwsgi (or similar) takes USR1.
- On Windows, `register()` and SIGUSR* don't exist — `enable()` still works for SIGSEGV. Wrap the register call in `hasattr(signal, "SIGUSR1")`.
- `faulthandler.is_enabled()` returns whether your call took effect — useful in tests that want to verify the entrypoint installed it.

## Common Mistake

> [!warning] Turning faulthandler on only in dev/staging. The whole point is production crashes — when a C extension segfaults at 4am, a dev-only build has lost the one chance to capture a traceback. Worse: pointing `file=stderr` in a containerized service that discards stderr on crash. Enable in every environment, write to a file the host preserves.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Dev-only enable — silent in prod where it matters most
if __debug__:
    faulthandler.enable()
```

**Senior:**
```python
# Enable everywhere; write to a path the host keeps
faulthandler.enable(file=open("/var/log/app/fault.log", "a", buffering=1),
                    all_threads=True)
```

## See Also

- [[Sections/debugging-profiling/builtin-debugging/traceback-formatting|traceback — capture, format, and chain exceptions (Debugging & Profiling)]]
- [[Sections/debugging-profiling/builtin-debugging/_Index|Debugging & Profiling → Built-in Debugging — pdb, traceback, faulthandler, inspect]]
- [[Sections/debugging-profiling/_Index|Debugging & Profiling index]]
- [[_Index|Vault index]]
