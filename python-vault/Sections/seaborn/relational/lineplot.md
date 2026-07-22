---
type: "entry"
domain: "python"
file: "seaborn"
section: "relational"
id: "lineplot"
title: "sns.lineplot()"
category: "Relational"
subtitle: "Aggregates multiple y values per x — shows mean + CI band"
signature_short: "sns.lineplot(data, x=\"x\", y=\"y\", hue=\"group\", errorbar=\"ci\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sns.lineplot()"
  - "lineplot"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/relational"
  - "category/relational"
  - "tier/tiered"
---

# sns.lineplot()

> Aggregates multiple y values per x — shows mean + CI band

## Overview

lineplot() automatically aggregates multiple y values at each x and draws the mean with a 95% CI band. Use errorbar=None to disable the band. Use units= to draw one line per subject without aggregation.

## Signature

```python
sns.lineplot(data, x="x", y="y", hue="group", errorbar="ci")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - x and y from long-form data. lineplot
#             auto-aggregates duplicate x values into
#             mean + 95% CI band.
# STRENGTHS - CI band is automatic — no manual stats.
# WEAKNESSES- doesn't yet show units/estimator=None for
#             "raw lines per subject" or errorbar=None.
#
import seaborn as sns
fmri = sns.load_dataset("fmri")
sns.lineplot(data=fmri, x="timepoint", y="signal")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday lineplot surface: hue/style
#             for grouping, errorbar choices (CI, SD,
#             None), units= for per-subject lines, and
#             markers for sparse time series.
# STRENGTHS - covers the patterns time-series and
#             repeated-measures analysis use daily.
# WEAKNESSES- doesn't address the auto-aggregation
#             surprise — senior.
#
import seaborn as sns

fmri = sns.load_dataset("fmri")

# Group + style
sns.lineplot(data=fmri, x="timepoint", y="signal",
              hue="region", style="event")

# Error band variants
sns.lineplot(data=fmri, x="timepoint", y="signal",
              errorbar="sd")               # std dev band
sns.lineplot(data=fmri, x="timepoint", y="signal",
              errorbar=None)               # mean only

# One line per subject — no aggregation
sns.lineplot(data=fmri, x="timepoint", y="signal",
              units="subject", estimator=None,
              alpha=0.3, color="steelblue")

# Markers at each x
sns.lineplot(data=fmri, x="timepoint", y="signal",
              hue="region", markers=True, dashes=False)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production lineplot: by default seaborn
#             AGGREGATES duplicate x values into mean+CI;
#             that's surprising for "I just want to
#             connect the dots" use cases. Use
#             estimator=None or a sorted DataFrame to
#             control behavior. Pre-aggregate when CI
#             intervals matter and N is small.
# STRENGTHS - explicit aggregation control eliminates
#             the most common lineplot surprise; pre-
#             aggregating gives you control over the CI
#             method.
# WEAKNESSES- estimator=None disables the CI band; pre-
#             aggregating loses the per-row visual.
#
import seaborn as sns

fmri = sns.load_dataset("fmri")

# 1. Auto-aggregate (default): mean + 95% bootstrap CI
sns.lineplot(data=fmri, x="timepoint", y="signal",
              hue="region", errorbar=("ci", 95),
              n_boot=1000, seed=42)        # reproducible bootstrap

# 2. "Just connect the dots" — no aggregation
df_sorted = fmri.sort_values("timepoint")
sns.lineplot(data=df_sorted.head(50),       # one row per x
              x="timepoint", y="signal",
              estimator=None)               # no aggregation

# 3. Pre-aggregate for explicit CI math
agg = (fmri.groupby(["region", "timepoint"])["signal"]
            .agg(["mean", "std", "count"])
            .reset_index())
agg["se"] = agg["std"] / agg["count"].pow(0.5)
# Now plot agg directly with custom error band (matplotlib)

# Decision rule:
#   long-form data, want mean + CI band   -> lineplot (default)
#   want raw connecting line, no CI       -> estimator=None + sorted data
#   per-subject lines without aggregation -> units= + estimator=None
#   show std-dev band, not bootstrap CI   -> errorbar="sd"
#   suppress band on dense data           -> errorbar=None
#   color-only group encoding             -> hue= with dashes=False
#
# Anti-pattern: passing wide-form / unsorted data to lineplot and expecting "connect the dots".
#   Seaborn aggregates duplicate x values into mean+95% CI by default — the chart you get is
#   NOT a connection of your raw rows. Either sort_values(x) and set estimator=None for a true
#   polyline, or accept the aggregation and check errorbar= matches the band you intend.
#   If you truly want one line per subject, units="subject_id" + estimator=None.
```

## Decision Rule

```text
long-form data, want mean + CI band   -> lineplot (default)
want raw connecting line, no CI       -> estimator=None + sorted data
per-subject lines without aggregation -> units= + estimator=None
show std-dev band, not bootstrap CI   -> errorbar="sd"
suppress band on dense data           -> errorbar=None
color-only group encoding             -> hue= with dashes=False
```

## Anti-Pattern

> [!warning] Anti-pattern
> passing wide-form / unsorted data to lineplot and expecting "connect the dots".
>   Seaborn aggregates duplicate x values into mean+95% CI by default — the chart you get is
>   NOT a connection of your raw rows. Either sort_values(x) and set estimator=None for a true
>   polyline, or accept the aggregation and check errorbar= matches the band you intend.
>   If you truly want one line per subject, units="subject_id" + estimator=None.

## Tips

- `errorbar=None` turns off aggregation display — just the mean line
- `estimator=None` with `units=` draws one line per unit — no aggregation at all
- `dashes=False` uses color only to distinguish groups (not dashes) — cleaner for colorful plots
- `markers=True` adds a marker at each x position — useful for sparse time series

## Common Mistake

> [!warning] Expecting `lineplot()` to just connect dots in order. It aggregates multiple y values per x by default. Use `estimator=None` and sort your data first to get a simple connecting line.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
fmri = sns.load_dataset('fmri')
```

**Senior:**
```python
hue='region', markers=True, dashes=False)
```

## See Also

- [[Sections/seaborn/relational/scatterplot|sns.scatterplot() (Seaborn)]]
- [[Sections/seaborn/relational/relplot|sns.relplot() (Seaborn)]]
- [[Sections/seaborn/relational/lmplot|sns.lmplot() (Seaborn)]]
- [[Sections/seaborn/relational/_Index|Seaborn → Relational & Regression Plots]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
