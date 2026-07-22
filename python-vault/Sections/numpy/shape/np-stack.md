---
type: "entry"
domain: "python"
file: "numpy"
section: "shape"
id: "np-stack"
title: "np.stack()"
category: "Shape"
subtitle: "All arrays must have identical shapes — creates one new dimension"
signature_short: "np.stack([a, b, c], axis=0)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "np.stack()"
  - "np-stack"
tags:
  - "python"
  - "python/numpy"
  - "python/numpy/shape"
  - "category/shape"
  - "tier/tiered"
---

# np.stack()

> All arrays must have identical shapes — creates one new dimension

## Overview

np.stack() joins a sequence of arrays along a new axis. All input arrays must have exactly the same shape. The result has one more dimension than the inputs. axis= controls where the new dimension is inserted.

## Signature

```python
np.stack([a, b, c], axis=0)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - join two same-shape 1D arrays along a NEW axis.
#             axis=0 stacks vertically, axis=1 column-wise.
# STRENGTHS - reveals what stack does that concatenate doesn't:
#             it ADDS a dimension.
# WEAKNESSES- doesn't yet contrast stack vs concatenate or
#             show how the choice maps to "batch axis" in ML.
#
import numpy as np

a = np.array([1, 2, 3])      # shape (3,)
b = np.array([4, 5, 6])      # shape (3,)

np.stack([a, b], axis=0)     # shape (2, 3)
np.stack([a, b], axis=1)     # shape (3, 2)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday stack surface: stacking 2D arrays
#             along a new batch axis (the canonical ML
#             pattern), the vstack/hstack convenience
#             wrappers, and the rule that stack REQUIRES
#             matching shapes.
# STRENGTHS - covers what stack does in real ML code: turn a
#             list of (H, W) arrays into a (B, H, W) batch.
# WEAKNESSES- doesn't address the "stack vs concatenate"
#             decision rule explicitly or the slow-loop
#             anti-pattern — senior tier.
#
import numpy as np

# 2D inputs — stack creates a NEW dimension at axis=
A = np.ones((3, 4))
B = np.ones((3, 4))

np.stack([A, B], axis=0)             # (2, 3, 4)  new batch dim at front
np.stack([A, B], axis=2)             # (3, 4, 2)  new dim at back

# Build a batch from a list of same-shape samples
samples = [np.random.randn(64, 64) for _ in range(32)]
batch = np.stack(samples, axis=0)    # (32, 64, 64)

# Convenience wrappers — but be careful what they actually do
np.vstack([a, b])                    # for 1D this is stack(axis=0)
np.hstack([a, b])                    # for 1D this is concatenate (NOT stack)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production stack: never accumulate via repeated
#             stack/concatenate in a loop (O(n^2)); collect into
#             a list and stack once; pre-allocate when shapes
#             are known up front; pick stack vs concatenate
#             based on "new axis" vs "extend existing axis".
# STRENGTHS - the list-then-stack pattern is correct and fast;
#             pre-allocation is even faster when shapes are
#             known; the decision rule eliminates the
#             stack/concatenate confusion entirely.
# WEAKNESSES- list-then-stack still allocates the final big
#             array; pre-allocation requires knowing the
#             count in advance; very large stacks may want
#             explicit dtype/order to avoid copies.
#
import numpy as np

# 1. Anti-pattern: accumulate by repeated stack — O(n^2)
# batch = np.empty((0, 64, 64))
# for sample in samples:
#     batch = np.concatenate([batch, sample[None]], axis=0)   # SLOW

# 2. Right: collect into a list, stack once
buf = []
for sample in samples:
    buf.append(process(sample))
batch = np.stack(buf, axis=0)          # one allocation

# 3. Faster still: pre-allocate when shapes are known
batch = np.empty((len(samples), 64, 64), dtype=np.float32)
for i, sample in enumerate(samples):
    batch[i] = process(sample)         # write in-place, zero copies

# 4. Quick guide: stack vs concatenate
#    "I have N items, I want N to become a NEW axis"          -> stack
#    "I have arrays I want to extend along an EXISTING axis"  -> concatenate
#
#    np.stack([(H,W), (H,W)], axis=0)        -> (2, H, W)        new axis
#    np.concatenate([(H,W), (H,W)], axis=0)  -> (2*H, W)         extends rows

# 5. vstack/hstack/dstack — readable but easy to misuse
#    vstack([1D_a, 1D_b]) -> (2, N)     stack-like
#    vstack([2D_a, 2D_b]) -> (Ra+Rb, C) concatenate-like
#    Pick stack/concatenate explicitly when the array dim might vary.
#
# Decision rule:
#   N items become a NEW axis (build a batch)    -> np.stack([...], axis=0)
#   extend an EXISTING axis (more rows / cols)   -> np.concatenate([...], axis=k)
#   1D arrays as columns of a 2D matrix          -> np.column_stack(arrays)
#   building a batch from a known count          -> pre-allocate np.empty + index-write
#   building incrementally, count unknown        -> append to list, np.stack ONCE at end
#   need same axis convention but unsure dim     -> np.stack/concatenate explicitly (NOT vstack)
#   stacking samples from a generator            -> np.fromiter or list-then-stack
#
# Anti-pattern: growing a batch via repeated np.stack/np.concatenate in a loop
#   batch = np.empty((0, 64, 64))
#   for s in samples:
#       batch = np.concatenate([batch, s[None]], axis=0)   # O(n^2) — copies every iter
#   Right: collect into a Python list and stack ONCE at the end, OR pre-allocate
#   np.empty((N, 64, 64), dtype=...) up front and write batch[i] = s.
```

