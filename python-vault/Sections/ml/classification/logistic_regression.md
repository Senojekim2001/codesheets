---
type: "entry"
domain: "python"
file: "ml"
section: "classification"
id: "logistic_regression"
title: "LogisticRegression"
category: "Linear Models"
subtitle: "Probabilistic binary classifier"
signature_short: "LogisticRegression(max_iter=1000, random_state=42)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "LogisticRegression"
  - "logistic_regression"
tags:
  - "python"
  - "python/ml"
  - "python/ml/classification"
  - "category/linear-models"
  - "tier/tiered"
---

# LogisticRegression

> Probabilistic binary classifier

## Overview

Linear classifier using logistic function to model probability of class membership, suitable for binary and multiclass classification with interpretable coefficients.

## Signature

```python
LogisticRegression(max_iter=1000, random_state=42)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - fit, predict, score. max_iter=1000 to
#             avoid convergence warnings.
# STRENGTHS - the simplest classifier baseline; reads
#             like every other sklearn estimator.
# WEAKNESSES- doesn't yet show predict_proba,
#             regularization, or scaling requirement.
#
from sklearn.linear_model import LogisticRegression

clf = LogisticRegression(max_iter=1000, random_state=42)
clf.fit(X_train, y_train)
clf.score(X_test, y_test)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday LR surface: scale features
#             FIRST (LR is sensitive), regularization
#             via C= (smaller C = more reg), predict_proba
#             for confidence scores, class_weight=
#             "balanced" for imbalanced data.
# STRENGTHS - covers what real LR usage looks like;
#             class_weight="balanced" is the single most
#             useful imbalance tool.
# WEAKNESSES- doesn't address penalty="l1" / "elasticnet"
#             or multi_class options — senior tier.
#
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report

pipe = Pipeline([
    ("scale", StandardScaler()),                # LR is scale-sensitive
    ("clf",   LogisticRegression(
        C=1.0,                                   # smaller -> more regularization
        max_iter=1000,
        class_weight="balanced",                 # weight inversely by frequency
        random_state=42,
    )),
])
pipe.fit(X_train, y_train)

# Predicted probabilities for thresholding / ranking
proba = pipe.predict_proba(X_test)[:, 1]
print(classification_report(y_test, pipe.predict(X_test)))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production LR: penalty="l1" for sparse
#             coefficients (feature selection),
#             "elasticnet" for both, calibrate
#             probabilities for downstream thresholding,
#             use class_weight or sample_weight for
#             imbalance.
# STRENGTHS - L1/elasticnet selects features inline;
#             calibration is essential when probability
#             values feed into business decisions.
# WEAKNESSES- L1 is slow for large feature counts;
#             elasticnet adds a second hyperparameter
#             (l1_ratio); calibration adds compute and
#             requires a held-out set.
#
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

# Sparse coefficients via L1 (feature selection inside the model)
pipe = Pipeline([
    ("scale", StandardScaler()),
    ("clf",   LogisticRegression(
        penalty="l1", solver="liblinear",        # L1 needs liblinear or saga
        C=0.5, max_iter=2000,
        random_state=42,
    )),
])
pipe.fit(X_train, y_train)

# Selected feature mask
nonzero = pipe.named_steps["clf"].coef_.ravel() != 0
print(f"selected {nonzero.sum()} of {len(nonzero)} features")

# Calibration — when probabilities matter (thresholds, expected value)
cal = CalibratedClassifierCV(pipe, method="isotonic", cv=5)
cal.fit(X_train, y_train)
proba = cal.predict_proba(X_test)[:, 1]
# Now proba is well-calibrated for setting business thresholds.

# Decision rule:
#   tabular baseline                  -> LogisticRegression(L2)
#   want feature selection inline     -> penalty="l1"
#   probabilities feed into decisions -> CalibratedClassifierCV
#   imbalanced classes                -> class_weight="balanced"
#   high-dim text / sparse            -> solver="saga" + penalty="l1"
#   multi-class                       -> default OvR (or multi_class="multinomial")
#
# Anti-pattern: trusting raw predict_proba as a calibrated probability
#   LogisticRegression's outputs only look calibrated; with regularization
#   or class_weight="balanced" they are NOT, and thresholding on 0.5 quietly
#   underperforms. If probabilities drive decisions (pricing, alerting),
#   wrap in CalibratedClassifierCV and pick the threshold via PR curve.
```

## Decision Rule

```text
tabular baseline                  -> LogisticRegression(L2)
want feature selection inline     -> penalty="l1"
probabilities feed into decisions -> CalibratedClassifierCV
imbalanced classes                -> class_weight="balanced"
high-dim text / sparse            -> solver="saga" + penalty="l1"
multi-class                       -> default OvR (or multi_class="multinomial")
```

## Anti-Pattern

> [!warning] Anti-pattern
> trusting raw predict_proba as a calibrated probability
>   LogisticRegression's outputs only look calibrated; with regularization
>   or class_weight="balanced" they are NOT, and thresholding on 0.5 quietly
>   underperforms. If probabilities drive decisions (pricing, alerting),
>   wrap in CalibratedClassifierCV and pick the threshold via PR curve.

## Tips

- Use C parameter to control regularization strength (lower C = more regularization)
- Access class probabilities with predict_proba() for confidence scores
- Interpretable coefficients show feature importance direction
- For imbalanced classes set `class_weight="balanced"`; if downstream code consumes the probabilities, wrap in `CalibratedClassifierCV` so they reflect real frequencies

## Common Mistake

> [!warning] Not scaling features before LogisticRegression, affecting convergence and coefficient magnitudes.

## Shorthand (Junior → Senior)

**Junior:**
```python
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import numpy as np
```

**Senior:**
```python
print(f'Intercept: {model.intercept_}')
```

## See Also

- [[Sections/ml/regression/linear_regression|LinearRegression (Machine Learning)]]
- [[Sections/ml/regression/ridge_regression|Ridge (Machine Learning)]]
- [[Sections/ml/regression/lasso_regression|Lasso (Machine Learning)]]
- [[Sections/ml/regression/elasticnet_regression|ElasticNet (Machine Learning)]]
- [[Sections/ml/classification/_Index|Machine Learning → Classification Models]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
