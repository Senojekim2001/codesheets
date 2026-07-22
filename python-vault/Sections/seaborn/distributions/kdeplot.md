---
type: "entry"
domain: "python"
file: "seaborn"
section: "distributions"
id: "kdeplot"
title: "sns.kdeplot()"
category: "Distribution"
subtitle: "Smooth continuous density — 1D or 2D"
signature_short: "sns.kdeplot(data, x=\"col\", hue=\"group\", fill=True)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sns.kdeplot()"
  - "kdeplot"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/distributions"
  - "category/distribution"
  - "tier/tiered"
---

# sns.kdeplot()

> Smooth continuous density — 1D or 2D

## Overview

kdeplot() fits and plots a kernel density estimate — a smooth continuous version of a histogram. bw_adjust= controls smoothness. For 2D distributions, pass both x= and y= to get a contour plot.

## Signature

```python
sns.kdeplot(data, x="col", hue="group", fill=True)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - smooth density curve. fill=True for a
#             filled area under the curve.
# STRENGTHS - smoother than histplot for showing shape
#             without bin-edge artifacts.
# WEAKNESSES- doesn't yet show hue, 2D KDE, or bandwidth
#             control.
#
import seaborn as sns
df = sns.load_dataset("tips")
sns.kdeplot(data=df, x="total_bill", fill=True)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday KDE surface: hue with
#             common_norm=False, 2D contour KDE, and
#             overlay on a scatter plot.
# STRENGTHS - the 2D KDE + scatter overlay is the most
#             common joint-distribution diagnostic.
# WEAKNESSES- doesn't address bandwidth tuning for
#             multimodal data — senior tier.
#
import seaborn as sns

df = sns.load_dataset("tips")

# Multiple distributions, separately normalized
sns.kdeplot(data=df, x="total_bill", hue="sex",
             fill=True, common_norm=False, alpha=0.4)

# 2D KDE — contours of joint density
sns.kdeplot(data=df, x="total_bill", y="tip",
             fill=True, cmap="viridis")

# Overlay on scatter for raw + smooth
ax = sns.scatterplot(data=df, x="total_bill", y="tip",
                      alpha=0.4)
sns.kdeplot(data=df, x="total_bill", y="tip",
             color="red", levels=5, ax=ax)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production KDE: tune bw_adjust deliberately
#             (default oversmooths multimodal data); use
#             cut=0 to clip the density at the data range
#             (no impossible-value extrapolation); pair
#             with rugplot for transparency.
# STRENGTHS - bw_adjust<1 reveals subgroups; cut=0 prevents
#             the "negative bill" extrapolation that
#             confuses readers; rug overlay shows the actual
#             data so KDE smoothness is honest.
# WEAKNESSES- bw_adjust requires judgment; cut=0 truncates
#             the curve at min/max which can hide tail
#             behavior; rugplot adds visual clutter on big
#             datasets.
#
import seaborn as sns
import matplotlib.pyplot as plt

df = sns.load_dataset("tips")

fig, axes = plt.subplots(1, 2, figsize=(12, 4),
                          layout="constrained")

# 1. Bandwidth tuning — see substructure
sns.kdeplot(data=df, x="total_bill",
             bw_adjust=0.5, fill=True, ax=axes[0])
axes[0].set_title("bw_adjust=0.5 (rougher)")

# 2. cut=0 + rugplot — honest visual
sns.kdeplot(data=df, x="total_bill",
             cut=0, fill=True, ax=axes[1])
sns.rugplot(data=df, x="total_bill",
             height=0.05, alpha=0.4, ax=axes[1])
axes[1].set_title("cut=0 + rug")

# Decision rule:
#   smoothing dominates             -> bw_adjust < 1
#   default looks fine              -> bw_adjust = 1
#   honest tail behavior matters    -> cut=0 + rugplot
#   compare groups (different N)    -> hue=, common_norm=False
#   bounded data (>=0, percent)     -> cut=0 (don't extend past data)
#   2D joint density                -> kdeplot(x=, y=) with fill=True
#
# Anti-pattern: trusting a default-bandwidth KDE on a multimodal distribution.
#   The default bandwidth heuristic over-smooths and silently merges peaks. Always sweep
#   bw_adjust over {0.5, 1.0, 1.5} and overlay a rugplot or histplot — if peaks appear/
#   vanish across bandwidths, the KDE alone is lying. Reach for histplot to confirm.
```

## Decision Rule

```text
smoothing dominates             -> bw_adjust < 1
default looks fine              -> bw_adjust = 1
honest tail behavior matters    -> cut=0 + rugplot
compare groups (different N)    -> hue=, common_norm=False
bounded data (>=0, percent)     -> cut=0 (don't extend past data)
2D joint density                -> kdeplot(x=, y=) with fill=True
```

## Anti-Pattern

> [!warning] Anti-pattern
> trusting a default-bandwidth KDE on a multimodal distribution.
>   The default bandwidth heuristic over-smooths and silently merges peaks. Always sweep
>   bw_adjust over {0.5, 1.0, 1.5} and overlay a rugplot or histplot — if peaks appear/
>   vanish across bandwidths, the KDE alone is lying. Reach for histplot to confirm.

## Tips

- `bw_adjust=` is a multiplier on the automatic bandwidth — <1 rougher, >1 smoother
- `fill=True` with `alpha=0.3` makes overlapping groups visible
- 2D kdeplot with `fill=True` and a sequential colormap shows density as color intensity
- Pair with `sns.rugplot()` to show individual data points below the curve

## Common Mistake

> [!warning] Using default bandwidth on a multimodal distribution — it may be over-smoothed and hide the multiple peaks. Use `bw_adjust=0.5` to reveal substructure.

## Shorthand (Junior → Senior)

**Junior:**
```python
import seaborn as sns
import matplotlib.pyplot as plt
data = sns.load_dataset('tips')
sns.kdeplot(data=data, x='total_bill', fill=True)
```

**Senior:**
```python
sns.kdeplot(data=data, x='total_bill', y='tip', color='red', levels=5)
```

## See Also

- [[Sections/seaborn/distributions/histplot|sns.histplot() (Seaborn)]]
- [[Sections/seaborn/distributions/ecdfplot|sns.ecdfplot() (Seaborn)]]
- [[Sections/seaborn/distributions/rugplot|sns.rugplot() (Seaborn)]]
- [[Sections/seaborn/distributions/displot|sns.displot() (Seaborn)]]
- [[Sections/seaborn/distributions/_Index|Seaborn → Distribution Plots]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
