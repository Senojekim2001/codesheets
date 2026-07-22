---
type: "entry"
domain: "python"
file: "seaborn"
section: "relational"
id: "lmplot"
title: "sns.lmplot()"
category: "Relational"
subtitle: "Figure-level regplot — adds col=, row=, and hue= grouping"
signature_short: "sns.lmplot(data, x=\"x\", y=\"y\", hue=\"group\", col=\"facet\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sns.lmplot()"
  - "lmplot"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/relational"
  - "category/relational"
  - "tier/tiered"
---

# sns.lmplot()

> Figure-level regplot — adds col=, row=, and hue= grouping

## Overview

lmplot() is the figure-level version of regplot. It adds hue= grouping (separate regression lines per group) and col=/row= faceting. Returns a FacetGrid.

## Signature

```python
sns.lmplot(data, x="x", y="y", hue="group", col="facet")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - figure-level regression. hue= draws a
#             separate fitted line per group.
# STRENGTHS - one call, one chart per group with
#             grouped regression.
# WEAKNESSES- doesn't yet show col=/row= faceting or
#             scatter=False for line-only comparison.
#
import seaborn as sns
df = sns.load_dataset("tips")
sns.lmplot(data=df, x="total_bill", y="tip", hue="sex")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday lmplot recipe: hue= for
#             grouped lines, col=/row= for faceting,
#             scatter=False for line-only group
#             comparison, order= for polynomial fits.
# STRENGTHS - the standard "do groups have different
#             slopes?" visualization.
# WEAKNESSES- doesn't address figure-level vs axes-level
#             distinction or robust regression — senior.
#
import seaborn as sns

df = sns.load_dataset("tips")

# Grouped lines + faceted
g = sns.lmplot(data=df, x="total_bill", y="tip",
                col="time", hue="sex",
                height=5, aspect=0.9)
g.set_axis_labels("Total Bill ($)", "Tip ($)")

# Slope comparison without scatter clutter
sns.lmplot(data=df, x="total_bill", y="tip",
            hue="sex", scatter=False)

# Polynomial fit per group
sns.lmplot(data=df, x="total_bill", y="tip",
            hue="sex", order=2)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production lmplot: figure-level OWNS the
#             figure (no ax=); use robust=True to
#             down-weight outliers, ci=None at large N,
#             and pair with statsmodels when you need
#             interaction coefficients (group * x).
# STRENGTHS - robust=True handles outlier-heavy data
#             that ordinary regression bends to;
#             statsmodels gives the actual interaction
#             test that lmplot suggests visually.
# WEAKNESSES- robust= is slower; ci=None loses the
#             uncertainty info; statsmodels is a
#             separate dep.
#
import seaborn as sns
import statsmodels.formula.api as smf

df = sns.load_dataset("tips")

# Robust regression — resistant to outliers
g = sns.lmplot(data=df, x="total_bill", y="tip",
                hue="sex",
                robust=True,                  # iteratively reweighted
                ci=None,                       # cleaner with many points
                height=5, aspect=1.0)

# Numeric: do slopes actually differ across groups?
fit = smf.ols("tip ~ total_bill * sex", data=df).fit()
print(fit.params)                              # interaction coefficient

# Decision rule:
#   single panel, line + scatter        -> regplot
#   grouped lines, no facets            -> lmplot(hue=)
#   facets across categories            -> lmplot(col=, hue=)
#   outlier-heavy data                  -> lmplot(robust=True)
#   need to TEST slope differences      -> statsmodels with interaction term
#   compare slopes only, no points      -> lmplot(scatter=False)
#   curved within group                 -> lmplot(order=2)
#
# Anti-pattern: showing four lmplot panels with visibly different slopes and concluding
# "groups have different slopes" without a statistical test.
#   The CI bands often overlap once you actually look at the numbers — the visual is
#   suggestive, not conclusive. The right pipeline is: lmplot for the picture, then
#   smf.ols("y ~ x * group", data=df) and inspect the interaction coefficient + p-value.
#   robust=True helps if outliers are bending the OLS slope.
```

## Decision Rule

```text
single panel, line + scatter        -> regplot
grouped lines, no facets            -> lmplot(hue=)
facets across categories            -> lmplot(col=, hue=)
outlier-heavy data                  -> lmplot(robust=True)
need to TEST slope differences      -> statsmodels with interaction term
compare slopes only, no points      -> lmplot(scatter=False)
curved within group                 -> lmplot(order=2)
```

## Anti-Pattern

> [!warning] Anti-pattern
> showing four lmplot panels with visibly different slopes and concluding
> "groups have different slopes" without a statistical test.
>   The CI bands often overlap once you actually look at the numbers — the visual is
>   suggestive, not conclusive. The right pipeline is: lmplot for the picture, then
>   smf.ols("y ~ x * group", data=df) and inspect the interaction coefficient + p-value.
>   robust=True helps if outliers are bending the OLS slope.

## Tips

- `hue=` draws a separate regression line per group — the most common use case for lmplot
- `scatter=False` shows only the regression lines — cleaner for comparing slopes across groups
- Customize using `g.set_axis_labels()`, `g.set_titles()`, `g.figure.suptitle()`
- For a single panel without faceting, `sns.regplot()` (axes-level) is simpler

## Common Mistake

> [!warning] Using lmplot inside `plt.subplots()`. lmplot creates its own Figure — it cannot be placed in an existing Axes. Use `sns.regplot()` for subplot layouts.

## Shorthand (Junior → Senior)

**Junior:**
```python
import matplotlib.pyplot as plt
import seaborn as sns
df = sns.load_dataset('tips')
sns.lmplot(data=df, x='total_bill', y='tip',
```

**Senior:**
```python
order=2)
```

## See Also

- [[Sections/seaborn/relational/scatterplot|sns.scatterplot() (Seaborn)]]
- [[Sections/seaborn/relational/lineplot|sns.lineplot() (Seaborn)]]
- [[Sections/seaborn/relational/relplot|sns.relplot() (Seaborn)]]
- [[Sections/seaborn/relational/_Index|Seaborn → Relational & Regression Plots]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
