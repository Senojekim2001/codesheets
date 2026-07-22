---
type: "entry"
domain: "python"
file: "seaborn"
section: "distributions"
id: "histplot"
title: "sns.histplot()"
category: "Distribution"
subtitle: "Modern histogram — replaces the deprecated sns.distplot()"
signature_short: "sns.histplot(data, x=\"col\", hue=\"group\", kde=True, stat=\"count\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sns.histplot()"
  - "histplot"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/distributions"
  - "category/distribution"
  - "tier/tiered"
---

# sns.histplot()

> Modern histogram — replaces the deprecated sns.distplot()

## Overview

histplot() is the modern seaborn histogram (replaces the removed distplot). kde=True overlays a kernel density estimate. stat= controls the y-axis: "count", "frequency", "density", or "percent". hue= splits by a categorical variable.

## Signature

```python
sns.histplot(data, x="col", hue="group", kde=True, stat="count")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - histplot with kde=True overlays a smooth
#             density on the histogram. Pass data + x.
# STRENGTHS - the modern replacement for distplot; one
#             line gets you a publication-ready histogram.
# WEAKNESSES- doesn't yet show hue, density normalization,
#             or 2D heatmaps.
#
import seaborn as sns
df = sns.load_dataset("tips")
sns.histplot(data=df, x="total_bill", kde=True)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday histplot surface: hue= for
#             grouping, multiple= for layering policy,
#             stat="density" for fair cross-group
#             comparison, bins= for resolution control.
# STRENGTHS - covers what real EDA looks like; density
#             scaling is the single most useful flag for
#             "groups have different N".
# WEAKNESSES- doesn't address common_norm or 2D histograms
#             — senior tier.
#
import seaborn as sns

df = sns.load_dataset("tips")

# Group by sex; density-normalized so different N is fair
sns.histplot(data=df, x="total_bill", hue="sex",
              stat="density", common_norm=False,
              bins=20, kde=True, multiple="layer")

# Bin policy options:
# multiple="layer"  -> overlapping (use alpha)
# multiple="dodge"  -> side-by-side bars
# multiple="stack"  -> stacked
# multiple="fill"   -> proportions (per bin)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production histograms: bins="fd" (Freedman-
#             Diaconis) for skewed data, common_norm=False
#             to compare shapes across groups, 2D histplot
#             for joint distributions, log_scale on heavy
#             tails.
# STRENGTHS - "fd" picks bin-width by IQR (robust to
#             outliers); 2D histplot reveals joint structure
#             scatter hides; log_scale handles long tails
#             without manual transforms.
# WEAKNESSES- "fd" can produce many bins on small samples;
#             2D histplot needs enough data to fill bins;
#             log_scale only handles positive values.
#
import seaborn as sns
import matplotlib.pyplot as plt

df = sns.load_dataset("tips")

fig, axes = plt.subplots(1, 3, figsize=(15, 4),
                          layout="constrained")

# 1. Robust bin width on skewed data
sns.histplot(data=df, x="total_bill", bins="fd",
              ax=axes[0])
axes[0].set_title("bins='fd' (robust)")

# 2. Group shapes — common_norm=False
sns.histplot(data=df, x="total_bill", hue="sex",
              stat="density", common_norm=False,
              kde=True, ax=axes[1])
axes[1].set_title("density, separate norms")

# 3. 2D joint distribution
sns.histplot(data=df, x="total_bill", y="tip",
              bins=20, cmap="viridis", cbar=True,
              ax=axes[2])
axes[2].set_title("2D histogram")

# Decision rule:
#   single var, normal-ish        -> bins=auto
#   single var, skewed/outliers   -> bins="fd"
#   compare groups (different N)  -> stat="density", common_norm=False
#   joint shape of two vars       -> 2D histplot or hexbin
#   long-tailed positive data     -> log_scale=True
#   reach for distplot            -> NEVER (removed in 0.14)
#
# Anti-pattern: comparing histograms of groups with very different sample sizes using default counts.
#   Default stat="count" makes the larger group look taller everywhere even when shapes
#   are identical. Always set stat="density" with common_norm=False so each group integrates
#   to 1 independently — then bar heights reflect shape, not N.
```

## Decision Rule

```text
single var, normal-ish        -> bins=auto
single var, skewed/outliers   -> bins="fd"
compare groups (different N)  -> stat="density", common_norm=False
joint shape of two vars       -> 2D histplot or hexbin
long-tailed positive data     -> log_scale=True
reach for distplot            -> NEVER (removed in 0.14)
```

## Anti-Pattern

> [!warning] Anti-pattern
> comparing histograms of groups with very different sample sizes using default counts.
>   Default stat="count" makes the larger group look taller everywhere even when shapes
>   are identical. Always set stat="density" with common_norm=False so each group integrates
>   to 1 independently — then bar heights reflect shape, not N.

## Tips

- `kde=True` is the easiest way to add a smooth density curve on top of a histogram
- `stat="density"` normalizes to a probability density — makes groups with different n comparable
- `multiple="fill"` shows proportions within each bin — best for comparing across groups
- `bins="auto"` or `bins="fd"` (Freedman-Diaconis) often gives better bin widths than a fixed number

## Common Mistake

> [!warning] Using the deprecated `sns.distplot()`. It was deprecated in seaborn 0.11 and removed in 0.14. Use `sns.histplot(kde=True)` for the equivalent result.

## Shorthand (Junior → Senior)

**Junior:**
```python
import seaborn as sns
import matplotlib.pyplot as plt
data = sns.load_dataset('tips')
sns.histplot(data=data, x='total_bill', kde=True)
```

**Senior:**
```python
plt.ylabel('Cumulative Proportion')
```

## See Also

- [[Sections/seaborn/distributions/kdeplot|sns.kdeplot() (Seaborn)]]
- [[Sections/seaborn/distributions/ecdfplot|sns.ecdfplot() (Seaborn)]]
- [[Sections/seaborn/distributions/rugplot|sns.rugplot() (Seaborn)]]
- [[Sections/seaborn/distributions/displot|sns.displot() (Seaborn)]]
- [[Sections/seaborn/distributions/_Index|Seaborn → Distribution Plots]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