## Decision Rule

```text
N items become a NEW axis (build a batch)    -> np.stack([...], axis=0)
extend an EXISTING axis (more rows / cols)   -> np.concatenate([...], axis=k)
1D arrays as columns of a 2D matrix          -> np.column_stack(arrays)
building a batch from a known count          -> pre-allocate np.empty + index-write
building incrementally, count unknown        -> append to list, np.stack ONCE at end
need same axis convention but unsure dim     -> np.stack/concatenate explicitly (NOT vstack)
stacking samples from a generator            -> np.fromiter or list-then-stack
```

## Anti-Pattern

> [!warning] Anti-pattern
> growing a batch via repeated np.stack/np.concatenate in a loop
>   batch = np.empty((0, 64, 64))
>   for s in samples:
>       batch = np.concatenate([batch, s[None]], axis=0)   # O(n^2) — copies every iter
>   Right: collect into a Python list and stack ONCE at the end, OR pre-allocate
>   np.empty((N, 64, 64), dtype=...) up front and write batch[i] = s.

## Tips

- `np.stack()` requires all arrays to have the **exact same shape** — use `np.concatenate()` for different sizes
- `axis=0` (default) adds the new axis at the front — `axis=-1` adds it at the back
- Stack is conceptually "adding a new dimension" — concatenate is "extending an existing one"
- `np.vstack` is `stack(axis=0)` for 1D, but `concatenate(axis=0)` for 2D+ — be careful
- Collect samples into a Python list and stack ONCE at the end — repeated stack/concatenate inside a loop is O(n²) because each call copies the growing buffer

## Common Mistake

> [!warning] Confusing `np.stack` and `np.concatenate`. stack([shape(3,)], [shape(3,)]) → shape (2,3) — new axis. concatenate([shape(3,)], [shape(3,)]) → shape (6,) — extended axis.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
import numpy as np
a = np.array([1, 2, 3])   # shape (3,)
b = np.array([4, 5, 6])   # shape (3,)
```

**Senior:**
```python
np.hstack([a, b])           # concatenate along axis 1 (not stack)
```

## See Also

- [[Sections/numpy/shape/reshape|np.reshape() (NumPy)]]
- [[Sections/numpy/shape/np-concatenate|np.concatenate() (NumPy)]]
- [[Sections/numpy/shape/np-tile|np.tile() (NumPy)]]
- [[Sections/numpy/shape/np-repeat|np.repeat() (NumPy)]]
- [[Sections/numpy/shape/_Index|NumPy → Shape & Structure]]
- [[Sections/numpy/_Index|NumPy index]]
- [[_Index|Vault index]]
