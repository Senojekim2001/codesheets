---
type: "entry"
domain: "python"
file: "ml"
section: "preprocessing"
id: "standard_scaler"
title: "StandardScaler"
category: "Feature Scaling"
subtitle: "Normalization via z-score"
signature_short: "StandardScaler().fit(X_train).transform(X_train)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "StandardScaler"
  - "standard_scaler"
tags:
  - "python"
  - "python/ml"
  - "python/ml/preprocessing"
  - "category/feature-scaling"
  - "tier/tiered"
---

# StandardScaler

> Normalization via z-score

## Overview

Rescales features to have mean 0 and standard deviation 1, essential for distance-based algorithms like KNN and SVM.

## Signature

```python
StandardScaler().fit(X_train).transform(X_train)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - z-score: subtract train mean, divide by
#             train std. fit ONCE on train, transform
#             train and test separately.
# STRENGTHS - the simplest scaler that meets the no-
#             leakage rule.
# WEAKNESSES- doesn't yet show fit_transform shortcut or
#             integration into a Pipeline.
#
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
scaler.fit(X_train)                       # fit ONLY on train
X_train_s = scaler.transform(X_train)
X_test_s  = scaler.transform(X_test)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday scaling pattern: fit_transform
#             on train, transform on test (one-line each),
#             integrate into a Pipeline so leakage can't
#             happen.
# STRENGTHS - Pipeline integration is the single most
#             important habit — it makes the scaler
#             refit per CV fold automatically.
# WEAKNESSES- doesn't address RobustScaler for outlier-
#             heavy data or with_mean=False for sparse —
#             senior tier.
#
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression

# Standalone — be careful never to fit on the full dataset
scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s  = scaler.transform(X_test)

# Pipeline — leakage-proof; refits per CV fold
pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("model",  LogisticRegression()),
])
pipe.fit(X_train, y_train)
pipe.score(X_test, y_test)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production scaling: pick the right scaler
#             for the data — StandardScaler for normal-
#             ish features, RobustScaler when outliers
#             dominate, MaxAbsScaler for sparse/sign-
#             preserving, MinMaxScaler when the model
#             needs bounded inputs (some neural nets).
# STRENGTHS - the scaler-by-data-shape rule prevents
#             outlier-driven failures; pipeline + CV
#             keeps the no-leakage rule enforced.
# WEAKNESSES- RobustScaler hides outlier-driven shifts
#             (sometimes you WANT them); MaxAbsScaler
#             only suits non-negative or sparse data.
#
import numpy as np
from sklearn.preprocessing import (
    StandardScaler, RobustScaler, MaxAbsScaler, MinMaxScaler)
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score

# 1. Picking the scaler per data shape
# Normal-ish numeric features         -> StandardScaler (z-score)
# Outliers dominate                   -> RobustScaler (uses median/IQR)
# Sparse / non-negative                -> MaxAbsScaler (preserves sparsity)
# Bounded inputs needed (some NNs)    -> MinMaxScaler

# 2. Pipeline + CV — refits scaler per fold (no leakage)
pipe = Pipeline([
    ("scaler", RobustScaler()),                # outlier-resistant
    ("clf",    LogisticRegression(max_iter=1000)),
])
scores = cross_val_score(pipe, X, y, cv=5, scoring="accuracy")
print(f"{scores.mean():.3f} +/- {scores.std():.3f}")

# 3. Anti-pattern — the most common bug
# scaler = StandardScaler()
# X_scaled = scaler.fit_transform(X)            # fit on FULL data
# X_train, X_test = train_test_split(X_scaled)  # leakage from test stats
# Right: always fit on train (or use a Pipeline).
#
# Decision rule:
#   normal-ish numeric features        -> StandardScaler
#   heavy outliers / non-Gaussian      -> RobustScaler (median + IQR)
#   sparse matrices (TF-IDF, one-hot)  -> MaxAbsScaler (preserves sparsity)
#   bounded inputs needed (some NNs)   -> MinMaxScaler([0,1])
#   tree-based models (RF, XGBoost)    -> skip scaling entirely; not needed
#   inside CV / grid search            -> always wrap in Pipeline
#
# Anti-pattern: fit_transform on the full X before splitting
#   Calling scaler.fit_transform(X) before train_test_split leaks test-set
#   means/stds into the model — validation scores look great, production
#   regresses. The fix is non-negotiable: fit on X_train only, transform
#   X_test, or put the scaler in a Pipeline so CV refits per fold.
```

## Decision Rule

```text
normal-ish numeric features        -> StandardScaler
heavy outliers / non-Gaussian      -> RobustScaler (median + IQR)
sparse matrices (TF-IDF, one-hot)  -> MaxAbsScaler (preserves sparsity)
bounded inputs needed (some NNs)   -> MinMaxScaler([0,1])
tree-based models (RF, XGBoost)    -> skip scaling entirely; not needed
inside CV / grid search            -> always wrap in Pipeline
```

## Anti-Pattern

> [!warning] Anti-pattern
> fit_transform on the full X before splitting
>   Calling scaler.fit_transform(X) before train_test_split leaks test-set
>   means/stds into the model — validation scores look great, production
>   regresses. The fix is non-negotiable: fit on X_train only, transform
>   X_test, or put the scaler in a Pipeline so CV refits per fold.

## Tips

- Always fit scaler on training data only, then transform test data
- Use fit_transform() on train, transform() on test separately
- Essential for algorithms with distance metrics (KNN, SVM, KMeans)

## Common Mistake

> [!warning] Fitting the scaler on the entire dataset before splitting, causing data leakage.

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

- [[Sections/ml/preprocessing/minmax_scaler|MinMaxScaler (Machine Learning)]]
- [[Sections/ml/preprocessing/_Index|Machine Learning → Data Preprocessing]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
