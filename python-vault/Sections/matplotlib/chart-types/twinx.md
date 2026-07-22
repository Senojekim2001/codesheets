---
type: "entry"
domain: "python"
file: "matplotlib"
section: "chart-types"
id: "twinx"
title: "ax.twinx()"
category: "Charts"
subtitle: "Plot two variables with different scales on the same chart"
signature_short: "ax2 = ax.twinx() | ax2 = ax.twiny()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "ax.twinx()"
  - "twinx"
tags:
  - "python"
  - "python/matplotlib"
  - "python/matplotlib/chart-types"
  - "category/charts"
  - "tier/tiered"
---

# ax.twinx()

> Plot two variables with different scales on the same chart

## Overview

ax.twinx() creates a new Axes that shares the x-axis but has an independent y-axis on the right side. Use it when two variables have very different scales but a meaningful relationship on the same x (e.g. temperature and rainfall over time).

## Signature

```python
ax2 = ax.twinx() | ax2 = ax.twiny()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - second y-axis sharing the x. Plot two
#             differently-scaled series on the same chart.
# STRENGTHS - the smallest possible "two scales, one chart".
# WEAKNESSES- doesn't yet show color-coding the axes (the
#             critical readability move) or combining
#             legends.
#
import matplotlib.pyplot as plt

fig, ax1 = plt.subplots()
ax1.plot(range(12), [10, 12, 8, 15, 18, 22, 25, 20, 18, 24, 28, 30])
ax2 = ax1.twinx()
ax2.plot(range(12), [.15, .18, .12, .20, .22, .25, .28, .24, .21, .26, .30, .32])
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the readability essentials: color-code each
#             axis label and tick to match its line, build a
#             combined legend across both axes.
# STRENGTHS - color-coding is the single thing that makes
#             twin-axis plots interpretable; the combined-
#             legend trick is the classic gotcha.
# WEAKNESSES- doesn't address WHEN twin axes are the wrong
#             tool (often: prefer two subplots) — senior.
#
import matplotlib.pyplot as plt

x = range(12)
revenue = [10, 12, 8, 15, 18, 22, 25, 20, 18, 24, 28, 30]
margin  = [.15, .18, .12, .20, .22, .25, .28, .24, .21, .26, .30, .32]

fig, ax1 = plt.subplots(figsize=(10, 5))
c1, c2 = "steelblue", "coral"

ax1.plot(x, revenue, color=c1, linewidth=2, label="Revenue")
ax1.set_ylabel("Revenue ($M)", color=c1)
ax1.tick_params(axis="y", labelcolor=c1)

ax2 = ax1.twinx()
ax2.plot(x, margin, color=c2, linewidth=2, linestyle="--", label="Margin")
ax2.set_ylabel("Margin (%)", color=c2)
ax2.tick_params(axis="y", labelcolor=c2)

# Combined legend across BOTH axes
h1, l1 = ax1.get_legend_handles_labels()
h2, l2 = ax2.get_legend_handles_labels()
ax1.legend(h1 + h2, l1 + l2, loc="upper left")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - twin axes are often the WRONG tool. The
#             implicit visual claim is "these two scales
#             move together" — which is misleading when
#             they don't. Prefer two subplots stacked
#             vertically with a shared x-axis. Use twin
#             axes only when the two series share a true
#             relationship the reader needs to see overlaid.
# STRENGTHS - stacked subplots remove the false-correlation
#             trap; sharex= keeps the time axis aligned;
#             explicit decision rule prevents twin-axis
#             overuse.
# WEAKNESSES- two subplots take more vertical space; some
#             audiences expect twin axes for "dollars and
#             percentages on the same x" out of habit.
#
import matplotlib.pyplot as plt

x = range(12)
revenue = [10, 12, 8, 15, 18, 22, 25, 20, 18, 24, 28, 30]
margin  = [.15, .18, .12, .20, .22, .25, .28, .24, .21, .26, .30, .32]

# Better default: two stacked subplots, shared x
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 6),
                                sharex=True,
                                layout="constrained")

ax1.plot(x, revenue, linewidth=2, color="steelblue")
ax1.set_ylabel("Revenue ($M)")

ax2.plot(x, margin, linewidth=2, color="coral", linestyle="--")
ax2.set_ylabel("Margin (%)")
ax2.set_xlabel("Month")

# Decision rule:
#   readers must visually overlay two series  -> twin axes (color-coded)
#   no real overlay benefit                    -> two subplots, sharex=True
#   THREE+ series at different scales          -> three subplots, NEVER triple-axis
#   secondary axis is a unit conversion (C/F)  -> ax.secondary_yaxis(functions=...)
#   shared y, two x axes (top date + bottom)   -> ax.twiny()
#   only need different SCALE not different y  -> ax.set_yscale("log")
#
# Anti-pattern: drawing a single combined legend by calling ax1.legend() then
#   ax2.legend() — you get TWO overlapping legend boxes. The fix is to gather
#   handles+labels from both axes and pass them to one legend call:
#   h1, l1 = ax1.get_legend_handles_labels(); h2, l2 = ax2.get_legend_handles_labels();
#   ax1.legend(h1+h2, l1+l2). Equally common: forgetting to color-code the y-tick labels
#   so readers can't tell which line maps to which scale.
```

## Decision Rule

```text
readers must visually overlay two series  -> twin axes (color-coded)
no real overlay benefit                    -> two subplots, sharex=True
THREE+ series at different scales          -> three subplots, NEVER triple-axis
secondary axis is a unit conversion (C/F)  -> ax.secondary_yaxis(functions=...)
shared y, two x axes (top date + bottom)   -> ax.twiny()
only need different SCALE not different y  -> ax.set_yscale("log")
```

## Anti-Pattern

> [!warning] Anti-pattern
> drawing a single combined legend by calling ax1.legend() then
>   ax2.legend() — you get TWO overlapping legend boxes. The fix is to gather
>   handles+labels from both axes and pass them to one legend call:
>   h1, l1 = ax1.get_legend_handles_labels(); h2, l2 = ax2.get_legend_handles_labels();
>   ax1.legend(h1+h2, l1+l2). Equally common: forgetting to color-code the y-tick labels
>   so readers can't tell which line maps to which scale.

## Tips

- Color-code each axis and its labels to match the corresponding line — critical for readability
- For a combined legend, collect handles from both axes: `ax1.get_legend_handles_labels()` + `ax2.get_legend_handles_labels()`
- `ax.twiny()` shares the y-axis and creates a second x-axis on top — less common
- Use sparingly — twin axes can confuse readers. Consider two separate subplots for complex data

## Common Mistake

> [!warning] Forgetting to color-code the y-axis labels to match the lines. With two y-axes, readers cannot tell which scale belongs to which line without color coding.

## Shorthand (Junior → Senior)

**Junior:**
```python
import matplotlib.pyplot as plt
fig, ax1 = plt.subplots(figsize=(10, 5))
x = range(12)
revenue = [10, 12, 8, 15, 18, 22, 25, 20, 18, 24, 28, 30]
```

**Senior:**
```python
plt.show()
```

## See Also

- [[Sections/matplotlib/chart-types/line|ax.plot() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/bar|ax.bar() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/barh|ax.barh() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/hist|ax.hist() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/_Index|Matplotlib → Chart Types]]
- [[Sections/matplotlib/_Index|Matplotlib index]]
- [[_Index|Vault index]]
