---
type: "entry"
domain: "python"
file: "matplotlib"
section: "chart-types"
id: "bar"
title: "ax.bar()"
category: "Charts"
subtitle: "Compare categorical values — grouped and stacked variants"
signature_short: "ax.bar(x, height, width=0.8, color=, label=)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "ax.bar()"
  - "bar"
tags:
  - "python"
  - "python/matplotlib"
  - "python/matplotlib/chart-types"
  - "category/charts"
  - "tier/tiered"
---

# ax.bar()

> Compare categorical values — grouped and stacked variants

## Overview

ax.bar() creates vertical bars. Use grouped bars by positioning with x offsets. Use bottom= for stacked bars. ax.bar_label() (matplotlib 3.4+) auto-labels bars.

## Signature

```python
ax.bar(x, height, width=0.8, color=, label=)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - one ax.bar call: categories + values.
# STRENGTHS - the simplest possible bar chart.
# WEAKNESSES- doesn't yet show grouped/stacked bars or
#             value labeling.
#
import matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.bar(["A", "B", "C", "D"], [23, 45, 12, 67])
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday bar surface: grouped bars via
#             x-offset, stacked bars via bottom=, and
#             ax.bar_label for auto value annotation.
# STRENGTHS - covers grouped/stacked patterns that real
#             reports use; bar_label replaces tedious
#             ax.text loops.
# WEAKNESSES- doesn't address sorting (almost always
#             improves readability) or color-by-value
#             encoding — senior tier.
#
import numpy as np
import matplotlib.pyplot as plt

categories = ["A", "B", "C", "D"]
v23 = [23, 45, 12, 67]
v24 = [30, 40, 20, 60]

fig, ax = plt.subplots()

# Grouped bars
x = np.arange(len(categories))
width = 0.35
ax.bar(x - width/2, v23, width, label="2023")
ax.bar(x + width/2, v24, width, label="2024")
ax.set_xticks(x); ax.set_xticklabels(categories)
ax.legend()

# Stacked bars (separate figure)
fig2, ax2 = plt.subplots()
b1 = ax2.bar(categories, [10, 20, 5,  30], label="Q1")
b2 = ax2.bar(categories, [13, 25, 7,  37],
              bottom=[10, 20, 5, 30], label="Q2")
ax2.bar_label(b1, padding=2)
ax2.bar_label(b2, padding=2)
ax2.legend()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production bars: sort by value (rank-style),
#             color-encode by sign or threshold, auto-label
#             with thousand separators, and switch to barh
#             when category names are long. Use ax.bar_label
#             with fmt= for currency/percent.
# STRENGTHS - sorted rankings are far easier to read; color-
#             by-threshold communicates intent (red bars =
#             below target); fmt= keeps labels publication-
#             ready.
# WEAKNESSES- color-coding adds visual complexity; sorting
#             changes the natural order (sometimes that
#             order matters); bar_label fmt= is a string,
#             easy to mistype.
#
import matplotlib.pyplot as plt

categories = ["Widgets", "Gadgets", "Doohickeys", "Gizmos"]
sales      = [12000, 45000, 8000, 67000]

# Sort descending for ranking
order = sorted(range(len(sales)), key=lambda i: -sales[i])
cats_s = [categories[i] for i in order]
vals_s = [sales[i]      for i in order]

# Color by threshold
threshold = 30000
colors = ["#2ca02c" if v >= threshold else "#d62728" for v in vals_s]

fig, ax = plt.subplots(figsize=(8, 5), layout="constrained")
bars = ax.bar(cats_s, vals_s, color=colors, edgecolor="white")
ax.bar_label(bars, fmt="${:,.0f}", padding=3)         # currency labels
ax.axhline(threshold, color="black", linestyle="--",
            linewidth=0.8, label=f"target ${threshold:,}")
ax.set_ylabel("Revenue (USD)")
ax.set_title("Product Sales (sorted)")
ax.legend()

# When category names are long -> switch to barh, NOT a tilt
# fig, ax = plt.subplots()
# ax.barh(cats_s[::-1], vals_s[::-1])
#
# Decision rule:
#   <8 short categories, ranking matters       -> ax.bar (sorted desc)
#   long category names                        -> ax.barh (NOT bar with rotation)
#   2 series side-by-side                      -> grouped bars via x +/- width/2
#   parts-of-a-whole over time                 -> stacked bars with bottom=
#   show value on each bar                     -> ax.bar_label(bars, fmt="...")
#   show uncertainty                           -> ax.bar(..., yerr=std)
#   >15 categories                             -> ax.barh (vertical scrolling fits)
#   continuous x (numeric bins)                -> ax.hist, NOT ax.bar
#
# Anti-pattern: rotating x-tick labels 45-90 degrees instead of switching to barh.
#   When labels overlap on a vertical bar chart, the instinct is tick_params(rotation=45).
#   Rotated text is harder to read AND eats vertical space. The right fix is ax.barh —
#   labels become horizontal and there's no width budget to fight over.
```

## Decision Rule

```text
<8 short categories, ranking matters       -> ax.bar (sorted desc)
long category names                        -> ax.barh (NOT bar with rotation)
2 series side-by-side                      -> grouped bars via x +/- width/2
parts-of-a-whole over time                 -> stacked bars with bottom=
show value on each bar                     -> ax.bar_label(bars, fmt="...")
show uncertainty                           -> ax.bar(..., yerr=std)
>15 categories                             -> ax.barh (vertical scrolling fits)
continuous x (numeric bins)                -> ax.hist, NOT ax.bar
```

## Anti-Pattern

> [!warning] Anti-pattern
> rotating x-tick labels 45-90 degrees instead of switching to barh.
>   When labels overlap on a vertical bar chart, the instinct is tick_params(rotation=45).
>   Rotated text is harder to read AND eats vertical space. The right fix is ax.barh —
>   labels become horizontal and there's no width budget to fight over.

## Tips

- ax.bar_label(container) auto-labels every bar — much cleaner than manual ax.text() loops
- Rotate labels when they overlap: `ax.tick_params(axis="x", rotation=45)`
- For stacked bars, pass the cumulative sum as `bottom=` for each subsequent series
- Use string x values directly — matplotlib handles the tick positioning automatically

## Common Mistake

> [!warning] Using ax.bar() for long category names that overlap. Switch to ax.barh() for horizontal bars — labels are far more readable.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
import matplotlib.pyplot as plt
categories = ["A", "B", "C", "D"]
values    = [23, 45, 12, 67]
```

**Senior:**
```python
ax.text(i, v + 0.5, str(v), ha="center", fontsize=9)
```

## See Also

- [[Sections/matplotlib/chart-types/line|ax.plot() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/barh|ax.barh() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/hist|ax.hist() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/scatter|ax.scatter() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/_Index|Matplotlib → Chart Types]]
- [[Sections/matplotlib/_Index|Matplotlib index]]
- [[_Index|Vault index]]
