---
type: "entry"
domain: "python"
file: "seaborn"
section: "setup-customization"
id: "despine"
title: "sns.despine()"
category: "Customization"
subtitle: "Remove top and right borders by default — instant polish"
signature_short: "sns.despine() | sns.despine(left=True, bottom=False)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sns.despine()"
  - "despine"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/setup-customization"
  - "category/customization"
  - "tier/tiered"
---

# sns.despine()

> Remove top and right borders by default — instant polish

## Overview

despine() removes axes borders (spines). By default it removes the top and right spines — the two that add clutter without conveying information. Removing all four spines creates a minimal floating plot.

## Signature

```python
sns.despine() | sns.despine(left=True, bottom=False)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - one call removes top + right spines.
#             Instant cleanup.
# STRENGTHS - the simplest "publication look" tweak.
# WEAKNESSES- doesn't yet show offset or selective
#             spine removal.
#
import seaborn as sns
sns.boxplot(data=df, x="day", y="total_bill")
sns.despine()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday despine surface: remove all
#             four for floating plots, offset for a
#             small gap, ax= for targeted, FacetGrid's
#             own g.despine() method.
# STRENGTHS - the (style="ticks" + despine) combo is
#             the canonical clean-publication look.
# WEAKNESSES- doesn't address rcParams-based spine
#             removal (more permanent) — senior tier.
#
import seaborn as sns

sns.set_style("ticks")            # ticks + despine = publication

sns.histplot(data=df, x="total_bill")
sns.despine(offset=10)            # small gap between plot and spines

# Selective
sns.despine(left=True)            # remove left, keep bottom

# In a FacetGrid — use g.despine
g = sns.catplot(data=df, x="day", y="total_bill", kind="box")
g.despine(left=True)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production despine: set spine visibility
#             via rcParams for a permanent house style;
#             offset + trim cleans the leftover spine
#             segments at axis limits; pair with
#             set_style("ticks") for ticks-only outside
#             the plot.
# STRENGTHS - rcParams scope makes despining automatic
#             across every figure; trim removes the
#             remaining spine segments past the data
#             range.
# WEAKNESSES- rcParams settings persist for the whole
#             notebook unless wrapped in rc_context.
#
import seaborn as sns
import matplotlib.pyplot as plt

with plt.rc_context({
    "axes.spines.top":   False,
    "axes.spines.right": False,
}):
    sns.set_style("ticks")
    sns.histplot(data=df, x="total_bill", kde=True)
    sns.despine(offset=10, trim=True)        # trim cuts past data range

# Decision rule:
#   one-off plot                  -> sns.despine() at the end
#   notebook house style          -> set_style("ticks") + rcParams in rc_context
#   minimal floating chart        -> despine(left=True, bottom=True)
#   FacetGrid                     -> g.despine(...)
#   gap between spines and data   -> despine(offset=10)
#   trim spine to data range      -> despine(trim=True)
#
# Anti-pattern: calling sns.despine() BEFORE the seaborn plot.
#   despine acts on the current Axes — if you call it before drawing, it operates on
#   nothing (or the previous figure's axes) and your plot keeps all four spines. The
#   correct order is: plot first, despine() last. On a FacetGrid use g.despine() instead
#   of sns.despine() — the global call only touches one panel.
```

## Decision Rule

```text
one-off plot                  -> sns.despine() at the end
notebook house style          -> set_style("ticks") + rcParams in rc_context
minimal floating chart        -> despine(left=True, bottom=True)
FacetGrid                     -> g.despine(...)
gap between spines and data   -> despine(offset=10)
trim spine to data range      -> despine(trim=True)
```

## Anti-Pattern

> [!warning] Anti-pattern
> calling sns.despine() BEFORE the seaborn plot.
>   despine acts on the current Axes — if you call it before drawing, it operates on
>   nothing (or the previous figure's axes) and your plot keeps all four spines. The
>   correct order is: plot first, despine() last. On a FacetGrid use g.despine() instead
>   of sns.despine() — the global call only touches one panel.

## Tips

- Pair `sns.set_style("ticks")` with `sns.despine()` for the cleanest publication-style plots
- `offset=10` adds a small gap between the remaining spines and the plot area — subtle polish
- FacetGrid has its own `g.despine()` method — use it instead of calling `sns.despine()` after
- Removing the left spine hides the y-axis line — useful for dot plots and lollipop charts

## Common Mistake

> [!warning] Not calling `sns.despine()` and wondering why your seaborn plots look heavier than example plots. It is a single-line call that instantly improves the aesthetics.

## Shorthand (Junior → Senior)

**Junior:**
```python
import matplotlib.pyplot as plt
import seaborn as sns
df = sns.load_dataset('tips')
fig, ax = plt.subplots()
```

**Senior:**
```python
sns.set_style('ticks')  # ticks style + despine() = clean publication style
```

## See Also

- [[Sections/seaborn/setup-customization/labels-axes|Axes-level labels (Seaborn)]]
- [[Sections/seaborn/setup-customization/labels-figure|Figure-level labels (Seaborn)]]
- [[Sections/seaborn/setup-customization/savefig-seaborn|plt.savefig() (Seaborn)]]
- [[Sections/seaborn/setup-customization/color-palette|sns.color_palette() (Seaborn)]]
- [[Sections/seaborn/setup-customization/_Index|Seaborn → Setup, Customization & Output]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
