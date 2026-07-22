---
type: "entry"
domain: "python"
file: "seaborn"
section: "matrix"
id: "clustermap"
title: "sns.clustermap()"
category: "Matrix"
subtitle: "Reorders rows and columns to group similar items together"
signature_short: "sns.clustermap(data, z_score=0, method=\"ward\", cmap=\"RdBu_r\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sns.clustermap()"
  - "clustermap"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/matrix"
  - "category/matrix"
  - "tier/tiered"
---

# sns.clustermap()

> Reorders rows and columns to group similar items together

## Overview

clustermap() combines a heatmap with hierarchical clustering. Rows and columns are reordered so similar items are adjacent. Dendrograms on the sides show the clustering hierarchy.

## Signature

```python
sns.clustermap(data, z_score=0, method="ward", cmap="RdBu_r")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - heatmap with hierarchical clustering on
#             rows AND columns. Reorders so similar
#             items sit adjacent.
# STRENGTHS - reveals block structure that a plain
#             heatmap with sorted rows hides.
# WEAKNESSES- doesn't yet show z_score for unequal
#             scales or method= for linkage choice.
#
import seaborn as sns
sns.clustermap(df.corr(), cmap="RdBu_r", center=0)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday clustermap surface: z_score
#             to standardize rows or columns, method=
#             "ward" for compact clusters, col_cluster=
#             False to keep one axis fixed.
# STRENGTHS - z_score is the single most-needed flag —
#             without it, one big-magnitude row dominates
#             the clustering.
# WEAKNESSES- doesn't address row_colors or
#             customization — senior tier.
#
import seaborn as sns

# Correlation matrix (already in [-1, 1])
sns.clustermap(df.corr(),
                method="ward",
                metric="euclidean",
                cmap="RdBu_r", center=0,
                annot=True, fmt=".1f",
                figsize=(10, 10))

# Feature matrix — standardize rows first
sns.clustermap(data_matrix,
                z_score=0,                # 0=rows, 1=cols
                cmap="viridis",
                figsize=(12, 8))

# Cluster rows only (keep column order)
sns.clustermap(data, col_cluster=False)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production clustermap: row_colors
#             annotations encode external metadata
#             (treatment group, batch); choose method=
#             ("ward" for compact, "average" for
#             elongated, "complete" for chaining-
#             resistant); always standardize before
#             clustering on raw features.
# STRENGTHS - row_colors makes "do clusters align with
#             my labels?" visually answerable; the
#             linkage choice rule prevents the most
#             common clustering misuse.
# WEAKNESSES- row_colors only takes one variable per
#             pass without manual concat; linkage
#             choice is data-dependent (no universal
#             best).
#
import seaborn as sns
import pandas as pd

# Annotation: color rows by class
row_colors = pd.Series(labels, index=data.index).map(
    {"A": "red", "B": "blue", "C": "green"})

g = sns.clustermap(
    data,
    z_score=0,                                # standardize per row
    method="ward",
    cmap="viridis",
    row_colors=row_colors,                    # external annotation
    col_cluster=True,
    figsize=(12, 10),
    cbar_pos=(0.02, 0.85, 0.03, 0.1),
)
# Access cluster results
# g.dendrogram_row.linkage  -> the row linkage matrix

# Decision rule:
#   already in [-1, 1] (correlation)         -> z_score=None, RdBu_r, center=0
#   raw features, varying scale              -> z_score=0 (per row)
#   compare to known labels                  -> row_colors=
#   want clusters but keep an axis ordered   -> col_cluster=False
#   compact clusters                         -> method="ward"
#   elongated / curved clusters              -> method="average"
#   correlated features                      -> metric="correlation"
#
# Anti-pattern: clustermap on a raw feature matrix without standardization.
#   If one column is "income in dollars" (1e5 scale) and another is "satisfaction 1-5",
#   the distance metric is dominated by the high-magnitude column and clusters reflect
#   that single feature. ALWAYS pass z_score=0 (standardize per row) or standard_scale=1
#   (rescale per column) when feature scales differ. For correlation matrices already in
#   [-1, 1], skip standardization (z_score=None) and use diverging cmap.
```

## Decision Rule

```text
already in [-1, 1] (correlation)         -> z_score=None, RdBu_r, center=0
raw features, varying scale              -> z_score=0 (per row)
compare to known labels                  -> row_colors=
want clusters but keep an axis ordered   -> col_cluster=False
compact clusters                         -> method="ward"
elongated / curved clusters              -> method="average"
correlated features                      -> metric="correlation"
```

## Anti-Pattern

> [!warning] Anti-pattern
> clustermap on a raw feature matrix without standardization.
>   If one column is "income in dollars" (1e5 scale) and another is "satisfaction 1-5",
>   the distance metric is dominated by the high-magnitude column and clusters reflect
>   that single feature. ALWAYS pass z_score=0 (standardize per row) or standard_scale=1
>   (rescale per column) when feature scales differ. For correlation matrices already in
>   [-1, 1], skip standardization (z_score=None) and use diverging cmap.

## Tips

- `z_score=0` standardizes rows before clustering — removes magnitude differences between features
- `method="ward"` minimizes within-cluster variance — generally produces the most compact clusters
- `col_cluster=False` keeps the column order fixed while only clustering rows
- `row_colors=` adds a color bar on the side for external annotations (e.g., treatment group)

## Common Mistake

> [!warning] Passing a raw data matrix with columns of very different scales to clustermap without `z_score=0`. One high-magnitude column dominates the clustering. Always standardize features first.

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

- [[Sections/seaborn/matrix/heatmap|sns.heatmap() (Seaborn)]]
- [[Sections/seaborn/matrix/pairplot|sns.pairplot() (Seaborn)]]
- [[Sections/seaborn/matrix/jointplot|sns.jointplot() (Seaborn)]]
- [[Sections/seaborn/matrix/pairgrid|sns.PairGrid() (Seaborn)]]
- [[Sections/seaborn/matrix/_Index|Seaborn → Matrix & Pairwise Plots]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
