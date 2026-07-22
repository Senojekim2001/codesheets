---
type: "entry"
domain: "python"
file: "core"
section: "control"
id: "walrus"
title: "Walrus operator :="
category: "Control Flow"
subtitle: "Named expression — assign inside while, if, and comprehensions"
signature_short: "if (n := compute()) > 0: use(n)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Walrus operator :="
  - "walrus"
tags:
  - "python"
  - "python/core"
  - "python/core/control"
  - "category/control-flow"
  - "tier/tiered"
---

# Walrus operator :=

> Named expression — assign inside while, if, and comprehensions

## Overview

The walrus operator := (Python 3.8+) assigns a value to a variable as part of an expression. It eliminates the "compute twice" pattern — where you compute a value to test it, then compute it again to use it.

## Signature

```python
if (n := compute()) > 0: use(n)
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
# GOAL: assign and test in the same line
import re

# WHY: without walrus you'd call re.search() once to check, then again to use it
text = "Order placed on 2024-03-15"
if (m := re.search(r"\d{4}-\d{2}-\d{2}", text)):
    print(m.group())  # → 2024-03-15
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
# GOAL: read a file in chunks without a separate priming read
# WHY: walrus eliminates the awkward "read, check, read again" pattern in while loops
with open("data.bin", "rb") as f:
    while (chunk := f.read(8192)):   # assigns and tests in one step
        process(chunk)               # chunk is always non-empty here
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
# GOAL: avoid calling an expensive transform twice inside a comprehension
data = [1, -2, 3, -4, 5]

def expensive(x):
    return x * 2   # imagine this is slow

# WHY: without walrus, expensive() is called twice per item — once to filter, once to include
bad  = [expensive(x) for x in data if expensive(x) > 0]

# WHY: walrus captures the result once — filter and output use the same computed value
good = [y for x in data if (y := expensive(x)) > 0]
# → [2, 6, 10]

# NOTE: wrap in parentheses — := has very low precedence and needs them in most expressions
#
# Decision rule:
#   read-loop: while (chunk := f.read(N)):    -> walrus (cleanest pattern)
#   regex match + use:  if (m := re.search): -> walrus (avoids double match)
#   filter + transform in one comprehension   -> walrus to compute once
#   plain assignment outside expression       -> regular = (no walrus)
#   need value across many lines               -> regular assignment for clarity
#   complex test inside listcomp filter        -> walrus, or extract to helper function
#   condition that doesn't need the value      -> just if / while (no walrus)
#
# Anti-pattern: sprinkling := in places where regular assignment would do.
#   `(x := 5)` adds noise without saving a line. The walrus earns its keep ONLY when the
#   assignment must happen inside an expression (loop condition, comprehension filter,
#   if-test where you also use the value). Outside those contexts, plain x = 5 is clearer
#   and easier to grep.
```

## Decision Rule

```text
read-loop: while (chunk := f.read(N)):    -> walrus (cleanest pattern)
regex match + use:  if (m := re.search): -> walrus (avoids double match)
filter + transform in one comprehension   -> walrus to compute once
plain assignment outside expression       -> regular = (no walrus)
need value across many lines               -> regular assignment for clarity
complex test inside listcomp filter        -> walrus, or extract to helper function
condition that doesn't need the value      -> just if / while (no walrus)
```

## Anti-Pattern

> [!warning] Anti-pattern
> sprinkling := in places where regular assignment would do.
>   `(x := 5)` adds noise without saving a line. The walrus earns its keep ONLY when the
>   assignment must happen inside an expression (loop condition, comprehension filter,
>   if-test where you also use the value). Outside those contexts, plain x = 5 is clearer
>   and easier to grep.

## Tips

- Most useful in `while` loops that read data — replaces the awkward `while True: x = read(); if not x: break`
- The walrus target leaks into the enclosing scope — useful but can surprise you
- In comprehensions, the walrus variable is available in the filter condition AND the output expression
- Wrap in parentheses: `if (n := fn()) > 0:` — the `:=` has lower precedence than comparison operators

## Common Mistake

> [!warning] Using `:=` for simple assignments: `(x := 5)`. This adds no value over `x = 5`. The walrus is only useful when the assignment happens *inside* an expression that is also testing or using the value.

## See Also

- [[Sections/core/control/if-elif-else|if statement (Core Syntax & Built-ins)]]
- [[Sections/core/control/ternary|Ternary expression (Core Syntax & Built-ins)]]
- [[Sections/core/control/for-loop|for loop (Core Syntax & Built-ins)]]
- [[Sections/core/control/while-loop|while loop (Core Syntax & Built-ins)]]
- [[Sections/core/control/_Index|Core Syntax & Built-ins → Control Flow]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]
