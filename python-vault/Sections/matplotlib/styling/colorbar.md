---
type: "entry"
domain: "python"
file: "matplotlib"
section: "styling"
id: "colorbar"
title: "fig.colorbar()"
category: "Styling"
subtitle: "Required when color encodes a continuous variable"
signature_short: "plt.colorbar(mappable, ax=ax, label=\"\", orientation=\"vertical\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "fig.colorbar()"
  - "colorbar"
tags:
  - "python"
  - "python/matplotlib"
  - "python/matplotlib/styling"
  - "category/styling"
  - "tier/tiered"
---

# fig.colorbar()

> Required when color encodes a continuous variable

## Overview

A colorbar explains what the colors in a plot mean. Required whenever you use a colormap to encode a continuous variable — scatter with c=, imshow, contour, pcolormesh. Always label it with what the colors represent.

## Signature

```python
plt.colorbar(mappable, ax=ax, label="", orientation="vertical")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - capture the mappable returned by scatter/
#             imshow, pass it to fig.colorbar with ax=.
# STRENGTHS - one call adds the legend for color-encoded
#             data.
# WEAKNESSES- doesn't yet show labeling, orientation, or
#             discrete colorbars.
#
import matplotlib.pyplot as plt
fig, ax = plt.subplots()
sc = ax.scatter(x, y, c=values, cmap="viridis")
fig.colorbar(sc, ax=ax)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday colorbar surface: ALWAYS label
#             with what the colors mean; orientation and
#             shrink for layout control; explicit ax= when
#             multiple subplots exist.
# STRENGTHS - the rule "always label the colorbar" is
#             non-negotiable for honest charts.
# WEAKNESSES- doesn't address discrete (categorical) bars
#             or shared colorbars across subplots — senior.
#
import matplotlib.pyplot as plt

fig, axes = plt.subplots(1, 2, figsize=(12, 5))

sc = axes[0].scatter(x, y, c=temperature, cmap="plasma")
cbar = fig.colorbar(sc, ax=axes[0])
cbar.set_label("Temperature (°C)")

im = axes[1].imshow(corr, cmap="RdBu_r", vmin=-1, vmax=1)
cbar2 = fig.colorbar(im, ax=axes[1])
cbar2.set_label("Correlation")

# Layout knobs
fig.colorbar(sc, ax=axes[0],
              orientation="horizontal",
              shrink=0.8, pad=0.04,
              label="Value")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production colorbar: discrete (categorical)
#             colorbars via BoundaryNorm + tick centering;
#             one shared colorbar across many subplots; pin
#             extend= when data may exceed vmin/vmax.
# STRENGTHS - discrete bars are the right answer for
#             classification/categorical scatter; one shared
#             bar saves space and makes panels comparable;
#             extend= flags out-of-range values honestly.
# WEAKNESSES- BoundaryNorm tick math is subtle (centering
#             on bin midpoints); shared colorbars require
#             passing the whole axes list to ax=.
#
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
import numpy as np

# 1. One colorbar shared across many subplots
fig, axes = plt.subplots(2, 2, figsize=(10, 8),
                          layout="constrained")
data = [np.random.randn(8, 8) for _ in range(4)]
limit = max(np.abs(d).max() for d in data)
ims = [ax.imshow(d, cmap="RdBu_r", vmin=-limit, vmax=limit)
       for ax, d in zip(axes.flat, data)]
fig.colorbar(ims[0], ax=axes, label="value", shrink=0.8)

# 2. Discrete colorbar with centered ticks
fig2, ax = plt.subplots()
cmap = plt.colormaps["tab10"].resampled(5)
norm = mcolors.BoundaryNorm(boundaries=np.arange(6) - 0.5, ncolors=5)
sc = ax.scatter(x, y, c=labels, cmap=cmap, norm=norm)
cbar = fig2.colorbar(sc, ax=ax, ticks=range(5))
cbar.ax.set_yticklabels(["A", "B", "C", "D", "E"])
cbar.set_label("Category")

# 3. extend= flags out-of-range data
fig3, ax3 = plt.subplots()
sc3 = ax3.scatter(x, y, c=values, cmap="viridis", vmin=0, vmax=100)
fig3.colorbar(sc3, ax=ax3, extend="both",          # arrows on either end
               label="score (0-100)")
#
# Decision rule:
#   single mappable, single ax          -> fig.colorbar(mappable, ax=ax)
#   shared bar across grid              -> fig.colorbar(im, ax=axes, shrink=0.8)
#   horizontal bar at bottom            -> orientation="horizontal", shrink=0.8
#   discrete categorical                -> BoundaryNorm + ticks=range(n) + set_yticklabels
#   data may exceed vmin/vmax           -> extend="both" (or "min"/"max") for arrows
#   thin bar next to tall axes          -> shrink=0.8, pad=0.04
#   external axes (precise placement)   -> cax=fig.add_axes([l, b, w, h])
#   need percent / currency labels      -> cbar.ax.yaxis.set_major_formatter(...)
#
# Anti-pattern: omitting cbar.set_label("...") so readers see a colored strip with
#   numbers but no clue what the colors mean. A colorbar without a label is dishonest —
#   you've removed the encoding key. Equally common: calling plt.colorbar() without
#   ax= in a multi-subplot figure, which attaches the bar to the most recently active
#   axes (often the wrong one) and can resize that subplot.
```

