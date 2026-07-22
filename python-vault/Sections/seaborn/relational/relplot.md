---
type: "entry"
domain: "python"
file: "seaborn"
section: "relational"
id: "relplot"
title: "sns.relplot()"
category: "Relational"
subtitle: "Figure-level wrapper for scatterplot and lineplot with col= and row="
signature_short: "sns.relplot(data, x=\"x\", y=\"y\", col=\"group\", kind=\"scatter\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sns.relplot()"
  - "relplot"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/relational"
  - "category/relational"
  - "tier/tiered"
---

# sns.relplot()

> Figure-level wrapper for scatterplot and lineplot with col= and row=

## Overview

relplot() is the figure-level version of scatterplot and lineplot. It adds faceting via col= and row=. Returns a FacetGrid.

## Signature

```python
sns.relplot(data, x="x", y="y", col="group", kind="scatter")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - figure-level wrapper for scatter/line. Use
#             col= or row= to facet across a categorical.
# STRENGTHS - one call gets you a small-multiples grid.
# WEAKNESSES- doesn't yet show the kind= switch or
#             FacetGrid customization.
#
import seaborn as sns
fmri = sns.load_dataset("fmri")
g = sns.relplot(data=fmri, x="timepoint", y="signal",
                 col="region", kind="line")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday relplot recipe: kind=
#             switches scatter/line, col=+row= facet
#             across two dims, hue= overlays groups
#             within a panel. Customize via the returned
#             FacetGrid.
# STRENGTHS - covers what real EDA dashboards look like:
#             a grid of similar charts.
# WEAKNESSES- doesn't address figure-level vs axes-level
#             tradeoffs — senior.
#
import seaborn as sns

fmri = sns.load_dataset("fmri")

# Faceted line plot
g = sns.relplot(data=fmri, x="timepoint", y="signal",
                 col="region", hue="event",
                 kind="line",
                 height=4, aspect=0.9)
g.set_axis_labels("Time", "Signal")
g.set_titles("Region: {col_name}")
g.figure.suptitle("FMRI Signal by Region", y=1.02)
g.add_legend(title="Event")

# Row + col faceting (full grid)
sns.relplot(data=fmri, x="timepoint", y="signal",
             col="region", row="event",
             kind="line", height=3)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production relplot: figure-level functions
#             OWN their figures (no ax= argument); use
#             col_wrap to keep row count manageable;
#             g.refline() / g.map_dataframe() for shared
#             reference lines and per-panel overlays.
# STRENGTHS - col_wrap is essential for >4 facets;
#             refline/map_dataframe scale facet
#             customization without a Python loop.
# WEAKNESSES- figure-level cliff (no ax=) traps users
#             trying to combine into matplotlib
#             subplots; map_dataframe takes effort to
#             learn.
#
import seaborn as sns

fmri = sns.load_dataset("fmri")

g = sns.relplot(
    data=fmri, x="timepoint", y="signal",
    col="region", col_wrap=2,             # wrap many facets
    hue="event",
    kind="line",
    errorbar=("ci", 95),
    height=3.5, aspect=1.0,
)

# Reference line on every facet
g.refline(y=0, color="black", linestyle=":", linewidth=0.8)

# Decision rule:
#   single panel into existing axes       -> sns.scatterplot/lineplot(ax=)
#   small multiples / faceted view        -> sns.relplot
#   many facets, one categorical          -> col_wrap=N
#   facet across two dims                 -> col= AND row=
#   shared reference line per facet       -> g.refline(y=...)
#   per-panel custom annotation           -> g.map_dataframe(callable)
#
# Anti-pattern: trying to embed a relplot grid inside a custom plt.subplots() layout.
#   relplot is figure-level — it OWNS its figure and ax= raises a TypeError. If you need
#   the small-multiples grid, commit to relplot and customize via the FacetGrid (g.set_titles,
#   g.refline, g.figure.suptitle). If you need a tight matplotlib subplot layout, use the
#   axes-level scatterplot/lineplot with ax= per cell instead.
```

## Decision Rule

```text
single panel into existing axes       -> sns.scatterplot/lineplot(ax=)
small multiples / faceted view        -> sns.relplot
many facets, one categorical          -> col_wrap=N
facet across two dims                 -> col= AND row=
shared reference line per facet       -> g.refline(y=...)
per-panel custom annotation           -> g.map_dataframe(callable)
```

## Anti-Pattern

> [!warning] Anti-pattern
> trying to embed a relplot grid inside a custom plt.subplots() layout.
>   relplot is figure-level — it OWNS its figure and ax= raises a TypeError. If you need
>   the small-multiples grid, commit to relplot and customize via the FacetGrid (g.set_titles,
>   g.refline, g.figure.suptitle). If you need a tight matplotlib subplot layout, use the
>   axes-level scatterplot/lineplot with ax= per cell instead.

## Tips

- `col_wrap=3` wraps facets into a grid when you have many groups
- FacetGrid customization: `g.set_axis_labels()`, `g.set_titles()`, `g.figure.suptitle()`
- `height=` sets panel height in inches; `aspect=` sets width/height ratio
- Use `relplot` when you want small multiples; use `scatterplot`/`lineplot` for single panels

## Common Mistake

> [!warning] Passing `ax=` to `sns.relplot()`. It is a figure-level function that creates its own Figure. Use `sns.scatterplot()` or `sns.lineplot()` with `ax=` for subplot layouts.

## Shorthand (Junior → Senior)

**Junior:**
```python
import matplotlib.pyplot as plt
import seaborn as sns
fmri = sns.load_dataset('fmri')
g = sns.relplot(
```

**Senior:**
```python
)
```

## See Also

- [[Sections/seaborn/relational/scatterplot|sns.scatterplot() (Seaborn)]]
- [[Sections/seaborn/relational/lineplot|sns.lineplot() (Seaborn)]]
- [[Sections/seaborn/relational/lmplot|sns.lmplot() (Seaborn)]]
- [[Sections/seaborn/relational/_Index|Seaborn → Relational & Regression Plots]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
