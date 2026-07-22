---
type: "entry"
domain: "python"
file: "matplotlib"
section: "styling"
id: "tick-formatting"
title: "Tick formatting"
category: "Styling"
subtitle: "Custom ticks, rotated labels, date formatting, log scale"
signature_short: "ax.set_xticks([]) | ax.xaxis.set_major_formatter() | ax.set_xscale(\"log\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Tick formatting"
  - "tick-formatting"
tags:
  - "python"
  - "python/matplotlib"
  - "python/matplotlib/styling"
  - "category/styling"
  - "tier/tiered"
---

# Tick formatting

> Custom ticks, rotated labels, date formatting, log scale

## Overview

Matplotlib tick control covers positions (set_xticks), labels (set_xticklabels), rotation (tick_params), number formatting (FuncFormatter), and date formatting (DateFormatter). Log scales are applied with set_xscale/set_yscale.

## Signature

```python
ax.set_xticks([]) | ax.xaxis.set_major_formatter() | ax.set_xscale("log")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - set custom tick positions and labels.
#             Rotate labels to prevent overlap.
# STRENGTHS - covers the most common tweak.
# WEAKNESSES- doesn't yet show formatters, log scale, or
#             date axis.
#
import matplotlib.pyplot as plt
fig, ax = plt.subplots()
ax.plot([1, 2, 3, 4], [10, 20, 15, 30])
ax.set_xticks([1, 2, 3, 4])
ax.set_xticklabels(["Q1", "Q2", "Q3", "Q4"])
ax.tick_params(axis="x", rotation=45)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday tick options: number formatters
#             ($1,000, 12.3%), log scale, date formatters
#             with locators.
# STRENGTHS - covers what real reports need: currency,
#             percentages, log axes, date ticks.
# WEAKNESSES- doesn't address dynamic formatters or
#             auto-rotation — senior tier.
#
import matplotlib.pyplot as plt
import matplotlib.ticker as mtick
from matplotlib.dates import DateFormatter, MonthLocator

fig, axes = plt.subplots(2, 2, figsize=(12, 8))

# Currency formatter
axes[0, 0].plot(x, y)
axes[0, 0].yaxis.set_major_formatter(
    mtick.FuncFormatter(lambda v, _: f"${v:,.0f}"))

# Percent formatter
axes[0, 1].plot(x, ratios)
axes[0, 1].yaxis.set_major_formatter(
    mtick.PercentFormatter(xmax=1, decimals=0))

# Log scale — when data spans orders of magnitude
axes[1, 0].plot([1, 10, 100, 1000], [1, 2, 3, 4])
axes[1, 0].set_xscale("log")

# Date formatting on time-series x-axis
axes[1, 1].plot(dates, values)
axes[1, 1].xaxis.set_major_formatter(DateFormatter("%b %Y"))
axes[1, 1].xaxis.set_major_locator(MonthLocator(interval=3))
plt.setp(axes[1, 1].get_xticklabels(), rotation=30, ha="right")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production tick formatting: AutoLocator/
#             AutoDateLocator for sensible defaults across
#             zoom levels, EngFormatter for engineering
#             notation (k/M/G), and ConciseDateFormatter
#             that avoids redundant year/month repetition.
# STRENGTHS - auto-locators adapt as users zoom; engineering
#             notation reads cleanly for big numbers;
#             ConciseDateFormatter is the modern best-default
#             for time series.
# WEAKNESSES- AutoDateLocator's choices are sometimes
#             surprising on short ranges; EngFormatter rounds
#             to fixed precision (override with places=).
#
import matplotlib.pyplot as plt
import matplotlib.ticker as mtick
from matplotlib.dates import AutoDateLocator, ConciseDateFormatter

fig, ax = plt.subplots()

# 1. Engineering notation (k, M, G) — much cleaner than $1,234,567
ax.yaxis.set_major_formatter(mtick.EngFormatter(unit="$"))

# 2. Auto date locator + concise formatter (modern default)
loc = AutoDateLocator()
ax.xaxis.set_major_locator(loc)
ax.xaxis.set_major_formatter(ConciseDateFormatter(loc))
# ConciseDateFormatter avoids "2024 Jan, 2024 Feb, 2024 Mar..." repetition

# 3. Custom formatter callable
def thousands(v, _):
    if abs(v) >= 1e6: return f"{v/1e6:.1f}M"
    if abs(v) >= 1e3: return f"{v/1e3:.0f}K"
    return f"{v:.0f}"
ax.yaxis.set_major_formatter(mtick.FuncFormatter(thousands))

# 4. Pick a formatter by data type.
#
# Decision rule:
#   currency / percent              -> FuncFormatter or PercentFormatter
#   big numbers (M, B)              -> EngFormatter or custom callable
#   time series (any range)         -> AutoDateLocator + ConciseDateFormatter
#   log span                        -> ax.set_xscale("log") then default ticks
#   categorical x                   -> set_xticks + set_xticklabels (paired)
#   too many ticks                  -> ax.locator_params(nbins=N) or MaxNLocator
#   rotate without overlap          -> tick_params(rotation=30) + ha="right"
#   minor ticks for fine grid       -> ax.minorticks_on() + ax.grid(which="minor")
#
# Anti-pattern: setting ax.set_xticklabels(["A", "B", "C"]) without calling
#   ax.set_xticks([0, 1, 2]) first. The labels attach to whatever default ticks
#   matplotlib chose during autoscaling, so labels can shift, repeat, or fall off
#   the axis (and recent versions raise a UserWarning). Always pair them, or use a
#   FixedLocator + FixedFormatter, or pass string x values directly to ax.bar/plot
#   so matplotlib handles the categorical mapping.
```

