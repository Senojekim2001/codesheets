---
type: "entry"
domain: "python"
file: "seaborn"
section: "distributions"
id: "displot"
title: "sns.displot()"
category: "Distribution"
subtitle: "Figure-level wrapper for histplot/kdeplot/ecdfplot with col= and row="
signature_short: "sns.displot(data, x=\"col\", col=\"group\", kind=\"hist\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sns.displot()"
  - "displot"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/distributions"
  - "category/distribution"
  - "tier/tiered"
---

# sns.displot()

> Figure-level wrapper for histplot/kdeplot/ecdfplot with col= and row=

## Overview

displot() is the figure-level distribution function. It wraps histplot, kdeplot, and ecdfplot and adds faceting via col= and row=. Returns a FacetGrid — not an Axes.

## Signature

```python
sns.displot(data, x="col", col="group", kind="hist")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - figure-level wrapper around histplot/
#             kdeplot/ecdfplot with built-in faceting.
# STRENGTHS - one call gets you a small-multiples grid
#             across categories.
# WEAKNESSES- doesn't yet show kind=, col_wrap, or
#             figure-level vs axes-level distinction.
#
import seaborn as sns
df = sns.load_dataset("tips")
sns.displot(data=df, x="total_bill", kde=True)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday displot recipe: kind= switches
#             plot type; col=/row= facet; hue= overlays
#             groups within each panel; height/aspect
#             control panel size. Returns a FacetGrid
#             (not an Axes).
# STRENGTHS - small-multiples are the right tool for
#             "compare distributions across categories".
# WEAKNESSES- doesn't address figure-level pitfalls (no
#             ax= argument) or set_titles formatting —
#             senior tier.
#
import seaborn as sns

df = sns.load_dataset("tips")

# Faceted histograms, hue inside each panel
g = sns.displot(
    data=df, x="total_bill",
    col="time", hue="sex",
    kind="hist", kde=True,
    height=4, aspect=0.9,
)

# Same data, kde panels
sns.displot(data=df, x="total_bill", col="sex",
             kind="kde", fill=True)

# ECDF panels with column wrap
sns.displot(data=df, x="total_bill", col="day",
             col_wrap=2, kind="ecdf", height=4)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - figure-level vs axes-level: displot OWNS
#             its figure; you cannot pass ax=. Customize
#             via the returned FacetGrid (g.set_titles,
#             g.figure, g.axes). Use axes-level histplot/
#             kdeplot when integrating into existing
#             subplots.
# STRENGTHS - clarifies the most-confused seaborn
#             distinction; FacetGrid customization is
#             needed for any publication-quality output.
# WEAKNESSES- the figure-level/axes-level split is a real
#             cliff; you can't smoothly mix them.
#
import seaborn as sns

df = sns.load_dataset("tips")

# Figure-level — returns FacetGrid; no ax= argument
g = sns.displot(data=df, x="total_bill",
                 col="day", col_wrap=2, hue="sex",
                 kind="hist", kde=True,
                 height=3.5, aspect=1.0)

# Customize via the FacetGrid
g.set_axis_labels("Total Bill ($)", "Count")
g.set_titles(col_template="{col_name}")
g.figure.suptitle("Bill distribution by day", y=1.02)
g.add_legend()
# g.figure.savefig("bills.png", dpi=200, bbox_inches="tight")

# Decision rule:
#   single panel into existing axes  -> sns.histplot(ax=ax)
#   small multiples / faceted        -> sns.displot
#   need both raw data + facets      -> displot + FacetGrid customization
#   kind=hist|kde|ecdf switch        -> stay in displot
#   custom plt.subplots layout       -> axes-level histplot/kdeplot per cell
#   want overall suptitle            -> g.figure.suptitle(..., y=1.02)
#
# Anti-pattern: passing ax= to displot to embed it in a plt.subplots() grid.
#   displot is figure-level — it OWNS its figure and ax= raises a TypeError. Either switch
#   to sns.histplot(ax=ax) for one panel inside a custom grid, or commit fully to displot
#   and customize via the returned FacetGrid (g.set_titles, g.figure, g.axes.flat).
```

## Decision Rule

```text
single panel into existing axes  -> sns.histplot(ax=ax)
small multiples / faceted        -> sns.displot
need both raw data + facets      -> displot + FacetGrid customization
kind=hist|kde|ecdf switch        -> stay in displot
custom plt.subplots layout       -> axes-level histplot/kdeplot per cell
want overall suptitle            -> g.figure.suptitle(..., y=1.02)
```

## Anti-Pattern

> [!warning] Anti-pattern
> passing ax= to displot to embed it in a plt.subplots() grid.
>   displot is figure-level — it OWNS its figure and ax= raises a TypeError. Either switch
>   to sns.histplot(ax=ax) for one panel inside a custom grid, or commit fully to displot
>   and customize via the returned FacetGrid (g.set_titles, g.figure, g.axes.flat).

## Tips

- `kind="hist"` (default), `"kde"`, or `"ecdf"` — switch the plot type while keeping faceting
- `height=` and `aspect=` control the size of each facet panel
- Returns a `FacetGrid` — use `g.figure` to access the underlying matplotlib Figure
- `col_wrap=3` wraps columns into a grid when you have many facets

## Common Mistake

> [!warning] Trying to pass `ax=` to `sns.displot()`. It is a figure-level function that manages its own Figure. Use `sns.histplot()` or `sns.kdeplot()` when you need to specify an existing Axes.

## Shorthand (Junior → Senior)

**Junior:**
```python
import matplotlib.pyplot as plt
import seaborn as sns
df = sns.load_dataset('tips')
sns.displot(data=df, x='total_bill')
```

**Senior:**
```python
g.add_legend()
```

## See Also

- [[Sections/seaborn/distributions/histplot|sns.histplot() (Seaborn)]]
- [[Sections/seaborn/distributions/kdeplot|sns.kdeplot() (Seaborn)]]
- [[Sections/seaborn/distributions/ecdfplot|sns.ecdfplot() (Seaborn)]]
- [[Sections/seaborn/distributions/rugplot|sns.rugplot() (Seaborn)]]
- [[Sections/seaborn/distributions/_Index|Seaborn → Distribution Plots]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
