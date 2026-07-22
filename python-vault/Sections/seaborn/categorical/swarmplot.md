---
type: "entry"
domain: "python"
file: "seaborn"
section: "categorical"
id: "swarmplot"
title: "sns.swarmplot()"
category: "Categorical"
subtitle: "Cleaner than stripplot for small-to-medium datasets"
signature_short: "sns.swarmplot(data, x=\"group\", y=\"value\", hue=\"subgroup\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sns.swarmplot()"
  - "swarmplot"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/categorical"
  - "category/categorical"
  - "tier/tiered"
---

# sns.swarmplot()

> Cleaner than stripplot for small-to-medium datasets

## Overview

swarmplot() is like stripplot() but uses a beeswarm algorithm to position points so they do not overlap. The result is a categorical scatter where every point is visible. Slower than stripplot and does not scale to large n — use for n < 500.

## Signature

```python
sns.swarmplot(data, x="group", y="value", hue="subgroup")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - non-overlapping beeswarm. Every point is
#             visible, none overlap.
# STRENGTHS - the cleanest categorical scatter at small N.
# WEAKNESSES- doesn't yet show hue dodge or overlay, and
#             doesn't warn about scale.
#
import seaborn as sns
df = sns.load_dataset("tips")
sns.swarmplot(data=df, x="day", y="total_bill")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday swarm surface: dodge with
#             hue, overlay on boxplot, the small size +
#             alpha tuning that keeps swarms readable.
# STRENGTHS - the box+swarm overlay is the cleanest
#             "summary + every point" combo for N < ~200.
# WEAKNESSES- doesn't address scale warnings (when to
#             switch to strip) — senior tier.
#
import seaborn as sns
import matplotlib.pyplot as plt

df = sns.load_dataset("tips")

# Group split via dodge
sns.swarmplot(data=df, x="day", y="total_bill",
               hue="sex", dodge=True, size=3)

# Box + swarm overlay
fig, ax = plt.subplots()
sns.boxplot(data=df, x="day", y="total_bill",
             fill=False, fliersize=0, ax=ax)
sns.swarmplot(data=df, x="day", y="total_bill",
               color="steelblue", size=3,
               alpha=0.7, ax=ax)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production swarm: SCALE LIMIT — swarmplot
#             slows dramatically and warns when N per
#             group > ~500. The beeswarm algorithm is
#             O(n^2) per category. Switch to stripplot
#             with low alpha for large N.
# STRENGTHS - calling out the scale limit prevents the
#             "why is my notebook hung?" moment; explicit
#             switch criteria makes the code review
#             obvious.
# WEAKNESSES- swarm is the cleanest visual at small N —
#             switching loses some readability.
#
import seaborn as sns

df = sns.load_dataset("tips")

# Safe at this size (< 200 per group)
sns.swarmplot(data=df, x="day", y="total_bill",
               size=3)

# Decision rule:
#   N <= 100 per group              -> swarmplot (cleanest)
#   100 < N <= 500 per group        -> swarmplot with smaller size=
#   N > 500 per group               -> stripplot(size=2, alpha=0.3)
#   N > 5000 per group              -> violinplot or boxplot only
#   want raw + summary together     -> box (fill=False) + swarmplot overlay
#   two hue groups side-by-side     -> dodge=True
#
# Anti-pattern: swarmplot on a 10k-row DataFrame and ignoring the placement warning.
#   The beeswarm algorithm is O(n^2) per category; on large N seaborn emits "X% of the
#   points cannot be placed" and silently drops them. The chart is now both slow AND a lie
#   about your data. Switch to stripplot(size=2, alpha=0.3) above ~500 per group, or
#   summarize with violin/box above ~5000.
```

## Decision Rule

```text
N <= 100 per group              -> swarmplot (cleanest)
100 < N <= 500 per group        -> swarmplot with smaller size=
N > 500 per group               -> stripplot(size=2, alpha=0.3)
N > 5000 per group              -> violinplot or boxplot only
want raw + summary together     -> box (fill=False) + swarmplot overlay
two hue groups side-by-side     -> dodge=True
```

## Anti-Pattern

> [!warning] Anti-pattern
> swarmplot on a 10k-row DataFrame and ignoring the placement warning.
>   The beeswarm algorithm is O(n^2) per category; on large N seaborn emits "X% of the
>   points cannot be placed" and silently drops them. The chart is now both slow AND a lie
>   about your data. Switch to stripplot(size=2, alpha=0.3) above ~500 per group, or
>   summarize with violin/box above ~5000.

## Tips

- swarmplot is best for n < 500 — above that it becomes slow and crowded
- Overlay on boxplot: `fill=False, fliersize=0` in boxplot, then swarmplot on the same ax
- `dodge=True` with hue separates the two groups side by side
- For larger datasets, use stripplot with `size=2, alpha=0.3` instead

## Common Mistake

> [!warning] Using swarmplot on datasets with more than 500-1000 points. The beeswarm algorithm becomes very slow and the plot becomes unreadable. Use stripplot for large n.

## Shorthand (Junior → Senior)

**Junior:**
```python
import matplotlib.pyplot as plt
import seaborn as sns
df = sns.load_dataset('tips')
sns.swarmplot(data=df, x='day', y='total_bill')
```

**Senior:**
```python
size=2, alpha=0.3, jitter=True)
```

## See Also

- [[Sections/seaborn/categorical/boxplot|sns.boxplot() (Seaborn)]]
- [[Sections/seaborn/categorical/violinplot|sns.violinplot() (Seaborn)]]
- [[Sections/seaborn/categorical/stripplot|sns.stripplot() (Seaborn)]]
- [[Sections/seaborn/categorical/barplot|sns.barplot() (Seaborn)]]
- [[Sections/seaborn/categorical/_Index|Seaborn → Categorical Plots]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
