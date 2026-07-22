---
type: "entry"
domain: "python"
file: "ml"
section: "classification"
id: "gradient_boosting_classifier"
title: "GradientBoostingClassifier"
category: "Boosting Models"
subtitle: "Iterative error correction"
signature_short: "GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "GradientBoostingClassifier"
  - "gradient_boosting_classifier"
tags:
  - "python"
  - "python/ml"
  - "python/ml/classification"
  - "category/boosting-models"
  - "tier/tiered"
---

# GradientBoostingClassifier

> Iterative error correction

## Overview

Iteratively builds trees to correct prediction errors using gradient descent, achieving high accuracy by combining weak learners into a strong ensemble.

## Signature

```python
GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - sequential trees, each correcting the
#             previous one's errors. Default 100 trees.
# STRENGTHS - typically the strongest tabular model
#             out-of-the-box.
# WEAKNESSES- doesn't yet show learning_rate/max_depth
#             tuning or HistGradientBoosting.
#
from sklearn.ensemble import GradientBoostingClassifier

clf = GradientBoostingClassifier(random_state=42)
clf.fit(X_train, y_train)
clf.score(X_test, y_test)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday GBM levers: learning_rate
#             (smaller = more trees but better
#             generalization), max_depth (3-5 typical),
#             subsample (<1 for stochastic GBM),
#             validation_fraction + n_iter_no_change for
#             early stopping.
# STRENGTHS - early stopping prevents overfitting and
#             saves training time; subsample is a free
#             regularizer.
# WEAKNESSES- doesn't address HistGradientBoosting
#             (much faster) or XGBoost / LightGBM —
#             senior tier.
#
from sklearn.ensemble import GradientBoostingClassifier

clf = GradientBoostingClassifier(
    n_estimators=500,                        # plenty of trees with early stop
    learning_rate=0.05,                      # smaller = better generalization
    max_depth=3,                              # shallow trees, like XGBoost
    subsample=0.8,                            # stochastic
    validation_fraction=0.1,
    n_iter_no_change=10,                      # early stop
    random_state=42,
)
clf.fit(X_train, y_train)
print(f"trees actually used: {clf.n_estimators_}")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production gradient boosting: prefer
#             HistGradientBoostingClassifier over
#             GradientBoostingClassifier (10-100x
#             faster, native missing-value support);
#             reach for XGBoost / LightGBM when squeezing
#             the last percent of accuracy or scaling
#             beyond sklearn's reach.
# STRENGTHS - HistGBM is the fast modern default; the
#             XGBoost/LightGBM step gets the strongest
#             tabular results documented on benchmarks.
# WEAKNESSES- HistGBM has a slightly different param
#             surface; XGBoost/LightGBM add a
#             dependency and a learning curve.
#
from sklearn.ensemble import HistGradientBoostingClassifier

# Modern fast default — handles missing values natively
clf = HistGradientBoostingClassifier(
    max_iter=500,
    learning_rate=0.05,
    max_depth=None,                           # let max_leaf_nodes regularize
    max_leaf_nodes=31,                         # LightGBM-like default
    min_samples_leaf=20,
    early_stopping=True,
    validation_fraction=0.1,
    random_state=42,
)
clf.fit(X_train, y_train)

# When sklearn isn't enough:
#   import xgboost as xgb
#   xgb.XGBClassifier(tree_method="hist", n_estimators=1000, learning_rate=0.05)
#   import lightgbm as lgb
#   lgb.LGBMClassifier(n_estimators=1000, learning_rate=0.05)

# Decision rule (tabular accuracy, in order):
#   1. HistGradientBoostingClassifier  (sklearn, fast)
#   2. LightGBM                         (faster on big data)
#   3. XGBoost                          (battle-tested, similar accuracy)
#   4. RandomForest                     (no tuning, decent baseline)
#
# Decision rule:
#   any tabular accuracy benchmark      -> gradient boosting first
#   sklearn-only stack, large N         -> HistGradientBoostingClassifier
#   need top accuracy / GPU             -> LightGBM or XGBoost
#   tons of categorical columns         -> LightGBM (categorical_feature) or CatBoost
#   missing values in features          -> HistGBM (native NaN support)
#   limited tuning time, want OK        -> RandomForest baseline
#   probabilities feed business rules   -> calibrate (CalibratedClassifierCV)
#
# Anti-pattern: stacking GBM on top of one-hot encoded high-cardinality categoricals
#   GBMs split greedily; OHE explodes the feature count and dilutes the
#   signal across many almost-empty columns, hurting both accuracy and
#   speed. Use OrdinalEncoder (trees handle it fine), TargetEncoder, or
#   LightGBM's native categorical_feature= argument instead.
```

## Decision Rule

```text
any tabular accuracy benchmark      -> gradient boosting first
sklearn-only stack, large N         -> HistGradientBoostingClassifier
need top accuracy / GPU             -> LightGBM or XGBoost
tons of categorical columns         -> LightGBM (categorical_feature) or CatBoost
missing values in features          -> HistGBM (native NaN support)
limited tuning time, want OK        -> RandomForest baseline
probabilities feed business rules   -> calibrate (CalibratedClassifierCV)
```

## Anti-Pattern

> [!warning] Anti-pattern
> stacking GBM on top of one-hot encoded high-cardinality categoricals
>   GBMs split greedily; OHE explodes the feature count and dilutes the
>   signal across many almost-empty columns, hurting both accuracy and
>   speed. Use OrdinalEncoder (trees handle it fine), TargetEncoder, or
>   LightGBM's native categorical_feature= argument instead.

## Tips

- learning_rate (shrinkage) 0.01-0.1 prevents overfitting; lower = slower but better
- Monitor validation scores to detect early stopping opportunity
- Subsample parameter helps prevent overfitting by using random subsets

## Common Mistake

> [!warning] Using high learning_rate without sufficient validation, causing unstable training.

## Shorthand (Junior → Senior)

**Junior:**
```python
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import numpy as np
```

**Senior:**
```python
print(classification_report(y_test, y_pred))
```

## See Also

- [[Sections/ml/classification/_Index|Machine Learning → Classification Models]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
