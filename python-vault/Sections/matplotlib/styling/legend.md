---
type: "entry"
domain: "python"
file: "matplotlib"
section: "styling"
id: "legend"
title: "ax.legend()"
category: "Styling"
subtitle: "Automatic from labels, or explicit with handles and labels"
signature_short: "ax.legend(loc=\"best\", title=\"\", framealpha=0.8)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "ax.legend()"
  - "legend"
tags:
  - "python"
  - "python/matplotlib"
  - "python/matplotlib/styling"
  - "category/styling"
  - "tier/tiered"
---

# ax.legend()

> Automatic from labels, or explicit with handles and labels

## Overview

legend() creates a legend from the label= arguments passed to each plot call. loc= controls placement. For full control over which elements appear, pass handles and labels explicitly.

## Signature

```python
ax.legend(loc="best", title="", framealpha=0.8)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - label= on each plot call, then ax.legend().
#             Without labels the legend is empty.
# STRENGTHS - the simplest "label each line" pattern.
# WEAKNESSES- doesn't yet show loc, outside placement, or
#             explicit handles.
#
import matplotlib.pyplot as plt
fig, ax = plt.subplots()
ax.plot(x, y1, label="Train")
ax.plot(x, y2, label="Val")
ax.legend()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday legend surface: loc options,
#             ncols for compact wide legends, framealpha for
#             transparency, bbox_to_anchor for outside-the-
#             axes placement.
# STRENGTHS - covers the placement and styling tweaks that
#             real charts need.
# WEAKNESSES- doesn't address explicit handles or combining
#             legends from twin axes — senior.
#
import matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.plot(x, y1, label="Train")
ax.plot(x, y2, label="Val")

# Auto-placement (loc="best"); explicit places also work
ax.legend(loc="best")

# Multi-column compact legend, with title
ax.legend(title="Model", ncols=2, fontsize=9, framealpha=0.85)

# Outside the axes — combine with constrained_layout to avoid clipping
ax.legend(loc="upper left", bbox_to_anchor=(1.02, 1.0),
           borderaxespad=0)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production legends: build explicit handles
#             when matplotlib's auto-detection fails (custom
#             markers, fill_between bands, scatter
#             collections); combine handles from twin axes;
#             reach for proxy artists for legend-only items.
# STRENGTHS - explicit handles are the only way to legend a
#             fill_between band or a non-plotted reference;
#             twin-axis handle merging is the standard pain
#             point fixed properly.
# WEAKNESSES- proxy artists need an extra import; manual
#             handle assembly is verbose for many series.
#
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D
from matplotlib.patches import Patch

fig, ax = plt.subplots()
ax.plot(x, mean, color="C0")
ax.fill_between(x, lower, upper, alpha=0.3, color="C0")

# Explicit handles — line + band proxy
handles = [
    Line2D([0], [0], color="C0", label="forecast"),
    Patch(facecolor="C0", alpha=0.3, label="95% CI"),
]
ax.legend(handles=handles)

# Twin-axis combined legend
fig2, ax1 = plt.subplots()
ax2 = ax1.twinx()
l1 = ax1.plot(x, y1, label="Revenue")
l2 = ax2.plot(x, y2, label="Margin", linestyle="--")
ax1.legend(l1 + l2, [h.get_label() for h in l1 + l2],
            loc="upper left")
#
# Decision rule:
#   simple multi-line/bar chart        -> label= on each call + ax.legend()
#   legend covers data                 -> ax.legend(loc="best") (auto-scan)
#   tight axes, no room inside         -> bbox_to_anchor=(1.02, 1) + constrained_layout
#   long legend, save vertical room    -> ax.legend(ncols=2, fontsize=9)
#   fill_between or proxy artist       -> handles=[Line2D(...), Patch(...)]
#   twin-axis combined legend          -> gather get_legend_handles_labels from both
#   one shared legend across subplots  -> fig.legend(handles=[...], loc="lower center")
#   suppress duplicates                -> dict.fromkeys on handle labels
#
# Anti-pattern: calling ax.legend() with no label= on any plot call. The call returns
#   silently (and with a UserWarning) — you get a tiny empty box or nothing. Always
#   pass label="..." on each plot/bar/scatter call BEFORE calling ax.legend(). Same
#   trap with two ax.legend() calls in the same axes — only the second one survives
#   (the first is replaced); use a single legend with combined handles instead.
```

## Decision Rule

```text
simple multi-line/bar chart        -> label= on each call + ax.legend()
legend covers data                 -> ax.legend(loc="best") (auto-scan)
tight axes, no room inside         -> bbox_to_anchor=(1.02, 1) + constrained_layout
long legend, save vertical room    -> ax.legend(ncols=2, fontsize=9)
fill_between or proxy artist       -> handles=[Line2D(...), Patch(...)]
twin-axis combined legend          -> gather get_legend_handles_labels from both
one shared legend across subplots  -> fig.legend(handles=[...], loc="lower center")
suppress duplicates                -> dict.fromkeys on handle labels
```

## Anti-Pattern

> [!warning] Anti-pattern
> calling ax.legend() with no label= on any plot call. The call returns
>   silently (and with a UserWarning) — you get a tiny empty box or nothing. Always
>   pass label="..." on each plot/bar/scatter call BEFORE calling ax.legend(). Same
>   trap with two ax.legend() calls in the same axes — only the second one survives
>   (the first is replaced); use a single legend with combined handles instead.

## Tips

- `loc="best"` avoids most overlap — let matplotlib find the best position
- `bbox_to_anchor=(1.01, 1)` places the legend just outside the right edge — prevents overlap with data
- `ncols=2` splits a long legend into two columns — keeps it compact
- Always set `label=` on each plot call — it is cheaper than manually building handles later

## Common Mistake

> [!warning] Calling `ax.legend()` without any `label=` arguments in the plot calls. The legend appears but is empty. Add `label="name"` to each `ax.plot()`, `ax.bar()`, etc.

## Shorthand (Junior → Senior)

**Junior:**
```python
        import matplotlib.pyplot as plt
fig, ax1 = plt.subplots(figsize=(10, 5))
x = range(12)
revenue = [10, 12, 8, 15, 18, 22, 25, 20, 18, 24, 28, 30]
margin  = [0.15, 0.18, 0.12, 0.20, 0.22, 0.25, 0.28, 0.24, 0.21, 0.26, 0.30, 0.32]
```

**Senior:**
```python
plt.show()
```

## See Also

- [[Sections/matplotlib/styling/labels|Labels & titles (Matplotlib)]]
- [[Sections/matplotlib/styling/annotate|ax.annotate() (Matplotlib)]]
- [[Sections/matplotlib/styling/tick-formatting|Tick formatting (Matplotlib)]]
- [[Sections/matplotlib/styling/colormaps|Colormaps (Matplotlib)]]
- [[Sections/matplotlib/styling/_Index|Matplotlib → Styling & Customization]]
- [[Sections/matplotlib/_Index|Matplotlib index]]
- [[_Index|Vault index]]