## Decision Rule

```text
currency / percent              -> FuncFormatter or PercentFormatter
big numbers (M, B)              -> EngFormatter or custom callable
time series (any range)         -> AutoDateLocator + ConciseDateFormatter
log span                        -> ax.set_xscale("log") then default ticks
categorical x                   -> set_xticks + set_xticklabels (paired)
too many ticks                  -> ax.locator_params(nbins=N) or MaxNLocator
rotate without overlap          -> tick_params(rotation=30) + ha="right"
minor ticks for fine grid       -> ax.minorticks_on() + ax.grid(which="minor")
```

## Anti-Pattern

> [!warning] Anti-pattern
> setting ax.set_xticklabels(["A", "B", "C"]) without calling
>   ax.set_xticks([0, 1, 2]) first. The labels attach to whatever default ticks
>   matplotlib chose during autoscaling, so labels can shift, repeat, or fall off
>   the axis (and recent versions raise a UserWarning). Always pair them, or use a
>   FixedLocator + FixedFormatter, or pass string x values directly to ax.bar/plot
>   so matplotlib handles the categorical mapping.

## Tips

- `plt.setp(ax.xaxis.get_majorticklabels(), rotation=45, ha="right")` rotates labels cleanly
- `ticker.FuncFormatter(lambda x, p: f"${x:,.0f}")` is the most flexible number formatter
- `ax.set_xscale("log")` applies log scale — use when data spans multiple orders of magnitude
- `DateFormatter("%b %Y")` formats datetime ticks as "Jan 2024" — pair with `MonthLocator`

## Common Mistake

> [!warning] Setting `ax.set_xticklabels([...])` without first calling `ax.set_xticks([...])`. Without matching tick positions, the labels are assigned to default tick positions which may not be what you want.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = {}
for k, v in pairs:
    result[k] = v
```

**Senior:**
```python
result = {k: v for k, v in pairs}
```

## See Also

- [[Sections/matplotlib/styling/labels|Labels & titles (Matplotlib)]]
- [[Sections/matplotlib/styling/annotate|ax.annotate() (Matplotlib)]]
- [[Sections/matplotlib/styling/legend|ax.legend() (Matplotlib)]]
- [[Sections/matplotlib/styling/colormaps|Colormaps (Matplotlib)]]
- [[Sections/matplotlib/styling/_Index|Matplotlib → Styling & Customization]]
- [[Sections/matplotlib/_Index|Matplotlib index]]
- [[_Index|Vault index]]
