---
type: "entry"
domain: "python"
file: "core"
section: "output"
id: "print"
title: "print()"
category: "I/O"
subtitle: "Console output with sep=, end=, and file= options"
signature_short: "print(*args, sep=\" \", end=\"\\n\", file=sys.stdout)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "print()"
  - "print"
tags:
  - "python"
  - "python/core"
  - "python/core/output"
  - "category/i-o"
  - "tier/tiered"
---

# print()

> Console output with sep=, end=, and file= options

## Overview

print() converts all arguments to strings and writes them separated by sep (default space), ending with end (default newline). Use file= to redirect to a file or stderr. The flush= parameter forces an immediate write.

## Signature

```python
print(*args, sep=" ", end="\n", file=sys.stdout)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - show the simplest call: defaults only, no options, no error handling.
# STRENGTHS - fastest to read; teaches the core idea without distraction;
#             matches what you'd type into a REPL or a quick script.
# WEAKNESSES- relies on default behavior that may not fit real inputs;
#             skips edge cases, validation, and any production concerns.
#
# GOAL: write values to the console
print("hello", "world")       # → hello world
print("x =", 42, "y =", 3.14) # → x = 42 y = 3.14
print("line one")
print("line two")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - layer in the common parameters, idioms, and patterns a working
#             developer reaches for daily (cast inputs, format output, options).
# STRENGTHS - covers the 80% case for real projects; teaches the parameters you'll
#             meet in code reviews; balances clarity with practical control.
# WEAKNESSES- still trusts inputs and skips deeper concerns like logging,
#             retries, performance tuning, or graceful failure modes.
#
# GOAL: control separator, line ending, and use f-strings
name, score = "Alice", 95.5

# WHY: sep= replaces the default space between arguments
print("a", "b", "c", sep=", ")        # → a, b, c

# WHY: end="" suppresses the newline — useful inside loops
print("loading...", end="")
print(" done!")                        # → loading... done!

# WHY: f-strings format values inline with full precision control
print(f"{name}: {score:.1f}%")        # → Alice: 95.5%
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - address production concerns: validation, observability, resource
#             handling, and signaling intent (stderr, flush, logging, retries).
# STRENGTHS - safe to ship; handles edge cases and failure modes; integrates
#             with logging/monitoring; communicates engineering intent to teammates.
# WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;
#             assumes a system context (logging, stderr) that may not exist yet.
#
import sys

# GOAL: write to stderr and use flush for buffered output
# WHY: file=sys.stderr separates errors from normal output — stdout stays clean
print("Something went wrong", file=sys.stderr)

# WHY: flush=True forces the write immediately — useful in long-running scripts
print("Processing row 1000...", flush=True)

# NOTE: in production code, replace print() with the logging module
# logging.debug() / .info() / .warning() can be silenced by log level without touching the code
#
# Decision rule:
#   throwaway script / REPL / one-off debug   -> print()
#   library / framework / reusable module     -> logging.getLogger(__name__)
#   long-lived service / production           -> logging with structured handlers
#   error / warning to terminal               -> print(..., file=sys.stderr)
#   pipe-friendly CLI output (stdout)         -> print() (stdout is the data channel)
#   progress in long loop, unbuffered tty     -> print(..., flush=True) or tqdm
#   sub-millisecond hot loop                  -> sys.stdout.write() (skip print formatting)
#
# Anti-pattern: leaving print() statements as the production logging strategy.
#   Devs sprinkle print() through code, ship it, and now they cannot silence noisy output,
#   filter by level, route to a file/syslog, or correlate with request IDs. Use logging from
#   day one — the cost is one import and getLogger(__name__); the payoff is configurable verbosity.
```

## Decision Rule

```text
throwaway script / REPL / one-off debug   -> print()
library / framework / reusable module     -> logging.getLogger(__name__)
long-lived service / production           -> logging with structured handlers
error / warning to terminal               -> print(..., file=sys.stderr)
pipe-friendly CLI output (stdout)         -> print() (stdout is the data channel)
progress in long loop, unbuffered tty     -> print(..., flush=True) or tqdm
sub-millisecond hot loop                  -> sys.stdout.write() (skip print formatting)
```

## Anti-Pattern

> [!warning] Anti-pattern
> leaving print() statements as the production logging strategy.
>   Devs sprinkle print() through code, ship it, and now they cannot silence noisy output,
>   filter by level, route to a file/syslog, or correlate with request IDs. Use logging from
>   day one — the cost is one import and getLogger(__name__); the payoff is configurable verbosity.

## Tips

- `print(*lst)` unpacks a list as separate arguments — prints space-separated values
- `print(..., end="")` is useful in loops to build a line incrementally
- `print(..., file=sys.stderr)` sends to stderr without redirecting stdout
- For logging in production, use the `logging` module — never `print()`

## Common Mistake

> [!warning] Using `print` for debugging in production code. Use `logging.debug()` instead — it can be silenced by log level without touching the code.

## See Also

- [[Sections/core/output/input|input() (Core Syntax & Built-ins)]]
- [[Sections/core/output/isinstance|isinstance() (Core Syntax & Built-ins)]]
- [[Sections/core/output/getattr|getattr() (Core Syntax & Built-ins)]]
- [[Sections/core/output/hasattr|hasattr() (Core Syntax & Built-ins)]]
- [[Sections/core/output/_Index|Core Syntax & Built-ins → I/O & Introspection]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]
