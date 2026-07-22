---
type: "entry"
domain: "python"
file: "matplotlib"
section: "chart-types"
id: "axhline"
title: "ax.axhline()"
category: "Charts"
subtitle: "Baselines, thresholds, mean lines"
signature_short: "ax.axhline(y=0, color=, linestyle=, linewidth=)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "ax.axhline()"
  - "axhline"
tags:
  - "python"
  - "python/matplotlib"
  - "python/matplotlib/chart-types"
  - "category/charts"
  - "tier/tiered"
---

# ax.axhline()

> Baselines, thresholds, mean lines

## Overview

axhline() draws a horizontal line at a given y value. Unlike a manually plotted line, it always spans the full width regardless of data or zoom. axhspan() shades a horizontal band between two y values.

## Signature

```python
ax.axhline(y=0, color=, linestyle=, linewidth=)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - draw a horizontal reference line. Spans the
#             full axes width regardless of zoom.
# STRENGTHS - one call replaces ax.plot([xmin, xmax], [y, y])
#             which doesn't auto-extend.
# WEAKNESSES- doesn't yet show axhspan (shaded band) or
#             label= for legend integration.
#
import matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.plot([1, 2, 3], [10, 50, 30])
ax.axhline(y=0, color="black", linewidth=0.8)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday axhline patterns: zero baseline,
#             threshold lines with labels, mean lines from
#             data, axhspan for shaded target ranges.
# STRENGTHS - covers the patterns reports use to mark
#             baselines, targets, and acceptable ranges.
# WEAKNESSES- doesn't address xmin/xmax (partial-width
#             lines) or zorder for layering — senior tier.
#
import matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.plot(x, y)

ax.axhline(y=0, color="black", linewidth=0.8)         # baseline
ax.axhline(y=100, color="red", linestyle="--",
            label="target")                            # threshold
ax.axhline(y=y.mean(), color="gray", linestyle=":",
            label="mean")
ax.axhspan(ymin=80, ymax=100, alpha=0.15,
            color="green", label="target range")
ax.legend()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production reference lines: pin zorder so
#             reference lines don't obscure or get obscured
#             by data; use xmin/xmax (axes-fraction) for
#             partial-width lines; combine axhspan with
#             label= for legend integration.
# STRENGTHS - explicit zorder prevents the "mean line is
#             hiding behind the data" surprise; partial-
#             width lines mark a specific x-range without
#             plotting two segments.
# WEAKNESSES- xmin/xmax use AXES FRACTION (0..1), not data
#             coordinates — easy to mistake; zorder layering
#             is invisible until something looks wrong.
#
import matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.plot(x, y, linewidth=2, zorder=2)

# Reference line BEHIND data
ax.axhline(y=0, color="black", linewidth=0.8, zorder=1)

# Highlight a horizontal band, label-aware
ax.axhspan(ymin=80, ymax=100, alpha=0.15,
            color="green", zorder=0, label="target")

# Partial-width line — xmin/xmax in AXES FRACTION (0..1)
ax.axhline(y=50, xmin=0.2, xmax=0.8,
            color="red", linestyle=":")               # spans middle 60% only

ax.legend()
#
# Decision rule:
#   y=0 baseline                          -> ax.axhline(y=0, color="black", lw=0.8)
#   threshold / target line               -> ax.axhline(y=target, ls="--", label="target")
#   acceptable range / band               -> ax.axhspan(ymin, ymax, alpha=0.15)
#   mean of plotted data                  -> ax.axhline(y=df["col"].mean())
#   line over a specific x-range only     -> ax.axhline(y=v, xmin=0.2, xmax=0.8) (axes frac)
#   reference line behind data            -> ax.axhline(..., zorder=0)
#   on a log y-scale                      -> still works; y is in DATA units
#
# Anti-pattern: using ax.plot([xmin, xmax], [y, y]) for a "horizontal line". When the
#   x-axis limits change (zoom, new data, autoscale), the segment doesn't extend — you
#   get a stub. ax.axhline always spans the full axes width and survives autoscale. Same
#   trap with xmin/xmax: those are AXES FRACTION (0..1), not data coords — easy to confuse.
```

## Decision Rule

```text
y=0 baseline                          -> ax.axhline(y=0, color="black", lw=0.8)
threshold / target line               -> ax.axhline(y=target, ls="--", label="target")
acceptable range / band               -> ax.axhspan(ymin, ymax, alpha=0.15)
mean of plotted data                  -> ax.axhline(y=df["col"].mean())
line over a specific x-range only     -> ax.axhline(y=v, xmin=0.2, xmax=0.8) (axes frac)
reference line behind data            -> ax.axhline(..., zorder=0)
on a log y-scale                      -> still works; y is in DATA units
```

## Anti-Pattern

> [!warning] Anti-pattern
> using ax.plot([xmin, xmax], [y, y]) for a "horizontal line". When the
>   x-axis limits change (zoom, new data, autoscale), the segment doesn't extend — you
>   get a stub. ax.axhline always spans the full axes width and survives autoscale. Same
>   trap with xmin/xmax: those are AXES FRACTION (0..1), not data coords — easy to confuse.

## Tips

- axhline(y=df["col"].mean()) adds a mean line without needing x coordinates
- axhspan(ymin, ymax, alpha=0.1) shades a horizontal band for target ranges
- The line auto-extends when the axis is zoomed — unlike ax.plot([x0,x1],[y,y])
- Use zorder= to control whether the line appears above or below chart elements

## Common Mistake

> [!warning] Using ax.plot([x_min, x_max], [y, y]) for a reference line. It does not extend when axis limits change. Use ax.axhline(y=val) which always spans full width.

## Shorthand (Junior → Senior)

**Junior:**
```python
import matplotlib.pyplot as plt
fig, ax = plt.subplots()
ax.plot(x, y)
ax.axhline(y=0, color='black', linewidth=0.8)
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
