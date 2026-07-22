---
type: "entry"
domain: "python"
file: "seaborn"
section: "categorical"
id: "stripplot"
title: "sns.stripplot()"
category: "Categorical"
subtitle: "Show every observation — best for small or medium datasets"
signature_short: "sns.stripplot(data, x=\"group\", y=\"value\", jitter=True)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sns.stripplot()"
  - "stripplot"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/categorical"
  - "category/categorical"
  - "tier/tiered"
---

# sns.stripplot()

> Show every observation — best for small or medium datasets

## Overview

stripplot() plots every data point along a categorical axis with jitter to reduce overlap. It is most useful for small datasets where you want to show all the raw data. Combine with boxplot or violinplot for large datasets.

## Signature

```python
sns.stripplot(data, x="group", y="value", jitter=True)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - one dot per observation, jittered along
#             the categorical axis to reduce overlap.
# STRENGTHS - shows every point — honest for small N.
# WEAKNESSES- doesn't yet show dodge=, overlay on box, or
#             scaling for large N.
#
import seaborn as sns
df = sns.load_dataset("tips")
sns.stripplot(data=df, x="day", y="total_bill",
               jitter=True, alpha=0.6)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday strip surface: dodge=True with
#             hue= (separate side-by-side groups), small
#             size + low alpha for medium N, and the
#             canonical box+strip overlay.
# STRENGTHS - covers the patterns reports use to combine
#             summary + raw data.
# WEAKNESSES- doesn't address swarmplot vs strip or scale
#             warnings — senior.
#
import seaborn as sns
import matplotlib.pyplot as plt

df = sns.load_dataset("tips")

# Group split with dodge
sns.stripplot(data=df, x="day", y="total_bill",
               hue="sex", dodge=True, alpha=0.6)

# Box + strip — quartiles plus raw points
fig, ax = plt.subplots()
sns.boxplot(data=df, x="day", y="total_bill",
             fill=False, fliersize=0, ax=ax)
sns.stripplot(data=df, x="day", y="total_bill",
               ax=ax, color="steelblue",
               size=3, alpha=0.4)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production strips: at scale (N > a few
#             hundred), reduce size and alpha or switch
#             to violin/box; choose strip over swarm
#             when N is large (swarm doesn't scale); use
#             native_scale=True to plot strips at numeric
#             x positions (mixed numeric+categorical).
# STRENGTHS - explicit scaling rules prevent unreadable
#             "blob" strip plots; native_scale unlocks
#             the rare numeric-x case.
# WEAKNESSES- judging size/alpha takes practice;
#             native_scale changes axis behavior in ways
#             that surprise readers.
#
import seaborn as sns

df = sns.load_dataset("tips")

# Scale-conscious styling for medium N
sns.stripplot(data=df, x="day", y="total_bill",
               hue="sex", dodge=True,
               size=2, alpha=0.3,                    # turn down for density
               jitter=0.25)                           # narrower jitter band

# Numeric x via native_scale — strip-on-numeric-axis
# sns.stripplot(data=df_with_int_x, x="month", y="value",
#                native_scale=True)

# Decision rule:
#   N <= 30 per group        -> swarmplot (no overlap)
#   30 < N <= 500            -> stripplot with size=3, alpha=0.6
#   500 < N <= 5000          -> stripplot with size=2, alpha=0.3
#   N > 5000                 -> switch to violin/box; strip becomes a blob
#   numeric-x mixed with cat -> native_scale=True
#   overlay on box/violin    -> fill=False box + stripplot color="black"
#
# Anti-pattern: leaving size= and alpha= at their defaults on medium-to-large N.
#   Default size=5 with full opacity becomes a solid colored bar at a few hundred points and
#   you lose all density information. The fix is a coordinated turn-down: size=2-3 with
#   alpha=0.3-0.5 and a narrower jitter=0.25. If even that still looks like a bar, you have
#   crossed into violin/box territory.
```

## Decision Rule

```text
N <= 30 per group        -> swarmplot (no overlap)
30 < N <= 500            -> stripplot with size=3, alpha=0.6
500 < N <= 5000          -> stripplot with size=2, alpha=0.3
N > 5000                 -> switch to violin/box; strip becomes a blob
numeric-x mixed with cat -> native_scale=True
overlay on box/violin    -> fill=False box + stripplot color="black"
```

## Anti-Pattern

> [!warning] Anti-pattern
> leaving size= and alpha= at their defaults on medium-to-large N.
>   Default size=5 with full opacity becomes a solid colored bar at a few hundred points and
>   you lose all density information. The fix is a coordinated turn-down: size=2-3 with
>   alpha=0.3-0.5 and a narrower jitter=0.25. If even that still looks like a bar, you have
>   crossed into violin/box territory.

## Tips

- Combine stripplot with boxplot: set `fill=False, fliersize=0` in boxplot then overlay strips
- `dodge=True` with `hue=` separates the two groups — prevents all points sitting on top of each other
- For more than ~200 points, use `swarmplot` (non-overlapping) or reduce `size=` and `alpha=`
- `sns.swarmplot()` is the non-overlapping alternative — cleaner but computationally slower for large n

## Common Mistake

> [!warning] Using stripplot with large datasets (n > 500) and getting a solid color block. Reduce `size=1`, increase `alpha=0.2`, or switch to a violin/box plot.

## Shorthand (Junior → Senior)

**Junior:**
```python
        import matplotlib.pyplot as plt
import seaborn as sns
df = sns.load_dataset('tips')
sns.ecdfplot(data=df, x='total_bill')
sns.ecdfplot(data=df, x='total_bill', hue='sex')
```

**Senior:**
```python
    ax=ax, height=0.05, alpha=0.4)
```

## See Also

- [[Sections/seaborn/categorical/boxplot|sns.boxplot() (Seaborn)]]
- [[Sections/seaborn/categorical/violinplot|sns.violinplot() (Seaborn)]]
- [[Sections/seaborn/categorical/swarmplot|sns.swarmplot() (Seaborn)]]
- [[Sections/seaborn/categorical/barplot|sns.barplot() (Seaborn)]]
- [[Sections/seaborn/categorical/_Index|Seaborn → Categorical Plots]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
