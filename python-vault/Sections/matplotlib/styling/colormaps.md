---
type: "entry"
domain: "python"
file: "matplotlib"
section: "styling"
id: "colormaps"
title: "Colormaps"
category: "Styling"
subtitle: "Perceptually uniform: viridis, plasma, cividis — avoid jet/rainbow"
signature_short: "ax.scatter(x, y, c=values, cmap=\"viridis\") | plt.cm.get_cmap()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Colormaps"
  - "colormaps"
tags:
  - "python"
  - "python/matplotlib"
  - "python/matplotlib/styling"
  - "category/styling"
  - "tier/tiered"
---

# Colormaps

> Perceptually uniform: viridis, plasma, cividis — avoid jet/rainbow

## Overview

Colormaps map numeric values to colors. Perceptually uniform colormaps (viridis, plasma, magma, cividis) are readable for colorblind users and convert correctly to greyscale. Diverging colormaps (RdBu, coolwarm) are best for data centered at zero.

## Signature

```python
ax.scatter(x, y, c=values, cmap="viridis") | plt.cm.get_cmap()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - viridis is the safe default. c= a numeric
#             array, cmap= a colormap name.
# STRENGTHS - one option flag picks a perceptually-uniform
#             default that works for everyone (including
#             colorblind viewers).
# WEAKNESSES- doesn't yet show diverging vs sequential vs
#             qualitative — junior.
#
import matplotlib.pyplot as plt
fig, ax = plt.subplots()
sc = ax.scatter(x, y, c=values, cmap="viridis")
fig.colorbar(sc, ax=ax)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - pick the colormap family by data type:
#             sequential (viridis) for unsigned, diverging
#             (RdBu_r) for ± centered at zero, qualitative
#             (tab10) for discrete categories.
# STRENGTHS - the family rule prevents most colormap
#             misuse; vmin/vmax centering on diverging
#             colormaps makes "0 = white" honest.
# WEAKNESSES- doesn't address custom colormaps or the
#             colorblind-safe rules — senior tier.
#
import matplotlib.pyplot as plt

fig, axes = plt.subplots(1, 3, figsize=(15, 4))

# Sequential — unsigned continuous data
sc = axes[0].scatter(x, y, c=values, cmap="viridis")
plt.colorbar(sc, ax=axes[0], label="value")
axes[0].set_title("viridis (sequential)")

# Diverging — signed data, centered at zero
limit = max(abs(diff.min()), abs(diff.max()))
sc2 = axes[1].scatter(x, y, c=diff,
                       cmap="RdBu_r", vmin=-limit, vmax=limit)
plt.colorbar(sc2, ax=axes[1], label="diff")
axes[1].set_title("RdBu_r (diverging)")

# Qualitative — discrete categories
cmap = plt.colormaps["tab10"].resampled(5)
for i, cat in enumerate(["A", "B", "C", "D", "E"]):
    axes[2].scatter(xs[i], ys[i], color=cmap(i), label=cat)
axes[2].legend()
axes[2].set_title("tab10 (qualitative)")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production color decisions: pick perceptually
#             uniform AND colorblind-safe (viridis, cividis,
#             plasma); use Normalize/LogNorm/TwoSlopeNorm for
#             non-linear data; build a custom colormap when
#             stakeholders demand brand colors.
# STRENGTHS - explicit Norm classes handle skewed/log/signed
#             data correctly without contorting the colormap;
#             custom cmaps allow brand-aligned charts that
#             still print in greyscale.
# WEAKNESSES- LogNorm requires positive data; TwoSlopeNorm
#             with mismatched bounds can mislead; custom
#             colormaps need testing in greyscale.
#
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
import numpy as np

# 1. Log-scale color encoding for skewed data
fig, ax = plt.subplots()
sc = ax.scatter(x, y, c=values,
                 norm=mcolors.LogNorm(vmin=1, vmax=values.max()),
                 cmap="viridis")
fig.colorbar(sc, ax=ax)

# 2. Asymmetric diverging — TwoSlopeNorm anchors zero
fig2, ax2 = plt.subplots()
sc2 = ax2.scatter(x, y, c=signed,
                   norm=mcolors.TwoSlopeNorm(vmin=signed.min(),
                                               vcenter=0,
                                               vmax=signed.max()),
                   cmap="RdBu_r")

# 3. Custom brand colormap (test in greyscale!)
brand = mcolors.LinearSegmentedColormap.from_list(
    "brand", ["#ffffff", "#5a9bd4", "#1f4068"])

# Standing rules:
#   - viridis / plasma / magma / cividis: safe perceptual sequential defaults
#   - RdBu_r / coolwarm: signed/diverging — always centered with vmin=-vmax or TwoSlopeNorm
#   - tab10 / tab20 / Set2: discrete categorical
#   - NEVER use: jet / rainbow / hsv (not perceptually uniform)
#
# Decision rule:
#   sequential, all positive            -> "viridis", "plasma", "magma", "cividis"
#   diverging, signed (+/-)             -> "RdBu_r" or "coolwarm" with vmin=-vmax
#   skewed positive data                -> norm=LogNorm(vmin=, vmax=)
#   asymmetric divergent (e.g. -1..5)   -> norm=TwoSlopeNorm(vcenter=0)
#   discrete categories                 -> "tab10" / "Set2" / BoundaryNorm
#   cyclic (angles, phase)              -> "twilight", "hsv"
#   colorblind-safe priority            -> cividis (safest), viridis (very safe)
#   brand colors                        -> LinearSegmentedColormap.from_list
#
# Anti-pattern: using "jet" or "rainbow" because they're "colorful". They are NOT
#   perceptually uniform — yellow stripes look like local maxima, and the brightness
#   curve dips and peaks across the range, fabricating features that aren't in the data.
#   Worse: they fail in greyscale and for colorblind viewers. Default to viridis; reach
#   for jet only when matching legacy publications, never for new analysis.
```

