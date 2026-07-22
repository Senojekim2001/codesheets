---
type: "entry"
domain: "python"
file: "ml"
section: "evaluation"
id: "cross_val_score"
title: "cross_val_score"
category: "Model Validation"
subtitle: "k-fold CV scoring"
signature_short: "cross_val_score(model, X, y, cv=5, scoring='accuracy')"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "cross_val_score"
tags:
  - "python"
  - "python/ml"
  - "python/ml/evaluation"
  - "category/model-validation"
  - "tier/tiered"
---

# cross_val_score

> k-fold CV scoring

## Overview

Performs k-fold cross-validation to estimate model generalization performance, reducing variance of single train-test split evaluation.

## Signature

```python
cross_val_score(model, X, y, cv=5, scoring='accuracy')
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - 5-fold CV on a model. Returns 5 scores.
# STRENGTHS - one call replaces the train/test loop;
#             gives mean + variance.
# WEAKNESSES- doesn't yet show stratification,
#             scoring choice, or Pipeline integration.
#
from sklearn.model_selection import cross_val_score
scores = cross_val_score(model, X, y, cv=5)
print(f"{scores.mean():.3f} +/- {scores.std():.3f}")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday CV surface: explicit
#             scoring=, stratified KFold for
#             classification, n_jobs= for parallel,
#             cross_validate for multiple metrics at
#             once.
# STRENGTHS - cross_validate (plural metrics) is the
#             cleaner alternative when you want
#             multiple scores at once.
# WEAKNESSES- doesn't address group/time CV — senior.
#
from sklearn.model_selection import (
    cross_val_score, cross_validate, StratifiedKFold)

# Stratified for classification (preserves class balance per fold)
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(model, X, y, cv=cv,
                          scoring="f1_weighted",
                          n_jobs=-1)

# Multiple metrics in one pass
results = cross_validate(model, X, y, cv=cv,
                          scoring=["accuracy", "f1_weighted", "roc_auc"],
                          n_jobs=-1, return_train_score=True)
print(results["test_f1_weighted"].mean())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production CV: pick the splitter that
#             matches your data shape (Stratified for
#             i.i.d. classification, GroupKFold when
#             entities have multiple rows,
#             TimeSeriesSplit for forecasts). Always
#             use a Pipeline so preprocessing refits
#             per fold.
# STRENGTHS - the splitter-by-shape rule prevents the
#             #1 cause of "great CV, terrible
#             production" — leaky CV; Pipeline
#             integration keeps preprocessing honest.
# WEAKNESSES- TimeSeriesSplit gives smaller train sets
#             early; GroupKFold requires a stable
#             group_id; n_jobs=-1 doesn't help if the
#             estimator already parallelizes.
#
from sklearn.model_selection import (
    cross_val_score,
    StratifiedKFold, GroupKFold, TimeSeriesSplit)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

pipe = Pipeline([
    ("scale", StandardScaler()),
    ("clf",   model),
])

# Pick the splitter for your data
cv_iid    = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_group  = GroupKFold(n_splits=5)                    # need groups=
cv_time   = TimeSeriesSplit(n_splits=5)               # always train < test in time

scores = cross_val_score(pipe, X, y, cv=cv_group,
                          groups=df["customer_id"],
                          scoring="roc_auc", n_jobs=-1)

# Decision rule:
#   i.i.d. classification          -> StratifiedKFold
#   one entity has many rows       -> GroupKFold (no leakage)
#   classification + groups        -> StratifiedGroupKFold
#   time series / forecasting      -> TimeSeriesSplit
#   regression, i.i.d.             -> KFold (or just cv=5)
#   tiny dataset (N < 100)         -> LeaveOneOut or KFold(n_splits=10)
#   never                          -> KFold on time-series data
#
# Anti-pattern: cross-validating a model AFTER preprocessing X
#   X_scaled = scaler.fit_transform(X); cross_val_score(model, X_scaled, y)
#   leaks each fold's validation distribution into the scaler. The
#   reported score is biased high. Always pass a Pipeline that contains
#   the scaler so each fold refits preprocessing on its own train slice.
```

## Decision Rule

```text
i.i.d. classification          -> StratifiedKFold
one entity has many rows       -> GroupKFold (no leakage)
classification + groups        -> StratifiedGroupKFold
time series / forecasting      -> TimeSeriesSplit
regression, i.i.d.             -> KFold (or just cv=5)
tiny dataset (N < 100)         -> LeaveOneOut or KFold(n_splits=10)
never                          -> KFold on time-series data
```

## Anti-Pattern

> [!warning] Anti-pattern
> cross-validating a model AFTER preprocessing X
>   X_scaled = scaler.fit_transform(X); cross_val_score(model, X_scaled, y)
>   leaks each fold's validation distribution into the scaler. The
>   reported score is biased high. Always pass a Pipeline that contains
>   the scaler so each fold refits preprocessing on its own train slice.

## Tips

- cv=5 is standard; use cv=10 for smaller datasets
- stratifiedKFold maintains class balance in each fold
- Try multiple scoring metrics: accuracy, f1, roc_auc, precision, recall
- When the same entity appears in many rows, use `GroupKFold` (or `StratifiedGroupKFold`) so a fold cannot leak the same user into both sides
- For time-series, hand `TimeSeriesSplit` to `cv=` — KFold on temporal data leaks the future and gives optimistic scores

## Common Mistake

> [!warning] Using single train-test split instead of cross-validation for variance estimation.

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

- [[Sections/ml/evaluation/_Index|Machine Learning → Model Evaluation]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
