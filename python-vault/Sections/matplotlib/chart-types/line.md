---
type: "entry"
domain: "python"
file: "matplotlib"
section: "chart-types"
id: "line"
title: "ax.plot()"
category: "Charts"
subtitle: "Connect data points with lines"
signature_short: "ax.plot(x, y, fmt, **kwargs)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "ax.plot()"
  - "line"
tags:
  - "python"
  - "python/matplotlib"
  - "python/matplotlib/chart-types"
  - "category/charts"
  - "tier/tiered"
---

# ax.plot()

> Connect data points with lines

## Overview

plot() creates line charts by default. The format string controls line style, marker, and color in shorthand. Use keyword arguments for fine-grained control.

## Signature

```python
ax.plot(x, y, fmt, **kwargs)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - one ax.plot call. fig/ax via plt.subplots().
# STRENGTHS - smallest possible plot; introduces the
#             figure/axes pattern that scales to any layout.
# WEAKNESSES- doesn't yet show labels, legend, or styling.
#
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(0, 10, 100)
fig, ax = plt.subplots()
ax.plot(x, np.sin(x))
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday line-plot recipe: figsize for
#             readability, multiple lines with label= and a
#             legend, axis titles, grid, tight_layout.
# STRENGTHS - covers what a publishable line chart looks
#             like; this is the call shape you write daily.
# WEAKNESSES- doesn't address date axes, log scales, or
#             chained subplots — senior tier.
#
import numpy as np
import matplotlib.pyplot as plt

months   = np.arange(1, 13)
q1_sales = np.array([120, 135, 148, 155, 168, 175, 182, 190, 198, 205, 215, 230])
q2_sales = q1_sales + 15

fig, ax = plt.subplots(figsize=(10, 6))
ax.plot(months, q1_sales, label="Q1 Sales", linewidth=2)
ax.plot(months, q2_sales, label="Q2 Sales", linewidth=2, linestyle="--")

ax.set_xlabel("Month")
ax.set_ylabel("Sales ($1000s)")
ax.set_title("Sales Trend")
ax.legend()
ax.grid(True, alpha=0.3)
plt.tight_layout()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production line plots: object-oriented (fig/ax)
#             always (never plt.* on shared figures), explicit
#             style-cycle handling for multi-line series, log
#             scales when range spans orders of magnitude, and
#             tight_layout vs constrained_layout.
# STRENGTHS - OO API works in subplots/notebooks/scripts
#             without state surprises; constrained_layout
#             handles label collisions automatically;
#             explicit log scales document data properties.
# WEAKNESSES- constrained_layout is slightly slower than
#             tight_layout; plt.style.use() applies globally
#             — wrap in a context manager for one-off figures.
#
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(1, 1000, 1000)

# 1. Use a style scope locally, not globally
with plt.style.context("seaborn-v0_8-whitegrid"):
    fig, ax = plt.subplots(figsize=(10, 6),
                            layout="constrained")     # auto-handles labels
    for label, fn in [("linear", lambda x: x),
                       ("sqrt",   np.sqrt),
                       ("log",    np.log)]:
        ax.plot(x, fn(x), label=label, linewidth=2)
    ax.set_yscale("log")                              # range spans orders of magnitude
    ax.set_xlabel("x")
    ax.set_ylabel("f(x)  (log scale)")
    ax.legend(frameon=False)

# 2. Anti-pattern: mixing plt.* with the OO API across subplots
# plt.title("X") is global — it sets title on the CURRENT axes only.
# Right: ax.set_title("X")

# 3. Save deterministically
# fig.savefig("out.png", dpi=150, bbox_inches="tight")
#
# Decision rule:
#   single line, quick check                  -> ax.plot(x, y) + plt.subplots()
#   2-5 series, same scale                    -> multiple ax.plot calls + ax.legend()
#   data spans orders of magnitude            -> ax.set_yscale("log")
#   irregular x or many series                -> ax.plot with explicit color cycle
#   layered with bands / fills                -> ax.plot + ax.fill_between for CI
#   datetime x-axis                           -> ax.plot(dates, y) + ConciseDateFormatter
#   need >1 different y-scale                 -> two subplots sharex=True (NOT twinx)
#   one-off style change                      -> with plt.style.context(...) wrapper
#
# Anti-pattern: mixing plt.* state-machine calls with the OO API on multi-axes figures.
#   Code like fig, ax = plt.subplots(); ax.plot(...); plt.title("X") sets the title on
#   whatever axes was created LAST, not on ax. The fix is total commitment to the OO API:
#   ax.set_title, ax.set_xlabel, fig.savefig — never plt.title / plt.xlabel / plt.savefig.
```

## Decision Rule

```text
single line, quick check                  -> ax.plot(x, y) + plt.subplots()
2-5 series, same scale                    -> multiple ax.plot calls + ax.legend()
data spans orders of magnitude            -> ax.set_yscale("log")
irregular x or many series                -> ax.plot with explicit color cycle
layered with bands / fills                -> ax.plot + ax.fill_between for CI
datetime x-axis                           -> ax.plot(dates, y) + ConciseDateFormatter
need >1 different y-scale                 -> two subplots sharex=True (NOT twinx)
one-off style change                      -> with plt.style.context(...) wrapper
```

## Anti-Pattern

> [!warning] Anti-pattern
> mixing plt.* state-machine calls with the OO API on multi-axes figures.
>   Code like fig, ax = plt.subplots(); ax.plot(...); plt.title("X") sets the title on
>   whatever axes was created LAST, not on ax. The fix is total commitment to the OO API:
>   ax.set_title, ax.set_xlabel, fig.savefig — never plt.title / plt.xlabel / plt.savefig.

## Tips

- Format string order: color + marker + linestyle → "r^--" (red triangle dashed)
- label= + ax.legend() adds a legend — always label lines for multi-line charts
- alpha=0.7 is useful for overlapping data
- For pure scatter: ax.scatter() has better control over individual point properties

## Common Mistake

> [!warning] Forgetting ax.legend() after setting label= on plot calls. Labels are invisible without calling ax.legend().

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
import matplotlib.pyplot as plt
months = np.arange(1, 13)
q1_sales = np.array([120, 135, 148, 155, 168, 175, 182, 190, 198, 205, 215, 230])
```

**Senior:**
```python
plt.tight_layout()
```

## See Also

- [[Sections/matplotlib/chart-types/bar|ax.bar() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/barh|ax.barh() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/hist|ax.hist() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/scatter|ax.scatter() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/_Index|Matplotlib → Chart Types]]
- [[Sections/matplotlib/_Index|Matplotlib index]]
- [[_Index|Vault index]]