## Decision Rule

```text
single mappable, single ax          -> fig.colorbar(mappable, ax=ax)
shared bar across grid              -> fig.colorbar(im, ax=axes, shrink=0.8)
horizontal bar at bottom            -> orientation="horizontal", shrink=0.8
discrete categorical                -> BoundaryNorm + ticks=range(n) + set_yticklabels
data may exceed vmin/vmax           -> extend="both" (or "min"/"max") for arrows
thin bar next to tall axes          -> shrink=0.8, pad=0.04
external axes (precise placement)   -> cax=fig.add_axes([l, b, w, h])
need percent / currency labels      -> cbar.ax.yaxis.set_major_formatter(...)
```

## Anti-Pattern

> [!warning] Anti-pattern
> omitting cbar.set_label("...") so readers see a colored strip with
>   numbers but no clue what the colors mean. A colorbar without a label is dishonest —
>   you've removed the encoding key. Equally common: calling plt.colorbar() without
>   ax= in a multi-subplot figure, which attaches the bar to the most recently active
>   axes (often the wrong one) and can resize that subplot.

## Tips

- Always label the colorbar — `cbar.set_label("what this represents")` is non-optional
- `shrink=0.8` on a tall figure keeps the colorbar height proportional to the axes
- `vmin` and `vmax` on the plot call and the colorbar stay in sync automatically
- For diverging colormaps, set `vmin=-abs_max, vmax=abs_max` to center at zero

## Common Mistake

> [!warning] Calling `plt.colorbar()` without the `ax=` argument in a multi-subplot figure. It attaches to the current active axes which may not be the one you want.

## Shorthand (Junior → Senior)

**Junior:**
```python
import matplotlib.pyplot as plt
fig, axes = plt.subplots(1, 2, figsize=(12, 5))
sc = axes[0].scatter(x, y, c=temperature, cmap='plasma',
s=50, alpha=0.7)
```

**Senior:**
```python
plt.colorbar(sm, ax=ax, label='Category')
```

## See Also

- [[Sections/matplotlib/styling/labels|Labels & titles (Matplotlib)]]
- [[Sections/matplotlib/styling/annotate|ax.annotate() (Matplotlib)]]
- [[Sections/matplotlib/styling/legend|ax.legend() (Matplotlib)]]
- [[Sections/matplotlib/styling/tick-formatting|Tick formatting (Matplotlib)]]
- [[Sections/matplotlib/styling/_Index|Matplotlib → Styling & Customization]]
- [[Sections/matplotlib/_Index|Matplotlib index]]
- [[_Index|Vault index]]
