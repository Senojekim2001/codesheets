---
type: "entry"
domain: "python"
file: "seaborn"
section: "matrix"
id: "heatmap"
title: "sns.heatmap()"
category: "Matrix"
subtitle: "Correlation matrices, confusion matrices, pivot tables"
signature_short: "sns.heatmap(data, annot=True, fmt=\".2f\", cmap=\"RdBu_r\", center=0)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sns.heatmap()"
  - "heatmap"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/matrix"
  - "category/matrix"
  - "tier/tiered"
---

# sns.heatmap()

> Correlation matrices, confusion matrices, pivot tables

## Overview

heatmap() encodes matrix values as colors. For correlation matrices, always use a diverging colormap centered at 0. annot=True displays values in cells. Mask the upper triangle to avoid duplicating correlations.

## Signature

```python
sns.heatmap(data, annot=True, fmt=".2f", cmap="RdBu_r", center=0)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - render a 2D matrix (correlation, pivot,
#             confusion) as a colored grid with annot=
#             values inside cells.
# STRENGTHS - one call replaces a manual matplotlib
#             imshow + ax.text loop.
# WEAKNESSES- doesn't yet show divergent colormaps,
#             masking, or fmt= choice for ints vs floats.
#
import seaborn as sns
sns.heatmap(df.corr(), annot=True, fmt=".2f")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday heatmap surface: divergent
#             colormap centered at 0 for correlations,
#             vmin/vmax for fair scales, square=True for
#             cells, mask= upper triangle to drop
#             redundancy.
# STRENGTHS - the divergent + center=0 + masked-upper
#             combo is the canonical correlation heatmap.
# WEAKNESSES- doesn't address pivot tables or confusion
#             matrices — senior tier covers them.
#
import numpy as np, seaborn as sns

corr = df.select_dtypes("number").corr()
mask = np.triu(np.ones_like(corr, dtype=bool))    # upper triangle

sns.heatmap(
    corr, mask=mask,
    annot=True, fmt=".2f",
    cmap="RdBu_r", center=0, vmin=-1, vmax=1,
    square=True, linewidths=0.5,
)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production heatmap: pick fmt= and cmap by
#             matrix kind (correlation/confusion/pivot),
#             use cbar_kws to shrink the colorbar in
#             multi-panel figures, and reach for
#             ax.set_xticklabels(rotation=45, ha="right")
#             when labels are long.
# STRENGTHS - the fmt/cmap-by-matrix-kind decision rule
#             eliminates the most common heatmap
#             misuse; rotation handling fixes label
#             collision.
# WEAKNESSES- no built-in support for diverging
#             confusion matrices (use a sequential
#             colormap there).
#
import numpy as np, seaborn as sns, matplotlib.pyplot as plt

# Confusion matrix — sequential cmap, integer fmt
fig, ax = plt.subplots(figsize=(6, 5))
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
             xticklabels=labels, yticklabels=labels, ax=ax)
ax.set_xlabel("Predicted"); ax.set_ylabel("Actual")
plt.setp(ax.get_xticklabels(), rotation=45, ha="right")

# Pivot table — sequential or diverging by data sign
pivot = df.pivot_table("sales", index="product", columns="region")
sns.heatmap(pivot, annot=True, fmt=".0f", cmap="YlOrRd")

# Decision rule:
#   correlation [-1, 1]         -> RdBu_r diverging, center=0,  fmt=".2f"
#   confusion matrix            -> Blues sequential,            fmt="d"
#   pivot table, signed         -> RdBu_r diverging, center=0
#   pivot table, unsigned       -> viridis / YlOrRd sequential, fmt=".0f"
#   correlation matrix          -> mask=upper triangle + square=True
#   want clustered reordering   -> sns.clustermap (not heatmap)
#   long category labels        -> rotate xticklabels 45 + ha="right"
#
# Anti-pattern: using a sequential colormap (Blues, viridis) on a correlation matrix.
#   Correlation ranges from -1 to +1 — a sequential cmap maps 0 (no relationship) to a
#   nondescript mid-color and -0.8 reads as a small value next to +0.8. The fix is always
#   diverging (RdBu_r / coolwarm) with center=0, vmin=-1, vmax=1. Same trap on any signed
#   pivot table; only unsigned magnitudes get sequential.
```

## Decision Rule

```text
correlation [-1, 1]         -> RdBu_r diverging, center=0,  fmt=".2f"
confusion matrix            -> Blues sequential,            fmt="d"
pivot table, signed         -> RdBu_r diverging, center=0
pivot table, unsigned       -> viridis / YlOrRd sequential, fmt=".0f"
correlation matrix          -> mask=upper triangle + square=True
want clustered reordering   -> sns.clustermap (not heatmap)
long category labels        -> rotate xticklabels 45 + ha="right"
```

## Anti-Pattern

> [!warning] Anti-pattern
> using a sequential colormap (Blues, viridis) on a correlation matrix.
>   Correlation ranges from -1 to +1 — a sequential cmap maps 0 (no relationship) to a
>   nondescript mid-color and -0.8 reads as a small value next to +0.8. The fix is always
>   diverging (RdBu_r / coolwarm) with center=0, vmin=-1, vmax=1. Same trap on any signed
>   pivot table; only unsigned magnitudes get sequential.

## Tips

- Always use a **diverging** colormap (`RdBu_r`, `coolwarm`) with `center=0` for correlation matrices
- `mask=np.triu(np.ones_like(corr, dtype=bool))` hides the upper triangle — avoids duplicate information
- `fmt="d"` for integer annotations (confusion matrices); `fmt=".2f"` for floats
- `square=True` makes cells square — cleaner for correlation matrices

## Common Mistake

> [!warning] Using a sequential colormap (Blues, Greens) for a correlation matrix. Correlation ranges from -1 to +1 — use a diverging colormap so positive and negative values read clearly.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
```

**Senior:**
```python
sns.heatmap(pivot, annot=True, fmt='.0f', cmap='YlOrRd')
```

## See Also

- [[Sections/seaborn/matrix/pairplot|sns.pairplot() (Seaborn)]]
- [[Sections/seaborn/matrix/jointplot|sns.jointplot() (Seaborn)]]
- [[Sections/seaborn/matrix/pairgrid|sns.PairGrid() (Seaborn)]]
- [[Sections/seaborn/matrix/clustermap|sns.clustermap() (Seaborn)]]
- [[Sections/seaborn/matrix/_Index|Seaborn → Matrix & Pairwise Plots]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
