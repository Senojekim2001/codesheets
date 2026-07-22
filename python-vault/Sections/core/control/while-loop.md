---
type: "entry"
domain: "python"
file: "core"
section: "control"
id: "while-loop"
title: "while loop"
category: "Control Flow"
subtitle: "Condition-controlled loop — use for loops without a known endpoint"
signature_short: "while condition: ... else: ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "while loop"
  - "while-loop"
tags:
  - "python"
  - "python/core"
  - "python/core/control"
  - "category/control-flow"
  - "tier/tiered"
---

# while loop

> Condition-controlled loop — use for loops without a known endpoint

## Overview

while loops repeat as long as a condition is truthy. Use them when the number of iterations is not known in advance. Like for loops, while supports break, continue, and an else clause.

## Signature

```python
while condition: ... else: ...
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
# GOAL: repeat until a condition becomes false
n = 256
steps = 0

while n > 1:
    n //= 2   # halve n each iteration
    steps += 1

print(steps)  # → 8  (256 → 128 → 64 → ... → 1)
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
# GOAL: keep prompting until the user gives valid input
# WHY: while True + break is the clearest pattern for "retry until valid"
while True:
    answer = input("Enter yes or no: ").lower()
    if answer in ("yes", "no"):
        break
    print("Invalid — please enter yes or no")

print(f"You said: {answer}")
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
# GOAL: drain a list using while, and use while/else for a search
items = [3, 1, 4, 1, 5]

# WHY: 'while lst:' is the idiomatic "drain" pattern — pops until empty
while items:
    print(items.pop())   # → 5 1 4 1 3

# WHY: while/else — else runs only if the condition went False (no break hit)
i, target = 0, 4
while i < len([3, 1, 4, 1, 5]):
    if [3, 1, 4, 1, 5][i] == target:
        print(f"found at index {i}")
        break
    i += 1
else:
    print("not found")  # NOTE: only if no break was hit
#
# Decision rule:
#   known iteration count                      -> for x in range(N) / for x in iterable
#   condition-controlled, unknown count        -> while cond
#   "retry until valid"                        -> while True: ... if ok: break
#   "drain until empty"                        -> while container: container.pop()
#   read in chunks                             -> while (chunk := f.read(N)): (walrus)
#   poll with timeout                          -> while time.monotonic() < deadline
#   server / event loop main loop              -> framework's run() / while True with handlers
#   numeric convergence                        -> while abs(new - old) > tol
#
# Anti-pattern: `while True` with no break/return path or no progress check.
#   The loop variable doesn't update, the break condition is never met, or the timeout is
#   missing — and the script hangs. Always include either a guaranteed exit (counter, deadline,
#   stop condition) or a structured break. Defensive pattern: `for _ in range(MAX_ATTEMPTS)`
#   instead of `while True` so a runaway can't be infinite.
```

## Decision Rule

```text
known iteration count                      -> for x in range(N) / for x in iterable
condition-controlled, unknown count        -> while cond
"retry until valid"                        -> while True: ... if ok: break
"drain until empty"                        -> while container: container.pop()
read in chunks                             -> while (chunk := f.read(N)): (walrus)
poll with timeout                          -> while time.monotonic() < deadline
server / event loop main loop              -> framework's run() / while True with handlers
numeric convergence                        -> while abs(new - old) > tol
```

## Anti-Pattern

> [!warning] Anti-pattern
> `while True` with no break/return path or no progress check.
>   The loop variable doesn't update, the break condition is never met, or the timeout is
>   missing — and the script hangs. Always include either a guaranteed exit (counter, deadline,
>   stop condition) or a structured break. Defensive pattern: `for _ in range(MAX_ATTEMPTS)`
>   instead of `while True` so a runaway can't be infinite.

## Tips

- `while True: ... if done: break` is the clearest pattern for retry/input loops
- Always ensure the condition can become False — missing an update to the loop variable causes infinite loops
- Use `for` when you know the number of iterations; use `while` when you don't
- `while lst:` pops items until the list is empty — a common drain pattern

## Common Mistake

> [!warning] Forgetting to update the loop variable inside the while body. `while n > 0: print(n)` loops forever. Make sure `n` decrements or the condition eventually becomes False.

## See Also

- [[Sections/core/control/if-elif-else|if statement (Core Syntax & Built-ins)]]
- [[Sections/core/control/ternary|Ternary expression (Core Syntax & Built-ins)]]
- [[Sections/core/control/walrus|Walrus operator := (Core Syntax & Built-ins)]]
- [[Sections/core/control/for-loop|for loop (Core Syntax & Built-ins)]]
- [[Sections/core/control/_Index|Core Syntax & Built-ins → Control Flow]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]
