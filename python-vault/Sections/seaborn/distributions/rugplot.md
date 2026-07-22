---
type: "entry"
domain: "python"
file: "seaborn"
section: "distributions"
id: "rugplot"
title: "sns.rugplot()"
category: "Distribution"
subtitle: "Marginal rug — pair with kdeplot or ecdfplot for full picture"
signature_short: "sns.rugplot(data, x=\"col\", hue=\"group\", height=0.05)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sns.rugplot()"
  - "rugplot"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/distributions"
  - "category/distribution"
  - "tier/tiered"
---

# sns.rugplot()

> Marginal rug — pair with kdeplot or ecdfplot for full picture

## Overview

rugplot() draws a small tick mark on the axis for each data point. On its own it gives a quick sense of density. Most useful as a marginal overlay on kdeplot, ecdfplot, or scatterplot to show the raw data distribution alongside a smooth summary.

## Signature

```python
sns.rugplot(data, x="col", hue="group", height=0.05)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - ticks along an axis, one per data point.
#             Most useful as an OVERLAY.
# STRENGTHS - shortest possible "show me where the points
#             actually are".
# WEAKNESSES- doesn't yet show overlay use (its primary
#             value) or 2D rugs.
#
import seaborn as sns
df = sns.load_dataset("tips")
sns.rugplot(data=df, x="total_bill")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the canonical pattern: rug as overlay on
#             KDE or ECDF. Add 2D ticks via x= and y=.
# STRENGTHS - shows the most useful pairing (kdeplot +
#             rugplot) — smooth shape with honest data.
# WEAKNESSES- doesn't address marginal rugs in JointGrid
#             — senior tier.
#
import seaborn as sns

df = sns.load_dataset("tips")

# Overlay on KDE — the canonical use
ax = sns.kdeplot(data=df, x="total_bill", hue="sex",
                  fill=True, alpha=0.3)
sns.rugplot(data=df, x="total_bill", hue="sex",
             ax=ax, height=0.05, alpha=0.5)

# 2D rug — ticks on both axes
sns.rugplot(data=df, x="total_bill", y="tip")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production rugs: marginal rugs on a
#             scatter via JointGrid, hide rug entirely
#             when N > a few hundred (the rug becomes a
#             solid line and adds nothing).
# STRENGTHS - JointGrid is the clean way to show joint +
#             marginals; the "skip rugplot at scale" rule
#             saves charts from becoming illegible.
# WEAKNESSES- JointGrid is figure-level (manages its own
#             figure); height tuning is finicky for
#             dense data.
#
import seaborn as sns

df = sns.load_dataset("tips")

# Marginal rug on scatter via JointGrid
g = sns.JointGrid(data=df, x="total_bill", y="tip", height=6)
g.plot_joint(sns.scatterplot, alpha=0.5)
g.plot_marginals(sns.rugplot, height=1)

# Skip rug when n > ~500 — every value becomes a tick
# and the rug becomes a solid bar with no information.
# Use kdeplot + low-alpha scatter instead.

# Decision rule:
#   small N, want raw data + smooth      -> kdeplot + rugplot
#   any N, marginals on a scatter        -> JointGrid + rugplot
#   N >> 500                             -> skip rugplot, use scatter alpha
#   2D marginals on JointGrid            -> g.plot_marginals(sns.rugplot)
#   primary chart, no overlay            -> use stripplot or histplot instead
#   want exact tick at each value        -> rugplot with height=0.05
#
# Anti-pattern: using rugplot as the standalone visualization.
#   Rugplot only encodes location, not density — adjacent ticks visually merge and you lose all
#   sense of shape. It is an OVERLAY on kdeplot/ecdfplot/scatterplot. If you need a primary
#   "show me the points" chart, reach for stripplot (categorical) or histplot (continuous).
```

## Decision Rule

```text
small N, want raw data + smooth      -> kdeplot + rugplot
any N, marginals on a scatter        -> JointGrid + rugplot
N >> 500                             -> skip rugplot, use scatter alpha
2D marginals on JointGrid            -> g.plot_marginals(sns.rugplot)
primary chart, no overlay            -> use stripplot or histplot instead
want exact tick at each value        -> rugplot with height=0.05
```

## Anti-Pattern

> [!warning] Anti-pattern
> using rugplot as the standalone visualization.
>   Rugplot only encodes location, not density — adjacent ticks visually merge and you lose all
>   sense of shape. It is an OVERLAY on kdeplot/ecdfplot/scatterplot. If you need a primary
>   "show me the points" chart, reach for stripplot (categorical) or histplot (continuous).

## Tips

- Rugplot is almost always used as an overlay — pair it with kdeplot or ecdfplot
- `height=0.05` keeps the ticks small and unobtrusive — the default is often too tall
- Pass `ax=` to draw on the same axes as an existing plot
- For 2D marginal distributions, use JointGrid with `plot_marginals(sns.rugplot)`

## Common Mistake

> [!warning] Using rugplot alone as the primary visualization. It only shows data locations without quantifying density. Pair it with kdeplot or ecdfplot for a complete picture.

## Shorthand (Junior → Senior)

**Junior:**
```python
import matplotlib.pyplot as plt
import seaborn as sns
df = sns.load_dataset('tips')
sns.rugplot(data=df, x='total_bill')
```

**Senior:**
```python
g.plot_marginals(sns.rugplot, height=1)
```

## See Also

- [[Sections/seaborn/distributions/histplot|sns.histplot() (Seaborn)]]
- [[Sections/seaborn/distributions/kdeplot|sns.kdeplot() (Seaborn)]]
- [[Sections/seaborn/distributions/ecdfplot|sns.ecdfplot() (Seaborn)]]
- [[Sections/seaborn/distributions/displot|sns.displot() (Seaborn)]]
- [[Sections/seaborn/distributions/_Index|Seaborn → Distribution Plots]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
