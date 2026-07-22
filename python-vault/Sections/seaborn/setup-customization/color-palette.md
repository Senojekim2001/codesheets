---
type: "entry"
domain: "python"
file: "seaborn"
section: "setup-customization"
id: "color-palette"
title: "sns.color_palette()"
category: "Customization"
subtitle: "Choose the right palette type — qualitative, sequential, or diverging"
signature_short: "sns.color_palette(\"deep\") | sns.color_palette(\"Blues\") | sns.diverging_palette()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sns.color_palette()"
  - "color-palette"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/setup-customization"
  - "category/customization"
  - "tier/tiered"
---

# sns.color_palette()

> Choose the right palette type — qualitative, sequential, or diverging

## Overview

Color palettes in seaborn fall into three types: qualitative (for categorical data — distinct colors), sequential (for ordered data — light to dark), and diverging (for data centered at zero — two hues going out from a midpoint). Choosing the wrong type is one of the most common visualization mistakes.

## Signature

```python
sns.color_palette("deep") | sns.color_palette("Blues") | sns.diverging_palette()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - pick a palette by name, pass it as
#             palette= to a plot.
# STRENGTHS - one argument changes every color in the
#             plot.
# WEAKNESSES- doesn't yet differentiate qualitative /
#             sequential / diverging — choosing the
#             wrong type misleads viewers.
#
import seaborn as sns
sns.boxplot(data=df, x="day", y="tip", palette="colorblind")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the three palette families: qualitative
#             for categories, sequential for ordered
#             magnitude, diverging for ± data.
#             Pick by data type, not by aesthetics.
# STRENGTHS - the family rule prevents misleading
#             plots; "colorblind" as the default
#             qualitative is the responsible choice.
# WEAKNESSES- doesn't address custom palettes or
#             colormap conversion — senior.
#
import seaborn as sns

# Qualitative — distinct colors per category
sns.boxplot(data=df, x="day", y="tip", palette="colorblind")

# Sequential — ordered magnitude (heatmaps of unsigned data)
sns.heatmap(pivot, cmap="viridis")

# Diverging — signed data, centered at zero
sns.heatmap(corr, cmap="RdBu_r", center=0, vmin=-1, vmax=1)

# Preview a palette in Jupyter (renders swatches)
sns.color_palette("deep")
sns.color_palette("colorblind")
sns.color_palette("RdBu", as_cmap=True)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production palettes: pin "colorblind" or
#             "viridis" / "magma" everywhere
#             accessibility matters; build branded
#             palettes from a hex list and register
#             via set_palette; NEVER rainbow / jet.
# STRENGTHS - explicit accessibility commitment
#             eliminates a class of plots that 8% of
#             readers can't decode; brand palettes
#             work without losing perceptual order.
# WEAKNESSES- branded palettes need testing in
#             greyscale and on actual color-blind
#             simulators.
#
import seaborn as sns
import matplotlib.colors as mcolors

# 1. Custom branded palette
brand = ["#E74C3C", "#3498DB", "#2ECC71", "#F1C40F"]
sns.set_palette(brand)

# 2. Custom diverging colormap (continuous)
my_cmap = sns.diverging_palette(220, 20, as_cmap=True)
# sns.heatmap(corr, cmap=my_cmap, center=0)

# 3. Custom sequential — bake it from two colors
my_seq = mcolors.LinearSegmentedColormap.from_list(
    "brand_seq", ["#FFFFFF", "#1F4068"])

# Decision rule:
#   categorical (cities, classes)        -> qualitative ("colorblind", "deep")
#   ordered numeric, unsigned            -> sequential ("viridis", "rocket")
#   signed data, centered at 0           -> diverging ("RdBu", "coolwarm")
#   small N (<=4) categories             -> custom hex list set via set_palette
#   color-blind audience                 -> "colorblind" (always safe)
#   continuous colormap for heatmap      -> color_palette(..., as_cmap=True)
#   NEVER                                -> jet, rainbow, hsv (perceptually misleading)
#
# Anti-pattern: using a qualitative palette ("deep", "Set1", "tab10") for a heatmap or
# any ordered/magnitude data.
#   Qualitative palettes have no perceptual order — adjacent values get unrelated colors
#   and the reader cannot tell "is this bigger or smaller?" from the chart. Always match
#   palette family to data: sequential (viridis) for unsigned magnitude, diverging (RdBu)
#   for signed data centered at 0, qualitative (colorblind) only for categories.
```

## Decision Rule

```text
categorical (cities, classes)        -> qualitative ("colorblind", "deep")
ordered numeric, unsigned            -> sequential ("viridis", "rocket")
signed data, centered at 0           -> diverging ("RdBu", "coolwarm")
small N (<=4) categories             -> custom hex list set via set_palette
color-blind audience                 -> "colorblind" (always safe)
continuous colormap for heatmap      -> color_palette(..., as_cmap=True)
NEVER                                -> jet, rainbow, hsv (perceptually misleading)
```

## Anti-Pattern

> [!warning] Anti-pattern
> using a qualitative palette ("deep", "Set1", "tab10") for a heatmap or
> any ordered/magnitude data.
>   Qualitative palettes have no perceptual order — adjacent values get unrelated colors
>   and the reader cannot tell "is this bigger or smaller?" from the chart. Always match
>   palette family to data: sequential (viridis) for unsigned magnitude, diverging (RdBu)
>   for signed data centered at 0, qualitative (colorblind) only for categories.

## Tips

- Use "colorblind" for any plot that may be seen by color-blind viewers — 8% of men are affected
- Sequential palettes for heatmaps of single-polarity data; diverging for data centered at zero
- Never use a rainbow (jet) palette — it introduces false perceptual boundaries in the data
- `sns.color_palette()` in Jupyter renders a color swatch — useful for choosing before plotting

## Common Mistake

> [!warning] Using a qualitative palette (deep, Set1) for a heatmap. Qualitative palettes have no inherent order — sequential (Blues, viridis) or diverging (RdBu) palettes communicate magnitude correctly.

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

- [[Sections/seaborn/setup-customization/labels-axes|Axes-level labels (Seaborn)]]
- [[Sections/seaborn/setup-customization/labels-figure|Figure-level labels (Seaborn)]]
- [[Sections/seaborn/setup-customization/savefig-seaborn|plt.savefig() (Seaborn)]]
- [[Sections/seaborn/setup-customization/despine|sns.despine() (Seaborn)]]
- [[Sections/seaborn/setup-customization/_Index|Seaborn → Setup, Customization & Output]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
