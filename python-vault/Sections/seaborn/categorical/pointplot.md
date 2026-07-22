---
type: "entry"
domain: "python"
file: "seaborn"
section: "categorical"
id: "pointplot"
title: "sns.pointplot()"
category: "Categorical"
subtitle: "Like barplot but with dots and lines — great for showing trends"
signature_short: "sns.pointplot(data, x=\"group\", y=\"value\", hue=\"subgroup\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sns.pointplot()"
  - "pointplot"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/categorical"
  - "category/categorical"
  - "tier/tiered"
---

# sns.pointplot()

> Like barplot but with dots and lines — great for showing trends

## Overview

pointplot() shows the mean per category as a point with a CI bar, connecting points with a line. Most useful when the x-axis has a natural order (time, dose level, ordinal category) and you want to see the trend across categories.

## Signature

```python
sns.pointplot(data, x="group", y="value", hue="subgroup")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - mean per category as a point with CI bar,
#             connected by a line.
# STRENGTHS - the right plot when x has a natural order
#             (time, dose, ordinal levels).
# WEAKNESSES- doesn't yet show hue, dodge, or the "wrong
#             tool for nominal categories" rule.
#
import seaborn as sns
df = sns.load_dataset("tips")
sns.pointplot(data=df, x="day", y="total_bill")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday pointplot surface: hue= for
#             multiple lines, dodge=True to separate
#             overlapping groups, estimator/errorbar for
#             aggregator choice, linestyle="none" for the
#             dot-plot variant.
# STRENGTHS - dodge prevents the "all groups stacked on
#             top" problem; linestyle="none" creates a
#             Cleveland dot plot.
# WEAKNESSES- doesn't address the "is x ordered?" rule
#             — senior tier covers when pointplot is the
#             wrong tool.
#
import seaborn as sns

df = sns.load_dataset("tips")

# Multiple lines via hue
sns.pointplot(data=df, x="day", y="total_bill",
               hue="sex", dodge=True,
               order=["Thur", "Fri", "Sat", "Sun"])

# Median + SD instead of mean + CI
sns.pointplot(data=df, x="day", y="total_bill",
               estimator="median", errorbar="sd")

# Dot-plot variant — no connecting line
sns.pointplot(data=df, x="day", y="total_bill",
               linestyle="none", capsize=0.1)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production pointplot: only when x has
#             ordinal meaning (the connecting line
#             implies progression). For nominal
#             categories use barplot/boxplot. For
#             genuinely numeric x with summary lines,
#             switch to lineplot which is designed for it.
# STRENGTHS - the ordinality rule prevents the most
#             common pointplot misuse; lineplot is the
#             better tool when x is numeric.
# WEAKNESSES- determining "ordinal vs nominal" is
#             sometimes a judgment call; pointplot has
#             a small API niche.
#
import seaborn as sns

df = sns.load_dataset("tips")

# Right tool: x is ordinal (time of day suggests progression)
sns.pointplot(data=df, x="time", y="total_bill",
               order=["Lunch", "Dinner"])

# Wrong tool: nominal categories
# sns.pointplot(data=df, x="day", y="total_bill")
#   The line "Thur -> Fri -> Sat -> Sun" implies a trend
#   but day-of-week is not really ordered for tips.
# Right alternative:
# sns.barplot(data=df, x="day", y="total_bill")

# Decision rule:
#   x is ordinal/temporal              -> pointplot
#   x is nominal categorical           -> barplot or boxplot
#   x is numeric (continuous)          -> lineplot
#   x is grouped time series           -> lineplot(hue=)
#   want Cleveland dot plot            -> pointplot(linestyle="none")
#   overlapping groups                 -> dodge=True
#
# Anti-pattern: pointplot with a connecting line between unordered nominal categories
# (city names, product SKUs, treatment groups).
#   The line implies a trend "City A -> City B -> City C" that has no meaning — readers
#   anchor on the slope and infer ordering that doesn't exist. For nominal x reach for
#   barplot or boxplot. Reserve pointplot for x with genuine ordinal/temporal structure
#   (dose level, year, time-of-day).
```

## Decision Rule

```text
x is ordinal/temporal              -> pointplot
x is nominal categorical           -> barplot or boxplot
x is numeric (continuous)          -> lineplot
x is grouped time series           -> lineplot(hue=)
want Cleveland dot plot            -> pointplot(linestyle="none")
overlapping groups                 -> dodge=True
```

## Anti-Pattern

> [!warning] Anti-pattern
> pointplot with a connecting line between unordered nominal categories
> (city names, product SKUs, treatment groups).
>   The line implies a trend "City A -> City B -> City C" that has no meaning — readers
>   anchor on the slope and infer ordering that doesn't exist. For nominal x reach for
>   barplot or boxplot. Reserve pointplot for x with genuine ordinal/temporal structure
>   (dose level, year, time-of-day).

## Tips

- pointplot is ideal when x has a natural ordering — the connecting line implies progression
- Use `dodge=True` with hue so overlapping groups do not sit on top of each other
- `linestyle="none"` shows just points with CI bars — a Cleveland dot plot style
- For unordered categories, barplot or boxplot communicates better than a connecting line

## Common Mistake

> [!warning] Using pointplot for unordered categories like city names. The connecting line implies a trend between adjacent categories — use barplot or boxplot for nominal categories.

## Shorthand (Junior → Senior)

**Junior:**
```python
import matplotlib.pyplot as plt
import seaborn as sns
df = sns.load_dataset('tips')
sns.pointplot(data=df, x='day', y='total_bill')
```

**Senior:**
```python
col='time', dodge=True)
```

## See Also

- [[Sections/seaborn/categorical/boxplot|sns.boxplot() (Seaborn)]]
- [[Sections/seaborn/categorical/violinplot|sns.violinplot() (Seaborn)]]
- [[Sections/seaborn/categorical/stripplot|sns.stripplot() (Seaborn)]]
- [[Sections/seaborn/categorical/swarmplot|sns.swarmplot() (Seaborn)]]
- [[Sections/seaborn/categorical/_Index|Seaborn → Categorical Plots]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
