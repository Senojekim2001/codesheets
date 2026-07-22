---
type: "entry"
domain: "python"
file: "matplotlib"
section: "styling"
id: "annotate"
title: "ax.annotate()"
category: "Styling"
subtitle: "Call out key features — arrow from label to data coordinate"
signature_short: "ax.annotate(text, xy=(x,y), xytext=(xt,yt), arrowprops={})"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "ax.annotate()"
  - "annotate"
tags:
  - "python"
  - "python/matplotlib"
  - "python/matplotlib/styling"
  - "category/styling"
  - "tier/tiered"
---

# ax.annotate()

> Call out key features — arrow from label to data coordinate

## Overview

ax.annotate() draws text with an optional arrow. xy is the point being annotated; xytext is where the text appears. Use transform=ax.transAxes for position relative to the axes (0-1 range) so the annotation stays fixed regardless of data range.

## Signature

```python
ax.annotate(text, xy=(x,y), xytext=(xt,yt), arrowprops={})
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - text + arrow pointing at a data point.
#             xy = the point; xytext = where the text sits.
# STRENGTHS - introduces the two-coordinate model in one call.
# WEAKNESSES- doesn't yet show transforms (axes-fraction
#             text) or curved arrows.
#
import matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.plot(x, y)
ax.annotate("Peak", xy=(peak_x, peak_y),
             xytext=(peak_x + 1, peak_y + 5),
             arrowprops=dict(arrowstyle="->"))
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday annotation surface: curved arrows
#             via connectionstyle, axes-fraction text via
#             transform=ax.transAxes (stays put when axes
#             zoom), and bbox-styled labels.
# STRENGTHS - axes-fraction text is essential for "n=150" /
#             stats boxes; curved arrows avoid overlap.
# WEAKNESSES- doesn't address auto-positioning (adjustText
#             library) or annotation-arrow styles — senior.
#
import matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.plot(x, y)

# Curved arrow
ax.annotate("Minimum",
            xy=(min_x, min_y),
            xytext=(min_x - 2, min_y + 10),
            arrowprops=dict(arrowstyle="->",
                              connectionstyle="arc3,rad=0.3",
                              color="red"))

# Stats box pinned in axes fraction (0..1)
ax.text(0.05, 0.95, "n = 150",
         transform=ax.transAxes, va="top",
         bbox=dict(boxstyle="round", facecolor="white", alpha=0.8))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production annotation: never label more than
#             3-5 points by hand (use adjustText for many);
#             attach metadata directly to the data point;
#             use figure-fraction transforms for figure-wide
#             labels (e.g. attribution at bottom).
# STRENGTHS - manually-placed text scales poorly; figure-
#             fraction transforms keep elements in fixed
#             positions across all subplots.
# WEAKNESSES- adjustText is an external dependency; figure-
#             fraction means thinking about figure space
#             rather than data space.
#
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(10, 6), layout="constrained")
ax.plot(x, y)

# Limit to 3-5 hand-placed annotations
hot_points = [(t, v) for t, v in zip(x, y) if v > threshold][:3]
for t, v in hot_points:
    ax.annotate(f"{v:,.0f}",
                xy=(t, v),
                xytext=(0, 8), textcoords="offset points",
                ha="center", fontsize=9)

# Figure-fraction text — survives subplot changes
fig.text(0.99, 0.01, "Source: company internal",
          ha="right", va="bottom", fontsize=8, color="gray")

# For dense labeling, reach for adjustText
# from adjustText import adjust_text
# texts = [ax.text(t, v, f"{v}") for t, v in zip(x, y)]
# adjust_text(texts, ax=ax)
#
# Decision rule:
#   call out 1-3 specific points        -> ax.annotate(text, xy=, xytext=, arrowprops=)
#   small offset label, no arrow        -> annotate(..., textcoords="offset points")
#   stats box ("n=150") in corner       -> ax.text(..., transform=ax.transAxes)
#   figure-wide note/source             -> fig.text(0.99, 0.01, "Source: ...")
#   curved arrow to avoid clutter       -> arrowprops with connectionstyle="arc3,rad=0.3"
#   labeled background bbox             -> bbox=dict(boxstyle="round", facecolor="white")
#   many overlapping labels (>5)        -> from adjustText import adjust_text
#   axes-fraction position              -> transform=ax.transAxes (0..1, not data coords)
#
# Anti-pattern: looping over every data point with ax.annotate to label them all.
#   The labels stack on top of each other and the chart becomes a black blob. Limit
#   manual annotation to 3-5 hot points (peaks, anomalies, outliers). For dense labeling
#   reach for the adjustText library, or switch to a hover-tooltip backend (mpld3,
#   plotly) where labels are interactive.
```

## Decision Rule

```text
call out 1-3 specific points        -> ax.annotate(text, xy=, xytext=, arrowprops=)
small offset label, no arrow        -> annotate(..., textcoords="offset points")
stats box ("n=150") in corner       -> ax.text(..., transform=ax.transAxes)
figure-wide note/source             -> fig.text(0.99, 0.01, "Source: ...")
curved arrow to avoid clutter       -> arrowprops with connectionstyle="arc3,rad=0.3"
labeled background bbox             -> bbox=dict(boxstyle="round", facecolor="white")
many overlapping labels (>5)        -> from adjustText import adjust_text
axes-fraction position              -> transform=ax.transAxes (0..1, not data coords)
```

## Anti-Pattern

> [!warning] Anti-pattern
> looping over every data point with ax.annotate to label them all.
>   The labels stack on top of each other and the chart becomes a black blob. Limit
>   manual annotation to 3-5 hot points (peaks, anomalies, outliers). For dense labeling
>   reach for the adjustText library, or switch to a hover-tooltip backend (mpld3,
>   plotly) where labels are interactive.

## Tips

- transform=ax.transAxes positions text 0-1 relative to axes — stays fixed when axis limits change
- connectionstyle="arc3,rad=0.3" creates a curved arrow — avoids overlap with other elements
- arrowstyle="->" is standard; "fancy" is filled triangle; "simple" is plain line
- bbox=dict(boxstyle="round", facecolor="white") adds a background box behind the text

## Common Mistake

> [!warning] Annotating many points in a loop and getting overlapping labels. Only annotate 3-5 key points, or use the adjustText library for automatic positioning.

## Shorthand (Junior → Senior)

**Junior:**
```python
import matplotlib.pyplot as plt
fig, ax = plt.subplots()
ax.plot(x, y)
ax.annotate(
```

**Senior:**
```python
)
```

## See Also

- [[Sections/matplotlib/styling/labels|Labels & titles (Matplotlib)]]
- [[Sections/matplotlib/styling/legend|ax.legend() (Matplotlib)]]
- [[Sections/matplotlib/styling/tick-formatting|Tick formatting (Matplotlib)]]
- [[Sections/matplotlib/styling/colormaps|Colormaps (Matplotlib)]]
- [[Sections/matplotlib/styling/_Index|Matplotlib → Styling & Customization]]
- [[Sections/matplotlib/_Index|Matplotlib index]]
- [[_Index|Vault index]]
