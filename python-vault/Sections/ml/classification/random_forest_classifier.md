---
type: "entry"
domain: "python"
file: "ml"
section: "classification"
id: "random_forest_classifier"
title: "RandomForestClassifier"
category: "Ensemble Models"
subtitle: "Robust ensemble of trees"
signature_short: "RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "RandomForestClassifier"
  - "random_forest_classifier"
tags:
  - "python"
  - "python/ml"
  - "python/ml/classification"
  - "category/ensemble-models"
  - "tier/tiered"
---

# RandomForestClassifier

> Robust ensemble of trees

## Overview

Combines multiple decision trees with bootstrap sampling and feature randomness, reducing overfitting and providing robust predictions with feature importance.

## Signature

```python
RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - n_estimators=100 trees, sane defaults.
#             No scaling needed.
# STRENGTHS - the strongest "default" classifier for
#             tabular data. Hard to misuse.
# WEAKNESSES- doesn't yet show n_jobs, OOB, or
#             permutation importance.
#
from sklearn.ensemble import RandomForestClassifier

clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X_train, y_train)
clf.score(X_test, y_test)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday RF surface: n_jobs=-1 to use
#             all cores, max_features="sqrt" (default for
#             classification), oob_score=True for free
#             validation, class_weight= for imbalance.
# STRENGTHS - n_jobs=-1 is a free 4-8x speedup;
#             oob_score gives validation accuracy
#             without a held-out set.
# WEAKNESSES- doesn't address permutation importance
#             (more honest than gini importance) —
#             senior tier.
#
from sklearn.ensemble import RandomForestClassifier

clf = RandomForestClassifier(
    n_estimators=300,
    max_depth=None,                          # full depth, regularize via leaves
    min_samples_leaf=5,
    max_features="sqrt",                     # default for classification
    class_weight="balanced",
    n_jobs=-1,                                # parallelize across cores
    oob_score=True,                           # built-in validation
    random_state=42,
)
clf.fit(X_train, y_train)
print(f"OOB score: {clf.oob_score_:.3f}")
print(f"Test:      {clf.score(X_test, y_test):.3f}")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production RF: prefer permutation_
#             importance over feature_importances_
#             (less biased toward high-cardinality
#             features); for tabular accuracy benchmarks
#             a tuned RF is hard to beat without a
#             gradient-boosted model (XGBoost / LightGBM
#             / GradientBoosting).
# STRENGTHS - permutation importance is honest;
#             explicit comparison to GBM clarifies when
#             RF is the right tool vs the strongest
#             tabular default.
# WEAKNESSES- permutation importance is slow on big
#             models (refits per feature); GBMs win on
#             accuracy but cost more tuning time.
#
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance

clf = RandomForestClassifier(
    n_estimators=500, min_samples_leaf=5,
    n_jobs=-1, random_state=42,
).fit(X_train, y_train)

# Permutation importance — refits NOT required
result = permutation_importance(
    clf, X_test, y_test,
    n_repeats=10, n_jobs=-1, random_state=42,
)
order = np.argsort(result.importances_mean)[::-1]
for i in order[:10]:
    print(f"{feature_names[i]:20s} {result.importances_mean[i]:.4f}")

# Decision rule:
#   strong tabular default               -> RandomForest
#   need top accuracy on tabular         -> XGBoost / LightGBM / sklearn HGB
#   need calibrated probabilities        -> CalibratedClassifierCV(rf, cv=5)
#   tiny dataset                         -> LogisticRegression baseline first
#   honest feature importance            -> permutation_importance on test
#   class imbalance                      -> class_weight="balanced_subsample"
#
# Anti-pattern: trusting clf.feature_importances_ on correlated features
#   The default impurity-based importance is biased toward high-cardinality
#   features and splits the credit among correlated ones, hiding the true
#   signal. Use permutation_importance on a held-out set, or SHAP. Also
#   never compute importance on training data — it overstates real impact.
```

## Decision Rule

```text
strong tabular default               -> RandomForest
need top accuracy on tabular         -> XGBoost / LightGBM / sklearn HGB
need calibrated probabilities        -> CalibratedClassifierCV(rf, cv=5)
tiny dataset                         -> LogisticRegression baseline first
honest feature importance            -> permutation_importance on test
class imbalance                      -> class_weight="balanced_subsample"
```

## Anti-Pattern

> [!warning] Anti-pattern
> trusting clf.feature_importances_ on correlated features
>   The default impurity-based importance is biased toward high-cardinality
>   features and splits the credit among correlated ones, hiding the true
>   signal. Use permutation_importance on a held-out set, or SHAP. Also
>   never compute importance on training data — it overstates real impact.

## Tips

- Start with n_estimators=100; more trees = better generalization (diminishing returns)
- Feature importances help identify most predictive variables
- Set n_jobs=-1 to parallelize tree training across all cores

## Common Mistake

> [!warning] Using too few estimators (n_estimators=10) for stable predictions.

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

- [[Sections/ml/regression/random_forest_regressor|RandomForestRegressor (Machine Learning)]]
- [[Sections/ml/classification/_Index|Machine Learning → Classification Models]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
