---
type: "entry"
domain: "python"
file: "seaborn"
section: "categorical"
id: "violinplot"
title: "sns.violinplot()"
category: "Categorical"
subtitle: "Better than boxplot when n is large or distribution is multimodal"
signature_short: "sns.violinplot(data, x=\"group\", y=\"value\", inner=\"quartile\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sns.violinplot()"
  - "violinplot"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/categorical"
  - "category/categorical"
  - "tier/tiered"
---

# sns.violinplot()

> Better than boxplot when n is large or distribution is multimodal

## Overview

violinplot() shows the full distribution shape as a mirrored KDE, not just quartiles. More informative than a boxplot when the distribution is multimodal or when sample size is large enough to estimate density reliably.

## Signature

```python
sns.violinplot(data, x="group", y="value", inner="quartile")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - mirrored KDE per category. Shows full
#             distribution shape, not just quartiles.
# STRENGTHS - reveals multimodality that boxplots hide.
# WEAKNESSES- doesn't yet show inner=, split=, or
#             density_norm.
#
import seaborn as sns
df = sns.load_dataset("tips")
sns.violinplot(data=df, x="day", y="total_bill")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday violin surface: inner= picks
#             what's drawn inside (quartile / box / stick),
#             split=True puts hue groups on the same
#             violin (efficient comparison), density_norm
#             controls how widths compare across groups.
# STRENGTHS - split=True is a great use of horizontal
#             space; density_norm="count" makes group N
#             differences visible.
# WEAKNESSES- doesn't address bw_adjust tuning or stripplot
#             overlay — senior.
#
import seaborn as sns

df = sns.load_dataset("tips")

# inner=quartile draws the three quartile lines inside
sns.violinplot(data=df, x="day", y="total_bill",
                inner="quartile")

# Split violins — two hue groups share each violin
sns.violinplot(data=df, x="day", y="total_bill",
                hue="sex", split=True, inner="quartile")

# density_norm — compare absolute widths
sns.violinplot(data=df, x="day", y="total_bill",
                density_norm="count")     # width reflects N
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production violins: bw_adjust to reveal/hide
#             substructure, inner=None + stripplot overlay
#             for the "shape + raw" combo, and the rule
#             that small N (<30 per group) should NOT use
#             violin (KDE is unreliable).
# STRENGTHS - bw_adjust tuning is what separates "this
#             violin is suggestive" from "I can see the
#             two peaks"; the inner=None overlay is the
#             cleanest possible joint summary.
# WEAKNESSES- bw_adjust requires judgment; the violin +
#             strip combo can look busy on dense data.
#
import seaborn as sns
import matplotlib.pyplot as plt

df = sns.load_dataset("tips")

fig, ax = plt.subplots(figsize=(10, 5))

# Shape + raw points overlay
sns.violinplot(data=df, x="day", y="total_bill",
                inner=None, fill=True, alpha=0.4,
                bw_adjust=0.7,                         # rougher to see substructure
                ax=ax)
sns.stripplot(data=df, x="day", y="total_bill",
               ax=ax, color="black", size=2, alpha=0.5)

# Decision rule:
#   N >= 30 per group, want shape        -> violinplot
#   N < 30 per group                     -> swarm/strip + boxplot
#   compare two distributions per cat    -> violinplot(hue=, split=True)
#   compact summary, no shape needed     -> boxplot
#   need raw points overlaid             -> inner=None + stripplot/swarmplot
#   group sizes vary, show with width    -> density_norm="count"
#
# Anti-pattern: drawing a violinplot when each group has fewer than ~20 points.
#   The KDE underneath is fitted from too few samples; the resulting smooth shape is mostly
#   bandwidth artifact and misleads viewers into seeing modes that aren't there. For small N
#   per group, prefer stripplot/swarmplot (every dot visible) optionally overlaid on a
#   thin boxplot — the data speaks for itself without inventing a density.
```

## Decision Rule

```text
N >= 30 per group, want shape        -> violinplot
N < 30 per group                     -> swarm/strip + boxplot
compare two distributions per cat    -> violinplot(hue=, split=True)
compact summary, no shape needed     -> boxplot
need raw points overlaid             -> inner=None + stripplot/swarmplot
group sizes vary, show with width    -> density_norm="count"
```

## Anti-Pattern

> [!warning] Anti-pattern
> drawing a violinplot when each group has fewer than ~20 points.
>   The KDE underneath is fitted from too few samples; the resulting smooth shape is mostly
>   bandwidth artifact and misleads viewers into seeing modes that aren't there. For small N
>   per group, prefer stripplot/swarmplot (every dot visible) optionally overlaid on a
>   thin boxplot — the data speaks for itself without inventing a density.

## Tips

- Violin plots reveal multimodal distributions that boxplots hide — prefer them when n > 30
- `split=True` with `hue=` draws both groups on the same violin — saves space for side-by-side comparison
- `inner=None` then overlay `sns.stripplot()` shows the raw data on top of the density
- `bw_adjust=0.5` reveals substructure; `bw_adjust=2.0` smooths over noise

## Common Mistake

> [!warning] Using violin plots with small samples (n < 20). The KDE is unreliable — use a swarmplot or stripplot that shows the actual data points instead.

## Shorthand (Junior → Senior)

**Junior:**
```python
import matplotlib.pyplot as plt
import seaborn as sns
df = sns.load_dataset('tips')
sns.violinplot(data=df, x='day', y='total_bill')
```

**Senior:**
```python
ax=ax, color='black', size=2, alpha=0.5)
```

## See Also

- [[Sections/seaborn/categorical/boxplot|sns.boxplot() (Seaborn)]]
- [[Sections/seaborn/categorical/stripplot|sns.stripplot() (Seaborn)]]
- [[Sections/seaborn/categorical/swarmplot|sns.swarmplot() (Seaborn)]]
- [[Sections/seaborn/categorical/barplot|sns.barplot() (Seaborn)]]
- [[Sections/seaborn/categorical/_Index|Seaborn → Categorical Plots]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
