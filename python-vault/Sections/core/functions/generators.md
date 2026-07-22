---
type: "entry"
domain: "python"
file: "core"
section: "functions"
id: "generators"
title: "Generators"
category: "Functions"
subtitle: "yield pauses a function and resumes on next()"
signature_short: "def gen(): yield value | (expr for x in it)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Generators"
  - "generators"
tags:
  - "python"
  - "python/core"
  - "python/core/functions"
  - "category/functions"
  - "tier/tiered"
---

# Generators

> yield pauses a function and resumes on next()

## Overview

A generator function contains yield — calling it returns a generator object without executing the body. Each call to next() resumes execution until the next yield. Generators are memory-efficient for large or infinite sequences.

## Signature

```python
def gen(): yield value | (expr for x in it)
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
# GOAL: produce values one at a time with yield
def count_up(n):
    for i in range(n):
        yield i          # pauses here and resumes on next call

g = count_up(3)
next(g)   # → 0
next(g)   # → 1
list(count_up(3))  # → [0, 1, 2]
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
# GOAL: use a generator expression to avoid loading everything into memory
# WHY: () creates a lazy generator — values computed one at a time
squares = (x**2 for x in range(1_000_000))  # uses almost no memory
next(squares)   # → 0
next(squares)   # → 1

# WHY: yield from delegates to another iterable — cleaner than a nested for loop
def chain_two(a, b):
    yield from a
    yield from b

list(chain_two([1, 2], [3, 4]))  # → [1, 2, 3, 4]
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
# GOAL: build a lazy processing pipeline — each stage yields one item at a time
def read_lines(path):
    with open(path) as f:
        yield from f                          # one line at a time

def strip_comments(lines):
    for line in lines:
        if not line.startswith("#"):
            yield line                        # only non-comment lines

def parse(lines):
    for line in lines:
        yield line.strip().split(",")         # split each line into fields

# WHY: each stage is lazy — no intermediate lists, constant memory regardless of file size
data = parse(strip_comments(read_lines("data.csv")))

# NOTE: generators are single-use — call the function again to restart
#
# Decision rule:
#   producing items lazily, one at a time      -> generator function (yield)
#   one-line transform of an iterable          -> generator expression (... for ...)
#   build a real list                           -> list comprehension [...]
#   build a real dict / set                     -> dict / set comprehension
#   stream data through stages                  -> chain of generators (pipeline pattern)
#   need random access / len() / multiple passes -> list (NOT generator)
#   async stream of values                      -> async generator (async def + yield)
#   need to send values back in (coroutine)     -> generator.send() (rare; usually use async)
#
# Anti-pattern: consuming a generator twice expecting the same items.
#   `g = (x*x for x in range(3)); list(g); list(g)` — the second call returns []. Generators
#   are single-pass iterators that exhaust on use. If you need multiple passes, materialize
#   to a list (or recreate the generator). For huge data where listing is impossible, redesign
#   to compute results in a single pass.
```

## Decision Rule

```text
producing items lazily, one at a time      -> generator function (yield)
one-line transform of an iterable          -> generator expression (... for ...)
build a real list                           -> list comprehension [...]
build a real dict / set                     -> dict / set comprehension
stream data through stages                  -> chain of generators (pipeline pattern)
need random access / len() / multiple passes -> list (NOT generator)
async stream of values                      -> async generator (async def + yield)
need to send values back in (coroutine)     -> generator.send() (rare; usually use async)
```

## Anti-Pattern

> [!warning] Anti-pattern
> consuming a generator twice expecting the same items.
>   `g = (x*x for x in range(3)); list(g); list(g)` — the second call returns []. Generators
>   are single-pass iterators that exhaust on use. If you need multiple passes, materialize
>   to a list (or recreate the generator). For huge data where listing is impossible, redesign
>   to compute results in a single pass.

## Tips

- Generator expressions `(... for ...)` are like list comprehensions but lazy — use them to save memory
- `yield from sub_gen` is cleaner than `for item in sub_gen: yield item`
- Generators can only be consumed once — call the function again to restart
- Use `list(gen)` or `for x in gen:` to consume a generator

## Common Mistake

> [!warning] Trying to reuse a consumed generator: `g = gen(); list(g); list(g)` — second `list()` returns `[]`. Generators are single-use iterators. Call the function again to get a fresh one.

## See Also

- [[Sections/core/functions/def|def (Core Syntax & Built-ins)]]
- [[Sections/core/functions/args-kwargs|*args / **kwargs (Core Syntax & Built-ins)]]
- [[Sections/core/functions/lambda|lambda (Core Syntax & Built-ins)]]
- [[Sections/core/functions/decorators|Decorators (Core Syntax & Built-ins)]]
- [[Sections/core/functions/_Index|Core Syntax & Built-ins → Functions]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]
