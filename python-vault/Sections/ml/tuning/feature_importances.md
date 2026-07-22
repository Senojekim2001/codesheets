---
type: "entry"
domain: "python"
file: "ml"
section: "tuning"
id: "feature_importances"
title: "feature_importances_"
category: "Feature Analysis"
subtitle: "Feature relevance ranking"
signature_short: "model.feature_importances_ (for tree-based models)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "feature_importances_"
  - "feature_importances"
tags:
  - "python"
  - "python/ml"
  - "python/ml/tuning"
  - "category/feature-analysis"
  - "tier/tiered"
---

# feature_importances_

> Feature relevance ranking

## Overview

Ranks features by their contribution to model predictions, useful for feature selection and understanding model behavior.

## Signature

```python
model.feature_importances_ (for tree-based models)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - tree-based models expose
#             feature_importances_ — sums to 1.0,
#             higher = more important.
# STRENGTHS - one attribute, instant feature ranking.
# WEAKNESSES- biased toward high-cardinality
#             features; permutation importance is
#             more honest.
#
import numpy as np
imp = model.feature_importances_
order = np.argsort(imp)[::-1]
for i in order:
    print(f"{feature_names[i]:20s} {imp[i]:.3f}")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday surface: rank, plot, pick
#             the top-K, drop low-importance features
#             via SelectFromModel. Compare model-
#             based importance to permutation
#             importance.
# STRENGTHS - permutation importance is data-driven
#             (reshuffles each feature, measures
#             score drop) — less biased than the
#             tree's MDI.
# WEAKNESSES- doesn't address SHAP for individual
#             prediction explanations — senior.
#
import numpy as np, matplotlib.pyplot as plt
from sklearn.feature_selection import SelectFromModel
from sklearn.inspection import permutation_importance

# Tree's built-in (Gini-based)
imp = model.feature_importances_
order = np.argsort(imp)[::-1]

# More honest — permutation importance
result = permutation_importance(
    model, X_test, y_test,
    n_repeats=10, n_jobs=-1, random_state=42,
)
perm_imp = result.importances_mean

# Drop low-importance features
sel = SelectFromModel(model, threshold="median")
X_train_sel = sel.fit_transform(X_train, y_train)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production interpretability: tree MDI
#             importance is biased toward
#             high-cardinality features. Reach for
#             permutation_importance for honesty, and
#             SHAP for per-prediction explanations.
#             For linear models, coef_ * std(feature)
#             is the right magnitude comparison.
# STRENGTHS - SHAP is the industry standard for ML
#             interpretability; the per-feature-type
#             rule (tree -> permutation, linear ->
#             scaled coef) prevents the most common
#             misuse.
# WEAKNESSES- SHAP is a separate dep and slow on
#             large data; permutation importance
#             requires a held-out set.
#
import numpy as np
from sklearn.inspection import permutation_importance

# 1. Tree models — permutation > MDI for honesty
result = permutation_importance(
    model, X_test, y_test,
    n_repeats=20, n_jobs=-1, random_state=42,
)
order = result.importances_mean.argsort()[::-1]
for i in order[:10]:
    print(f"{feature_names[i]:20s} "
           f"{result.importances_mean[i]:+.4f} "
           f"+/- {result.importances_std[i]:.4f}")

# 2. Linear models — magnitude depends on feature scale
# coefs = model.coef_.ravel()
# stds  = X_train.std(axis=0)
# scaled_importance = np.abs(coefs * stds)

# 3. SHAP — per-prediction explanations
# import shap
# explainer = shap.TreeExplainer(model)
# shap_values = explainer.shap_values(X_test)
# shap.summary_plot(shap_values, X_test, feature_names=feature_names)

# Decision rule:
#   tree-based, global ranking          -> permutation_importance (NOT MDI)
#   linear, global ranking              -> abs(coef) * std(feature)
#   per-prediction explanation          -> SHAP
#   feature SELECTION inside Pipeline   -> SelectFromModel
#   correlated features in the table    -> permutation w/ correlation grouping
#   regression vs classification        -> permutation works for both
#   small dataset, fast read            -> default feature_importances_ is OK
#
# Anti-pattern: ranking features by clf.feature_importances_ on training data
#   The default MDI metric is biased toward high-cardinality / high-variance
#   features even when they're random noise; computed on training data, it
#   also overstates impact. Use permutation_importance on a held-out test
#   set, group correlated features before interpreting, and don't drop
#   features based on a single run — bootstrap or k-fold the ranking.
```

## Decision Rule

```text
tree-based, global ranking          -> permutation_importance (NOT MDI)
linear, global ranking              -> abs(coef) * std(feature)
per-prediction explanation          -> SHAP
feature SELECTION inside Pipeline   -> SelectFromModel
correlated features in the table    -> permutation w/ correlation grouping
regression vs classification        -> permutation works for both
small dataset, fast read            -> default feature_importances_ is OK
```

## Anti-Pattern

> [!warning] Anti-pattern
> ranking features by clf.feature_importances_ on training data
>   The default MDI metric is biased toward high-cardinality / high-variance
>   features even when they're random noise; computed on training data, it
>   also overstates impact. Use permutation_importance on a held-out test
>   set, group correlated features before interpreting, and don't drop
>   features based on a single run — bootstrap or k-fold the ranking.

## Tips

- Use for feature selection; drop low-importance features
- Feature importances sum to 1.0
- Different models compute importance differently (MDI, permutation, SHAP)
- For tree models, prefer `permutation_importance` over the built-in MDI `feature_importances_` — MDI inflates the score of high-cardinality features
- For per-prediction explanations reach for SHAP; for selection inside a Pipeline use `SelectFromModel`

## Common Mistake

> [!warning] Dropping features based on single model; use multiple methods for validation.

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

- [[Sections/ml/tuning/_Index|Machine Learning → Hyperparameter Tuning]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
