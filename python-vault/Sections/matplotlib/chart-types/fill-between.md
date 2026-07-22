---
type: "entry"
domain: "python"
file: "matplotlib"
section: "chart-types"
id: "fill-between"
title: "ax.fill_between()"
category: "Charts"
subtitle: "Confidence intervals, uncertainty bands, area charts"
signature_short: "ax.fill_between(x, y1, y2=0, alpha=0.3)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "ax.fill_between()"
  - "fill-between"
tags:
  - "python"
  - "python/matplotlib"
  - "python/matplotlib/chart-types"
  - "category/charts"
  - "tier/tiered"
---

# ax.fill_between()

> Confidence intervals, uncertainty bands, area charts

## Overview

fill_between() fills the region between two lines (or between a line and a constant baseline). Most commonly used for confidence intervals, uncertainty bands around time series, and area charts.

## Signature

```python
ax.fill_between(x, y1, y2=0, alpha=0.3)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - fill the area between two y-curves at the same
#             x. Use alpha to keep the lines visible.
# STRENGTHS - shows the core idea — confidence band — in
#             three lines.
# WEAKNESSES- doesn't yet show area charts or conditional
#             fill above/below threshold.
#
import numpy as np, matplotlib.pyplot as plt
x = np.linspace(0, 10, 100); y = np.sin(x)
fig, ax = plt.subplots()
ax.plot(x, y)
ax.fill_between(x, y - 0.3, y + 0.3, alpha=0.3)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday fill_between recipes: confidence
#             band, area chart (fill to zero), conditional
#             fill via where=.
# STRENGTHS - covers the patterns reports actually use:
#             uncertainty bands, area-under-curve, above/
#             below-threshold highlighting.
# WEAKNESSES- doesn't address interpolate=True for clean
#             crossings or stacked area charts — senior.
#
import numpy as np, matplotlib.pyplot as plt
x = np.linspace(0, 10, 100); y = np.sin(x)

fig, axes = plt.subplots(1, 3, figsize=(14, 4))

# Confidence band
axes[0].plot(x, y); axes[0].fill_between(x, y - 0.3, y + 0.3, alpha=0.3)

# Area chart — fill to zero
axes[1].fill_between(x, y, alpha=0.4); axes[1].plot(x, y)

# Conditional above/below threshold
axes[2].plot(x, y, "k", linewidth=1)
axes[2].fill_between(x, y, 0, where=(y >= 0), alpha=0.4, color="green")
axes[2].fill_between(x, y, 0, where=(y <  0), alpha=0.4, color="red")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production fill_between: interpolate=True for
#             clean threshold crossings, stacked area via
#             cumulative sums, asymmetric confidence intervals
#             with different upper/lower deltas, and pick
#             stackplot for proper stacked areas.
# STRENGTHS - interpolate=True fixes the visible "step" at
#             crossings; cumulative-sum stacking is the
#             clean idiom for area charts; asymmetric CIs
#             reflect real model output.
# WEAKNESSES- interpolate=True is mildly slower for huge
#             arrays; stackplot has its own quirks (label
#             ordering); asymmetric bands need the array form
#             of upper/lower (broadcasting can surprise).
#
import numpy as np, matplotlib.pyplot as plt

# 1. Clean threshold crossings with interpolate=True
x = np.linspace(0, 10, 50); y = np.sin(x)
fig, ax = plt.subplots()
ax.plot(x, y, "k", linewidth=1)
ax.fill_between(x, y, 0,
                 where=(y >= 0), interpolate=True,
                 alpha=0.4, color="green")
ax.fill_between(x, y, 0,
                 where=(y <  0), interpolate=True,
                 alpha=0.4, color="red")

# 2. Stacked areas — use stackplot, not multiple fill_between
years = np.arange(2018, 2024)
a = np.array([1, 2, 3, 4, 5, 6])
b = np.array([2, 2, 3, 5, 6, 7])
c = np.array([1, 1, 2, 2, 3, 4])

fig2, ax2 = plt.subplots()
ax2.stackplot(years, a, b, c, labels=["A", "B", "C"], alpha=0.8)
ax2.legend(loc="upper left")

# 3. Asymmetric CI — pass arrays for upper and lower
ci_lower = y - np.array([0.1, 0.2, 0.3] * (len(x)//3 + 1))[:len(x)]
ci_upper = y + np.array([0.4, 0.3, 0.2] * (len(x)//3 + 1))[:len(x)]
fig3, ax3 = plt.subplots()
ax3.plot(x, y); ax3.fill_between(x, ci_lower, ci_upper, alpha=0.3)
#
# Decision rule:
#   line + uncertainty band                    -> ax.plot + ax.fill_between(lo, hi)
#   area chart (single series to zero)         -> ax.fill_between(x, y, 0, alpha=0.4)
#   stacked areas (parts of a whole)           -> ax.stackplot, NOT chained fill_between
#   shade above/below a threshold              -> fill_between(..., where=mask, interpolate=True)
#   asymmetric errors per point                -> pass ci_lower/ci_upper arrays
#   horizontal band (y range)                  -> ax.axhspan
#   vertical band (x range / time period)      -> ax.axvspan
#
# Anti-pattern: forgetting interpolate=True with where=. When fill_between is masked by
#   a boolean (e.g. where=(y >= 0)), the fill ends at sample points, not at the actual
#   zero crossings — leaving visible "stairsteps" exactly where the curve crosses. Setting
#   interpolate=True linearly interpolates between samples to find the true crossing and
#   produces a clean shaded region.
```

## Decision Rule

```text
line + uncertainty band                    -> ax.plot + ax.fill_between(lo, hi)
area chart (single series to zero)         -> ax.fill_between(x, y, 0, alpha=0.4)
stacked areas (parts of a whole)           -> ax.stackplot, NOT chained fill_between
shade above/below a threshold              -> fill_between(..., where=mask, interpolate=True)
asymmetric errors per point                -> pass ci_lower/ci_upper arrays
horizontal band (y range)                  -> ax.axhspan
vertical band (x range / time period)      -> ax.axvspan
```

## Anti-Pattern

> [!warning] Anti-pattern
> forgetting interpolate=True with where=. When fill_between is masked by
>   a boolean (e.g. where=(y >= 0)), the fill ends at sample points, not at the actual
>   zero crossings — leaving visible "stairsteps" exactly where the curve crosses. Setting
>   interpolate=True linearly interpolates between samples to find the true crossing and
>   produces a clean shaded region.

## Tips

- `alpha=0.2-0.4` keeps the fill from obscuring the data underneath
- `where=` accepts a boolean array — enables conditional filling above/below a threshold
- `interpolate=True` ensures the fill transitions correctly at crossing points
- For a stacked area chart, pass cumulative sums as the y1/y2 values

## Common Mistake

> [!warning] Using `fill_between()` without `alpha<1`. A solid fill at full opacity hides the data lines underneath. Always use `alpha=0.2-0.4` for overlay fills.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
import matplotlib.pyplot as plt
x = np.linspace(0, 10, 100)
y = np.sin(x)
```

**Senior:**
```python
plt.tight_layout()
```

## See Also

- [[Sections/matplotlib/chart-types/line|ax.plot() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/bar|ax.bar() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/barh|ax.barh() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/hist|ax.hist() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/_Index|Matplotlib → Chart Types]]
- [[Sections/matplotlib/_Index|Matplotlib index]]
- [[_Index|Vault index]]
