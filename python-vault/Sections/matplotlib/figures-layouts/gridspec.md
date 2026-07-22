---
type: "entry"
domain: "python"
file: "matplotlib"
section: "figures-layouts"
id: "gridspec"
title: "GridSpec"
category: "Layouts"
subtitle: "Spans rows/columns for dashboard-style figures"
signature_short: "gs = GridSpec(nrows, ncols) | ax = fig.add_subplot(gs[0, :])"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "GridSpec"
  - "gridspec"
tags:
  - "python"
  - "python/matplotlib"
  - "python/matplotlib/figures-layouts"
  - "category/layouts"
  - "tier/tiered"
---

# GridSpec

> Spans rows/columns for dashboard-style figures

## Overview

GridSpec creates a grid layout where individual subplots can span multiple rows or columns. More flexible than plt.subplots() for dashboard-style figures. subplot_mosaic() is a simpler string-based alternative (matplotlib 3.3+).

## Signature

```python
gs = GridSpec(nrows, ncols) | ax = fig.add_subplot(gs[0, :])
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - GridSpec lets one subplot span multiple cells.
#             Index with [row, col] slices.
# STRENGTHS - the smallest possible asymmetric layout.
# WEAKNESSES- doesn't yet show ratios, mosaic, or hspace
#             tuning.
#
import matplotlib.pyplot as plt
fig = plt.figure(figsize=(10, 6))
gs = fig.add_gridspec(2, 2)
fig.add_subplot(gs[0, :])         # span full top row
fig.add_subplot(gs[1, 0])
fig.add_subplot(gs[1, 1])
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - dashboard layout: full top row + three bottom
#             cells. Tune hspace/wspace for spacing.
# STRENGTHS - covers the canonical "one big chart over
#             several smaller ones" dashboard.
# WEAKNESSES- doesn't address height_ratios/width_ratios or
#             when to switch to subplot_mosaic — senior.
#
import matplotlib.pyplot as plt, numpy as np

fig = plt.figure(figsize=(12, 8))
gs = fig.add_gridspec(2, 3, hspace=0.4, wspace=0.3)
ax_top = fig.add_subplot(gs[0, :])
ax_bl  = fig.add_subplot(gs[1, 0])
ax_bm  = fig.add_subplot(gs[1, 1])
ax_br  = fig.add_subplot(gs[1, 2])

ax_top.plot(np.random.randn(100).cumsum())
ax_top.set_title("Full width")
ax_bl.hist(np.random.randn(200), bins=20)
ax_bm.scatter(np.random.rand(50), np.random.rand(50))
ax_br.bar([1, 2, 3], [3, 1, 4])
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production layouts: prefer subplot_mosaic for
#             readability, use width_ratios/height_ratios
#             when panels need different sizes, and reach
#             for layout="constrained" instead of manual
#             hspace/wspace tuning.
# STRENGTHS - mosaic is named-access (axes["main"]) and
#             far easier to maintain; constrained_layout
#             handles spacing automatically.
# WEAKNESSES- mosaic requires matplotlib 3.3+; constrained
#             is slightly slower to render than tight_layout.
#
import matplotlib.pyplot as plt, numpy as np

# Same layout via subplot_mosaic — much more readable
fig, axd = plt.subplot_mosaic(
    """
    AAA
    BCD
    """,
    figsize=(12, 8),
    height_ratios=[2, 1],
    layout="constrained",
)
axd["A"].plot(np.random.randn(100).cumsum())
axd["B"].hist(np.random.randn(200), bins=20)
axd["C"].scatter(np.random.rand(50), np.random.rand(50))
axd["D"].bar([1, 2, 3], [3, 1, 4])

# When to pick which:
#   simple uniform grid           -> plt.subplots(rows, cols)
#   asymmetric, one panel spans   -> subplot_mosaic (preferred)
#   complex with size ratios      -> GridSpec (fine-grained)
#
# Decision rule:
#   uniform NxM grid, equal sizes        -> plt.subplots(nrows, ncols)
#   one panel spans rows or cols         -> subplot_mosaic (named, preferred)
#   need precise width/height ratios     -> GridSpec(width_ratios=, height_ratios=)
#   nested grids (grid inside a panel)   -> gs.subgridspec(...)
#   pixel-perfect dashboards             -> GridSpec + manual layout="constrained"
#   need shared axes across spans        -> GridSpec + sharex=, or per_subplot_kw
#   one-off "big chart + sparklines"     -> subplot_mosaic with height_ratios
#
# Anti-pattern: hand-tuning hspace/wspace until it "looks right". GridSpec spacing is
#   sensitive to figsize, dpi, and label length — what looks good in your notebook
#   clips on a slide. Use layout="constrained" (or constrained_layout=True) on the
#   Figure and let matplotlib compute spacing from real label sizes. Reach for hspace
#   only when constrained layout still doesn't fit.
```

## Decision Rule

```text
uniform NxM grid, equal sizes        -> plt.subplots(nrows, ncols)
one panel spans rows or cols         -> subplot_mosaic (named, preferred)
need precise width/height ratios     -> GridSpec(width_ratios=, height_ratios=)
nested grids (grid inside a panel)   -> gs.subgridspec(...)
pixel-perfect dashboards             -> GridSpec + manual layout="constrained"
need shared axes across spans        -> GridSpec + sharex=, or per_subplot_kw
one-off "big chart + sparklines"     -> subplot_mosaic with height_ratios
```

## Anti-Pattern

> [!warning] Anti-pattern
> hand-tuning hspace/wspace until it "looks right". GridSpec spacing is
>   sensitive to figsize, dpi, and label length — what looks good in your notebook
>   clips on a slide. Use layout="constrained" (or constrained_layout=True) on the
>   Figure and let matplotlib compute spacing from real label sizes. Reach for hspace
>   only when constrained layout still doesn't fit.

## Tips

- `gs[0, :]` spans the full first row; `gs[:, 0]` spans the full first column
- `subplot_mosaic()` with ASCII art layout is cleaner for most dashboard designs
- `hspace` and `wspace` in GridSpec control vertical and horizontal spacing between plots
- Use `fig.add_subplot(gs[row_slice, col_slice])` for spanning — standard slice syntax works

## Common Mistake

> [!warning] Using `plt.subplots(2, 3)` when you need one plot to span multiple cells. Switch to `GridSpec` or `subplot_mosaic()` when any panel needs to span rows or columns.

## Shorthand (Junior → Senior)

**Junior:**
```python
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import numpy as np
fig = plt.figure(figsize=(12, 8))
```

**Senior:**
```python
plt.show()
```

## See Also

- [[Sections/matplotlib/figures-layouts/_Index|Matplotlib → Figures & Layouts]]
- [[Sections/matplotlib/_Index|Matplotlib index]]
- [[_Index|Vault index]]
