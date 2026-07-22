---
type: "entry"
domain: "python"
file: "debugging-profiling"
section: "builtin-debugging"
id: "pdb-breakpoint"
title: "pdb / breakpoint() — interactive Python debugger"
category: "Debuggers"
subtitle: "breakpoint(), PYTHONBREAKPOINT, pdb.set_trace, pdb.post_mortem, conditional breakpoints, ipdb / pudb / pdbpp"
signature_short: "def buggy(x): breakpoint(); return x * 2   # PYTHONBREAKPOINT=ipdb.set_trace for ipdb"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pdb / breakpoint() — interactive Python debugger"
  - "pdb-breakpoint"
tags:
  - "python"
  - "python/debugging-profiling"
  - "python/debugging-profiling/builtin-debugging"
  - "category/debuggers"
  - "tier/tiered"
---

# pdb / breakpoint() — interactive Python debugger

> breakpoint(), PYTHONBREAKPOINT, pdb.set_trace, pdb.post_mortem, conditional breakpoints, ipdb / pudb / pdbpp

## Overview

Since Python 3.7, `breakpoint()` is the canonical way to enter a debugger — it dispatches to whatever `PYTHONBREAKPOINT` env var names. Default is stdlib pdb; setting `PYTHONBREAKPOINT=ipdb.set_trace` switches you to ipdb without changing code. Beyond planned breakpoints, pdb has two production-relevant modes: post-mortem debugging (drop into the frame where an exception happened) and remote attach for runaway processes. The three examples solve the SAME concrete task — a function returns the wrong value; inspect locals at the call site — at three depths: drop a literal `breakpoint()` → conditional + post-mortem on exception → production-safe entrypoint with PYTHONBREAKPOINT swap and ipdb integration.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — A function returns the wrong value; inspect locals at the call site.
- **Junior** — SAME — but trigger the debugger ONLY on the bad input, and drop into the frame on uncaught exceptions automatically.
- **Senior** — SAME — production-safe: developer can pick the debugger via env var; CI never enters one; remote-attach pattern for diagnosing a hung process without code changes.

## Signature

```python
def buggy(x): breakpoint(); return x * 2   # PYTHONBREAKPOINT=ipdb.set_trace for ipdb
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - A function returns the wrong value; inspect locals at the call site.
# APPROACH  - Drop a literal breakpoint() in the suspect function; run.
# STRENGTHS - Zero setup; works in any Python 3.7+; one-line removal.
# WEAKNESSES- Code change required to set; easy to forget and commit one.

def calculate_total(items):
    total = 0
    for item in items:
        breakpoint()                              # <- enter pdb here on every iteration
        total += item["price"] * item["qty"]
    return total

calculate_total([{"price": 10, "qty": 2}, {"price": 5, "qty": 3}])

# Once at the (Pdb) prompt, the high-leverage commands are:
#   p item                  # print item
#   pp item                 # pretty-print
#   ll                      # list source for current function
#   args                    # show args of current frame
#   n                       # next line (step over)
#   s                       # step into a call
#   c                       # continue until next breakpoint
#   q                       # quit
#   ! total = 99            # execute Python in the frame (mutates state)
#   interact                # drop into a full Python REPL with frame locals
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but trigger the debugger ONLY on the bad input,
#             and drop into the frame on uncaught exceptions automatically.
# APPROACH  - Conditional breakpoint() guarded by a predicate; sys.excepthook
#             that calls pdb.post_mortem so any uncaught exception drops us
#             into the failing frame with full locals intact.
# STRENGTHS - No more "step through 1000 iterations"; bugs that crash the
#             program become inspectable instead of one-shot tracebacks.
# WEAKNESSES- post_mortem replaces the default traceback; turn it off in CI.
import sys
import pdb

def calculate_total(items):
    total = 0
    for i, item in enumerate(items):
        # Conditional: only break when something looks off.
        if item.get("price", 0) < 0:
            breakpoint()
        total += item["price"] * item["qty"]
    return total

# Auto post-mortem on uncaught exceptions.
def _auto_pdb(exc_type, exc, tb):
    if exc_type is KeyboardInterrupt:
        return                                     # Ctrl-C should still exit
    sys.__excepthook__(exc_type, exc, tb)          # print the traceback first
    pdb.post_mortem(tb)                            # then drop into the failing frame

sys.excepthook = _auto_pdb

# Or one-shot, around a specific call:
try:
    calculate_total([{"price": 10}])               # KeyError at item["qty"]
except Exception:
    pdb.post_mortem()                              # drops into the frame that raised

# A .pdbrc file in $HOME or CWD runs commands at every pdb start. Useful:
# alias pi pp inspect.signature(%1)
# alias pdir pp dir(%1)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production-safe: developer can pick the debugger via
#             env var; CI never enters one; remote-attach pattern for
#             diagnosing a hung process without code changes.
# APPROACH  - PYTHONBREAKPOINT routes breakpoint() to ipdb in dev, no-ops
#             in CI; py-spy dump (separate entry) for prod attach;
#             contextlib helper that scopes auto-post-mortem narrowly.
# STRENGTHS - Same code ships everywhere; debugger choice is configuration;
#             CI cannot accidentally hang on a forgotten breakpoint().
# WEAKNESSES- Requires teaching the convention; ipdb is an extra dep.
import os, sys, pdb
from contextlib import contextmanager

# 1) Configure breakpoint() per environment via PYTHONBREAKPOINT.
#    Dev shell:    export PYTHONBREAKPOINT=ipdb.set_trace
#    Rich tracebacks: export PYTHONBREAKPOINT=pudb.set_trace
#    CI / prod:    export PYTHONBREAKPOINT=0          # makes breakpoint() a no-op
#    Default:      pdb.set_trace                       # stdlib

# 2) Conditional breakpoint with rich repr — useful for hard bugs that
#    only show up on weird inputs.
def calculate_total(items):
    from rich.pretty import pprint
    total = 0
    for i, item in enumerate(items):
        if item.get("price", 0) < 0:
            pprint(item)                            # rich-formatted before stop
            breakpoint()
        total += item["price"] * item["qty"]
    return total

# 3) Scoped auto-post-mortem — never globally; only inside a deliberate block.
@contextmanager
def auto_pdb_on_error():
    """Use only in dev tooling — CLI commands, REPL, jupyter. Never in services."""
    try:
        yield
    except KeyboardInterrupt:
        raise
    except Exception:
        sys.__excepthook__(*sys.exc_info())
        pdb.post_mortem()
        raise

if __name__ == "__main__":
    if os.environ.get("DEV_AUTO_PDB") == "1":
        with auto_pdb_on_error():
            calculate_total([{"price": 10}])
    else:
        calculate_total([{"price": 10}])

# 4) Remote attach to a running PID (no code change required) — see
#    "remote-attach-py-spy" entry. py-spy dump --pid <PID> prints a
#    full Python traceback for every thread in the live process.

# Decision rule:
#   know the line you want to stop      -> breakpoint() in code; PYTHONBREAKPOINT picks tool
#   only break for one bad input        -> if pred: breakpoint()
#   crashed and you have stderr         -> wrap in try/except + pdb.post_mortem
#   long-running CLI dev tool           -> auto_pdb_on_error() ctx; per-invocation only
#   production process is hung          -> py-spy dump --pid; do NOT touch the code
#   need richer UI than pdb             -> ipdb (tab-completion) or pudb (curses) via PYTHONBREAKPOINT
#   editor-integrated debugging         -> debugpy + VS Code attach; Pycharm remote debug
#   tests fail intermittently in CI     -> pytest --pdb on local rerun; never in CI
#   asyncio coroutine                   -> pdb works in 3.10+; otherwise asyncio.run(debug=True)
#
# Anti-pattern: setting sys.excepthook = pdb.post_mortem globally in code that
# might run unattended (cron, systemd, supervisord, Docker). When something
# raises at 3am the process pauses at the (Pdb) prompt forever — the host's
# memory fills, the orchestrator marks it healthy because it hasn't exited,
# and your incident clock keeps ticking. Use the scoped contextmanager OR
# guard with an env var (DEV_AUTO_PDB=1) that's never set in prod.
```

