---
type: "entry"
domain: "python"
file: "seaborn"
section: "categorical"
id: "boxplot"
title: "sns.boxplot()"
category: "Categorical"
subtitle: "Median, quartiles, and outliers at a glance"
signature_short: "sns.boxplot(data, x=\"group\", y=\"value\", hue=\"subgroup\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sns.boxplot()"
  - "boxplot"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/categorical"
  - "category/categorical"
  - "tier/tiered"
---

# sns.boxplot()

> Median, quartiles, and outliers at a glance

## Overview

boxplot() shows the median, IQR, and outliers. The box spans Q1-Q3, the line is the median, whiskers extend to 1.5×IQR, and points beyond are outliers. Use hue= to split by a second variable.

## Signature

```python
sns.boxplot(data, x="group", y="value", hue="subgroup")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - one categorical x, one numeric y. Median,
#             IQR box, whiskers to 1.5xIQR, outliers as
#             dots.
# STRENGTHS - the most familiar "compare distributions
#             across categories" chart.
# WEAKNESSES- doesn't yet show hue, order=, or raw-data
#             overlay.
#
import seaborn as sns
df = sns.load_dataset("tips")
sns.boxplot(data=df, x="day", y="total_bill")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday boxplot surface: hue= for two-
#             variable comparison, explicit order= (avoids
#             alphabetical surprises), strip/swarm overlay
#             for small N.
# STRENGTHS - explicit order= prevents the "Mon, Sat,
#             Sun, Thu" alphabetical mess; overlay shows
#             individual points so the box isn't lying.
# WEAKNESSES- doesn't address showmeans, notch, or the
#             "use violin instead for multimodal" rule —
#             senior tier.
#
import seaborn as sns

df = sns.load_dataset("tips")

# Two-variable comparison + explicit order
sns.boxplot(data=df, x="day", y="total_bill",
             hue="sex",
             order=["Thur", "Fri", "Sat", "Sun"])

# Box + raw points overlay (small N visible)
ax = sns.boxplot(data=df, x="day", y="total_bill",
                  fill=False, fliersize=0)
sns.stripplot(data=df, x="day", y="total_bill",
               ax=ax, size=3, alpha=0.4)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production boxplots: notch=True for visual
#             "is the median different?" CI; switch to
#             violin/swarm when distributions are
#             multimodal or N is small; sort categories by
#             a meaningful order (median, sample size).
# STRENGTHS - notch is a quick visual significance test;
#             the right plot per shape (boxplot for
#             quartiles only; violin for shape; swarm for
#             every point) prevents misleading charts.
# WEAKNESSES- notches require enough N to be meaningful;
#             ordering by median changes between datasets.
#
import seaborn as sns
import matplotlib.pyplot as plt

df = sns.load_dataset("tips")

# 1. Sort categories by median (most-to-least)
order = df.groupby("day")["total_bill"].median().sort_values(
    ascending=False).index

fig, ax = plt.subplots(figsize=(8, 5))
sns.boxplot(data=df, x="day", y="total_bill",
             order=order, notch=True,             # CI notch on median
             showmeans=True,                       # mean as triangle
             meanprops={"marker": "^",
                         "markerfacecolor": "white",
                         "markeredgecolor": "black"},
             ax=ax)

# Decision rule:
#   compare medians/IQR across categories       -> boxplot
#   shape matters (multimodal, skew)            -> violinplot
#   N small enough to show every point          -> stripplot or swarmplot
#   want CI on the median visible               -> notch=True (boxplot)
#   long tails / many outliers (large N)        -> boxenplot (letter-value)
#   alphabetical category order leaks in        -> set order= explicitly
#
# Anti-pattern: boxplot on a multimodal distribution.
#   The five-number summary collapses two peaks into a single IQR — the chart looks unimodal
#   and hides the structure that matters. If a kdeplot or histogram of one group shows >1 peak,
#   switch to violinplot (or violin+stripplot overlay). Boxplot only honestly represents
#   roughly-unimodal data.
```

## Decision Rule

```text
compare medians/IQR across categories       -> boxplot
shape matters (multimodal, skew)            -> violinplot
N small enough to show every point          -> stripplot or swarmplot
want CI on the median visible               -> notch=True (boxplot)
long tails / many outliers (large N)        -> boxenplot (letter-value)
alphabetical category order leaks in        -> set order= explicitly
```

## Anti-Pattern

> [!warning] Anti-pattern
> boxplot on a multimodal distribution.
>   The five-number summary collapses two peaks into a single IQR — the chart looks unimodal
>   and hides the structure that matters. If a kdeplot or histogram of one group shows >1 peak,
>   switch to violinplot (or violin+stripplot overlay). Boxplot only honestly represents
>   roughly-unimodal data.

## Tips

- Set `fill=False, fliersize=0` in boxplot then overlay `sns.stripplot()` to show raw data
- `order=` controls category order — always set explicitly to avoid alphabetical surprises
- Whiskers extend to 1.5×IQR by default — points beyond are plotted as outliers
- For many groups, try `orient="h"` for horizontal boxes with room for long labels

## Common Mistake

> [!warning] Using boxplot alone for small datasets where all the data points matter. Overlay `sns.stripplot()` so individual observations are visible.

## Shorthand (Junior → Senior)

**Junior:**
```python
import seaborn as sns
import matplotlib.pyplot as plt
data = sns.load_dataset('tips')
sns.boxplot(data=data, x='day', y='total_bill')
```

**Senior:**
```python
sns.boxplot(data=data, x='day', y='total_bill', hue='time')
```

## See Also

- [[Sections/seaborn/categorical/violinplot|sns.violinplot() (Seaborn)]]
- [[Sections/seaborn/categorical/stripplot|sns.stripplot() (Seaborn)]]
- [[Sections/seaborn/categorical/swarmplot|sns.swarmplot() (Seaborn)]]
- [[Sections/seaborn/categorical/barplot|sns.barplot() (Seaborn)]]
- [[Sections/seaborn/categorical/_Index|Seaborn → Categorical Plots]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
