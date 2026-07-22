---
type: "entry"
domain: "python"
file: "seaborn"
section: "relational"
id: "residplot"
title: "sns.residplot()"
category: "Regression"
subtitle: "Diagnose non-linearity — residuals should scatter randomly around 0"
signature_short: "sns.residplot(data, x=\"x\", y=\"y\", lowess=True)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sns.residplot()"
  - "residplot"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/relational"
  - "category/regression"
  - "tier/tiered"
---

# sns.residplot()

> Diagnose non-linearity — residuals should scatter randomly around 0

## Overview

residplot() plots the residuals (actual - predicted) against the predictor variable. Residuals that scatter randomly around y=0 indicate a good linear fit. Curved patterns indicate non-linearity — the linear model is misspecified.

## Signature

```python
sns.residplot(data, x="x", y="y", lowess=True)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - residuals (actual - predicted) vs the
#             predictor. Expect random scatter around 0.
# STRENGTHS - the simplest "is my linear fit any good?"
#             diagnostic.
# WEAKNESSES- doesn't yet show the lowess overlay or
#             interpretation rules.
#
import seaborn as sns
df = sns.load_dataset("tips")
sns.residplot(data=df, x="total_bill", y="tip")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday residplot recipe: lowess
#             smoother to reveal systematic patterns,
#             reference line at y=0, interpretation
#             rules for the four canonical patterns.
# STRENGTHS - the lowess overlay turns "looks random?"
#             into a binary visual answer.
# WEAKNESSES- doesn't address residual normality
#             checks (Q-Q plots) or heteroscedasticity
#             — senior tier.
#
import seaborn as sns

df = sns.load_dataset("tips")

ax = sns.residplot(data=df, x="total_bill", y="tip",
                    lowess=True,
                    line_kws={"color": "red", "linewidth": 2})
ax.axhline(0, color="black", linewidth=0.5)

# Pattern interpretation:
# - flat horizontal scatter -> linear model is fine
# - U-shape / curve          -> non-linear; try polynomial or log(x)
# - fan shape (widening)     -> heteroscedasticity; try log(y)
# - outliers far from 0      -> influential observations
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production diagnostics: residplot is ONE
#             of four standard regression diagnostics.
#             Combine with histplot/Q-Q for normality,
#             scale-location for heteroscedasticity, and
#             leverage for influential points. Use
#             statsmodels' built-in plot suite when
#             possible.
# STRENGTHS - the four-plot diagnostic suite is the
#             industry-standard regression check;
#             statsmodels.graphics gives all four with
#             one import.
# WEAKNESSES- four plots crowd a single figure; some
#             teams stop at residplot — fine for
#             exploration, not for publication.
#
import seaborn as sns
import matplotlib.pyplot as plt
import statsmodels.api as sm
import statsmodels.formula.api as smf

df = sns.load_dataset("tips")
fit = smf.ols("tip ~ total_bill", data=df).fit()
df["resid"] = fit.resid

fig, axes = plt.subplots(2, 2, figsize=(11, 8),
                          layout="constrained")

# 1. Residuals vs fitted
sns.residplot(data=df, x="total_bill", y="tip",
                lowess=True, ax=axes[0, 0],
                line_kws={"color": "red"})
axes[0, 0].axhline(0, color="black", linewidth=0.5)
axes[0, 0].set_title("Residuals vs predictor")

# 2. Histogram of residuals
sns.histplot(df["resid"], kde=True, ax=axes[0, 1])
axes[0, 1].set_title("Residual distribution")

# 3. Q-Q plot (normality)
sm.qqplot(fit.resid, line="45", ax=axes[1, 0])
axes[1, 0].set_title("Q-Q plot")

# 4. Scale-location for heteroscedasticity
sns.scatterplot(x=fit.fittedvalues,
                 y=(fit.resid.abs()) ** 0.5,
                 ax=axes[1, 1])
axes[1, 1].set_title("Scale-location")

# Decision rule:
#   quick "is linear OK?" check          -> sns.residplot(lowess=True)
#   curved lowess line                   -> add polynomial term or log(x)
#   fan-shaped residuals                 -> log(y) or weighted regression
#   normality check on residuals         -> histplot(kde=True) + sm.qqplot
#   full diagnostic suite                -> statsmodels.graphics.regressionplots
#   non-parametric alt to residuals      -> regplot(lowess=True) overlay
#
# Anti-pattern: skipping residplot after sns.regplot and reporting an R^2 from a clearly
# misspecified linear fit.
#   regplot will happily fit a line through quadratic data; the R^2 looks decent but
#   residuals show the curve. Without residplot you'll publish "y is linearly related to x"
#   when the true model is order=2 or log(x). The residual lowess line should be flat at
#   y=0 with constant spread — anything else means "the model is wrong, transform something".
```

## Decision Rule

```text
quick "is linear OK?" check          -> sns.residplot(lowess=True)
curved lowess line                   -> add polynomial term or log(x)
fan-shaped residuals                 -> log(y) or weighted regression
normality check on residuals         -> histplot(kde=True) + sm.qqplot
full diagnostic suite                -> statsmodels.graphics.regressionplots
non-parametric alt to residuals      -> regplot(lowess=True) overlay
```

## Anti-Pattern

> [!warning] Anti-pattern
> skipping residplot after sns.regplot and reporting an R^2 from a clearly
> misspecified linear fit.
>   regplot will happily fit a line through quadratic data; the R^2 looks decent but
>   residuals show the curve. Without residplot you'll publish "y is linearly related to x"
>   when the true model is order=2 or log(x). The residual lowess line should be flat at
>   y=0 with constant spread — anything else means "the model is wrong, transform something".

## Tips

- `lowess=True` adds a smoother — the red line reveals systematic patterns in the residuals
- A straight horizontal lowess line through 0 confirms the linear assumption is valid
- Fan-shaped residuals (increasing spread with x) suggest `log(y)` transformation
- Pair residplot with histplot of residuals to check the normality assumption

## Common Mistake

> [!warning] Not checking residuals after fitting a linear model. A curved residual pattern means the linear model is wrong — the relationship requires a transformation or polynomial term.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = {}
for k, v in pairs:
    result[k] = v
```

**Senior:**
```python
result = {k: v for k, v in pairs}
```

## See Also

- [[Sections/seaborn/relational/regplot|sns.regplot() (Seaborn)]]
- [[Sections/seaborn/relational/_Index|Seaborn → Relational & Regression Plots]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
