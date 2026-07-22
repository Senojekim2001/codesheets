---
type: "entry"
domain: "python"
file: "seaborn"
section: "matrix"
id: "pairgrid"
title: "sns.PairGrid()"
category: "Matrix"
subtitle: "map_upper(), map_lower(), map_diag() for asymmetric grids"
signature_short: "g = sns.PairGrid(df); g.map_upper(fn); g.map_lower(fn); g.map_diag(fn)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sns.PairGrid()"
  - "pairgrid"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/matrix"
  - "category/matrix"
  - "tier/tiered"
---

# sns.PairGrid()

> map_upper(), map_lower(), map_diag() for asymmetric grids

## Overview

PairGrid gives full control over what plot function appears in each section of the pair grid. map_upper() controls the upper triangle, map_lower() the lower, map_diag() the diagonal.

## Signature

```python
g = sns.PairGrid(df); g.map_upper(fn); g.map_lower(fn); g.map_diag(fn)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - PairGrid sets up the empty grid; map()
#             populates every cell with the same fn.
# STRENGTHS - smallest possible alternative to
#             pairplot when you want full control.
# WEAKNESSES- doesn't yet show map_upper/lower/diag
#             which is the whole reason to use PairGrid.
#
import seaborn as sns
df = sns.load_dataset("iris")
g = sns.PairGrid(df)
g.map(sns.scatterplot)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday PairGrid surface: different
#             plots in upper / lower / diag, x_vars/
#             y_vars for non-square grids.
# STRENGTHS - asymmetric upper/lower is the canonical
#             reason to use PairGrid over pairplot.
# WEAKNESSES- doesn't address custom callables or
#             per-cell annotation — senior.
#
import seaborn as sns

df = sns.load_dataset("iris")

# Asymmetric grid: scatter above, KDE below, hist diag
g = sns.PairGrid(df, hue="species", diag_sharey=False)
g.map_upper(sns.scatterplot, alpha=0.5)
g.map_lower(sns.kdeplot, fill=True, alpha=0.3)
g.map_diag(sns.histplot, kde=True)
g.add_legend()

# Non-square grid — different x and y variables
g2 = sns.PairGrid(df,
                   x_vars=["sepal_length", "petal_length"],
                   y_vars=["sepal_width",  "petal_width"])
g2.map(sns.scatterplot)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production PairGrid: custom callables
#             receive (x, y, **kwargs) so you can
#             annotate each cell with stats (correlation,
#             slope, group mean); pair with map_offdiag
#             for "all off-diagonal" patterns.
# STRENGTHS - the cell callable + annotation pattern
#             is the cleanest way to embed statistics
#             into pair grids.
# WEAKNESSES- callable signature surprises people who
#             only used pairplot; matplotlib annotation
#             positioning takes practice.
#
import numpy as np, matplotlib.pyplot as plt, seaborn as sns

df = sns.load_dataset("iris")

def corr_label(x, y, **kw):
    r = np.corrcoef(x, y)[0, 1]
    ax = plt.gca()
    ax.annotate(f"r={r:.2f}", xy=(0.05, 0.92),
                 xycoords=ax.transAxes, fontsize=9)

g = sns.PairGrid(df, hue="species", diag_sharey=False)
g.map_upper(sns.scatterplot, alpha=0.5)
g.map_upper(corr_label)                 # annotate corr in each upper cell
g.map_lower(sns.kdeplot, fill=True, alpha=0.3)
g.map_diag(sns.histplot, kde=True)
g.add_legend()

# Decision rule:
#   one plot type, square grid          -> sns.pairplot
#   asymmetric upper/lower              -> sns.PairGrid
#   need stats annotations per cell     -> PairGrid + custom callable
#   different x and y variables         -> PairGrid(x_vars=, y_vars=)
#   apply same fn off-diagonal          -> g.map_offdiag()
#   share diagonal scale across rows    -> diag_sharey=True (default off)
#
# Anti-pattern: fighting pairplot's symmetric API to get scatter above and KDE below.
#   pairplot only accepts one plot kind across the whole grid — there is no
#   "different upper/lower" knob. People hack it with vars= twice or two pairplots.
#   The right tool is sns.PairGrid: g.map_upper(scatterplot), g.map_lower(kdeplot),
#   g.map_diag(histplot) — a few extra lines but the grid does what you actually want.
```

## Decision Rule

```text
one plot type, square grid          -> sns.pairplot
asymmetric upper/lower              -> sns.PairGrid
need stats annotations per cell     -> PairGrid + custom callable
different x and y variables         -> PairGrid(x_vars=, y_vars=)
apply same fn off-diagonal          -> g.map_offdiag()
share diagonal scale across rows    -> diag_sharey=True (default off)
```

## Anti-Pattern

> [!warning] Anti-pattern
> fighting pairplot's symmetric API to get scatter above and KDE below.
>   pairplot only accepts one plot kind across the whole grid — there is no
>   "different upper/lower" knob. People hack it with vars= twice or two pairplots.
>   The right tool is sns.PairGrid: g.map_upper(scatterplot), g.map_lower(kdeplot),
>   g.map_diag(histplot) — a few extra lines but the grid does what you actually want.

## Tips

- PairGrid is the right choice when you want scatter above the diagonal and KDE below
- `map_offdiag()` applies a function to all off-diagonal cells (upper + lower)
- `x_vars` and `y_vars` allow non-square grids — useful for comparing two sets of variables
- Individual cell functions receive `x`, `y`, and optional `hue` arrays as arguments

## Common Mistake

> [!warning] Using `pairplot()` when you need different upper/lower triangles. `pairplot()` only supports one plot type per region. Use `PairGrid()` for asymmetric grids.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
df = sns.load_dataset('iris')
```

**Senior:**
```python
g.map_diag(sns.kdeplot, fill=True)
```

## See Also

- [[Sections/seaborn/matrix/heatmap|sns.heatmap() (Seaborn)]]
- [[Sections/seaborn/matrix/pairplot|sns.pairplot() (Seaborn)]]
- [[Sections/seaborn/matrix/jointplot|sns.jointplot() (Seaborn)]]
- [[Sections/seaborn/matrix/clustermap|sns.clustermap() (Seaborn)]]
- [[Sections/seaborn/matrix/_Index|Seaborn → Matrix & Pairwise Plots]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
