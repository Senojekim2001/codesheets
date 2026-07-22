---
type: "entry"
domain: "python"
file: "numpy"
section: "indexing"
id: "boolean-masking"
title: "Boolean masking"
category: "Indexing"
subtitle: "Returns a copy — combine conditions with & | ~"
signature_short: "a[a > 0] | a[(a > 0) & (a < 10)]"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Boolean masking"
  - "boolean-masking"
tags:
  - "python"
  - "python/numpy"
  - "python/numpy/indexing"
  - "category/indexing"
  - "tier/tiered"
---

# Boolean masking

> Returns a copy — combine conditions with & | ~

## Overview

Boolean indexing creates a boolean array and uses it to select elements. Always returns a copy (not a view). Combine multiple conditions with & (and), | (or), ~ (not) — never Python `and`/`or`/`not`.

## Signature

```python
a[a > 0] | a[(a > 0) & (a < 10)]
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - one boolean condition, one filtered array.
#             Reads exactly like a SQL WHERE.
# STRENGTHS - shortest possible "filter an array" — no loops,
#             no list comp.
# WEAKNESSES- doesn't yet show the &/|/~ rule for combined
#             conditions or the in-place assignment trick.
#
import numpy as np

scores = np.array([85, 42, 92, 38, 88])
scores[scores >= 80]     # array([85, 92, 88])
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday boolean-mask surface: combine
#             conditions with &/|/~ (NEVER Python and/or/not),
#             in-place clipping via mask assignment, and
#             extracting flat values from a 2D array.
# STRENGTHS - the &/|/~ rule is the most common bug source;
#             "scores[mask] = value" is the canonical clip
#             idiom; 2D mask flattening is what value-extraction
#             actually does.
# WEAKNESSES- doesn't address mask reuse across columns or
#             integer-codes-via-cumsum tricks — senior tier.
#
import numpy as np

scores = np.array([85, 42, 92, 38, 88, 76, 29, 94, 67, 81])

# Single and combined conditions
scores[scores >= 80]                    # high
scores[(scores >= 80) & (scores <= 90)] # band
scores[(scores < 40) | (scores > 95)]   # outliers
scores[~(scores >= 80)]                 # complement

# In-place clipping via mask assignment
clean = scores.copy()
clean[clean < 50] = 50                  # floor at 50

# 2D: extract values where condition is true (returns flat 1D)
regions = np.array([[82, 91, 78],
                    [45, 38, 52],
                    [88, 85, 79]])
high = regions[regions > 80]            # [82, 91, 88, 85]

# Boolean mask itself is a useful return — same shape as input
target_met = regions > 80                # 2D bool array
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production boolean masking: never use Python
#             and/or/not (raises ValueError on arrays); reach
#             for np.where for ternaries, np.select for
#             multi-branch, and np.clip for the simplest
#             clamp; reuse a mask across columns for
#             dimensional safety.
# STRENGTHS - the four primitives (mask, where, select, clip)
#             cover ~95% of "if/else over arrays" cases;
#             reusing one mask across columns prevents the
#             "different rows masked per column" bug.
# WEAKNESSES- np.select with many conditions becomes hard to
#             read; np.clip only handles min/max bounds; mask
#             arithmetic doesn't help when the branches need
#             completely different code paths.
#
import numpy as np

scores = np.array([85, 42, 92, 38, 88, 76, 29, 94, 67, 81])

# 1. Anti-pattern that ALWAYS fails on arrays
# scores[scores > 0 and scores < 10]    # ValueError — Python and on arrays
# Right:
scores[(scores > 0) & (scores < 10)]

# 2. Vectorized ternary — np.where(cond, x, y)
adjusted = np.where(scores >= 80, scores * 1.10, scores * 0.90)

# 3. Multi-branch — np.select beats nested np.where for clarity
ratings = np.select(
    [scores < 40, scores < 70, scores >= 90],
    ["poor",     "average",   "excellent"],
    default="good",
)

# 4. Simplest min/max clamp — np.clip beats mask assignment
clipped = np.clip(scores, 50, 100)        # floor at 50, ceil at 100

# 5. Reuse one mask across columns for dimensional safety
data = np.random.randn(100, 4)
keep = (data[:, 0] > 0) & (data[:, 1] < 1)
data_keep = data[keep]                    # same rows kept across all 4 cols

# Decision rule:
#   single filter                                -> a[mask]
#   binary if/else                               -> np.where(mask, x, y)
#   3+ branches                                  -> np.select([masks], [values], default=...)
#   floor / ceiling clamp                        -> np.clip(a, lo, hi)
#   combining conditions                         -> use & | ~ with parens, NEVER and/or/not
#   need rows from a 2D array                    -> 1D row-mask: a[a[:, k] > t]
#   need to set values in place                  -> a[mask] = value (no allocation)
#
# Anti-pattern: using Python and/or/not (or missing parens) on array conditions
#   scores[scores > 0 and scores < 10]   # ValueError: ambiguous truth value
#   scores[scores > 0 & scores < 10]     # wrong precedence; evaluates 0 & scores
#   The bitwise ops &/|/~ have LOWER precedence than comparison, so each
#   comparison must be parenthesized: scores[(scores > 0) & (scores < 10)].
```

## Decision Rule

```text
single filter                                -> a[mask]
binary if/else                               -> np.where(mask, x, y)
3+ branches                                  -> np.select([masks], [values], default=...)
floor / ceiling clamp                        -> np.clip(a, lo, hi)
combining conditions                         -> use & | ~ with parens, NEVER and/or/not
need rows from a 2D array                    -> 1D row-mask: a[a[:, k] > t]
need to set values in place                  -> a[mask] = value (no allocation)
```

## Anti-Pattern

> [!warning] Anti-pattern
> using Python and/or/not (or missing parens) on array conditions
>   scores[scores > 0 and scores < 10]   # ValueError: ambiguous truth value
>   scores[scores > 0 & scores < 10]     # wrong precedence; evaluates 0 & scores
>   The bitwise ops &/|/~ have LOWER precedence than comparison, so each
>   comparison must be parenthesized: scores[(scores > 0) & (scores < 10)].

## Tips

- Boolean indexing always returns a **copy** — unlike slicing which returns a view
- Use `&`, `|`, `~` for conditions — never Python `and`, `or`, `not` on arrays
- `np.where(cond, x, y)` is the vectorized ternary — much faster than any loop
- `a[mask] = value` sets values in-place without creating intermediate arrays

## Common Mistake

> [!warning] `a[a > 0 and a < 10]` raises ValueError. Python `and` calls `bool()` on arrays. Use `a[(a > 0) & (a < 10)]` with parentheses around each condition.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = []
for x in items:
    if x > 0:
        result.append(x)
```

**Senior:**
```python
result = [x for x in items if x > 0]
```

## See Also

- [[Sections/numpy/indexing/array-slicing|Array slicing (NumPy)]]
- [[Sections/numpy/indexing/fancy-indexing|Fancy indexing (NumPy)]]
- [[Sections/numpy/indexing/np-unique|np.unique() (NumPy)]]
- [[Sections/numpy/indexing/np-where|np.where() (NumPy)]]
- [[Sections/numpy/indexing/_Index|NumPy → Indexing & Slicing]]
- [[Sections/numpy/_Index|NumPy index]]
- [[_Index|Vault index]]
