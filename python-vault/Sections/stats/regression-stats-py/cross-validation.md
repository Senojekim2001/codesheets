---
type: "entry"
domain: "python"
file: "stats"
section: "regression-stats-py"
id: "cross-validation"
title: "sklearn.model_selection.cross_val_score, StratifiedKFold"
category: "Model Evaluation"
subtitle: "Estimate generalization performance"
signature_short: "cross_val_score(model, X, y, cv=5)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sklearn.model_selection.cross_val_score, StratifiedKFold"
  - "cross-validation"
tags:
  - "python"
  - "python/stats"
  - "python/stats/regression-stats-py"
  - "category/model-evaluation"
  - "tier/tiered"
---

# sklearn.model_selection.cross_val_score, StratifiedKFold

> Estimate generalization performance

## Overview

Partition data into folds, fit/evaluate repeatedly. Provides multiple performance estimates and standard error. More robust than single train/test split.

## Signature

```python
cross_val_score(model, X, y, cv=5)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - 5-fold cross_val_score on a classifier
# STRENGTHS - The smallest valid CV with a single metric
# WEAKNESSES- Random split (not stratified); only one metric
#
from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score

X, y = load_iris(return_X_y=True)

scores = cross_val_score(LogisticRegression(max_iter=200), X, y, cv=5)
print(f"mean = {scores.mean():.3f}  std = {scores.std():.3f}")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - StratifiedKFold for classification, cross_validate for many metrics
# STRENGTHS - The pattern most production CV scripts settle on
# WEAKNESSES- No nested CV, no leakage discussion yet
#
from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_validate

X, y = load_iris(return_X_y=True)
clf = LogisticRegression(max_iter=200)

# Stratified preserves the class ratio in every fold — mandatory for imbalanced data
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)

cv = cross_validate(
    clf, X, y, cv=skf,
    scoring=["accuracy", "f1_macro", "roc_auc_ovr"],
    return_train_score=True,
)
for k, v in cv.items():
    if k.startswith("test_"):
        print(f"{k:>20}: mean={v.mean():.3f}  std={v.std():.3f}")

# Train vs test gap reveals overfitting:
print(f"train acc - test acc = {cv['train_accuracy'].mean() - cv['test_accuracy'].mean():.3f}")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Pipeline-based CV (no leakage), GroupKFold, TimeSeriesSplit, nested CV
# STRENGTHS - The leakage patterns that destroy real ML projects
# WEAKNESSES- N/A
#
import numpy as np
from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import (
    StratifiedKFold, GroupKFold, TimeSeriesSplit, GridSearchCV, cross_val_score,
)

X, y = load_iris(return_X_y=True)

# 1) ALWAYS scale inside a Pipeline so each fold rescales independently.
#    Fitting StandardScaler on all of X before CV leaks test stats into training.
pipe = Pipeline([
    ("scale", StandardScaler()),
    ("clf",   LogisticRegression(max_iter=500)),
])
scores = cross_val_score(pipe, X, y, cv=StratifiedKFold(5, shuffle=True, random_state=0))
print(f"pipe CV: {scores.mean():.3f} ± {scores.std():.3f}")

# 2) Grouped data — multiple rows per patient/user/session
#    Use GroupKFold so the same group never spans train AND test.
groups = np.repeat(np.arange(30), 5)              # imagined group IDs
gkf    = GroupKFold(n_splits=5)
# scores = cross_val_score(pipe, X, y, cv=gkf, groups=groups)

# 3) Time series — never use random folds; the past must predict the future
tscv = TimeSeriesSplit(n_splits=5)
# for train_idx, test_idx in tscv.split(X): ...    # train < test in time

# 4) Nested CV — the only honest way to report performance AFTER hyperparam search
inner = StratifiedKFold(3, shuffle=True, random_state=0)
outer = StratifiedKFold(5, shuffle=True, random_state=0)
gs = GridSearchCV(pipe, {"clf__C": [0.1, 1.0, 10.0]}, cv=inner, scoring="accuracy")
nested = cross_val_score(gs, X, y, cv=outer)
print(f"nested CV: {nested.mean():.3f} ± {nested.std():.3f}")

# Decision rule:
#   classification, IID rows               -> StratifiedKFold (always shuffle, seed)
#   regression, IID rows                    -> KFold(shuffle=True)
#   multiple rows per subject/group         -> GroupKFold or LeaveOneGroupOut
#   time series                              -> TimeSeriesSplit (no shuffle)
#   tiny dataset (n < 100)                   -> RepeatedStratifiedKFold for stable estimate
#   reporting performance after tuning        -> nested CV; otherwise youre lying about CV scores
#
# Anti-pattern: fitting scaler / imputer / encoder OUTSIDE the Pipeline before CV
#   The fold's "test" data participated in fitting the preprocessor. CV scores
#   come back optimistic; production performance disappoints. Always Pipeline.
```

## Decision Rule

```text
classification, IID rows               -> StratifiedKFold (always shuffle, seed)
regression, IID rows                    -> KFold(shuffle=True)
multiple rows per subject/group         -> GroupKFold or LeaveOneGroupOut
time series                              -> TimeSeriesSplit (no shuffle)
tiny dataset (n < 100)                   -> RepeatedStratifiedKFold for stable estimate
reporting performance after tuning        -> nested CV; otherwise youre lying about CV scores
```

## Anti-Pattern

> [!warning] Anti-pattern
> fitting scaler / imputer / encoder OUTSIDE the Pipeline before CV
>   The fold's "test" data participated in fitting the preprocessor. CV scores
>   come back optimistic; production performance disappoints. Always Pipeline.

## Tips

- Use StratifiedKFold for classification to preserve class ratios
- Larger k (e.g., 10) more reliable but slower; k=5 standard balance
- Cross-validation gives better generalization estimate than single split

## Common Mistake

> [!warning] Tuning hyperparameters before cross-validation; causes optimistic bias.

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

- [[Sections/stats/regression-stats-py/_Index|Statistics & Probability → Regression & Modeling]]
- [[Sections/stats/_Index|Statistics & Probability index]]
- [[_Index|Vault index]]
