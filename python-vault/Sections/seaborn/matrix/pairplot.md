---
type: "entry"
domain: "python"
file: "seaborn"
section: "matrix"
id: "pairplot"
title: "sns.pairplot()"
category: "Matrix"
subtitle: "Scatter matrix — diagonal shows each variable's distribution"
signature_short: "sns.pairplot(data, hue=\"group\", diag_kind=\"kde\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sns.pairplot()"
  - "pairplot"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/matrix"
  - "category/matrix"
  - "tier/tiered"
---

# sns.pairplot()

> Scatter matrix — diagonal shows each variable's distribution

## Overview

pairplot() creates a grid of scatter plots for all pairs of numeric variables, with distribution plots on the diagonal. Use hue= to color by a categorical variable. Slow on large datasets — sample first.

## Signature

```python
sns.pairplot(data, hue="group", diag_kind="kde")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - one call, a grid of all pairwise
#             scatterplots plus marginal histograms on
#             the diagonal.
# STRENGTHS - shortest possible "give me an overview of
#             my dataset" diagnostic.
# WEAKNESSES- doesn't yet show hue, vars=, or KDE on
#             the diagonal.
#
import seaborn as sns
df = sns.load_dataset("iris")
sns.pairplot(df, hue="species")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday pairplot recipe: hue= for
#             group-color, vars= to limit columns,
#             diag_kind="kde" for cleaner marginals,
#             plot_kws/diag_kws to style sub-plots.
# STRENGTHS - covers the patterns that matter for real
#             EDA — color-by-class, focused subset.
# WEAKNESSES- doesn't address PairGrid for asymmetric
#             grids — senior tier.
#
import seaborn as sns

df = sns.load_dataset("iris")

sns.pairplot(
    df,
    vars=["sepal_length", "petal_length", "petal_width"],
    hue="species",
    diag_kind="kde",
    plot_kws={"alpha": 0.5, "s": 30},
    diag_kws={"fill": True},
)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production pairplot: SAMPLE before plotting
#             on big DataFrames (pairplot is N x M
#             scatters), cap variables to the most
#             important 4-6, switch to PairGrid when
#             you need different plots in upper/lower
#             triangles.
# STRENGTHS - sampling rule prevents the "Jupyter hung"
#             moment; PairGrid is the right tool for
#             "scatter above, KDE below" presentations.
# WEAKNESSES- sampling can hide rare combinations;
#             PairGrid takes more setup than pairplot.
#
import seaborn as sns

df = big_df.sample(2000, random_state=42)        # SAMPLE FIRST

g = sns.PairGrid(df,
                  vars=["x1", "x2", "x3", "x4"],
                  hue="class",
                  diag_sharey=False)
g.map_upper(sns.scatterplot, alpha=0.5, s=20)
g.map_lower(sns.kdeplot, fill=True, alpha=0.3)
g.map_diag(sns.histplot, kde=True)
g.add_legend()

# Decision rule:
#   N <= 1k, want everything            -> sns.pairplot
#   N <= 1k, asymmetric upper/lower     -> sns.PairGrid
#   N > 5k                              -> SAMPLE then pairplot or PairGrid
#   > 6 numeric columns                 -> vars= to limit; full grid is unreadable
#   color by class                      -> hue= with diag_kind="kde"
#   need stats annotated per cell       -> PairGrid + custom callable
#
# Anti-pattern: calling pairplot on a 50k-row, 30-column DataFrame and walking away.
#   You'll get an N x M scatter grid that hangs Jupyter, then renders cells too small to
#   read. Always: (1) SAMPLE first via df.sample(2000, random_state=42); (2) use vars=
#   to cap at 4-6 of the most relevant columns; (3) reach for PairGrid + map_lower(kdeplot)
#   when scatter overplotting eats the signal.
```

## Decision Rule

```text
N <= 1k, want everything            -> sns.pairplot
N <= 1k, asymmetric upper/lower     -> sns.PairGrid
N > 5k                              -> SAMPLE then pairplot or PairGrid
> 6 numeric columns                 -> vars= to limit; full grid is unreadable
color by class                      -> hue= with diag_kind="kde"
need stats annotated per cell       -> PairGrid + custom callable
```

## Anti-Pattern

> [!warning] Anti-pattern
> calling pairplot on a 50k-row, 30-column DataFrame and walking away.
>   You'll get an N x M scatter grid that hangs Jupyter, then renders cells too small to
>   read. Always: (1) SAMPLE first via df.sample(2000, random_state=42); (2) use vars=
>   to cap at 4-6 of the most relevant columns; (3) reach for PairGrid + map_lower(kdeplot)
>   when scatter overplotting eats the signal.

## Tips

- `pairplot()` is slow on large DataFrames — sample first: `df.sample(500)` before passing in
- Use `vars=` to limit to the most important columns — avoids an unwieldy grid
- `sns.PairGrid()` gives full control over what appears in the upper, lower, and diagonal cells
- The diagonal shows each variable's marginal distribution — `diag_kind="kde"` is often cleaner than "hist"

## Common Mistake

> [!warning] Running pairplot on a DataFrame with 20+ columns. The resulting grid is unreadably small. Limit to 4-6 key variables with `vars=`.

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
g.add_legend()
```

## See Also

- [[Sections/seaborn/matrix/heatmap|sns.heatmap() (Seaborn)]]
- [[Sections/seaborn/matrix/jointplot|sns.jointplot() (Seaborn)]]
- [[Sections/seaborn/matrix/pairgrid|sns.PairGrid() (Seaborn)]]
- [[Sections/seaborn/matrix/clustermap|sns.clustermap() (Seaborn)]]
- [[Sections/seaborn/matrix/_Index|Seaborn → Matrix & Pairwise Plots]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
