---
type: "entry"
domain: "python"
file: "seaborn"
section: "relational"
id: "scatterplot"
title: "sns.scatterplot()"
category: "Relational"
subtitle: "Encode up to 5 dimensions via x, y, hue, size, and style"
signature_short: "sns.scatterplot(data, x=\"x\", y=\"y\", hue=\"group\", size=\"n\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sns.scatterplot()"
  - "scatterplot"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/relational"
  - "category/relational"
  - "tier/tiered"
---

# sns.scatterplot()

> Encode up to 5 dimensions via x, y, hue, size, and style

## Overview

scatterplot() plots individual data points and can encode additional dimensions through hue (color), size, and style (marker shape). Adds automatic legend and palette management.

## Signature

```python
sns.scatterplot(data, x="x", y="y", hue="group", size="n")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - x and y from a DataFrame. seaborn handles
#             the legend, colors, and palette.
# STRENGTHS - cleaner than matplotlib scatter when data
#             is in a DataFrame.
# WEAKNESSES- doesn't yet show the multi-dimensional
#             encoding (hue/size/style) which is seaborn
#             scatter's main value.
#
import seaborn as sns
df = sns.load_dataset("penguins").dropna()
sns.scatterplot(data=df, x="bill_length_mm", y="bill_depth_mm")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday seaborn scatter: encode up to
#             5 dimensions with x, y, hue, style, size.
#             alpha for overlap. legend outside the axes.
# STRENGTHS - multi-dimensional encoding makes seaborn
#             scatter genuinely better than matplotlib's.
# WEAKNESSES- doesn't address the >6 hue rule or large-N
#             alternatives — senior.
#
import seaborn as sns
import matplotlib.pyplot as plt

df = sns.load_dataset("penguins").dropna()

# Three dimensions encoded in one scatter
sns.scatterplot(
    data=df,
    x="bill_length_mm", y="bill_depth_mm",
    hue="species",
    style="sex",
    size="body_mass_g",
    sizes=(30, 200),
    alpha=0.7,
)

# Move legend outside the axes
plt.legend(loc="upper left", bbox_to_anchor=(1.02, 1.0))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production scatter: at large N use
#             scatterplot only with low alpha (or switch
#             to histplot 2D / hexbin); cap hue at ~6
#             values; for many categories use facets via
#             sns.relplot(col=).
# STRENGTHS - the N + hue scaling rules prevent
#             unreadable scatters; facets via relplot
#             scale to many groups.
# WEAKNESSES- facets cost vertical/horizontal space;
#             choosing 6 colors well requires a thought
#             about the palette.
#
import seaborn as sns
import matplotlib.pyplot as plt

df = sns.load_dataset("penguins").dropna()

# Right pattern at scale: facet, don't over-color
g = sns.relplot(data=df,
                 x="bill_length_mm", y="bill_depth_mm",
                 col="species", hue="sex",
                 height=4, aspect=0.9)
g.set_titles("{col_name}")

# Decision rule:
#   N <= 1k, 2-6 groups    -> scatterplot(hue=, alpha=0.6)
#   N > 5k                 -> histplot(2D) or hexbin
#   many categories        -> relplot(col=...) facets
#   need a regression line -> regplot or lmplot
#   3+ encodings needed    -> hue= + size= + style=
#   color-blind audience   -> palette="colorblind"
#
# Anti-pattern: encoding 8+ categories via hue on a single scatter.
#   Beyond ~6 colors the legend becomes a key the reader has to memorize and adjacent points
#   from different groups are visually indistinguishable. The fixes, in order: drop to <=6
#   categories with "Other" lumping, split via style= for a second dim, or facet with
#   relplot(col=..., col_wrap=N) — small multiples scale where one packed scatter doesn't.
```

## Decision Rule

```text
N <= 1k, 2-6 groups    -> scatterplot(hue=, alpha=0.6)
N > 5k                 -> histplot(2D) or hexbin
many categories        -> relplot(col=...) facets
need a regression line -> regplot or lmplot
3+ encodings needed    -> hue= + size= + style=
color-blind audience   -> palette="colorblind"
```

## Anti-Pattern

> [!warning] Anti-pattern
> encoding 8+ categories via hue on a single scatter.
>   Beyond ~6 colors the legend becomes a key the reader has to memorize and adjacent points
>   from different groups are visually indistinguishable. The fixes, in order: drop to <=6
>   categories with "Other" lumping, split via style= for a second dim, or facet with
>   relplot(col=..., col_wrap=N) — small multiples scale where one packed scatter doesn't.

## Tips

- Use `hue`, `size`, AND `style` to show three categorical variables on one scatter plot
- `alpha=0.5-0.7` is essential for overlapping points — reveals density
- Legend position: `plt.legend(loc="upper left", bbox_to_anchor=(1, 1))` to move outside
- For very large datasets, use `rasterized=True` to render the points as a bitmap — smaller file size

## Common Mistake

> [!warning] Using too many hue categories in a scatter plot. More than ~6 colors become hard to distinguish. Use `style=` for a second variable, or facet with `sns.relplot(col=)`.

## Shorthand (Junior → Senior)

**Junior:**
```python
import seaborn as sns
import matplotlib.pyplot as plt
data = sns.load_dataset('penguins').dropna()
sns.scatterplot(data=data, x='bill_length_mm', y='bill_depth_mm')
```

**Senior:**
```python
col='species', hue='sex')
```

## See Also

- [[Sections/seaborn/relational/lineplot|sns.lineplot() (Seaborn)]]
- [[Sections/seaborn/relational/relplot|sns.relplot() (Seaborn)]]
- [[Sections/seaborn/relational/lmplot|sns.lmplot() (Seaborn)]]
- [[Sections/seaborn/relational/_Index|Seaborn → Relational & Regression Plots]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
