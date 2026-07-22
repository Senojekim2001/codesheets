---
type: "entry"
domain: "python"
file: "seaborn"
section: "categorical"
id: "barplot"
title: "sns.barplot()"
category: "Categorical"
subtitle: "Shows mean + CI — NOT raw counts or totals"
signature_short: "sns.barplot(data, x=\"group\", y=\"value\", estimator=\"mean\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sns.barplot()"
  - "barplot"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/categorical"
  - "category/categorical"
  - "tier/tiered"
---

# sns.barplot()

> Shows mean + CI — NOT raw counts or totals

## Overview

barplot() shows the mean (or another estimator) with a 95% confidence interval. It does NOT show raw counts — use countplot() for counts or aggregate your data first for totals.

## Signature

```python
sns.barplot(data, x="group", y="value", estimator="mean")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - mean of y per category. NOT counts, NOT
#             totals — the MEAN with a 95% CI band by
#             default.
# STRENGTHS - the canonical "compare means" chart in one
#             call.
# WEAKNESSES- doesn't yet show estimator=, errorbar=, or
#             order= which are the everyday options.
#
import seaborn as sns
df = sns.load_dataset("tips")
sns.barplot(data=df, x="day", y="total_bill")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday barplot surface: hue= for
#             group split, explicit order=, errorbar=
#             choice (CI vs SD vs SE), estimator= for
#             median or custom aggregator.
# STRENGTHS - covers the patterns reports use; explicit
#             errorbar= prevents the "what does this band
#             represent?" confusion.
# WEAKNESSES- doesn't address bar_label or the "bar is
#             not the right tool" rule for raw counts —
#             senior tier.
#
import seaborn as sns

df = sns.load_dataset("tips")

# Mean by day with split, CI band default
sns.barplot(data=df, x="day", y="tip",
             hue="sex",
             order=["Thur", "Fri", "Sat", "Sun"])

# Median is more robust to outliers
sns.barplot(data=df, x="day", y="total_bill",
             estimator="median",
             errorbar=("ci", 95))

# Standard deviation band (variability, not mean uncertainty)
sns.barplot(data=df, x="day", y="total_bill",
             errorbar="sd")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production barplots: ALWAYS label what the
#             error bar represents (95% CI is NOT the same
#             as +/- SD); add bar_label for value
#             annotation; pick countplot for raw counts,
#             ax.bar for pre-aggregated totals.
# STRENGTHS - explicit errorbar labeling forces honest
#             charts; the decision tree (barplot/countplot/
#             ax.bar) clarifies the most-confused trio.
# WEAKNESSES- bar_label requires axes-level access; the
#             distinction between barplot/countplot/ax.bar
#             takes practice.
#
import seaborn as sns
import matplotlib.pyplot as plt

df = sns.load_dataset("tips")

fig, ax = plt.subplots(figsize=(8, 5))
sns.barplot(data=df, x="day", y="tip",
             order=["Thur", "Fri", "Sat", "Sun"],
             estimator="mean",
             errorbar=("ci", 95),
             ax=ax)

# Always annotate what the bar represents
ax.set_ylabel("Mean tip ($) - error bars: 95% CI")

# Value labels on each bar
for c in ax.containers:
    ax.bar_label(c, fmt="%.2f", padding=3)

# Decision rule:
#   mean / median per category, with CI    -> sns.barplot
#   raw count of rows per category         -> sns.countplot
#   pre-aggregated totals (already summed) -> ax.bar (matplotlib)
#   outliers skew the mean                 -> estimator="median"
#   show variability not uncertainty       -> errorbar="sd"
#   suppress error bars entirely           -> errorbar=None
#
# Anti-pattern: passing already-aggregated totals to sns.barplot expecting it to "just plot".
#   barplot will recompute the mean of your single-row-per-category column — for one row
#   that's the value itself, but the CI bar collapses to 0 and the chart implies "no
#   uncertainty" when really there's no replication. For pre-summed data use ax.bar()
#   directly; reach for barplot only when seaborn should do the aggregation.
```

## Decision Rule

```text
mean / median per category, with CI    -> sns.barplot
raw count of rows per category         -> sns.countplot
pre-aggregated totals (already summed) -> ax.bar (matplotlib)
outliers skew the mean                 -> estimator="median"
show variability not uncertainty       -> errorbar="sd"
suppress error bars entirely           -> errorbar=None
```

## Anti-Pattern

> [!warning] Anti-pattern
> passing already-aggregated totals to sns.barplot expecting it to "just plot".
>   barplot will recompute the mean of your single-row-per-category column — for one row
>   that's the value itself, but the CI bar collapses to 0 and the chart implies "no
>   uncertainty" when really there's no replication. For pre-summed data use ax.bar()
>   directly; reach for barplot only when seaborn should do the aggregation.

## Tips

- `sns.barplot()` shows the **mean** — not totals or counts. Use `sns.countplot()` for counts
- `errorbar="sd"` shows ±1 std dev — shows variability, not uncertainty in the mean
- Always set `order=` explicitly — alphabetical ordering is rarely what you want
- `estimator="median"` is more robust to outliers than the default mean

## Common Mistake

> [!warning] Expecting barplot to show totals or counts. It shows the **mean** with a confidence interval. For counts: `sns.countplot()`. For pre-aggregated data: use `ax.bar()` directly.

## Shorthand (Junior → Senior)

**Junior:**
```python
import seaborn as sns
import matplotlib.pyplot as plt
data = sns.load_dataset('tips')
sns.barplot(data=data, x='day', y='tip', hue='sex')
```

**Senior:**
```python
sns.barplot(data=data, x='day', y='tip', order=['Thur', 'Fri', 'Sat', 'Sun'])
```

## See Also

- [[Sections/seaborn/categorical/boxplot|sns.boxplot() (Seaborn)]]
- [[Sections/seaborn/categorical/violinplot|sns.violinplot() (Seaborn)]]
- [[Sections/seaborn/categorical/stripplot|sns.stripplot() (Seaborn)]]
- [[Sections/seaborn/categorical/swarmplot|sns.swarmplot() (Seaborn)]]
- [[Sections/seaborn/categorical/_Index|Seaborn → Categorical Plots]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
