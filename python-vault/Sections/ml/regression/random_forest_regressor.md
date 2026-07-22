---
type: "entry"
domain: "python"
file: "ml"
section: "regression"
id: "random_forest_regressor"
title: "RandomForestRegressor"
category: "Ensemble Models"
subtitle: "Robust tree ensemble"
signature_short: "RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "RandomForestRegressor"
  - "random_forest_regressor"
tags:
  - "python"
  - "python/ml"
  - "python/ml/regression"
  - "category/ensemble-models"
  - "tier/tiered"
---

# RandomForestRegressor

> Robust tree ensemble

## Overview

Combines multiple decision trees with bootstrap sampling, reducing variance and overfitting while maintaining interpretability through feature importance.

## Signature

```python
RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - 100 trees, sane defaults. No scaling.
# STRENGTHS - the strongest "default" tabular regressor.
# WEAKNESSES- doesn't yet show n_jobs, OOB, or
#             permutation importance.
#
from sklearn.ensemble import RandomForestRegressor

reg = RandomForestRegressor(n_estimators=100, random_state=42)
reg.fit(X_train, y_train)
reg.score(X_test, y_test)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday RFR levers: n_jobs=-1,
#             min_samples_leaf for regularization,
#             oob_score=True, max_features="sqrt"
#             (default is 1.0 for regression — change it).
# STRENGTHS - the max_features change is the single
#             biggest gain over RF defaults for
#             regression.
# WEAKNESSES- doesn't address quantile regression
#             forests or HistGBM — senior tier.
#
from sklearn.ensemble import RandomForestRegressor

reg = RandomForestRegressor(
    n_estimators=300,
    max_features="sqrt",                     # default 1.0 for regr — switch
    min_samples_leaf=5,
    n_jobs=-1,
    oob_score=True,
    random_state=42,
)
reg.fit(X_train, y_train)
print(f"OOB R^2: {reg.oob_score_:.3f}")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production RFR: HistGradientBoostingRegressor
#             usually wins on accuracy; keep RF when
#             you need quantile predictions
#             (RandomForestQuantileRegressor) or stable
#             feature importances.
# STRENGTHS - HistGBM > RF on raw accuracy is the most
#             empirically-supported claim in tabular ML;
#             the quantile variant gives prediction
#             intervals.
# WEAKNESSES- HistGBM has more hyperparameters; quantile
#             RF is in scikit-learn-quantile-forest, not
#             core sklearn.
#
from sklearn.ensemble import (
    RandomForestRegressor, HistGradientBoostingRegressor)

# Strongest sklearn tabular regressor
hgb = HistGradientBoostingRegressor(
    max_iter=500,
    learning_rate=0.05,
    max_leaf_nodes=31,
    min_samples_leaf=20,
    early_stopping=True,
    random_state=42,
).fit(X_train, y_train)

# Keep RF when prediction intervals matter
# from sklearn_quantile import RandomForestQuantileRegressor
# qrf = RandomForestQuantileRegressor(q=[0.05, 0.5, 0.95], n_estimators=300)
# qrf.fit(X_train, y_train)
# preds = qrf.predict(X_test)            # shape (n, 3)

# Decision rule (tabular regression, in order):
#   1. HistGradientBoostingRegressor    (sklearn, fast, strong)
#   2. LightGBM / XGBoost                (slightly better, more tuning)
#   3. RandomForestRegressor              (no tuning, decent baseline)
#   4. quantile RF                        (when uncertainty matters)
#
# Decision rule:
#   any tabular regression baseline      -> RandomForestRegressor (n_estimators=300)
#   need top accuracy                    -> HistGBM, LightGBM, or XGBoost
#   need prediction intervals            -> quantile_forest / NGBoost
#   memory-tight                         -> HistGBM (binned histograms)
#   honest feature impact                -> permutation_importance on test
#   target with long tail / outliers     -> log-transform y first, or HuberLoss
#   small N (< 1k)                       -> Ridge / SVR may beat trees
#
# Anti-pattern: extrapolating outside the training range with RF
#   Trees split on training quantiles — predictions on x values larger
#   than any training row are clamped at the largest leaf mean. The
#   model "flatlines" on extrapolation. If extrapolation matters, choose
#   a linear model or add a linear residual on top of the forest.
```

## Decision Rule

```text
any tabular regression baseline      -> RandomForestRegressor (n_estimators=300)
need top accuracy                    -> HistGBM, LightGBM, or XGBoost
need prediction intervals            -> quantile_forest / NGBoost
memory-tight                         -> HistGBM (binned histograms)
honest feature impact                -> permutation_importance on test
target with long tail / outliers     -> log-transform y first, or HuberLoss
small N (< 1k)                       -> Ridge / SVR may beat trees
```

## Anti-Pattern

> [!warning] Anti-pattern
> extrapolating outside the training range with RF
>   Trees split on training quantiles — predictions on x values larger
>   than any training row are clamped at the largest leaf mean. The
>   model "flatlines" on extrapolation. If extrapolation matters, choose
>   a linear model or add a linear residual on top of the forest.

## Tips

- Increase n_estimators for better generalization; diminishing returns after 100
- Feature importances show which variables drive predictions
- Set n_jobs=-1 for parallel training on multi-core systems

## Common Mistake

> [!warning] Using too few trees (n_estimators=10) for unstable predictions.

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

- [[Sections/ml/classification/random_forest_classifier|RandomForestClassifier (Machine Learning)]]
- [[Sections/ml/regression/_Index|Machine Learning → Regression Models]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
