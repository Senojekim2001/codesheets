---
type: "entry"
domain: "python"
file: "ml"
section: "tuning"
id: "validation_curve"
title: "validation_curve"
category: "Hyperparameter Search"
subtitle: "Hyperparameter impact"
signature_short: "validation_curve(estimator, X, y, param_name, param_range, cv=5)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "validation_curve"
tags:
  - "python"
  - "python/ml"
  - "python/ml/tuning"
  - "category/hyperparameter-search"
  - "tier/tiered"
---

# validation_curve

> Hyperparameter impact

## Overview

Shows how train and validation scores change with one hyperparameter, identifying optimal value and overfitting region.

## Signature

```python
validation_curve(estimator, X, y, param_name, param_range, cv=5)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - sweep ONE hyperparameter and watch
#             train + val scores. Find the sweet spot.
# STRENGTHS - shows where overfitting starts as a
#             function of complexity.
# WEAKNESSES- doesn't yet show param ranges or
#             plotting.
#
from sklearn.model_selection import validation_curve
import numpy as np

train_s, val_s = validation_curve(
    model, X, y, param_name="max_depth",
    param_range=np.arange(1, 15), cv=5)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday recipe: pick a parameter
#             range that spans "too simple" to "too
#             complex"; plot train + val; pick the val
#             peak.
# STRENGTHS - the val-peak rule is the most direct
#             "what should this hyperparameter be?"
#             answer.
# WEAKNESSES- doesn't address Pipeline integration or
#             searching multiple params at once —
#             senior.
#
import numpy as np, matplotlib.pyplot as plt
from sklearn.model_selection import validation_curve

depths = np.arange(1, 16)
train_s, val_s = validation_curve(
    model, X, y,
    param_name="max_depth", param_range=depths,
    cv=5, n_jobs=-1,
)
train_m, val_m = train_s.mean(1), val_s.mean(1)

plt.plot(depths, train_m, label="train")
plt.plot(depths, val_m, label="val")
plt.xlabel("max_depth"); plt.ylabel("score"); plt.legend()

best = depths[np.argmax(val_m)]
print(f"Optimal max_depth: {best}")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production usage: pair validation_curve
#             with a Pipeline (so preprocessing fits
#             per fold), use "step__param" notation
#             for parameter names, prefer log-spaced
#             ranges for hyperparameters that span
#             magnitudes (C, alpha, learning_rate).
# STRENGTHS - Pipeline + step__param keeps the curve
#             leakage-free; log-spaced ranges expose
#             the typical U-shaped train/val gap.
# WEAKNESSES- one parameter at a time misses
#             interactions — for that, GridSearch with
#             cv_results_ visualization wins.
#
import numpy as np
from sklearn.model_selection import validation_curve
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

pipe = Pipeline([
    ("scale", StandardScaler()),
    ("clf",   LogisticRegression(max_iter=1000)),
])

# Log-spaced range for C
C_range = np.logspace(-3, 3, 13)
train_s, val_s = validation_curve(
    pipe, X, y,
    param_name="clf__C",                    # step__param notation
    param_range=C_range,
    cv=5, scoring="f1_weighted", n_jobs=-1,
)

best_C = C_range[np.argmax(val_s.mean(1))]

# Decision rule:
#   one parameter to tune, want to SEE the curve   -> validation_curve
#   multiple parameters, just want best combo      -> GridSearchCV
#   parameter spans orders of magnitude            -> np.logspace range
#   parameter is integer count                     -> np.arange / list
#   parameter is regularization strength           -> np.logspace(-3, 3, 13)
#   need both train and val side-by-side           -> validation_curve does this
#   parameter inside Pipeline                      -> use "step__param" name
#
# Anti-pattern: picking the parameter value that maximizes the TRAIN curve
#   It looks tempting because the train score keeps rising, but that's
#   the overfit direction. Always pick the value at the validation peak
#   (or a slightly more regularized one if the peak is a plateau). Also:
#   linear-spaced range on log-scale params (C, alpha) misses the action.
```

## Decision Rule

```text
one parameter to tune, want to SEE the curve   -> validation_curve
multiple parameters, just want best combo      -> GridSearchCV
parameter spans orders of magnitude            -> np.logspace range
parameter is integer count                     -> np.arange / list
parameter is regularization strength           -> np.logspace(-3, 3, 13)
need both train and val side-by-side           -> validation_curve does this
parameter inside Pipeline                      -> use "step__param" name
```

## Anti-Pattern

> [!warning] Anti-pattern
> picking the parameter value that maximizes the TRAIN curve
>   It looks tempting because the train score keeps rising, but that's
>   the overfit direction. Always pick the value at the validation peak
>   (or a slightly more regularized one if the peak is a plateau). Also:
>   linear-spaced range on log-scale params (C, alpha) misses the action.

## Tips

- Inspect where gap widens (increasing overfitting)
- Look for "sweet spot" where validation score peaks
- Repeat for each hyperparameter to find interactions

## Common Mistake

> [!warning] Tuning only from final validation score; visualize full curve for insights.

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

- [[Sections/ml/tuning/grid_search_cv|GridSearchCV (Machine Learning)]]
- [[Sections/ml/tuning/randomized_search_cv|RandomizedSearchCV (Machine Learning)]]
- [[Sections/ml/tuning/_Index|Machine Learning → Hyperparameter Tuning]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
