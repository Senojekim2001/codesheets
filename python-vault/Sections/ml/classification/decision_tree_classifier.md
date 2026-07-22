---
type: "entry"
domain: "python"
file: "ml"
section: "classification"
id: "decision_tree_classifier"
title: "DecisionTreeClassifier"
category: "Tree Models"
subtitle: "Hierarchical decision rules"
signature_short: "DecisionTreeClassifier(max_depth=5, random_state=42)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "DecisionTreeClassifier"
  - "decision_tree_classifier"
tags:
  - "python"
  - "python/ml"
  - "python/ml/classification"
  - "category/tree-models"
  - "tier/tiered"
---

# DecisionTreeClassifier

> Hierarchical decision rules

## Overview

Creates decision trees through recursive partitioning based on feature thresholds, providing interpretable models with feature importance without scaling requirements.

## Signature

```python
DecisionTreeClassifier(max_depth=5, random_state=42)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - fit a tree with max_depth set. No scaling
#             needed.
# STRENGTHS - interpretable splits, no preprocessing.
# WEAKNESSES- doesn't yet show overfitting controls or
#             visualization.
#
from sklearn.tree import DecisionTreeClassifier

clf = DecisionTreeClassifier(max_depth=3, random_state=42)
clf.fit(X_train, y_train)
clf.score(X_test, y_test)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday tree controls: max_depth +
#             min_samples_split + min_samples_leaf to
#             curb overfitting; feature_importances_
#             for variable ranking; class_weight for
#             imbalance.
# STRENGTHS - the regularization triplet is the standard
#             way to tame a tree; importances give you
#             a feature story for free.
# WEAKNESSES- single trees overfit easily; reach for
#             RandomForest / GradientBoosting at scale —
#             senior tier.
#
from sklearn.tree import DecisionTreeClassifier, plot_tree
import matplotlib.pyplot as plt

clf = DecisionTreeClassifier(
    max_depth=5,
    min_samples_split=20,
    min_samples_leaf=10,
    class_weight="balanced",
    random_state=42,
)
clf.fit(X_train, y_train)

# Feature importances — Gini-based
imp = sorted(zip(feature_names, clf.feature_importances_),
              key=lambda x: -x[1])

# Visualize
plot_tree(clf, feature_names=feature_names, filled=True,
           rounded=True, fontsize=8)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production trees: a single tree is rarely
#             the right answer — use it for explanation
#             only, then ensemble for prediction. Cost-
#             complexity pruning (ccp_alpha) gives a
#             principled tree-size tradeoff. Always
#             cross-validate depth.
# STRENGTHS - ccp_alpha is the modern alternative to
#             arbitrary max_depth tuning; the "tree for
#             explanation, ensemble for prediction" rule
#             clarifies when each tool is right.
# WEAKNESSES- ccp_alpha tuning is slow; a single tree's
#             accuracy is almost always beaten by a
#             RandomForest or GradientBoosting on real
#             data.
#
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import GridSearchCV

# Tune complexity via cost-complexity pruning
grid = GridSearchCV(
    DecisionTreeClassifier(random_state=42),
    param_grid={
        "ccp_alpha":         [0.0, 0.001, 0.005, 0.01],
        "max_depth":         [None, 4, 8, 12],
        "min_samples_leaf":  [1, 5, 20],
    },
    cv=5, scoring="accuracy",
)
grid.fit(X_train, y_train)
best = grid.best_estimator_

# Decision rule:
#   need an interpretable model         -> DecisionTreeClassifier (small)
#   need accuracy on tabular data       -> RandomForest / GradientBoosting
#   need both                           -> shallow tree for explanation,
#                                          ensemble for production scoring
#   class imbalance                     -> class_weight="balanced"
#   feature interactions matter          -> max_depth >= 5 (let it find them)
#
# Anti-pattern: leaving max_depth=None on a single tree
#   The default grows until every leaf is pure — train accuracy 100%,
#   test accuracy mediocre, model unusable. Always constrain depth
#   (max_depth, min_samples_leaf, or ccp_alpha). If you want max accuracy
#   without the fiddling, switch to RandomForest or GradientBoosting.
```

## Decision Rule

```text
need an interpretable model         -> DecisionTreeClassifier (small)
need accuracy on tabular data       -> RandomForest / GradientBoosting
need both                           -> shallow tree for explanation,
                                       ensemble for production scoring
class imbalance                     -> class_weight="balanced"
feature interactions matter          -> max_depth >= 5 (let it find them)
```

## Anti-Pattern

> [!warning] Anti-pattern
> leaving max_depth=None on a single tree
>   The default grows until every leaf is pure — train accuracy 100%,
>   test accuracy mediocre, model unusable. Always constrain depth
>   (max_depth, min_samples_leaf, or ccp_alpha). If you want max accuracy
>   without the fiddling, switch to RandomForest or GradientBoosting.

## Tips

- Limit max_depth to prevent overfitting; start with 3-5
- Use min_samples_split to require minimum samples for splits
- No scaling required; handles categorical features well

## Common Mistake

> [!warning] Using deep trees without constraints, causing overfitting on training data.

## Shorthand (Junior → Senior)

**Junior:**
```python
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import numpy as np
```

**Senior:**
```python
print(f'Tree depth: {model.get_depth()}')
```

## See Also

- [[Sections/ml/regression/decision_tree_regressor|DecisionTreeRegressor (Machine Learning)]]
- [[Sections/ml/classification/_Index|Machine Learning → Classification Models]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
