---
type: "entry"
domain: "python"
file: "seaborn"
section: "relational"
id: "regplot"
title: "sns.regplot()"
category: "Regression"
subtitle: "Axes-level regression visualization with optional polynomial or lowess fit"
signature_short: "sns.regplot(data, x=\"x\", y=\"y\", order=1, logistic=False)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sns.regplot()"
  - "regplot"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/relational"
  - "category/regression"
  - "tier/tiered"
---

# sns.regplot()

> Axes-level regression visualization with optional polynomial or lowess fit

## Overview

regplot() draws a scatter plot and fits a regression line with a 95% CI band. order= for polynomial regression, logistic=True for logistic regression (binary y), lowess=True for non-parametric smoothing.

## Signature

```python
sns.regplot(data, x="x", y="y", order=1, logistic=False)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - scatter + linear regression line + 95% CI
#             band in one call.
# STRENGTHS - the cleanest possible "is there a linear
#             relationship?" diagnostic.
# WEAKNESSES- doesn't yet show order=, logistic, or
#             lowess for non-linear fits.
#
import seaborn as sns
df = sns.load_dataset("tips")
sns.regplot(data=df, x="total_bill", y="tip")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday regplot surface: order= for
#             polynomials, logistic= for binary y,
#             lowess= for non-parametric smoothing,
#             scatter_kws/line_kws to style the parts.
# STRENGTHS - the four kinds of fit cover most diagnostic
#             needs; logistic regplot is the cleanest
#             visualization of binary outcomes.
# WEAKNESSES- doesn't address ci=None for large N or the
#             "use lmplot for facets" rule — senior tier.
#
import seaborn as sns

df = sns.load_dataset("tips")

# Linear with style controls
sns.regplot(data=df, x="total_bill", y="tip",
             scatter_kws={"alpha": 0.4, "s": 20},
             line_kws={"color": "red", "linewidth": 2})

# Polynomial fit
sns.regplot(data=df, x="total_bill", y="tip", order=2)

# Logistic regression (binary y, with jitter for visibility)
df["big_tip"] = (df["tip"] / df["total_bill"] > 0.2).astype(int)
sns.regplot(data=df, x="total_bill", y="big_tip",
             logistic=True, y_jitter=0.03)

# Non-parametric LOWESS smoother
sns.regplot(data=df, x="total_bill", y="tip",
             lowess=True, line_kws={"color": "red"})
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production regplot: ALWAYS check
#             residuals (residplot) before trusting a
#             linear fit; ci=None at large N (band gets
#             unreadably narrow); pair with statsmodels
#             when you need actual coefficients.
# STRENGTHS - the regplot+residplot pair is the visual
#             diagnostic; statsmodels gives the numeric
#             story regplot suggests.
# WEAKNESSES- regplot doesn't expose coefficients —
#             you need statsmodels.OLS for that;
#             residual checks add a second chart.
#
import seaborn as sns
import matplotlib.pyplot as plt
import statsmodels.formula.api as smf

df = sns.load_dataset("tips")

# Visual diagnostic side-by-side
fig, axes = plt.subplots(1, 2, figsize=(12, 4),
                          layout="constrained")
sns.regplot(data=df, x="total_bill", y="tip",
             ax=axes[0])
sns.residplot(data=df, x="total_bill", y="tip",
                lowess=True,
                line_kws={"color": "red"},
                ax=axes[1])
axes[1].axhline(0, color="black", linewidth=0.5)

# Numeric backing — coefficients, p-values, R^2
fit = smf.ols("tip ~ total_bill", data=df).fit()
print(fit.summary())

# Decision rule:
#   single panel, linear               -> regplot (default)
#   curved relationship                -> regplot(order=2) OR lowess=True
#   binary y                           -> regplot(logistic=True)
#   need facets per group              -> lmplot
#   need actual coefficients/p-values  -> statsmodels.OLS
#   too many points, narrow band       -> ci=None
#   style scatter and line separately  -> scatter_kws=, line_kws=
#
# Anti-pattern: trusting the regplot line+CI band without ever looking at residuals.
#   regplot fits a model and draws a line — it cannot tell you if the linear assumption
#   is correct. Curved residuals mean the line is the wrong shape; fan-shaped residuals
#   mean heteroscedasticity invalidates the CI. ALWAYS pair regplot with residplot(lowess=True);
#   if the residual lowess line is not flat at zero, switch to order=2 / lowess=True / log(y).
```

## Decision Rule

```text
single panel, linear               -> regplot (default)
curved relationship                -> regplot(order=2) OR lowess=True
binary y                           -> regplot(logistic=True)
need facets per group              -> lmplot
need actual coefficients/p-values  -> statsmodels.OLS
too many points, narrow band       -> ci=None
style scatter and line separately  -> scatter_kws=, line_kws=
```

## Anti-Pattern

> [!warning] Anti-pattern
> trusting the regplot line+CI band without ever looking at residuals.
>   regplot fits a model and draws a line — it cannot tell you if the linear assumption
>   is correct. Curved residuals mean the line is the wrong shape; fan-shaped residuals
>   mean heteroscedasticity invalidates the CI. ALWAYS pair regplot with residplot(lowess=True);
>   if the residual lowess line is not flat at zero, switch to order=2 / lowess=True / log(y).

## Tips

- `ci=None` disables the confidence band — useful when n is large and the band is very narrow
- `lowess=True` reveals non-linear relationships without assuming a functional form
- `order=2` fits a quadratic — check if the curve is meaningfully better before using it
- Use `sns.lmplot()` (figure-level) for the same plot with `col=` and `row=` faceting

## Common Mistake

> [!warning] Interpreting the CI band as a prediction interval. It is the **confidence interval for the regression line** — uncertainty in the mean, not the range for individual observations.

## Shorthand (Junior → Senior)

**Junior:**
```python
import matplotlib.pyplot as plt
import seaborn as sns
df = sns.load_dataset('tips')
sns.regplot(data=df, x='total_bill', y='tip',
```

**Senior:**
```python
scatter=False)
```

## See Also

- [[Sections/seaborn/relational/residplot|sns.residplot() (Seaborn)]]
- [[Sections/seaborn/relational/_Index|Seaborn → Relational & Regression Plots]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