## Decision Rule

```text
sequential, all positive            -> "viridis", "plasma", "magma", "cividis"
diverging, signed (+/-)             -> "RdBu_r" or "coolwarm" with vmin=-vmax
skewed positive data                -> norm=LogNorm(vmin=, vmax=)
asymmetric divergent (e.g. -1..5)   -> norm=TwoSlopeNorm(vcenter=0)
discrete categories                 -> "tab10" / "Set2" / BoundaryNorm
cyclic (angles, phase)              -> "twilight", "hsv"
colorblind-safe priority            -> cividis (safest), viridis (very safe)
brand colors                        -> LinearSegmentedColormap.from_list
```

## Anti-Pattern

> [!warning] Anti-pattern
> using "jet" or "rainbow" because they're "colorful". They are NOT
>   perceptually uniform — yellow stripes look like local maxima, and the brightness
>   curve dips and peaks across the range, fabricating features that aren't in the data.
>   Worse: they fail in greyscale and for colorblind viewers. Default to viridis; reach
>   for jet only when matching legacy publications, never for new analysis.

## Tips

- Use `viridis` as your default sequential colormap — perceptually uniform and colorblind-safe
- Add `_r` suffix to reverse any colormap: `"viridis_r"`, `"RdBu_r"`
- Set `vmin` and `vmax` on diverging maps to center at zero: `vmin=-max_abs, vmax=max_abs`
- `plt.cm.get_cmap("tab10", n)` creates a discrete colormap with exactly n colors

## Common Mistake

> [!warning] Using the `jet` or `rainbow` colormap. They are not perceptually uniform — small value differences in the middle look larger than large differences at the edges. Use `viridis` instead.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = []
for x in items:
    if x > 0:
        result.append(x)
```

**Senior:**
```python
result = [x for x in items if x > 0]
```

## See Also

- [[Sections/matplotlib/styling/labels|Labels & titles (Matplotlib)]]
- [[Sections/matplotlib/styling/annotate|ax.annotate() (Matplotlib)]]
- [[Sections/matplotlib/styling/legend|ax.legend() (Matplotlib)]]
- [[Sections/matplotlib/styling/tick-formatting|Tick formatting (Matplotlib)]]
- [[Sections/matplotlib/styling/_Index|Matplotlib → Styling & Customization]]
- [[Sections/matplotlib/_Index|Matplotlib index]]
- [[_Index|Vault index]]
