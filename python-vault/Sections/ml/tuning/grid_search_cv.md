---
type: "entry"
domain: "python"
file: "ml"
section: "tuning"
id: "grid_search_cv"
title: "GridSearchCV"
category: "Hyperparameter Search"
subtitle: "Brute-force grid search"
signature_short: "GridSearchCV(estimator, param_grid, cv=5, scoring='accuracy')"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "GridSearchCV"
  - "grid_search_cv"
tags:
  - "python"
  - "python/ml"
  - "python/ml/tuning"
  - "category/hyperparameter-search"
  - "tier/tiered"
---

# GridSearchCV

> Brute-force grid search

## Overview

Tests all combinations of hyperparameters in a specified grid with cross-validation, identifying the best parameters but computationally expensive.

## Signature

```python
GridSearchCV(estimator, param_grid, cv=5, scoring='accuracy')
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - exhaustive grid search with CV. fit
#             explores every combination, picks the
#             best by mean CV score.
# STRENGTHS - the simplest "tune the hyperparameters"
#             pattern.
# WEAKNESSES- doesn't yet show Pipeline integration
#             or n_jobs.
#
from sklearn.model_selection import GridSearchCV

grid = GridSearchCV(model, param_grid={"max_depth": [3, 5, 10]},
                     cv=5)
grid.fit(X_train, y_train)
grid.best_params_, grid.best_score_
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday GridSearch surface: tune
#             across a full Pipeline using "step__param"
#             notation, n_jobs=-1 for parallel,
#             refit=True (default) gives you the best
#             model fit on full training data.
# STRENGTHS - Pipeline + GridSearch + step__param is
#             the leakage-proof tuning pattern.
# WEAKNESSES- doesn't address halving / random search
#             for big spaces — senior tier.
#
from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

pipe = Pipeline([
    ("scale", StandardScaler()),
    ("clf",   LogisticRegression(max_iter=1000)),
])

grid = GridSearchCV(
    pipe,
    param_grid={
        "scale__with_mean": [True, False],
        "clf__C":            [0.01, 0.1, 1.0, 10.0],
        "clf__penalty":      ["l1", "l2"],
    },
    cv=5, scoring="f1_weighted",
    n_jobs=-1,                              # parallel
)
grid.fit(X_train, y_train)
print(grid.best_params_)
best_model = grid.best_estimator_           # refit on full train
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production hyperparameter search:
#             GridSearch is fine for <100 combos;
#             switch to RandomizedSearchCV or
#             HalvingGridSearchCV when the space is
#             large. Use cv=Stratified/Group/Time as
#             appropriate. cv_results_ as a DataFrame
#             gives you the full search history.
# STRENGTHS - HalvingGrid is dramatically faster than
#             GridSearch for large spaces;
#             cv_results_ DataFrame is the right tool
#             for "why did the search choose this?"
# WEAKNESSES- HalvingGrid requires sklearn 0.24+ and
#             the experimental import; cv choice
#             depends on data shape (i.i.d. vs
#             grouped vs time series).
#
import pandas as pd
from sklearn.experimental import enable_halving_search_cv  # noqa
from sklearn.model_selection import HalvingGridSearchCV
from sklearn.model_selection import StratifiedKFold

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

# Halving — much faster for big grids
search = HalvingGridSearchCV(
    pipe,
    param_grid={
        "clf__C":            [0.01, 0.1, 1.0, 10.0, 100.0],
        "clf__penalty":      ["l1", "l2"],
        "scale__with_mean":  [True, False],
    },
    cv=cv, scoring="f1_weighted", n_jobs=-1,
    factor=3,                                # eliminate 2/3 of candidates per round
    random_state=42,
)
search.fit(X_train, y_train)

# Inspect the search history
results = pd.DataFrame(search.cv_results_)
results.sort_values("mean_test_score", ascending=False).head(5)

# Decision rule (search size by combos):
#   <= 50 combos                -> GridSearchCV
#   50 .. 1000 combos            -> HalvingGridSearchCV (factor=3)
#   1000+, distributions of params -> RandomizedSearchCV (n_iter=)
#
# Decision rule:
#   <= 50 combos, exhaustive needed   -> GridSearchCV
#   50..1000 combos                   -> HalvingGridSearchCV(factor=3)
#   continuous / huge space           -> RandomizedSearchCV(n_iter=50)
#   sample-efficient, costly fits     -> Optuna / scikit-optimize (Bayesian)
#   data has groups                   -> cv=GroupKFold(...) + groups=
#   forecasting / time series         -> cv=TimeSeriesSplit
#   need both train and val scores    -> return_train_score=True
#
# Anti-pattern: tuning a model that includes preprocessing fitted outside CV
#   GridSearchCV refits whatever you pass to it per fold, so a scaler
#   sitting OUTSIDE leaks the validation distribution into the training
#   features. Always pass a Pipeline. Also: tuning on all of X then
#   evaluating on the same X gives a pointlessly inflated score — keep
#   a held-out test set the search never touches.
```

## Decision Rule

```text
<= 50 combos, exhaustive needed   -> GridSearchCV
50..1000 combos                   -> HalvingGridSearchCV(factor=3)
continuous / huge space           -> RandomizedSearchCV(n_iter=50)
sample-efficient, costly fits     -> Optuna / scikit-optimize (Bayesian)
data has groups                   -> cv=GroupKFold(...) + groups=
forecasting / time series         -> cv=TimeSeriesSplit
need both train and val scores    -> return_train_score=True
```

## Anti-Pattern

> [!warning] Anti-pattern
> tuning a model that includes preprocessing fitted outside CV
>   GridSearchCV refits whatever you pass to it per fold, so a scaler
>   sitting OUTSIDE leaks the validation distribution into the training
>   features. Always pass a Pipeline. Also: tuning on all of X then
>   evaluating on the same X gives a pointlessly inflated score — keep
>   a held-out test set the search never touches.

## Tips

- Use n_jobs=-1 for parallel computation on all cores
- Start with coarse grid, refine around best values
- Set cv=10 for smaller datasets, cv=5 for larger

## Common Mistake

> [!warning] Searching too broad parameter space; narrows to reasonable ranges first.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = []
for x in items:
    if x > 0:
        result.append(x)
```

**Senior:**
```python
result = [x for x in items if x > 0]
```

## See Also

- [[Sections/ml/tuning/randomized_search_cv|RandomizedSearchCV (Machine Learning)]]
- [[Sections/ml/tuning/validation_curve|validation_curve (Machine Learning)]]
- [[Sections/ml/tuning/_Index|Machine Learning → Hyperparameter Tuning]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
