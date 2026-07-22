---
type: "entry"
domain: "python"
file: "matplotlib"
section: "chart-types"
id: "hist"
title: "ax.hist()"
category: "Charts"
subtitle: "Visualize the distribution of a dataset"
signature_short: "ax.hist(data, bins=10, **kwargs)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "ax.hist()"
  - "hist"
tags:
  - "python"
  - "python/matplotlib"
  - "python/matplotlib/chart-types"
  - "category/charts"
  - "tier/tiered"
---

# ax.hist()

> Visualize the distribution of a dataset

## Overview

hist() plots the frequency distribution of data. bins controls the number of bars. Use density=True for probability density. Multiple histograms can be overlaid with alpha for transparency.

## Signature

```python
ax.hist(data, bins=10, **kwargs)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - one ax.hist call with bins=30. Shows the
#             distribution shape immediately.
# STRENGTHS - smallest possible "look at the data"
#             diagnostic.
# WEAKNESSES- doesn't yet show density=, overlapping
#             histograms, or bin-edge control.
#
import numpy as np, matplotlib.pyplot as plt

data = np.random.randn(1000)
fig, ax = plt.subplots()
ax.hist(data, bins=30, edgecolor="white")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday histogram options: density=True
#             for probability mass, overlapping histograms
#             with alpha for group comparison, custom bin
#             edges, cumulative form.
# STRENGTHS - covers the patterns that actual EDA uses;
#             alpha + label + legend = clean two-group
#             comparison.
# WEAKNESSES- doesn't address bin-count selection rules
#             (Sturges, Freedman-Diaconis) or KDE overlay —
#             senior tier.
#
import numpy as np, matplotlib.pyplot as plt

a = np.random.randn(1000)
b = np.random.randn(1000) * 1.5 + 1

fig, ax = plt.subplots()
ax.hist(a, bins=30, density=True, alpha=0.6, label="A")
ax.hist(b, bins=30, density=True, alpha=0.6, label="B")
ax.legend()
ax.set_xlabel("value"); ax.set_ylabel("density")

# Custom bin edges
# ax.hist(a, bins=np.linspace(-4, 4, 30))
# Cumulative form
# ax.hist(a, bins=50, cumulative=True, density=True)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production histograms: pick bins via a rule
#             ("auto" / "fd" / "sturges"), overlay a KDE for
#             smooth distribution shape, share x-limits
#             across subplots for fair comparison, and
#             switch to violin/box for compact multi-group
#             distributions.
# STRENGTHS - bins="auto" picks a reasonable rule; KDE
#             overlay makes shape obvious; shared x-limits
#             prevent visual misreads.
# WEAKNESSES- KDE smoothing has its own bandwidth choice;
#             violin plots are denser to read; "auto" can
#             pick too few bins on heavily skewed data.
#
import numpy as np, matplotlib.pyplot as plt
from scipy.stats import gaussian_kde

a = np.random.randn(1000)
b = np.random.randn(1000) * 1.5 + 1

fig, axes = plt.subplots(1, 2, figsize=(10, 4),
                         sharex=True, sharey=True,
                         layout="constrained")

for ax, data, name in zip(axes, [a, b], ["A", "B"]):
    ax.hist(data, bins="auto", density=True, alpha=0.6,
             edgecolor="white", label=f"{name} hist")
    xs = np.linspace(data.min(), data.max(), 200)
    ax.plot(xs, gaussian_kde(data)(xs), linewidth=2,
             label=f"{name} KDE")
    ax.legend(); ax.set_title(name)

# Decision rule:
#   single distribution shape           -> hist (bins="auto")
#   compare 2 groups                    -> overlapping hist + KDE
#   compare many groups                 -> violinplot or boxplot
#   long-tailed / log-scale data        -> set xscale="log" or log-bin
#   want probability density            -> density=True (NOT raw counts)
#   need 2-D distribution               -> hist2d or hexbin
#   distribution + summary in one       -> seaborn histplot/displot
#
# Anti-pattern: comparing two histograms drawn at different bin counts or ranges.
#   Calling ax.hist(a, bins=20) then ax.hist(b, bins=50) makes the bars different widths,
#   so apparent "tallness" reflects bin width as much as data. Always pin shared bin edges
#   (bins=np.linspace(lo, hi, k)) when comparing groups, and density=True if sample sizes
#   differ.
```

## Decision Rule

```text
single distribution shape           -> hist (bins="auto")
compare 2 groups                    -> overlapping hist + KDE
compare many groups                 -> violinplot or boxplot
long-tailed / log-scale data        -> set xscale="log" or log-bin
want probability density            -> density=True (NOT raw counts)
need 2-D distribution               -> hist2d or hexbin
distribution + summary in one       -> seaborn histplot/displot
```

## Anti-Pattern

> [!warning] Anti-pattern
> comparing two histograms drawn at different bin counts or ranges.
>   Calling ax.hist(a, bins=20) then ax.hist(b, bins=50) makes the bars different widths,
>   so apparent "tallness" reflects bin width as much as data. Always pin shared bin edges
>   (bins=np.linspace(lo, hi, k)) when comparing groups, and density=True if sample sizes
>   differ.

## Tips

- bins="auto" lets matplotlib choose — often a good starting point
- alpha=0.6 on overlapping histograms makes both visible
- density=True gives probability density (area sums to 1), not raw counts
- For comparing distributions, consider violin plots or KDE plots (seaborn)

## Common Mistake

> [!warning] Using too few or too many bins. Too few: hides the shape. Too many: looks noisy. Start with bins=30 and adjust visually.

## Shorthand (Junior → Senior)

**Junior:**
```python
import numpy as np
import matplotlib.pyplot as plt
data = np.random.randn(1000)
ax.hist(data, bins=30, color="steelblue", edgecolor="white")
```

**Senior:**
```python
counts, edges, patches = ax.hist(data, bins=20)
```

## See Also

- [[Sections/matplotlib/chart-types/line|ax.plot() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/bar|ax.bar() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/barh|ax.barh() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/scatter|ax.scatter() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/_Index|Matplotlib → Chart Types]]
- [[Sections/matplotlib/_Index|Matplotlib index]]
- [[_Index|Vault index]]
