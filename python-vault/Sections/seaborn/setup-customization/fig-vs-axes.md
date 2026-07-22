---
type: "entry"
domain: "python"
file: "seaborn"
section: "setup-customization"
id: "fig-vs-axes"
title: "Figure-level vs axes-level"
category: "Setup"
subtitle: "Figure-level functions return FacetGrid; axes-level return Axes"
signature_short: "displot/relplot/catplot → FacetGrid | histplot/scatterplot/boxplot → Axes"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Figure-level vs axes-level"
  - "fig-vs-axes"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/setup-customization"
  - "category/setup"
  - "tier/tiered"
---

# Figure-level vs axes-level

> Figure-level functions return FacetGrid; axes-level return Axes

## Overview

Seaborn has two API tiers. Figure-level functions (displot, relplot, catplot, lmplot) create their own Figure and support faceting via col= and row=. Axes-level functions (histplot, scatterplot, boxplot, etc.) draw on an existing Axes — use these inside plt.subplots() layouts. Passing ax= to a figure-level function raises an error.

## Signature

```python
displot/relplot/catplot → FacetGrid | histplot/scatterplot/boxplot → Axes
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - axes-level fns (histplot, boxplot,
#             scatterplot) take ax= and draw into an
#             existing Axes. Figure-level fns
#             (displot, relplot, catplot) make their
#             own Figure.
# STRENGTHS - clarifies the most-confused seaborn
#             distinction in two examples.
# WEAKNESSES- doesn't yet show the full naming
#             convention or which to pick when.
#
import matplotlib.pyplot as plt, seaborn as sns

# Axes-level
fig, ax = plt.subplots()
sns.histplot(data=df, x="total_bill", ax=ax)

# Figure-level
g = sns.displot(data=df, x="total_bill", col="sex")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday rule: figure-level for
#             facets, axes-level for subplots. Each
#             figure-level fn wraps several axes-level
#             counterparts via kind=.
# STRENGTHS - the wrapping table makes it clear which
#             axes-level fn each figure-level call
#             actually invokes.
# WEAKNESSES- doesn't address the type-error pitfall
#             of passing ax= to figure-level — senior.
#
import matplotlib.pyplot as plt, seaborn as sns

# Axes-level for subplot layouts
fig, axes = plt.subplots(1, 2, figsize=(12, 5))
sns.histplot(data=df, x="total_bill", ax=axes[0])
sns.boxplot(data=df, x="day", y="total_bill", ax=axes[1])

# Figure-level for faceting
g = sns.displot(data=df, x="total_bill", col="sex")
g.set_axis_labels("Total Bill ($)", "Count")
g.figure.suptitle("Bill by Sex", y=1.02)

# Wrapping table:
#   sns.displot(kind="hist") -> sns.histplot
#   sns.displot(kind="kde")  -> sns.kdeplot
#   sns.relplot(kind="scatter") -> sns.scatterplot
#   sns.relplot(kind="line")    -> sns.lineplot
#   sns.catplot(kind="box")     -> sns.boxplot
#   sns.lmplot                  -> sns.regplot
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production rule: passing ax= to a
#             figure-level fn is a TypeError. Save via
#             g.savefig (figure-level) or fig.savefig
#             (axes-level). g.figure exposes the
#             underlying Figure for matplotlib-level
#             customization.
# STRENGTHS - the explicit do-not-pass-ax rule
#             eliminates the most common figure-level
#             trap; g.figure access unlocks every
#             matplotlib customization.
# WEAKNESSES- the "should I pick figure-level or
#             axes-level" decision sometimes requires
#             both (e.g. faceted plots with a
#             customized matplotlib subplot layout).
#
import matplotlib.pyplot as plt, seaborn as sns

# Decision rule:
#   custom subplot layout                       -> axes-level + plt.subplots()
#   small multiples / faceting (col=, row=)     -> figure-level
#   one panel only                               -> axes-level + plt.subplots()

# WRONG — figure-level rejects ax=
# fig, ax = plt.subplots()
# sns.displot(data=df, x="x", ax=ax)            # TypeError

# Right ways:
fig, ax = plt.subplots()                          # axes-level for one panel
sns.histplot(data=df, x="total_bill", ax=ax)
fig.savefig("p.png", bbox_inches="tight")

g = sns.displot(data=df, x="total_bill", col="sex") # figure-level for facets
g.figure.suptitle("...")                           # access underlying Figure
g.savefig("g.png", bbox_inches="tight")            # NOT plt.savefig

# Naming heuristic: figure-level functions END in "plot" with a one-letter
# prefix that maps to a category — disPLOT, relPLOT, catPLOT, lmPLOT.

# Decision rule:
#   one panel into custom subplots layout  -> axes-level + ax= argument
#   small multiples (col=, row=)           -> figure-level (FacetGrid)
#   need to combine with matplotlib code   -> axes-level
#   want g.refline / g.set_titles APIs     -> figure-level
#   save the whole faceted figure          -> g.savefig (NOT plt.savefig)
#   set overall title                      -> g.figure.suptitle(..., y=1.02)
#
# Anti-pattern: trying to place sns.displot/relplot/catplot inside plt.subplots(1, 2) cells.
#   Figure-level functions OWN their figure — passing ax= raises TypeError, and even if
#   you skip ax= the call creates a SECOND, separate figure and your subplots cell stays
#   empty. The fix is to pick the matching axes-level function (histplot, scatterplot,
#   lineplot, boxplot, ...) with ax=axes[i, j], or commit fully to the figure-level
#   FacetGrid and customize via g.* methods.
```

## Decision Rule

```text
  custom subplot layout                       -> axes-level + plt.subplots()
  small multiples / faceting (col=, row=)     -> figure-level
  one panel only                               -> axes-level + plt.subplots()

WRONG — figure-level rejects ax=
fig, ax = plt.subplots()
sns.displot(data=df, x="x", ax=ax)            # TypeError

Right ways:
```

## Anti-Pattern

> [!warning] Anti-pattern
> trying to place sns.displot/relplot/catplot inside plt.subplots(1, 2) cells.
>   Figure-level functions OWN their figure — passing ax= raises TypeError, and even if
>   you skip ax= the call creates a SECOND, separate figure and your subplots cell stays
>   empty. The fix is to pick the matching axes-level function (histplot, scatterplot,
>   lineplot, boxplot, ...) with ax=axes[i, j], or commit fully to the figure-level
>   FacetGrid and customize via g.* methods.

## Tips

- Figure-level functions support `col=` and `row=` for faceting; axes-level do not
- Axes-level functions return an `Axes` object; figure-level return a `FacetGrid`
- To customize a figure-level plot, use `g.set_axis_labels()`, `g.set_titles()`, `g.figure.suptitle()`
- For subplot layouts, always use axes-level functions with `plt.subplots()`

## Common Mistake

> [!warning] Passing `ax=` to a figure-level function like `sns.displot(ax=ax)`. Figure-level functions manage their own Figure — they do not accept an `ax=` argument.

## Shorthand (Junior → Senior)

**Junior:**
```python
try:
    result = risky()
except ValueError as e:
    print(e)
```

**Senior:**
```python
try:
    result = risky()
except ValueError:
    result = None
```

## See Also

- [[Sections/seaborn/setup-customization/set-theme|sns.set_theme() (Seaborn)]]
- [[Sections/seaborn/setup-customization/_Index|Seaborn → Setup, Customization & Output]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