## Decision Rule

```text
know the line you want to stop      -> breakpoint() in code; PYTHONBREAKPOINT picks tool
only break for one bad input        -> if pred: breakpoint()
crashed and you have stderr         -> wrap in try/except + pdb.post_mortem
long-running CLI dev tool           -> auto_pdb_on_error() ctx; per-invocation only
production process is hung          -> py-spy dump --pid; do NOT touch the code
need richer UI than pdb             -> ipdb (tab-completion) or pudb (curses) via PYTHONBREAKPOINT
editor-integrated debugging         -> debugpy + VS Code attach; Pycharm remote debug
tests fail intermittently in CI     -> pytest --pdb on local rerun; never in CI
asyncio coroutine                   -> pdb works in 3.10+; otherwise asyncio.run(debug=True)
```

## Anti-Pattern

> [!warning] Anti-pattern
> setting sys.excepthook = pdb.post_mortem globally in code that
> might run unattended (cron, systemd, supervisord, Docker). When something
> raises at 3am the process pauses at the (Pdb) prompt forever — the host's
> memory fills, the orchestrator marks it healthy because it hasn't exited,
> and your incident clock keeps ticking. Use the scoped contextmanager OR
> guard with an env var (DEV_AUTO_PDB=1) that's never set in prod.

## Tips

- `breakpoint()` (Python 3.7+) is the modern entry — never write `import pdb; pdb.set_trace()` in new code. The env var routing makes the call site portable.
- Set `PYTHONBREAKPOINT=0` in CI to make stray `breakpoint()` calls a no-op. Combine with a pre-commit hook that flags committed `breakpoint()` lines.
- `PYTHONBREAKPOINT=ipdb.set_trace` is the most common dev-time swap — adds tab-completion, syntax highlighting, and `?`/`??` Object inspection.
- In pdb, `!` prefixes execute Python code in the current frame: `!self.x = 99` mutates state. `interact` drops into a full REPL with the frame's locals — escape hatch when the pdb commands feel limited.
- `pdb.post_mortem(tb)` opens the debugger in the FRAME WHERE THE EXCEPTION WAS RAISED — not where it was caught. Locals are still available; the call stack is intact.
- A `.pdbrc` in `$HOME` runs commands on every pdb start. Useful: `alias pi pp inspect.signature(%1)`, `alias pdir pp dir(%1)`, `import inspect`.

## Common Mistake

> [!warning] Globally setting `sys.excepthook = pdb.post_mortem` in code that might run unattended. When an exception hits a cron/systemd/Docker process at 3am, it pauses at the `(Pdb)` prompt indefinitely — the orchestrator can't tell it's hung, memory accumulates, and the bug compounds. Scope auto-post-mortem to dev tooling (CLI commands, REPLs) via a contextmanager or an env-var guard.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Old idiom — works, but PYTHONBREAKPOINT can't redirect it
import pdb; pdb.set_trace()
```

**Senior:**
```python
# Modern: respects PYTHONBREAKPOINT, one-line removal
breakpoint()
```

## See Also

- [[Sections/debugging-profiling/builtin-debugging/_Index|Debugging & Profiling → Built-in Debugging — pdb, traceback, faulthandler, inspect]]
- [[Sections/debugging-profiling/_Index|Debugging & Profiling index]]
- [[_Index|Vault index]]
