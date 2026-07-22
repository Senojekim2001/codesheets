---
type: "entry"
domain: "python"
file: "matplotlib"
section: "chart-types"
id: "barh"
title: "ax.barh()"
category: "Charts"
subtitle: "Same as ax.bar() but rotated — use when labels are long"
signature_short: "ax.barh(y, width, height=0.8, color=, label=)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "ax.barh()"
  - "barh"
tags:
  - "python"
  - "python/matplotlib"
  - "python/matplotlib/chart-types"
  - "category/charts"
  - "tier/tiered"
---

# ax.barh()

> Same as ax.bar() but rotated — use when labels are long

## Overview

ax.barh() is the horizontal equivalent of ax.bar(). It is the better choice when category names are long, when ranking items, or when you have many categories. The x-axis becomes the value axis and y-axis becomes the category axis.

## Signature

```python
ax.barh(y, width, height=0.8, color=, label=)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - the horizontal twin of ax.bar. Categories on
#             the y-axis, values on the x-axis.
# STRENGTHS - the right call when category names are long
#             or numerous.
# WEAKNESSES- doesn't yet show sorting, value labels, or
#             color encoding.
#
import matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.barh(["Very Long Name A", "Long Name B", "C", "D"], [23, 45, 12, 67])
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday barh recipe: sort by value for
#             ranking, color-encode by threshold, label the
#             bars with bar_label.
# STRENGTHS - matches what real reports do: rank N items,
#             label each, color the outliers.
# WEAKNESSES- doesn't address invert_yaxis (top-down
#             ordering) or grouped horizontal bars — senior.
#
import matplotlib.pyplot as plt

categories = ["Widgets", "Gadgets", "Doohickeys", "Gizmos"]
values     = [23, 45, 12, 67]

# Sort ascending so largest is at the top after invert
order = sorted(range(len(values)), key=lambda i: values[i])
cats  = [categories[i] for i in order]
vals  = [values[i]     for i in order]

colors = ["#d62728" if v > 40 else "#1f77b4" for v in vals]

fig, ax = plt.subplots()
bars = ax.barh(cats, vals, color=colors)
ax.bar_label(bars, padding=3, fmt="%.0f")
ax.set_xlabel("Value")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production rankings: sort + invert_yaxis (top-
#             down reading), use figsize taller for many
#             rows, group with offsets when comparing two
#             time periods, and pick barh whenever names
#             would otherwise overlap or rotate.
# STRENGTHS - top-down reading order matches how Western
#             readers scan; tall figsize prevents label
#             collisions; grouped horizontal bars are the
#             clearest "year over year by long category"
#             chart.
# WEAKNESSES- inverting the axis is non-obvious to first-
#             time readers; very tall figures don't fit
#             slide layouts.
#
import numpy as np
import matplotlib.pyplot as plt

categories = ["Very Long Item " + c for c in "ABCDEFGHIJ"]
v23 = np.random.randint(10, 100, len(categories))
v24 = v23 + np.random.randint(-10, 30, len(categories))

# Sort by 2024 desc
order = np.argsort(v24)[::-1]
cats  = np.array(categories)[order]
v23s, v24s = v23[order], v24[order]

fig, ax = plt.subplots(figsize=(8, max(4, 0.4 * len(cats))),
                        layout="constrained")
y = np.arange(len(cats))
height = 0.4
ax.barh(y - height/2, v23s, height, label="2023")
ax.barh(y + height/2, v24s, height, label="2024")
ax.set_yticks(y); ax.set_yticklabels(cats)
ax.invert_yaxis()                                      # largest at TOP
ax.set_xlabel("Value")
ax.legend()
#
# Decision rule:
#   ranking with long names                    -> ax.barh + sort + invert_yaxis
#   short names, <=6 cats                      -> ax.bar (vertical reads faster)
#   compare two periods per category           -> grouped barh with y +/- height/2
#   highlight a winner / target                -> color-encode + axvline threshold
#   show value at end of bar                   -> ax.bar_label(bars, padding=3)
#   N rows uncertain                           -> figsize=(8, max(4, 0.4 * N))
#   negative + positive values                 -> barh with axvline(x=0) baseline
#
# Anti-pattern: forgetting ax.invert_yaxis() on a sorted ranking. Without inversion,
#   the largest bar is at the BOTTOM (matplotlib's default y origin). Western readers
#   scan top-to-bottom, so they read the smallest first. Always pair sort + invert_yaxis
#   for ranking charts; otherwise pick ax.bar instead.
```

## Decision Rule

```text
ranking with long names                    -> ax.barh + sort + invert_yaxis
short names, <=6 cats                      -> ax.bar (vertical reads faster)
compare two periods per category           -> grouped barh with y +/- height/2
highlight a winner / target                -> color-encode + axvline threshold
show value at end of bar                   -> ax.bar_label(bars, padding=3)
N rows uncertain                           -> figsize=(8, max(4, 0.4 * N))
negative + positive values                 -> barh with axvline(x=0) baseline
```

## Anti-Pattern

> [!warning] Anti-pattern
> forgetting ax.invert_yaxis() on a sorted ranking. Without inversion,
>   the largest bar is at the BOTTOM (matplotlib's default y origin). Western readers
>   scan top-to-bottom, so they read the smallest first. Always pair sort + invert_yaxis
>   for ranking charts; otherwise pick ax.bar instead.

## Tips

- Sort categories by value before plotting — creates a natural ranking that is easier to read
- ax.bar_label() works the same as with ax.bar() — labels appear at the end of each bar
- Invert the y-axis so the highest value appears at the top: `ax.invert_yaxis()`
- For many categories (10+), increase figure height: `fig, ax = plt.subplots(figsize=(8, 12))`

## Common Mistake

> [!warning] Plotting unsorted horizontal bars when ranking is the point. Always sort by value — unsorted rankings make comparisons much harder to read.

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

- [[Sections/matplotlib/chart-types/line|ax.plot() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/bar|ax.bar() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/hist|ax.hist() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/scatter|ax.scatter() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/_Index|Matplotlib → Chart Types]]
- [[Sections/matplotlib/_Index|Matplotlib index]]
- [[_Index|Vault index]]
