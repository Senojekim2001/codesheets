---
type: "entry"
domain: "python"
file: "ml"
section: "regression"
id: "decision_tree_regressor"
title: "DecisionTreeRegressor"
category: "Tree Models"
subtitle: "Hierarchical regression rules"
signature_short: "DecisionTreeRegressor(max_depth=5, random_state=42)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "DecisionTreeRegressor"
  - "decision_tree_regressor"
tags:
  - "python"
  - "python/ml"
  - "python/ml/regression"
  - "category/tree-models"
  - "tier/tiered"
---

# DecisionTreeRegressor

> Hierarchical regression rules

## Overview

Recursively partitions feature space to minimize mean squared error, providing non-linear relationships without feature scaling requirements.

## Signature

```python
DecisionTreeRegressor(max_depth=5, random_state=42)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - tree regression splits feature space to
#             minimize MSE. No scaling needed.
# STRENGTHS - non-linear, no preprocessing.
# WEAKNESSES- single tree predicts piecewise constants
#             — a step function, not a curve.
#
from sklearn.tree import DecisionTreeRegressor

reg = DecisionTreeRegressor(max_depth=3, random_state=42)
reg.fit(X_train, y_train)
reg.score(X_test, y_test)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday tree-regressor controls:
#             max_depth + min_samples_leaf to curb
#             overfitting; criterion="absolute_error"
#             for outlier-robust splits.
# STRENGTHS - the regularization controls match the
#             classifier; absolute_error is the easy
#             outlier defense.
# WEAKNESSES- still piecewise-constant; for smooth
#             relationships, RandomForest / GBM are
#             better — senior tier.
#
from sklearn.tree import DecisionTreeRegressor

reg = DecisionTreeRegressor(
    max_depth=8,
    min_samples_leaf=10,
    criterion="absolute_error",            # robust to outliers in y
    random_state=42,
)
reg.fit(X_train, y_train)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production rule: a single tree regressor
#             is rarely the best predictor — it produces
#             step-function predictions. Use it for
#             explanation only, then ensemble for
#             prediction. Cost-complexity pruning
#             (ccp_alpha) for principled size control.
# STRENGTHS - the "tree for explanation, ensemble for
#             prediction" rule is the same in regression
#             as classification.
# WEAKNESSES- step-function predictions can be
#             genuinely useful in some domains (e.g.,
#             monotonic step responses) — don't ensemble
#             reflexively.
#
from sklearn.tree import DecisionTreeRegressor
from sklearn.model_selection import GridSearchCV

grid = GridSearchCV(
    DecisionTreeRegressor(random_state=42),
    param_grid={
        "ccp_alpha":         [0.0, 0.001, 0.01],
        "max_depth":         [None, 6, 12],
        "min_samples_leaf":  [1, 5, 20],
    },
    cv=5, scoring="neg_mean_squared_error",
)
grid.fit(X_train, y_train)

# Decision rule (regression):
#   single, interpretable predictor    -> small DecisionTreeRegressor
#   smooth predictions on tabular       -> RandomForest / HistGBM
#   genuinely step-function targets     -> single tree may be RIGHT
#
# Decision rule:
#   need an interpretable model         -> DecisionTreeRegressor (max_depth<=5)
#   need accurate, smooth predictions   -> RandomForestRegressor or HistGBM
#   step-function ground truth          -> single tree is the right shape
#   monotonic constraint                -> HistGBM(monotonic_cst=...)
#   regularize complexity               -> ccp_alpha tuned in CV
#   predicting beyond train range       -> linear model, NOT trees (extrapolate)
#
# Anti-pattern: using a single deep tree for production scoring
#   max_depth=None overfits, MSE on test stays high, and predictions are
#   piecewise-constant (no smoothing). The fix is almost always an
#   ensemble: RandomForestRegressor or HistGradientBoostingRegressor;
#   keep the single tree only as an interpretable explanation surface.
```

## Decision Rule

```text
need an interpretable model         -> DecisionTreeRegressor (max_depth<=5)
need accurate, smooth predictions   -> RandomForestRegressor or HistGBM
step-function ground truth          -> single tree is the right shape
monotonic constraint                -> HistGBM(monotonic_cst=...)
regularize complexity               -> ccp_alpha tuned in CV
predicting beyond train range       -> linear model, NOT trees (extrapolate)
```

## Anti-Pattern

> [!warning] Anti-pattern
> using a single deep tree for production scoring
>   max_depth=None overfits, MSE on test stays high, and predictions are
>   piecewise-constant (no smoothing). The fix is almost always an
>   ensemble: RandomForestRegressor or HistGradientBoostingRegressor;
>   keep the single tree only as an interpretable explanation surface.

## Tips

- Limit max_depth to prevent overfitting; typical range 3-5
- Use min_samples_leaf to ensure minimum samples per leaf node
- No scaling required; handles non-linear relationships naturally

## Common Mistake

> [!warning] Using unlimited depth without validation; leads to overfitting.

## Shorthand (Junior → Senior)

**Junior:**
```python
from sklearn.tree import DecisionTreeRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np
```

**Senior:**
```python
print(f'Feature importances: {model.feature_importances_}')
```

## See Also

- [[Sections/ml/classification/decision_tree_classifier|DecisionTreeClassifier (Machine Learning)]]
- [[Sections/ml/regression/_Index|Machine Learning → Regression Models]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
