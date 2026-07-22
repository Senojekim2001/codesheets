---
type: "entry"
domain: "python"
file: "numpy"
section: "creation"
id: "np-random"
title: "np.random.default_rng()"
category: "Creation"
subtitle: "default_rng(seed) for reproducible results — replaces legacy np.random"
signature_short: "rng = np.random.default_rng(seed=42)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "np.random.default_rng()"
  - "np-random"
tags:
  - "python"
  - "python/numpy"
  - "python/numpy/creation"
  - "category/creation"
  - "tier/tiered"
---

# np.random.default_rng()

> default_rng(seed) for reproducible results — replaces legacy np.random

## Overview

The modern NumPy random API uses default_rng() to create a Generator object. Always pass a seed for reproducibility. This replaces the legacy np.random.seed() / np.random.rand() API which used global state.

## Signature

```python
rng = np.random.default_rng(seed=42)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - create a Generator with a seed for reproducibility,
#             draw a few uniform samples and integers.
# STRENGTHS - the modern API in three lines; immediately
#             reproducible thanks to the seed.
# WEAKNESSES- doesn't yet show distributions beyond uniform,
#             choice/shuffle, or the legacy-API anti-pattern.
#
import numpy as np

rng = np.random.default_rng(seed=42)
rng.random(5)                      # uniform [0, 1)
rng.integers(0, 10, size=5)        # ints in [0, 10) exclusive
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday Generator surface: normal/uniform/
#             binomial/poisson/exponential, choice with and
#             without replacement, shuffle vs permutation.
#             Always seed for reproducibility.
# STRENGTHS - covers what numpy random looks like in real code:
#             generate a synthetic dataset, sample without
#             replacement, shuffle for an epoch.
# WEAKNESSES- doesn't address parallel/independent streams via
#             SeedSequence.spawn, or the "global state is bad"
#             rule for libraries — senior tier.
#
import numpy as np

rng = np.random.default_rng(seed=42)

# Distributions
rng.normal(loc=0, scale=1, size=(3, 3))           # mean=0, std=1
rng.uniform(low=0, high=10, size=100)
rng.binomial(n=10, p=0.5, size=100)
rng.poisson(lam=3, size=100)
rng.exponential(scale=1.0, size=100)

# Choice — sampling with or without replacement
rng.choice(["a", "b", "c"], size=10, replace=True)
rng.choice(100, size=10, replace=False)            # 10 distinct ints in [0,100)

# Shuffle vs permutation
arr = np.arange(10)
rng.shuffle(arr)                                   # in-place
shuffled = rng.permutation(arr)                    # returns a new array
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production randomness: never use the legacy
#             np.random.* (global state); use SeedSequence to
#             spawn independent streams across workers; pin a
#             seed at the boundary (config or CLI) and pass the
#             rng down — don't call default_rng() in deep code.
# STRENGTHS - per-worker independent streams are the only safe
#             pattern for parallelism; passing rng down keeps
#             functions deterministic given their inputs;
#             SeedSequence is reproducible and lock-free.
# WEAKNESSES- requires plumbing rng through call sites;
#             SeedSequence syntax is one more thing to learn;
#             some libraries still expect a numpy global seed.
#
import numpy as np
from numpy.random import default_rng, SeedSequence

# 1. Seed at the boundary (config / CLI), inject rng into helpers
def make_dataset(rng: np.random.Generator, n: int):
    return rng.normal(size=(n, 4))

ROOT_SEED = 42
rng = default_rng(ROOT_SEED)
data = make_dataset(rng, 1000)

# 2. Independent streams for parallel workers
ss = SeedSequence(ROOT_SEED)
worker_seeds = ss.spawn(8)                  # 8 independent child sequences
worker_rngs  = [default_rng(s) for s in worker_seeds]
# Each worker uses its own rng — no global state, no cross-talk.

# 3. Reproducible ML split
def stratified_indices(y: np.ndarray, frac: float, rng):
    out = []
    for cls in np.unique(y):
        idx = np.flatnonzero(y == cls)
        rng.shuffle(idx)
        cut = int(len(idx) * frac)
        out.append(idx[:cut])
    return np.concatenate(out)

# 4. Common pitfalls
#    np.random.seed(42)        - global state; threading-unsafe; AVOID
#    np.random.rand(5)         - legacy API; use rng.random(5)
#    Calling default_rng() inside a hot loop -> different seed each call
#
# Decision rule:
#   single-threaded reproducible script          -> rng = default_rng(seed)
#   library code (no global state allowed)       -> accept rng parameter, never create one
#   parallel workers / multiprocessing           -> SeedSequence(seed).spawn(N) per worker
#   uniform [0,1) samples                        -> rng.random(size)
#   integers in a half-open range                -> rng.integers(low, high, size)
#   sample without replacement                   -> rng.choice(pop, size, replace=False)
#   full-corpus shuffle in place                 -> rng.shuffle(arr)
#   need a fresh shuffled copy                   -> rng.permutation(arr)
#
# Anti-pattern: np.random.seed(42) + np.random.rand(...) (legacy global API)
#   Global RNG state is shared across threads, libraries, and notebooks — one
#   stray call elsewhere reorders your sequence and breaks reproducibility.
#   Use rng = np.random.default_rng(42) and pass rng explicitly through code.
```

## Decision Rule

```text
single-threaded reproducible script          -> rng = default_rng(seed)
library code (no global state allowed)       -> accept rng parameter, never create one
parallel workers / multiprocessing           -> SeedSequence(seed).spawn(N) per worker
uniform [0,1) samples                        -> rng.random(size)
integers in a half-open range                -> rng.integers(low, high, size)
sample without replacement                   -> rng.choice(pop, size, replace=False)
full-corpus shuffle in place                 -> rng.shuffle(arr)
need a fresh shuffled copy                   -> rng.permutation(arr)
```

## Anti-Pattern

> [!warning] Anti-pattern
> np.random.seed(42) + np.random.rand(...) (legacy global API)
>   Global RNG state is shared across threads, libraries, and notebooks — one
>   stray call elsewhere reorders your sequence and breaks reproducibility.
>   Use rng = np.random.default_rng(42) and pass rng explicitly through code.

## Tips

- Always use `default_rng(seed)` — not the legacy `np.random.seed()` which is global state
- The same seed gives the same sequence — essential for reproducible experiments
- `rng.integers(lo, hi)` is exclusive at `hi` — like Python `range(lo, hi)`
- For ML: set both `np.random.default_rng(42)` and `random.seed(42)` for full reproducibility

## Common Mistake

> [!warning] Using the legacy API: `np.random.rand()` or `np.random.seed(42)`. The seed is global state — it interferes across threads and modules. Use `rng = np.random.default_rng(42)` instead.

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

- [[Sections/numpy/creation/np-array|np.array() (NumPy)]]
- [[Sections/numpy/creation/np-zeros|np.zeros() (NumPy)]]
- [[Sections/numpy/creation/np-ones|np.ones() (NumPy)]]
- [[Sections/numpy/creation/np-arange|np.arange() (NumPy)]]
- [[Sections/numpy/creation/_Index|NumPy → Array Creation]]
- [[Sections/numpy/_Index|NumPy index]]
- [[_Index|Vault index]]
