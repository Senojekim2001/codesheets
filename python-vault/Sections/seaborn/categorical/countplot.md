---
type: "entry"
domain: "python"
file: "seaborn"
section: "categorical"
id: "countplot"
title: "sns.countplot()"
category: "Categorical"
subtitle: "Bar chart of raw counts — no y variable needed"
signature_short: "sns.countplot(data, x=\"col\", hue=\"group\", order=[])"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sns.countplot()"
  - "countplot"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/categorical"
  - "category/categorical"
  - "tier/tiered"
---

# sns.countplot()

> Bar chart of raw counts — no y variable needed

## Overview

countplot() counts the occurrences of each category and displays them as bars. Unlike barplot() it does not need a y variable — it counts the rows. The most common plot for showing category frequency.

## Signature

```python
sns.countplot(data, x="col", hue="group", order=[])
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - bars showing the count of rows per
#             category. No y variable.
# STRENGTHS - the simplest "frequency table" chart.
# WEAKNESSES- doesn't yet show order=, value labels, or
#             the horizontal form.
#
import seaborn as sns
df = sns.load_dataset("tips")
sns.countplot(data=df, x="day")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday countplot recipe: order by
#             frequency, hue= split, horizontal for long
#             labels, bar_label for annotations.
# STRENGTHS - "order by frequency" is THE rule for
#             readable count plots; bar_label removes the
#             need to manually annotate.
# WEAKNESSES- doesn't address normalize= for proportions
#             or the "long-tail" categorical fix —
#             senior tier.
#
import seaborn as sns

df = sns.load_dataset("tips")

# Sort by frequency, most common first
order = df["day"].value_counts().index
ax = sns.countplot(data=df, x="day", order=order)

# Auto value labels
for c in ax.containers:
    ax.bar_label(c)

# Horizontal — better for long labels
sns.countplot(data=df, y="day", order=order)

# Group split via hue
sns.countplot(data=df, x="day", hue="sex", order=order)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production countplot: collapse the long
#             tail into "Other"; show proportions instead
#             of raw counts when groups have very
#             different sizes; reach for value_counts()
#             + ax.bar when you want full control.
# STRENGTHS - long-tail collapse keeps the plot readable;
#             proportion-mode bars are the right choice
#             for "what fraction of orders is X?"
# WEAKNESSES- "Other" loses information; proportion bars
#             aren't built into countplot — use a small
#             precompute step.
#
import seaborn as sns
import matplotlib.pyplot as plt

df = sns.load_dataset("tips")

# 1. Collapse the long tail into "Other"
top_n = 5
counts = df["day"].value_counts()
top    = counts.nlargest(top_n).index
view = df.assign(day_top=df["day"].where(df["day"].isin(top), "Other"))
sns.countplot(data=view, x="day_top",
               order=list(top) + ["Other"])

# 2. Proportions per group (precompute, then ax.bar)
fig, ax = plt.subplots()
prop = (df.groupby("day")["sex"]
          .value_counts(normalize=True)
          .unstack(fill_value=0))
prop.plot(kind="bar", stacked=True, ax=ax)
ax.set_ylabel("Proportion")

# Decision rule:
#   raw category counts             -> countplot
#   counts split by another cat     -> countplot(hue=)
#   normalized proportions per cat  -> precompute + ax.bar
#   long-tail categorical           -> collapse to "Other" first
#   long category names             -> y= instead of x= (horizontal)
#   want sorted-by-frequency        -> order=df[col].value_counts().index
#
# Anti-pattern: leaving order at default (alphabetical / first-seen) on countplot.
#   Seaborn sorts categories alphabetically, which buries the dominant class and forces
#   the eye to scan back and forth. ALWAYS pass order=df[col].value_counts().index for
#   most-to-least, or your domain's canonical ordering. Same fix applies to barplot,
#   boxplot, and violinplot — explicit order= is the rule.
```

## Decision Rule

```text
raw category counts             -> countplot
counts split by another cat     -> countplot(hue=)
normalized proportions per cat  -> precompute + ax.bar
long-tail categorical           -> collapse to "Other" first
long category names             -> y= instead of x= (horizontal)
want sorted-by-frequency        -> order=df[col].value_counts().index
```

## Anti-Pattern

> [!warning] Anti-pattern
> leaving order at default (alphabetical / first-seen) on countplot.
>   Seaborn sorts categories alphabetically, which buries the dominant class and forces
>   the eye to scan back and forth. ALWAYS pass order=df[col].value_counts().index for
>   most-to-least, or your domain's canonical ordering. Same fix applies to barplot,
>   boxplot, and violinplot — explicit order= is the rule.

## Tips

- `order=df["col"].value_counts().index` sorts bars from most to least frequent
- `ax.bar_label(container)` adds count labels on top of bars — one line of code
- Use `y=` instead of `x=` for horizontal bars — gives room for long category names
- countplot is essentially `barplot` with `estimator=len` — it counts, not aggregates

## Common Mistake

> [!warning] Using barplot() when you just want counts. barplot() shows the mean of a numeric column with CI bands. countplot() shows raw row counts — no y variable needed.

## Shorthand (Junior → Senior)

**Junior:**
```python
import matplotlib.pyplot as plt
import seaborn as sns
df = sns.load_dataset('tips')
sns.countplot(data=df, x='day')
```

**Senior:**
```python
order=order)
```

## See Also

- [[Sections/seaborn/categorical/boxplot|sns.boxplot() (Seaborn)]]
- [[Sections/seaborn/categorical/violinplot|sns.violinplot() (Seaborn)]]
- [[Sections/seaborn/categorical/stripplot|sns.stripplot() (Seaborn)]]
- [[Sections/seaborn/categorical/swarmplot|sns.swarmplot() (Seaborn)]]
- [[Sections/seaborn/categorical/_Index|Seaborn → Categorical Plots]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
