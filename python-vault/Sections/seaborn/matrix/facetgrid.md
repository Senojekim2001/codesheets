---
type: "entry"
domain: "python"
file: "seaborn"
section: "matrix"
id: "facetgrid"
title: "sns.FacetGrid()"
category: "Matrix"
subtitle: "Low-level faceting — map_dataframe() for full flexibility"
signature_short: "g = sns.FacetGrid(df, col=\"group\"); g.map_dataframe(fn, x=\"col\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sns.FacetGrid()"
  - "facetgrid"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/matrix"
  - "category/matrix"
  - "tier/tiered"
---

# sns.FacetGrid()

> Low-level faceting — map_dataframe() for full flexibility

## Overview

FacetGrid creates a grid of subplots based on one or more categorical variables. map_dataframe() passes each subset of data to the plotting function. More flexible than displot/catplot/relplot when those do not support your plot type.

## Signature

```python
g = sns.FacetGrid(df, col="group"); g.map_dataframe(fn, x="col")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - low-level faceting: build the grid
#             manually, then map a plot function
#             across it.
# STRENGTHS - more flexible than displot/relplot/
#             catplot when those don't support your
#             plot type.
# WEAKNESSES- doesn't yet show map_dataframe vs map.
#
import seaborn as sns
df = sns.load_dataset("tips")
g = sns.FacetGrid(df, col="time", row="sex")
g.map_dataframe(sns.histplot, x="total_bill")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday FacetGrid surface: col_wrap
#             for many panels, margin_titles for
#             cleaner labels, map_dataframe (passes a
#             DataFrame; required for seaborn fns) vs
#             map (passes raw arrays; for matplotlib).
# STRENGTHS - the map vs map_dataframe rule is the
#             single most-confused FacetGrid issue.
# WEAKNESSES- doesn't address per-panel callable
#             customization — senior tier.
#
import seaborn as sns

df = sns.load_dataset("tips")

g = sns.FacetGrid(df, col="time", row="sex",
                   height=4, aspect=1.2,
                   margin_titles=True)
g.map_dataframe(sns.histplot, x="total_bill", kde=True)
g.set_axis_labels("Total Bill ($)", "Count")
g.set_titles(col_template="{col_name}", row_template="{row_name}")
g.add_legend()

# col_wrap when one categorical has many values
g2 = sns.FacetGrid(df, col="day", col_wrap=2, height=4)
g2.map_dataframe(sns.scatterplot, x="total_bill", y="tip",
                  alpha=0.5)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production FacetGrid: refline for shared
#             reference lines, custom callables that
#             receive (x, **kwargs) for per-panel
#             annotations, axes.flat for matplotlib-
#             level customization, sharey=False when
#             panels span different scales.
# STRENGTHS - refline is the cleanest "zero baseline
#             on every panel" tool; callables unlock
#             per-panel stats annotations.
# WEAKNESSES- callable signature trips people up;
#             sharey=False loses the "compare panels
#             at a glance" benefit.
#
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np

df = sns.load_dataset("tips")

g = sns.FacetGrid(df, col="day", col_wrap=2,
                   height=4, sharey=False)
g.map_dataframe(sns.scatterplot, x="total_bill", y="tip", alpha=0.5)

# Shared reference line on every panel
g.refline(y=df["tip"].mean(), color="black", linestyle=":")

# Per-panel annotation via custom callable
def annotate_n(data, **kw):
    ax = plt.gca()
    ax.text(0.05, 0.95, f"n={len(data)}",
             transform=ax.transAxes, va="top", fontsize=9)

g.map_dataframe(annotate_n)

# Decision rule:
#   built-in seaborn fn (hist/box/scatter)    -> sns.displot/relplot/catplot
#   custom callable or seaborn fn not covered -> sns.FacetGrid + map_dataframe
#   matplotlib raw fn (plt.scatter)           -> g.map (passes arrays)
#   need shared reference lines               -> g.refline()
#   panels span very different y              -> sharey=False
#   long row labels                           -> margin_titles=True
#
# Anti-pattern: g.map(sns.histplot, "total_bill") instead of g.map_dataframe(sns.histplot, x="total_bill").
#   g.map passes columns as positional 1-D arrays — modern seaborn functions expect data=
#   plus x=/y= keyword args and silently misread or raise. The rule: use g.map_dataframe()
#   for any seaborn function (it gets the full DataFrame subset), and reserve g.map() for
#   raw matplotlib callables like plt.scatter.
```

## Decision Rule

```text
built-in seaborn fn (hist/box/scatter)    -> sns.displot/relplot/catplot
custom callable or seaborn fn not covered -> sns.FacetGrid + map_dataframe
matplotlib raw fn (plt.scatter)           -> g.map (passes arrays)
need shared reference lines               -> g.refline()
panels span very different y              -> sharey=False
long row labels                           -> margin_titles=True
```

## Anti-Pattern

> [!warning] Anti-pattern
> g.map(sns.histplot, "total_bill") instead of g.map_dataframe(sns.histplot, x="total_bill").
>   g.map passes columns as positional 1-D arrays — modern seaborn functions expect data=
>   plus x=/y= keyword args and silently misread or raise. The rule: use g.map_dataframe()
>   for any seaborn function (it gets the full DataFrame subset), and reserve g.map() for
>   raw matplotlib callables like plt.scatter.

## Tips

- `map_dataframe()` receives the data subset as a DataFrame — supports all seaborn functions
- `margin_titles=True` puts row titles in the margin instead of above each cell — cleaner layout
- `col_wrap=3` wraps columns into a grid when you have many groups
- `g.axes.flat` lets you iterate over all axes to add custom annotations

## Common Mistake

> [!warning] Using `g.map(sns.histplot, x="col")` instead of `g.map_dataframe(sns.histplot, x="col")`. `map()` passes x as a 1D array; `map_dataframe()` passes the full DataFrame subset — required for seaborn functions that need `data=`.

## Shorthand (Junior → Senior)

**Junior:**
```python
import matplotlib.pyplot as plt
import seaborn as sns
df = sns.load_dataset('tips')
g = sns.FacetGrid(df, col='time', row='sex',
```

**Senior:**
```python
g.axes.flat           # iterate over all axes
```

## See Also

- [[Sections/seaborn/matrix/heatmap|sns.heatmap() (Seaborn)]]
- [[Sections/seaborn/matrix/pairplot|sns.pairplot() (Seaborn)]]
- [[Sections/seaborn/matrix/jointplot|sns.jointplot() (Seaborn)]]
- [[Sections/seaborn/matrix/pairgrid|sns.PairGrid() (Seaborn)]]
- [[Sections/seaborn/matrix/_Index|Seaborn → Matrix & Pairwise Plots]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
