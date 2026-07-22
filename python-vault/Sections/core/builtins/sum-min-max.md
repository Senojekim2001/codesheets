---
type: "entry"
domain: "python"
file: "core"
section: "builtins"
id: "sum-min-max"
title: "Numeric built-ins"
category: "Builtins"
subtitle: "Reduce sequences to a single numeric value"
signature_short: "sum(iterable, start=0) | min(it, key=fn) | max(it, key=fn)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Numeric built-ins"
  - "sum-min-max"
tags:
  - "python"
  - "python/core"
  - "python/core/builtins"
  - "category/builtins"
  - "tier/tiered"
---

# Numeric built-ins

> Reduce sequences to a single numeric value

## Overview

sum(), min(), and max() work on any iterable. min() and max() accept a key= function for custom comparison logic. round() uses banker's rounding (round half to even) — which can surprise you on .5 values.

## Signature

```python
sum(iterable, start=0) | min(it, key=fn) | max(it, key=fn)
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
nums = [3, 1, 4, 1, 5, 9]

sum(nums)          # → 23
min(nums)          # → 1
max(nums)          # → 9
abs(-7)            # → 7
round(3.14159, 2)  # → 3.14
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
# GOAL: use key= to find min/max by a computed property
words = ["banana", "apple", "fig", "cherry"]

# WHY: key= tells min/max what to compare — no need to sort the whole list
min(words, key=len)         # → 'fig'      (shortest word)
max(words, key=len)         # → 'banana'   (longest word)

# WHY: sum() with a generator avoids building an intermediate list
total_squares = sum(x**2 for x in range(10))  # → 285
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
# GOAL: watch out for banker's rounding and use fast modular pow
round(2.5)   # → 2  (rounds to even — not 3!)
round(3.5)   # → 4  (rounds to even)

# WHY: Python follows IEEE 754 banker's rounding — surprises people expecting "round half up"
# Use math.floor(x + 0.5) if you always need round-half-up behaviour

# WHY: three-argument pow() uses fast modular exponentiation — much faster than (base**exp) % mod
pow(2, 10, 1000)   # → 24  (2^10 mod 1000, computed efficiently)

# NOTE: min(it, key=fn) is faster than sorted(it, key=fn)[0] — avoids sorting the whole list
#
# Decision rule:
#   add up numbers in iterable                -> sum(iterable) (NOT reduce(+, ...))
#   smallest / largest by natural order       -> min(it) / max(it)
#   smallest / largest by computed key        -> min(it, key=fn)
#   need top-K, not just one                  -> heapq.nlargest(k, it) / nsmallest
#   absolute value                             -> abs(x)
#   round to N decimals                       -> round(x, n) (banker's rounding!)
#   need round-half-up always                 -> int(x + 0.5) for positives or decimal.ROUND_HALF_UP
#   modular exponentiation                    -> pow(base, exp, mod) (huge perf win for crypto)
#
# Anti-pattern: `sum(lst_of_lists, [])` to flatten nested lists.
#   This works but is O(n²) because each + creates a new list. Use
#   `list(itertools.chain.from_iterable(lst_of_lists))` for O(n), or for NumPy/pandas data use
#   their native concat / np.concatenate. The sum() trick is famous on Stack Overflow but is
#   actively bad on more than ~100 sublists.
```

## Decision Rule

```text
add up numbers in iterable                -> sum(iterable) (NOT reduce(+, ...))
smallest / largest by natural order       -> min(it) / max(it)
smallest / largest by computed key        -> min(it, key=fn)
need top-K, not just one                  -> heapq.nlargest(k, it) / nsmallest
absolute value                             -> abs(x)
round to N decimals                       -> round(x, n) (banker's rounding!)
need round-half-up always                 -> int(x + 0.5) for positives or decimal.ROUND_HALF_UP
modular exponentiation                    -> pow(base, exp, mod) (huge perf win for crypto)
```

## Anti-Pattern

> [!warning] Anti-pattern
> `sum(lst_of_lists, [])` to flatten nested lists.
>   This works but is O(n²) because each + creates a new list. Use
>   `list(itertools.chain.from_iterable(lst_of_lists))` for O(n), or for NumPy/pandas data use
>   their native concat / np.concatenate. The sum() trick is famous on Stack Overflow but is
>   actively bad on more than ~100 sublists.

## Tips

- `min(it, key=fn)` is more efficient than `sorted(it, key=fn)[0]` — avoids sorting the whole list
- `sum(gen)` with a generator expression avoids building an intermediate list
- `round(2.5) == 2` — Python uses banker's rounding. Use `math.floor(x + 0.5)` for always-round-up
- `pow(base, exp, mod)` is much faster than `(base**exp) % mod` for large numbers

## Common Mistake

> [!warning] Calling `sum([[1,2],[3,4]], [])` to flatten a list. It works but is O(n²). Use `list(itertools.chain.from_iterable([[1,2],[3,4]]))` for O(n).

## See Also

- [[Sections/core/builtins/len|len() (Core Syntax & Built-ins)]]
- [[Sections/core/builtins/range|range() (Core Syntax & Built-ins)]]
- [[Sections/core/builtins/any-all|any() / all() (Core Syntax & Built-ins)]]
- [[Sections/core/builtins/enumerate|enumerate() (Core Syntax & Built-ins)]]
- [[Sections/core/builtins/_Index|Core Syntax & Built-ins → Built-in Functions]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]
