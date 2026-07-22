---
type: "entry"
domain: "python"
file: "seaborn"
section: "relational"
id: "catplot"
title: "sns.catplot()"
category: "Categorical"
subtitle: "Figure-level wrapper for all categorical plots with col= and row="
signature_short: "sns.catplot(data, x=\"g\", y=\"v\", col=\"facet\", kind=\"box\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sns.catplot()"
  - "catplot"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/relational"
  - "category/categorical"
  - "tier/tiered"
---

# sns.catplot()

> Figure-level wrapper for all categorical plots with col= and row=

## Overview

catplot() is the figure-level version of all categorical axes-level plots. kind= selects the plot type: strip, swarm, box, violin, boxen, bar, count, or point. Adds col= and row= faceting. Returns a FacetGrid.

## Signature

```python
sns.catplot(data, x="g", y="v", col="facet", kind="box")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - figure-level wrapper for ALL categorical
#             plots. kind= selects the type, col=/row= add
#             faceting.
# STRENGTHS - one function for boxplot/violin/strip/etc
#             with built-in faceting.
# WEAKNESSES- doesn't yet show all kind= options or
#             customization.
#
import seaborn as sns
df = sns.load_dataset("tips")
sns.catplot(data=df, x="day", y="total_bill",
             col="time", kind="box")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday catplot recipe: kind= picks
#             the plot type (box/violin/swarm/bar/...);
#             col= and row= facet across categories;
#             hue= overlays a third variable per panel.
# STRENGTHS - covers the standard "compare categories
#             across facets" pattern; kind= is the
#             one-line switch between box/violin/etc.
# WEAKNESSES- doesn't address kind= choice rules — senior.
#
import seaborn as sns

df = sns.load_dataset("tips")

# kind= selects the underlying plot
g = sns.catplot(
    data=df, x="day", y="total_bill",
    col="time", hue="sex",
    kind="box",                  # box|violin|strip|swarm|boxen|bar|count|point
    height=5, aspect=0.8,
)

# Available kinds
# strip / swarm  - raw points
# box / boxen / violin - distribution summaries
# bar / count / point - aggregate summaries

# Two-dimension faceting
sns.catplot(data=df, x="day", y="total_bill",
             col="time", row="sex",
             kind="violin", height=3)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production catplot: kind= choice maps
#             directly to the underlying plot's tradeoffs
#             (boxplot for quartiles, violin for shape,
#             swarm/strip for raw points). col_wrap= and
#             sharex/sharey for many facets. Pre-sort
#             categories with order=.
# STRENGTHS - kind= decision rule maps to the categorical
#             tools you already know; sharey=False is
#             essential when facets have very different
#             scales.
# WEAKNESSES- catplot's figure-level constraints carry
#             over (no ax=); too many kinds to remember
#             without a quick-reference.
#
import seaborn as sns

df = sns.load_dataset("tips")

g = sns.catplot(
    data=df, x="day", y="total_bill",
    col="time", col_wrap=2,
    kind="violin",
    inner="quartile",
    order=["Thur", "Fri", "Sat", "Sun"],
    sharey=False,                 # each facet has its own y range
    height=4, aspect=1.0,
)

# Decision rule:
#   median + IQR per category       -> kind="box"
#   distribution shape              -> kind="violin"
#   small N, every point            -> kind="swarm" or "strip"
#   mean + CI per category          -> kind="bar"
#   raw counts                      -> kind="count"
#   ordinal x with trend            -> kind="point"
#   panels span very different y    -> sharey=False
#   single panel inside subplots    -> use axes-level (boxplot, etc.)
#
# Anti-pattern: catplot inside plt.subplots() expecting it to land in one cell.
#   catplot is figure-level — it builds its own Figure and silently produces a SECOND figure
#   while leaving your subplots cell empty. The fix: pick the matching axes-level function
#   (boxplot, violinplot, stripplot, ...) with ax=axes[i,j] when integrating into a custom
#   layout. Reach for catplot only when you want the small-multiples grid it builds.
```

## Decision Rule

```text
median + IQR per category       -> kind="box"
distribution shape              -> kind="violin"
small N, every point            -> kind="swarm" or "strip"
mean + CI per category          -> kind="bar"
raw counts                      -> kind="count"
ordinal x with trend            -> kind="point"
panels span very different y    -> sharey=False
single panel inside subplots    -> use axes-level (boxplot, etc.)
```

## Anti-Pattern

> [!warning] Anti-pattern
> catplot inside plt.subplots() expecting it to land in one cell.
>   catplot is figure-level — it builds its own Figure and silently produces a SECOND figure
>   while leaving your subplots cell empty. The fix: pick the matching axes-level function
>   (boxplot, violinplot, stripplot, ...) with ax=axes[i,j] when integrating into a custom
>   layout. Reach for catplot only when you want the small-multiples grid it builds.

## Tips

- catplot is the go-to for faceted categorical plots — replaces building subplots manually
- `kind="boxen"` (letter-value plot) is a better boxplot for large datasets — shows more quantiles
- Returns a FacetGrid — customize with `g.set_axis_labels()`, `g.set_titles()`, `g.figure.suptitle()`
- `col_wrap=2` wraps columns into a grid — useful when you have many facets

## Common Mistake

> [!warning] Passing ax= to catplot. It is a figure-level function that creates its own Figure. Use the axes-level equivalent (boxplot, violinplot, etc.) when you need to place a plot in an existing Axes.

## Shorthand (Junior → Senior)

**Junior:**
```python
import matplotlib.pyplot as plt
import seaborn as sns
df = sns.load_dataset('tips')
g = sns.catplot(
```

**Senior:**
```python
g.figure.suptitle('Bills by Day and Time', y=1.02)
```

## See Also

- [[Sections/seaborn/categorical/boxplot|sns.boxplot() (Seaborn)]]
- [[Sections/seaborn/categorical/violinplot|sns.violinplot() (Seaborn)]]
- [[Sections/seaborn/categorical/stripplot|sns.stripplot() (Seaborn)]]
- [[Sections/seaborn/categorical/swarmplot|sns.swarmplot() (Seaborn)]]
- [[Sections/seaborn/relational/_Index|Seaborn → Relational & Regression Plots]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
