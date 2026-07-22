---
type: "entry"
domain: "python"
file: "seaborn"
section: "distributions"
id: "ecdfplot"
title: "sns.ecdfplot()"
category: "Distribution"
subtitle: "Shows what fraction of data is below each value — no binning needed"
signature_short: "sns.ecdfplot(data, x=\"col\", hue=\"group\", stat=\"proportion\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sns.ecdfplot()"
  - "ecdfplot"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/distributions"
  - "category/distribution"
  - "tier/tiered"
---

# sns.ecdfplot()

> Shows what fraction of data is below each value — no binning needed

## Overview

ecdfplot() plots the empirical CDF — for each value x, it shows the proportion of observations less than or equal to x. Unlike histplot or kdeplot, the ECDF requires no binning or bandwidth choice. Excellent for comparing distributions across groups.

## Signature

```python
sns.ecdfplot(data, x="col", hue="group", stat="proportion")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - empirical CDF: for each x, what fraction of
#             observations are <=x. No bins, no bandwidth.
# STRENGTHS - exact, deterministic, no parameter choices.
# WEAKNESSES- doesn't yet show hue comparison or the
#             complementary form.
#
import seaborn as sns
df = sns.load_dataset("tips")
sns.ecdfplot(data=df, x="total_bill")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday ECDF surface: hue= for group
#             comparison, complementary=True for survival
#             curves, stat= options for percent vs count,
#             rug overlay for the raw data.
# STRENGTHS - ECDF is the cleanest tool to COMPARE
#             distributions visually — where curves cross,
#             quantiles are equal.
# WEAKNESSES- doesn't address quantile-reading or KS
#             distance — senior tier.
#
import seaborn as sns

df = sns.load_dataset("tips")

# Compare groups
ax = sns.ecdfplot(data=df, x="total_bill", hue="sex")

# Add rug for raw points
sns.rugplot(data=df, x="total_bill", hue="sex",
             ax=ax, height=0.05, alpha=0.4)

# Survival curve: P(X > x)
sns.ecdfplot(data=df, x="total_bill",
              complementary=True)

# Stat options
sns.ecdfplot(data=df, x="total_bill", stat="percent")  # 0..100
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production ECDF: read percentiles directly
#             off the curve (median = horizontal line at
#             0.5 intersects x at p50); compare two
#             distributions with a vertical max-gap line
#             (Kolmogorov-Smirnov visualization); use
#             complementary=True for time-to-event /
#             survival data.
# STRENGTHS - ECDF is the right answer when "compare
#             distributions" matters; KS-style max-gap is
#             the visual echo of the test statistic;
#             survival curves are how reliability/churn
#             analyses are read.
# WEAKNESSES- ECDF is harder to parse than histograms for
#             non-statistician audiences; KS visualization
#             requires marking the max-gap manually.
#
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np

df = sns.load_dataset("tips")

fig, ax = plt.subplots(figsize=(8, 5))
sns.ecdfplot(data=df, x="total_bill", hue="sex", ax=ax)

# Mark the median (y=0.5)
ax.axhline(0.5, color="gray", linestyle="--", linewidth=0.7)

# Annotate where each group's median falls on x
for sex, grp in df.groupby("sex"):
    p50 = grp["total_bill"].median()
    ax.axvline(p50, color="gray", linestyle=":",
                linewidth=0.7, alpha=0.5)
    ax.text(p50, 0.02, f"p50 {sex}={p50:.0f}",
             rotation=90, va="bottom", ha="right",
             fontsize=8)

# Decision rule:
#   compare distributions visually   -> ecdfplot (preferred over KDE)
#   probability of exceedance        -> complementary=True
#   read a specific quantile         -> intersect ECDF with horizontal line
#   no parameter choices needed      -> ecdfplot (no bins, no bandwidth)
#   audience unfamiliar with CDFs    -> histplot(stat="density") instead
#   time-to-event / churn / survival -> ecdfplot(complementary=True)
#
# Anti-pattern: comparing two histograms with different N when the real question is "are these
# distributions different?".
#   Histogram bar heights conflate sample size with density and binning amplifies noise. ECDFs
#   need no bins, scale identically across N, and let you read quantiles directly off the y axis.
#   Default to ecdfplot(hue=...) for distribution comparisons; reach for histplot only when the
#   audience needs the familiar bar shape.
```

## Decision Rule

```text
compare distributions visually   -> ecdfplot (preferred over KDE)
probability of exceedance        -> complementary=True
read a specific quantile         -> intersect ECDF with horizontal line
no parameter choices needed      -> ecdfplot (no bins, no bandwidth)
audience unfamiliar with CDFs    -> histplot(stat="density") instead
time-to-event / churn / survival -> ecdfplot(complementary=True)
```

## Anti-Pattern

> [!warning] Anti-pattern
> comparing two histograms with different N when the real question is "are these
> distributions different?".
>   Histogram bar heights conflate sample size with density and binning amplifies noise. ECDFs
>   need no bins, scale identically across N, and let you read quantiles directly off the y axis.
>   Default to ecdfplot(hue=...) for distribution comparisons; reach for histplot only when the
>   audience needs the familiar bar shape.

## Tips

- ECDF requires no binning or smoothing — every point is exact, not estimated
- Where ECDFs cross, the distributions have the same proportion below that value
- `complementary=True` shows the survival function: P(X > x) — useful for time-to-event
- Two ECDFs that are far apart indicate very different distributions

## Common Mistake

> [!warning] Using histplot to compare two distributions when the sample sizes are different. histplot counts are hard to compare across groups of different size. Use ecdfplot or histplot with stat="density" instead.

## Shorthand (Junior → Senior)

**Junior:**
```python
import matplotlib.pyplot as plt
import seaborn as sns
df = sns.load_dataset('tips')
sns.ecdfplot(data=df, x='total_bill')
```

**Senior:**
```python
ax=ax, height=0.05, alpha=0.4)
```

## See Also

- [[Sections/seaborn/distributions/histplot|sns.histplot() (Seaborn)]]
- [[Sections/seaborn/distributions/kdeplot|sns.kdeplot() (Seaborn)]]
- [[Sections/seaborn/distributions/rugplot|sns.rugplot() (Seaborn)]]
- [[Sections/seaborn/distributions/displot|sns.displot() (Seaborn)]]
- [[Sections/seaborn/distributions/_Index|Seaborn → Distribution Plots]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
