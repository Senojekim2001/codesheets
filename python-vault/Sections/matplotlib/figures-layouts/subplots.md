---
type: "entry"
domain: "python"
file: "matplotlib"
section: "figures-layouts"
id: "subplots"
title: "plt.subplots()"
category: "Basics"
subtitle: "The standard entry point — always use instead of plt.figure()"
signature_short: "fig, ax = plt.subplots(nrows=1, ncols=1, figsize=(8,6))"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "plt.subplots()"
  - "subplots"
tags:
  - "python"
  - "python/matplotlib"
  - "python/matplotlib/figures-layouts"
  - "category/basics"
  - "tier/tiered"
---

# plt.subplots()

> The standard entry point — always use instead of plt.figure()

## Overview

plt.subplots() is the standard way to create matplotlib figures. It returns a Figure and one or more Axes objects. figsize= controls the size in inches. The axes array is 1D for a single row/column and 2D for a grid.

## Signature

```python
fig, ax = plt.subplots(nrows=1, ncols=1, figsize=(8,6))
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - one call returns Figure + Axes. Default is
#             a single plot.
# STRENGTHS - the universal entry point.
# WEAKNESSES- doesn't yet show grids, sharing axes, or
#             axes.flat iteration.
#
import matplotlib.pyplot as plt
fig, ax = plt.subplots(figsize=(10, 6))
ax.plot([1, 2, 3], [4, 5, 6])
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday subplots surface: 1xN row,
#             2x2 grid, sharex/sharey, axes.flat iteration
#             over a DataFrame's columns.
# STRENGTHS - covers the patterns that show up in EDA
#             notebooks every day.
# WEAKNESSES- doesn't address layout="constrained" or
#             dpi= for hi-DPI screens — senior tier.
#
import matplotlib.pyplot as plt

# 1 row, 3 cols
fig, axes = plt.subplots(1, 3, figsize=(15, 4))
axes[0].plot(x, y1); axes[1].bar(cats, vals); axes[2].scatter(x, y2)

# 2x2 grid — axes is 2D
fig, axes = plt.subplots(2, 2, figsize=(12, 8))
axes[0, 0].plot(x, y); axes[1, 1].scatter(x, y)

# Shared x-axis between stacked time series
fig, (ax1, ax2) = plt.subplots(2, 1, sharex=True, figsize=(10, 6))

# Iterate flat — clean per-column histograms
fig, axes = plt.subplots(2, 3, figsize=(15, 8))
for ax, col in zip(axes.flat, df.columns[:6]):
    ax.hist(df[col], bins=20)
    ax.set_title(col)
plt.tight_layout()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production subplots: layout="constrained" over
#             plt.tight_layout (handles label collisions
#             during render, not after); subplot_kw= for
#             per-axes options like polar projection;
#             gridspec_kw for ratios; squeeze=False for
#             always-2D axes arrays even with 1xN.
# STRENGTHS - constrained_layout fixes 90% of "labels
#             clipped" issues; squeeze=False keeps code
#             generic across grid sizes.
# WEAKNESSES- constrained_layout slightly slower; some
#             rcParams interact unexpectedly (savefig may
#             override layout).
#
import matplotlib.pyplot as plt

# Always-2D axes via squeeze=False — generic looping
fig, axes = plt.subplots(2, 3, figsize=(15, 8),
                          layout="constrained",
                          squeeze=False)
for ax in axes.flat:
    ax.set_xlim(0, 10)

# Per-axes options via subplot_kw
fig, axes = plt.subplots(1, 2, figsize=(12, 5),
                          subplot_kw={"projection": "polar"})

# Size ratios via gridspec_kw
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 6),
                                 gridspec_kw={"height_ratios": [3, 1]})
#
# Decision rule:
#   single chart                       -> fig, ax = plt.subplots(figsize=(...))
#   uniform NxM grid                   -> fig, axes = plt.subplots(N, M)
#   one panel spans rows/cols          -> plt.subplot_mosaic, NOT subplots
#   stacked time series                -> plt.subplots(N, 1, sharex=True)
#   loop over DataFrame columns        -> plt.subplots(...) + axes.flat zip
#   need consistent 2D access          -> plt.subplots(..., squeeze=False)
#   uneven panel sizes                 -> gridspec_kw={"height_ratios": [...]}
#   polar / 3D projection              -> subplot_kw={"projection": "polar"}
#
# Anti-pattern: forgetting that axes is 1D for plt.subplots(1, N) but 2D for
#   plt.subplots(M, N) with M>1 — code written for axes[0, 0] crashes when N or M
#   becomes 1. Either standardize on squeeze=False (always 2D), or use axes.flat
#   to iterate without caring about shape. Also: calling plt.tight_layout() AFTER
#   plt.show() — show() flushes the figure first, so the layout fix is a no-op.
```

## Decision Rule

```text
single chart                       -> fig, ax = plt.subplots(figsize=(...))
uniform NxM grid                   -> fig, axes = plt.subplots(N, M)
one panel spans rows/cols          -> plt.subplot_mosaic, NOT subplots
stacked time series                -> plt.subplots(N, 1, sharex=True)
loop over DataFrame columns        -> plt.subplots(...) + axes.flat zip
need consistent 2D access          -> plt.subplots(..., squeeze=False)
uneven panel sizes                 -> gridspec_kw={"height_ratios": [...]}
polar / 3D projection              -> subplot_kw={"projection": "polar"}
```

## Anti-Pattern

> [!warning] Anti-pattern
> forgetting that axes is 1D for plt.subplots(1, N) but 2D for
>   plt.subplots(M, N) with M>1 — code written for axes[0, 0] crashes when N or M
>   becomes 1. Either standardize on squeeze=False (always 2D), or use axes.flat
>   to iterate without caring about shape. Also: calling plt.tight_layout() AFTER
>   plt.show() — show() flushes the figure first, so the layout fix is a no-op.

## Tips

- `axes.flat` iterates over all axes in a grid regardless of shape — cleaner than nested loops
- `sharex=True` / `sharey=True` links axis limits across subplots — great for comparisons
- Always call `plt.tight_layout()` before `plt.show()` — prevents label overlap
- `plt.subplots_adjust(hspace=0.4)` gives fine control over spacing between subplots

## Common Mistake

> [!warning] Using `plt.figure()` + `fig.add_subplot()` manually. `plt.subplots()` is cleaner and handles the grid for you — use it for all new code.

## Shorthand (Junior → Senior)

**Junior:**
```python
import matplotlib.pyplot as plt
import numpy as np
fig, ax = plt.subplots()
fig, ax = plt.subplots(figsize=(10, 6))
```

**Senior:**
```python
plt.show()
```

## See Also

- [[Sections/matplotlib/figures-layouts/subplot-mosaic|plt.subplot_mosaic() (Matplotlib)]]
- [[Sections/matplotlib/figures-layouts/anatomy|Figure & Axes (Matplotlib)]]
- [[Sections/matplotlib/figures-layouts/figsize|Figure size and DPI (Matplotlib)]]
- [[Sections/typing/core-typing/basic-annotations|Type Annotations — Variables, Functions & Collections (Type Hints & mypy)]]
- [[Sections/matplotlib/figures-layouts/_Index|Matplotlib → Figures & Layouts]]
- [[Sections/matplotlib/_Index|Matplotlib index]]
- [[_Index|Vault index]]
