---
type: "entry"
domain: "python"
file: "matplotlib"
section: "chart-types"
id: "scatter"
title: "ax.scatter()"
category: "Charts"
subtitle: "Plot points with optional size and color dimensions"
signature_short: "ax.scatter(x, y, s=size, c=color, **kwargs)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "ax.scatter()"
  - "scatter"
tags:
  - "python"
  - "python/matplotlib"
  - "python/matplotlib/chart-types"
  - "category/charts"
  - "tier/tiered"
---

# ax.scatter()

> Plot points with optional size and color dimensions

## Overview

scatter() plots individual data points and lets you encode two additional dimensions through size (s=) and color (c=). A colorbar adds a legend for the color dimension.

## Signature

```python
ax.scatter(x, y, s=size, c=color, **kwargs)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - x and y points, that's it.
# STRENGTHS - simplest possible scatter — see relationships
#             in two lines.
# WEAKNESSES- doesn't yet show alpha for overlap, color/size
#             encoding, or a regression line overlay.
#
import numpy as np, matplotlib.pyplot as plt
x = np.random.randn(50); y = x * 2 + np.random.randn(50)
fig, ax = plt.subplots()
ax.scatter(x, y)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday scatter recipe: alpha for
#             overlap, c=array for color encoding, s=array
#             for size encoding, regression overlay via
#             np.polyfit.
# STRENGTHS - covers the patterns real exploration uses;
#             alpha is the single most-needed argument.
# WEAKNESSES- doesn't address big-data scatter (use hexbin
#             or density) or perceptually-uniform colormaps
#             — senior tier.
#
import numpy as np, matplotlib.pyplot as plt

x = np.random.randn(200) * 2 + 5
y = x * 50 + np.random.randn(200) * 20 + 200

fig, ax = plt.subplots(figsize=(8, 5))
ax.scatter(x, y, s=80, alpha=0.5, edgecolors="black")

# Regression line
z = np.polyfit(x, y, 1)
ax.plot(np.sort(x), np.poly1d(z)(np.sort(x)),
         "r--", linewidth=2, label="trend")

ax.set_xlabel("Feature"); ax.set_ylabel("Price"); ax.legend()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production scatter: when N gets large
#             (>10k), overlap kills readability — switch to
#             hexbin, hist2d, or set very low alpha. Use a
#             perceptually-uniform colormap for color
#             encoding (viridis/plasma, never jet/rainbow).
# STRENGTHS - hexbin reveals density that scatter hides;
#             perceptually-uniform colormaps don't mislead
#             viewers about magnitude; explicit decision
#             rule prevents the "1M-point unreadable
#             scatter" failure mode.
# WEAKNESSES- hexbin loses individual-point detail; jet was
#             the historical default so people still
#             instinctively use it.
#
import numpy as np, matplotlib.pyplot as plt

# Big data — scatter fails, hexbin succeeds
n = 100_000
x = np.random.randn(n); y = np.random.randn(n) + 0.5 * x

fig, axes = plt.subplots(1, 2, figsize=(12, 5),
                          layout="constrained")

# Scatter at low alpha just to see the cloud shape
axes[0].scatter(x, y, s=2, alpha=0.05)
axes[0].set_title("scatter (alpha=0.05)")

# Hexbin — reveals density
hb = axes[1].hexbin(x, y, gridsize=40, cmap="viridis")
fig.colorbar(hb, ax=axes[1], label="count")
axes[1].set_title("hexbin")

# Decision rule:
#   N <= 1k                              -> scatter (full markers)
#   1k < N <= 10k                        -> scatter with alpha=0.2-0.5
#   N > 10k                              -> hexbin / hist2d / 2D KDE
#   color-encode continuous variable     -> c=array, cmap="viridis" + colorbar
#   color-encode categorical             -> loop groups + label= per scatter
#   3rd dim via marker size              -> s=array (clip extreme values first)
#   need regression overlay              -> seaborn regplot or np.polyfit
#
# Anti-pattern: using c="red" (single color) when the user likely meant cmap encoding.
#   The c= argument is overloaded — c="red" sets every point red, but c=values + cmap=
#   maps to a colorbar. People copy "c=red" then later try c=df["score"] expecting a
#   gradient and get a confusing error or solid color. Use color="red" for solid; reserve
#   c= for numeric arrays driving a colormap.
```

## Decision Rule

```text
N <= 1k                              -> scatter (full markers)
1k < N <= 10k                        -> scatter with alpha=0.2-0.5
N > 10k                              -> hexbin / hist2d / 2D KDE
color-encode continuous variable     -> c=array, cmap="viridis" + colorbar
color-encode categorical             -> loop groups + label= per scatter
3rd dim via marker size              -> s=array (clip extreme values first)
need regression overlay              -> seaborn regplot or np.polyfit
```

## Anti-Pattern

> [!warning] Anti-pattern
> using c="red" (single color) when the user likely meant cmap encoding.
>   The c= argument is overloaded — c="red" sets every point red, but c=values + cmap=
>   maps to a colorbar. People copy "c=red" then later try c=df["score"] expecting a
>   gradient and get a confusing error or solid color. Use color="red" for solid; reserve
>   c= for numeric arrays driving a colormap.

## Tips

- alpha=0.5-0.7 is essential for overlapping points — reveals density
- c= accepts a numeric array for color mapping; cmap= sets the colormap
- s= accepts a scalar (same size all) or array (individual sizes)
- viridis, plasma, magma are perceptually uniform colormaps — prefer them over rainbow/jet

## Common Mistake

> [!warning] Using rainbow/jet colormap. It is not perceptually uniform and misleads viewers about data magnitude. Use viridis, plasma, or cividis instead.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
import matplotlib.pyplot as plt
np.random.seed(42)
features = np.random.randn(30) * 2 + 5  # 0-10 scale
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
