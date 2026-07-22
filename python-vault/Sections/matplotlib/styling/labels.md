---
type: "entry"
domain: "python"
file: "matplotlib"
section: "styling"
id: "labels"
title: "Labels & titles"
category: "Styling"
subtitle: "The essential labeling calls every plot needs"
signature_short: "ax.set_title() | ax.set_xlabel() | ax.annotate()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Labels & titles"
  - "labels"
tags:
  - "python"
  - "python/matplotlib"
  - "python/matplotlib/styling"
  - "category/styling"
  - "tier/tiered"
---

# Labels & titles

> The essential labeling calls every plot needs

## Overview

Well-labelled plots communicate clearly. Use set_title(), set_xlabel(), set_ylabel() for basic labels. annotate() adds arrows and text pointing to specific data points.

## Signature

```python
ax.set_title() | ax.set_xlabel() | ax.annotate()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - the three calls every plot needs: title, x
#             label, y label.
# STRENGTHS - smallest possible labeling.
# WEAKNESSES- doesn't yet show ax.set() (combined call) or
#             tick customization.
#
import matplotlib.pyplot as plt
fig, ax = plt.subplots()
ax.plot(x, y)
ax.set_title("Sales by Quarter")
ax.set_xlabel("Quarter")
ax.set_ylabel("Revenue ($K)")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday labeling surface: ax.set() to
#             combine multiple labels, custom xticks for
#             categorical axes, rotated labels, grid styling,
#             axis limits.
# STRENGTHS - covers what a clean, presentable chart needs;
#             ax.set() is the cleanest single-call form.
# WEAKNESSES- doesn't address spine removal or per-rcParams
#             theming — senior tier.
#
import matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.plot(x, y)

# Combined labels (cleaner than three separate set_* calls)
ax.set(title="Sales by Quarter",
        xlabel="Quarter",
        ylabel="Revenue ($K)",
        xlim=(0, 10),
        ylim=(0, 100))

# Categorical ticks
ax.set_xticks([1, 2, 3, 4])
ax.set_xticklabels(["Q1", "Q2", "Q3", "Q4"])
ax.tick_params(axis="x", rotation=45, labelsize=10)

# Grid — only horizontal (cleaner for bar charts)
ax.grid(True, axis="y", linestyle="--", alpha=0.5)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production labeling: pin font sizes via
#             rcParams in a context manager, remove top/
#             right spines for a cleaner publication look,
#             use ax.set_xlabel(..., loc="left") to align
#             labels with the start of the data area.
# STRENGTHS - rc_context scopes styling to one figure;
#             spine removal is the single biggest readability
#             win for publication-style charts.
# WEAKNESSES- spine removal can hide the axis origin —
#             reach for axhline(y=0) to compensate; rcParams
#             keys are a sprawl, easy to misspell.
#
import matplotlib.pyplot as plt

with plt.rc_context({
    "axes.spines.top":   False,
    "axes.spines.right": False,
    "axes.titlesize":   14,
    "axes.titleweight": "bold",
    "axes.labelsize":   11,
    "xtick.labelsize":  10,
    "ytick.labelsize":  10,
    "axes.grid":        True,
    "grid.alpha":       0.3,
    "grid.linestyle":   "--",
}):
    fig, ax = plt.subplots(figsize=(10, 6), layout="constrained")
    ax.plot(x, y, linewidth=2)
    ax.set(title="Sales by Quarter (FY2024)",
            xlabel="Quarter",
            ylabel="Revenue ($K)")
    # Title aligned with data area, not figure
    ax.set_title("Sales by Quarter", loc="left", pad=10)
#
# Decision rule:
#   single chart, three labels         -> ax.set_title / set_xlabel / set_ylabel
#   set many labels at once            -> ax.set(title=, xlabel=, ylabel=, xlim=)
#   common publication look            -> remove top/right spines + grid alpha=0.3
#   align title to data start          -> ax.set_title(..., loc="left")
#   needs space below title            -> ax.set_title(..., pad=10)
#   global font/spines override        -> with plt.rc_context({...}):
#   axis-only grid (bar charts)        -> ax.grid(True, axis="y", ls="--", alpha=0.5)
#   suptitle across subplots           -> fig.suptitle, NOT ax.set_title
#
# Anti-pattern: calling ax.set_xticklabels([...]) WITHOUT first calling ax.set_xticks([...]).
#   The labels are written at whatever default tick positions matplotlib chose — often the
#   wrong cells or shifted off-by-one. Recent matplotlib raises a UserWarning here. Always
#   pair them: ax.set_xticks([1, 2, 3]); ax.set_xticklabels(["A", "B", "C"]). For
#   categorical bar charts, prefer passing string x values directly to ax.bar.
```

## Decision Rule

```text
single chart, three labels         -> ax.set_title / set_xlabel / set_ylabel
set many labels at once            -> ax.set(title=, xlabel=, ylabel=, xlim=)
common publication look            -> remove top/right spines + grid alpha=0.3
align title to data start          -> ax.set_title(..., loc="left")
needs space below title            -> ax.set_title(..., pad=10)
global font/spines override        -> with plt.rc_context({...}):
axis-only grid (bar charts)        -> ax.grid(True, axis="y", ls="--", alpha=0.5)
suptitle across subplots           -> fig.suptitle, NOT ax.set_title
```

## Anti-Pattern

> [!warning] Anti-pattern
> calling ax.set_xticklabels([...]) WITHOUT first calling ax.set_xticks([...]).
>   The labels are written at whatever default tick positions matplotlib chose — often the
>   wrong cells or shifted off-by-one. Recent matplotlib raises a UserWarning here. Always
>   pair them: ax.set_xticks([1, 2, 3]); ax.set_xticklabels(["A", "B", "C"]). For
>   categorical bar charts, prefer passing string x values directly to ax.bar.

## Tips

- pad= in set_title() adds space between title and axes
- ax.set(title="...", xlabel="...", ylabel="...") sets multiple labels at once
- tight_layout() or constrained_layout=True prevents label clipping
- ax.spines["top"].set_visible(False) removes chart borders for cleaner look

## Common Mistake

> [!warning] Saving a figure before calling tight_layout() — axis labels often get cut off. Always call fig.tight_layout() or use plt.subplots(layout="constrained").

## Shorthand (Junior → Senior)

**Junior:**
```python
import matplotlib.pyplot as plt
ax.set_title("Sales by Quarter", fontsize=16, fontweight="bold", pad=15)
ax.set_xlabel("Quarter", fontsize=12)
ax.set_ylabel("Revenue ($K)", fontsize=12)
```

**Senior:**
```python
ax.axvline(x=0, color="black", linewidth=0.5)
```

## See Also

- [[Sections/matplotlib/styling/annotate|ax.annotate() (Matplotlib)]]
- [[Sections/matplotlib/styling/legend|ax.legend() (Matplotlib)]]
- [[Sections/matplotlib/styling/tick-formatting|Tick formatting (Matplotlib)]]
- [[Sections/matplotlib/styling/colormaps|Colormaps (Matplotlib)]]
- [[Sections/matplotlib/styling/_Index|Matplotlib → Styling & Customization]]
- [[Sections/matplotlib/_Index|Matplotlib index]]
- [[_Index|Vault index]]
