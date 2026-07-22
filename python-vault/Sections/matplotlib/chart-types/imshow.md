---
type: "entry"
domain: "python"
file: "matplotlib"
section: "chart-types"
id: "imshow"
title: "ax.imshow()"
category: "Charts"
subtitle: "Matrices, images, confusion matrices — raw array heatmap"
signature_short: "ax.imshow(data, cmap=\"viridis\", vmin=, vmax=, aspect=\"auto\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "ax.imshow()"
  - "imshow"
tags:
  - "python"
  - "python/matplotlib"
  - "python/matplotlib/chart-types"
  - "category/charts"
  - "tier/tiered"
---

# ax.imshow()

> Matrices, images, confusion matrices — raw array heatmap

## Overview

ax.imshow() renders a 2D numpy array as a color image. Use it for raw array heatmaps, confusion matrices, and displaying image files. For annotated heatmaps from DataFrames, sns.heatmap() is easier — imshow() gives lower-level control.

## Signature

```python
ax.imshow(data, cmap="viridis", vmin=, vmax=, aspect="auto")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - render a 2D array as colors. Add a colorbar.
# STRENGTHS - smallest possible heatmap.
# WEAKNESSES- doesn't yet show vmin/vmax (essential for
#             comparable scales), divergent colormaps, or
#             annotation.
#
import numpy as np, matplotlib.pyplot as plt
fig, ax = plt.subplots()
im = ax.imshow(np.random.randn(10, 10), cmap="viridis")
fig.colorbar(im, ax=ax)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday imshow surface: pin vmin/vmax for
#             comparable scales, divergent colormap centered
#             at zero, confusion-matrix annotations, hide
#             axes for image files.
# STRENGTHS - vmin/vmax pinning is essential for any side-
#             by-side comparison; the annotated confusion-
#             matrix pattern is one of imshow's most common
#             real uses.
# WEAKNESSES- doesn't address aspect= (square cells vs
#             stretched), origin= ("upper" vs "lower"), or
#             when sns.heatmap is the better choice — senior.
#
import numpy as np, matplotlib.pyplot as plt

# Symmetric data with divergent colormap
data = np.random.randn(8, 8)
fig, ax = plt.subplots()
im = ax.imshow(data, cmap="RdBu_r", vmin=-3, vmax=3)
fig.colorbar(im, ax=ax, label="value")

# Annotated confusion matrix
cm = np.array([[50, 5], [3, 42]])
fig2, ax2 = plt.subplots()
ax2.imshow(cm, cmap="Blues")
for i in range(cm.shape[0]):
    for j in range(cm.shape[1]):
        ax2.text(j, i, str(cm[i, j]),
                  ha="center", va="center", fontsize=14)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production imshow: pick the right colormap
#             family (sequential/divergent/cyclic), control
#             aspect= and interpolation= deliberately, set
#             extent= for real-world coordinates instead of
#             pixel indices, and reach for sns.heatmap when
#             you have row/column labels.
# STRENGTHS - colormap family choice prevents data
#             misreading; extent= maps pixels to true axes
#             coordinates; sns.heatmap is dramatically less
#             code for labeled DataFrames.
# WEAKNESSES- divergent colormaps require centered vmin/vmax
#             to read correctly; interpolation="nearest" is
#             usually right but the default is "antialiased"
#             on newer matplotlib.
#
import numpy as np, matplotlib.pyplot as plt

data = np.random.randn(64, 64) * 2

# 1. Divergent for signed data, sequential for unsigned
fig, ax = plt.subplots(layout="constrained")
limit = max(abs(data.min()), abs(data.max()))
im = ax.imshow(data,
                cmap="RdBu_r",
                vmin=-limit, vmax=limit,                  # symmetric -> 0 = white
                interpolation="nearest",                  # crisp pixels
                extent=[-3, 3, -3, 3],                    # real coords, not pixels
                origin="lower")                           # math convention
fig.colorbar(im, ax=ax, label="z")

# 2. For labeled heatmaps, sns.heatmap is far less code
# import seaborn as sns
# sns.heatmap(df, annot=True, fmt=".2f", cmap="coolwarm")

# Decision rule:
#   sequential, all positive       -> "viridis", "plasma", "magma"
#   divergent, signed (+/-)        -> "RdBu_r", "coolwarm", "seismic"
#   cyclic (angle, phase)          -> "twilight", "hsv"
#   labeled rows/cols (DataFrame)  -> sns.heatmap (annot=True, fmt=...)
#   real-world coordinates         -> imshow(extent=[x0, x1, y0, y1])
#   image data (RGB)               -> imshow(arr, origin="upper") + ax.axis("off")
#   confusion matrix               -> imshow + text loop OR sklearn ConfusionMatrixDisplay
#   NEVER                          -> "jet", "rainbow" (perceptually misleading)
#
# Anti-pattern: leaving aspect="equal" (the default) on a non-image array, producing
#   a tall sliver or wide stripe when rows != cols. For arbitrary 2D arrays that are
#   NOT images, pass aspect="auto" so the heatmap fills the axes. Reserve aspect="equal"
#   for actual images and confusion matrices where square cells matter.
```

## Decision Rule

```text
sequential, all positive       -> "viridis", "plasma", "magma"
divergent, signed (+/-)        -> "RdBu_r", "coolwarm", "seismic"
cyclic (angle, phase)          -> "twilight", "hsv"
labeled rows/cols (DataFrame)  -> sns.heatmap (annot=True, fmt=...)
real-world coordinates         -> imshow(extent=[x0, x1, y0, y1])
image data (RGB)               -> imshow(arr, origin="upper") + ax.axis("off")
confusion matrix               -> imshow + text loop OR sklearn ConfusionMatrixDisplay
NEVER                          -> "jet", "rainbow" (perceptually misleading)
```

## Anti-Pattern

> [!warning] Anti-pattern
> leaving aspect="equal" (the default) on a non-image array, producing
>   a tall sliver or wide stripe when rows != cols. For arbitrary 2D arrays that are
>   NOT images, pass aspect="auto" so the heatmap fills the axes. Reserve aspect="equal"
>   for actual images and confusion matrices where square cells matter.

## Tips

- Use cmap="RdBu_r" with vmin=-v, vmax=v for diverging data centered at zero
- ax.axis("off") removes ticks and labels — standard for displaying images
- For DataFrame heatmaps with annotations, sns.heatmap() is easier than imshow()
- origin="upper" (default) puts row 0 at top; origin="lower" puts it at bottom

## Common Mistake

> [!warning] Using imshow() on a float array without setting vmin/vmax. The colormap auto-scales — two plots of the same variable at different ranges will show different colors, making comparison misleading.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
import matplotlib.pyplot as plt
fig, ax = plt.subplots()
data = np.random.randn(10, 10)
```

**Senior:**
```python
ax.set_yticklabels(row_labels)
```

## See Also

- [[Sections/matplotlib/chart-types/line|ax.plot() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/bar|ax.bar() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/barh|ax.barh() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/hist|ax.hist() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/_Index|Matplotlib → Chart Types]]
- [[Sections/matplotlib/_Index|Matplotlib index]]
- [[_Index|Vault index]]
