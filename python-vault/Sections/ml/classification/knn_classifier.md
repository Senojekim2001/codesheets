---
type: "entry"
domain: "python"
file: "ml"
section: "classification"
id: "knn_classifier"
title: "KNeighborsClassifier"
category: "Instance-based"
subtitle: "Distance-based voting"
signature_short: "KNeighborsClassifier(n_neighbors=5)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "KNeighborsClassifier"
  - "knn_classifier"
tags:
  - "python"
  - "python/ml"
  - "python/ml/classification"
  - "category/instance-based"
  - "tier/tiered"
---

# KNeighborsClassifier

> Distance-based voting

## Overview

Classifies samples by majority vote of k nearest neighbors in feature space, non-parametric and suitable for non-linear decision boundaries.

## Signature

```python
KNeighborsClassifier(n_neighbors=5)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - lazy classifier — no training step.
#             k=5 by default. Scale FIRST.
# STRENGTHS - simplest non-parametric classifier.
# WEAKNESSES- doesn't yet show k tuning or weights=.
#
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

clf = Pipeline([
    ("scale", StandardScaler()),
    ("knn",   KNeighborsClassifier(n_neighbors=5)),
])
clf.fit(X_train, y_train)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday KNN surface: tune k via CV,
#             weights="distance" (closer neighbors
#             vote more), n_jobs= for parallel
#             prediction.
# STRENGTHS - the (k, weights) pair is the entire
#             KNN tuning surface; n_jobs is a free
#             speedup at predict time.
# WEAKNESSES- doesn't address the curse of
#             dimensionality or memory cost — senior.
#
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import GridSearchCV

pipe = Pipeline([
    ("scale", StandardScaler()),
    ("knn",   KNeighborsClassifier(n_jobs=-1)),
])

grid = GridSearchCV(pipe, param_grid={
    "knn__n_neighbors": [3, 5, 10, 25],
    "knn__weights":     ["uniform", "distance"],
}, cv=5)
grid.fit(X_train, y_train)
print(grid.best_params_)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production KNN: stores the entire
#             training set (memory cost), suffers in
#             high dimensions, and predict() is O(N) per
#             query without an index. For >100k rows or
#             >50 features, switch to a real classifier
#             (RF / GBM) or use approximate nearest
#             neighbors (faiss, annoy).
# STRENGTHS - the scale + dimensionality rule prevents
#             "why is my notebook slow" surprises; ANN
#             libraries scale to millions when you must
#             stick with KNN semantics.
# WEAKNESSES- ANN approximates — it's faster but not
#             exact; switching to RF/GBM loses the
#             interpretable "k closest neighbors" story.
#
from sklearn.neighbors import KNeighborsClassifier

# 1. Built-in tree indexes — used automatically when N is large
clf = KNeighborsClassifier(
    n_neighbors=5,
    algorithm="auto",                    # auto picks ball_tree / kd_tree
    leaf_size=30,                         # tune for very large N
    n_jobs=-1,
)

# 2. Curse of dimensionality — KNN degrades fast above ~30 features
#    Reduce dims first (PCA, UMAP) or use a different model.
# from sklearn.decomposition import PCA
# Pipeline([("scale", StandardScaler()), ("pca", PCA(n_components=20)), ("knn", clf)])

# Decision rule:
#   N small (< 10k), few dims (< 30)   -> KNN with full search
#   N large but few dims               -> KNN with kd_tree / ball_tree
#   N large AND many dims              -> RandomForest or GBM
#   need exact KNN at huge scale       -> faiss / annoy (approximate NN)
#   want neighbor-weighted votes       -> weights="distance"
#   small k -> overfit, large k -> bias-> tune via CV in 3..30
#
# Anti-pattern: KNN on raw, unscaled features
#   KNN is pure distance — a feature with values in 0..10000 will dominate
#   one in 0..1 and the model effectively ignores everything else.
#   Always StandardScaler (or MinMaxScaler) inside a Pipeline. Same goes
#   for one-hot columns: distance on them is binary and noisy; consider
#   OrdinalEncoder + scaling, or skip KNN for high-cardinality categoricals.
```

## Decision Rule

```text
N small (< 10k), few dims (< 30)   -> KNN with full search
N large but few dims               -> KNN with kd_tree / ball_tree
N large AND many dims              -> RandomForest or GBM
need exact KNN at huge scale       -> faiss / annoy (approximate NN)
want neighbor-weighted votes       -> weights="distance"
small k -> overfit, large k -> bias-> tune via CV in 3..30
```

## Anti-Pattern

> [!warning] Anti-pattern
> KNN on raw, unscaled features
>   KNN is pure distance — a feature with values in 0..10000 will dominate
>   one in 0..1 and the model effectively ignores everything else.
>   Always StandardScaler (or MinMaxScaler) inside a Pipeline. Same goes
>   for one-hot columns: distance on them is binary and noisy; consider
>   OrdinalEncoder + scaling, or skip KNN for high-cardinality categoricals.

## Tips

- Choose n_neighbors via cross-validation; typical range 3-10
- Scale features because KNN is distance-based
- Use weights="distance" to weight neighbors by inverse distance
- Set `algorithm="kd_tree"` or `"ball_tree"` for large N with few dimensions; high-dim KNN degrades to brute-force — switch to a tree ensemble or FAISS/annoy instead

## Common Mistake

> [!warning] Using k=1 or k too large without validation; both extremes harm generalization.

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

- [[Sections/ml/classification/_Index|Machine Learning → Classification Models]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
