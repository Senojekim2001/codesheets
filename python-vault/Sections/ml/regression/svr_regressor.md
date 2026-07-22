---
type: "entry"
domain: "python"
file: "ml"
section: "regression"
id: "svr_regressor"
title: "SVR (Support Vector Regressor)"
category: "Kernel Methods"
subtitle: "Margin-based regression"
signature_short: "SVR(kernel='rbf', C=1.0, gamma='scale')"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "SVR (Support Vector Regressor)"
  - "svr_regressor"
tags:
  - "python"
  - "python/ml"
  - "python/ml/regression"
  - "category/kernel-methods"
  - "tier/tiered"
---

# SVR (Support Vector Regressor)

> Margin-based regression

## Overview

Uses support vector machines for regression with kernel methods, effective for non-linear relationships with epsilon-tube loss function.

## Signature

```python
SVR(kernel='rbf', C=1.0, gamma='scale')
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - scale x AND y for SVR. RBF kernel default.
# STRENGTHS - the simplest non-linear regressor with no
#             feature engineering.
# WEAKNESSES- doesn't yet show C, epsilon, or scaling
#             best practices.
#
from sklearn.svm import SVR
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

reg = Pipeline([
    ("scale", StandardScaler()),
    ("svr",   SVR(kernel="rbf")),
])
reg.fit(X_train, y_train)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday SVR knobs: C (slack), gamma
#             (RBF width), epsilon (insensitive tube
#             width). For regression, scale BOTH X and y
#             (use TransformedTargetRegressor).
# STRENGTHS - scaling y is the most-missed SVR rule;
#             TransformedTargetRegressor handles it
#             cleanly.
# WEAKNESSES- doesn't address scale limits — senior.
#
import numpy as np
from sklearn.svm import SVR
from sklearn.compose import TransformedTargetRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

# Scale both X and y; target scaling matters for SVR
reg = TransformedTargetRegressor(
    regressor=Pipeline([
        ("scale", StandardScaler()),
        ("svr",   SVR(kernel="rbf", C=1.0,
                       gamma="scale", epsilon=0.1)),
    ]),
    transformer=StandardScaler(),
)
reg.fit(X_train, y_train)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production SVR: SVR is O(n^2 .. n^3);
#             for N > ~10k switch to LinearSVR (linear
#             only) or KernelRidge (closed-form). Tune
#             C/gamma/epsilon in CV with the full
#             pipeline so scaling refits per fold.
# STRENGTHS - the scale rule prevents the "30-minute
#             fit" notebook surprise; LinearSVR /
#             KernelRidge are the standard escape
#             hatches.
# WEAKNESSES- KernelRidge is O(n^2) too — use it for
#             non-linear small data; LinearSVR loses
#             non-linear capacity.
#
import numpy as np
from sklearn.svm import SVR, LinearSVR
from sklearn.kernel_ridge import KernelRidge
from sklearn.compose import TransformedTargetRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import GridSearchCV

base = TransformedTargetRegressor(
    regressor=Pipeline([
        ("scale", StandardScaler()),
        ("svr",   SVR(kernel="rbf")),
    ]),
    transformer=StandardScaler(),
)

grid = GridSearchCV(base, param_grid={
    "regressor__svr__C":       [0.1, 1.0, 10.0],
    "regressor__svr__gamma":   ["scale", 0.01, 0.1, 1.0],
    "regressor__svr__epsilon": [0.01, 0.1, 0.5],
}, cv=5, n_jobs=-1)
grid.fit(X_train, y_train)

# Decision rule (regression by N):
#   N <= 10k, non-linear        -> SVR(rbf)
#   N <= 50k, linear OK          -> LinearSVR
#   small N, closed-form fast    -> KernelRidge
#   N >> 50k                      -> HistGradientBoostingRegressor
#
# Decision rule:
#   N < 10k, non-linear, smooth target  -> SVR(kernel="rbf")
#   linear regression at any scale      -> LinearSVR or Ridge
#   N < 1k, want closed-form non-linear -> KernelRidge
#   N > 50k                             -> tree ensemble (HistGBM)
#   y has long tail / outliers          -> wrap in TransformedTargetRegressor(log)
#   scale of features differs           -> StandardScaler IN the Pipeline
#   tune three knobs (C, gamma, eps)    -> GridSearchCV with Pipeline
#
# Anti-pattern: skipping y-scaling on heavy-tailed targets
#   SVR depends on the absolute scale of y (epsilon-insensitive tube),
#   so a target ranging 0..1e6 makes default epsilon meaningless and
#   most points sit inside the tube — the model under-fits. Wrap in
#   TransformedTargetRegressor(transformer=StandardScaler()) or log(1+y).
```

## Decision Rule

```text
N < 10k, non-linear, smooth target  -> SVR(kernel="rbf")
linear regression at any scale      -> LinearSVR or Ridge
N < 1k, want closed-form non-linear -> KernelRidge
N > 50k                             -> tree ensemble (HistGBM)
y has long tail / outliers          -> wrap in TransformedTargetRegressor(log)
scale of features differs           -> StandardScaler IN the Pipeline
tune three knobs (C, gamma, eps)    -> GridSearchCV with Pipeline
```

## Anti-Pattern

> [!warning] Anti-pattern
> skipping y-scaling on heavy-tailed targets
>   SVR depends on the absolute scale of y (epsilon-insensitive tube),
>   so a target ranging 0..1e6 makes default epsilon meaningless and
>   most points sit inside the tube — the model under-fits. Wrap in
>   TransformedTargetRegressor(transformer=StandardScaler()) or log(1+y).

## Tips

- Always scale features before SVR; StandardScaler is essential
- Tune C parameter: higher C fits training data more closely
- Epsilon controls tube width around decision function

## Common Mistake

> [!warning] Not scaling features, causing poor convergence and weak predictions.

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

- [[Sections/ml/classification/svm_classifier|SVC (Support Vector Classifier) (Machine Learning)]]
- [[Sections/ml/regression/_Index|Machine Learning → Regression Models]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
