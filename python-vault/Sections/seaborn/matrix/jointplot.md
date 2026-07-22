---
type: "entry"
domain: "python"
file: "seaborn"
section: "matrix"
id: "jointplot"
title: "sns.jointplot()"
category: "Matrix"
subtitle: "Scatter + marginals — shows joint and individual distributions together"
signature_short: "sns.jointplot(data, x=\"x\", y=\"y\", kind=\"scatter\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sns.jointplot()"
  - "jointplot"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/matrix"
  - "category/matrix"
  - "tier/tiered"
---

# sns.jointplot()

> Scatter + marginals — shows joint and individual distributions together

## Overview

jointplot() combines a central bivariate plot (scatter, hex, kde, etc.) with marginal univariate plots on each axis. The marginals show the distribution of each variable individually. Returns a JointGrid object.

## Signature

```python
sns.jointplot(data, x="x", y="y", kind="scatter")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - bivariate plot in the center plus marginal
#             histograms on each axis. One call, full
#             distribution overview.
# STRENGTHS - the cleanest "joint + marginals" plot.
# WEAKNESSES- doesn't yet show kind= options or per-
#             group plotting.
#
import seaborn as sns
df = sns.load_dataset("tips")
sns.jointplot(data=df, x="total_bill", y="tip")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday kind= options: scatter (the
#             default), kde for smooth, hex for big
#             data, reg for trend, resid for residuals.
# STRENGTHS - one knob covers the bivariate plot you
#             actually need.
# WEAKNESSES- doesn't address per-group color (jointplot
#             has no hue=) — senior tier.
#
import seaborn as sns

df = sns.load_dataset("tips")

# Different kinds for different stories
sns.jointplot(data=df, x="total_bill", y="tip", kind="kde", fill=True)
sns.jointplot(data=df, x="total_bill", y="tip", kind="hex", gridsize=20)
sns.jointplot(data=df, x="total_bill", y="tip", kind="reg")

# kind= options: "scatter" | "kde" | "hist" | "hex" | "reg" | "resid"
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production jointplot: jointplot does NOT
#             support hue=. For per-group color, build
#             a JointGrid and plot per group manually.
#             Access sub-axes (ax_joint, ax_marg_x,
#             ax_marg_y) for full customization.
# STRENGTHS - the JointGrid escape hatch unlocks every
#             multi-group joint visualization seaborn's
#             higher-level helpers can't.
# WEAKNESSES- per-group loops are more code than a hue=
#             argument; sub-axes manipulation requires
#             reading seaborn's internal layout.
#
import seaborn as sns

df = sns.load_dataset("tips")

g = sns.JointGrid(data=df, x="total_bill", y="tip", height=6)

for sex, group in df.groupby("sex"):
    sns.scatterplot(data=group, x="total_bill", y="tip",
                     ax=g.ax_joint, label=sex, alpha=0.6)
    sns.kdeplot(data=group, x="total_bill",
                 ax=g.ax_marg_x, fill=True, alpha=0.3)
    sns.kdeplot(data=group, y="tip",
                 ax=g.ax_marg_y, fill=True, alpha=0.3)

g.ax_joint.legend()

# Decision rule:
#   simple bivariate + marginals       -> sns.jointplot
#   per-group color (multiple hues)    -> sns.JointGrid + per-group loop
#   marginals only on a scatter        -> JointGrid + plot_marginals(rugplot)
#   large N with overplotting          -> kind="hex" or kind="hist"
#   trend line + marginals             -> kind="reg"
#   smooth bivariate density           -> kind="kde", fill=True
#
# Anti-pattern: passing hue= to jointplot expecting per-group color.
#   jointplot does NOT support hue= and silently ignores it (older versions raised; newer
#   versions warn). The escape hatch is sns.JointGrid + a per-group loop calling
#   sns.scatterplot(ax=g.ax_joint) and sns.kdeplot(ax=g.ax_marg_x / ax_marg_y) explicitly.
#   Reach for sns.displot or sns.relplot if you need a grid of grouped joint plots.
```

## Decision Rule

```text
simple bivariate + marginals       -> sns.jointplot
per-group color (multiple hues)    -> sns.JointGrid + per-group loop
marginals only on a scatter        -> JointGrid + plot_marginals(rugplot)
large N with overplotting          -> kind="hex" or kind="hist"
trend line + marginals             -> kind="reg"
smooth bivariate density           -> kind="kde", fill=True
```

## Anti-Pattern

> [!warning] Anti-pattern
> passing hue= to jointplot expecting per-group color.
>   jointplot does NOT support hue= and silently ignores it (older versions raised; newer
>   versions warn). The escape hatch is sns.JointGrid + a per-group loop calling
>   sns.scatterplot(ax=g.ax_joint) and sns.kdeplot(ax=g.ax_marg_x / ax_marg_y) explicitly.
>   Reach for sns.displot or sns.relplot if you need a grid of grouped joint plots.

## Tips

- `kind="kde"` gives a clean continuous view of the joint distribution
- `kind="hex"` handles overlapping points better than scatter for large datasets
- For per-group coloring, use JointGrid directly — jointplot does not support hue=
- Access sub-axes: `g.ax_joint`, `g.ax_marg_x`, `g.ax_marg_y`

## Common Mistake

> [!warning] Expecting jointplot to support hue=. It does not. For grouped joint plots, use sns.JointGrid() and call plot_joint() and plot_marginals() manually per group.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
df = sns.load_dataset('tips')
```

**Senior:**
```python
g.add_legend()
```

## See Also

- [[Sections/seaborn/matrix/heatmap|sns.heatmap() (Seaborn)]]
- [[Sections/seaborn/matrix/pairplot|sns.pairplot() (Seaborn)]]
- [[Sections/seaborn/matrix/pairgrid|sns.PairGrid() (Seaborn)]]
- [[Sections/seaborn/matrix/clustermap|sns.clustermap() (Seaborn)]]
- [[Sections/seaborn/matrix/_Index|Seaborn → Matrix & Pairwise Plots]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
