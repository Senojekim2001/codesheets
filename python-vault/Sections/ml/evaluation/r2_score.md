---
type: "entry"
domain: "python"
file: "ml"
section: "evaluation"
id: "r2_score"
title: "r2_score"
category: "Classification Metrics"
subtitle: "Variance explained"
signature_short: "r2_score(y_true, y_pred)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "r2_score"
tags:
  - "python"
  - "python/ml"
  - "python/ml/evaluation"
  - "category/classification-metrics"
  - "tier/tiered"
---

# r2_score

> Variance explained

## Overview

Measures proportion of variance explained by model (0-1); 1.0 is perfect, 0.0 means no better than mean baseline, negative means worse.

## Signature

```python
r2_score(y_true, y_pred)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - 1.0 = perfect, 0.0 = predicts mean,
#             negative = worse than predicting mean.
# STRENGTHS - the standard "how much variance did the
#             model explain?" metric.
# WEAKNESSES- doesn't yet show that R² is NOT
#             comparable across datasets.
#
from sklearn.metrics import r2_score
r2_score(y_true, y_pred)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday R^2 patterns: model.score
#             returns R^2 for regressors; compare to
#             baseline (mean predictor); explicit
#             multi-output via multioutput=
#             "raw_values".
# STRENGTHS - the model.score shortcut is what most
#             code uses; multi-output is the right
#             tool for vector-valued y.
# WEAKNESSES- doesn't address adjusted R^2 or the
#             "R^2 across datasets" warning — senior.
#
from sklearn.metrics import r2_score

# Same as the regressor's score method
reg.score(X_test, y_test)
r2_score(y_test, reg.predict(X_test))

# Multi-output
r2_score(Y_test, Y_pred, multioutput="raw_values")    # per-target
r2_score(Y_test, Y_pred, multioutput="uniform_average")
r2_score(Y_test, Y_pred,
          multioutput="variance_weighted")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production R^2 caveats: NEVER compare
#             R^2 across datasets (the variance
#             baseline differs); use adjusted R^2
#             when comparing models with different
#             feature counts; on time series, R^2 can
#             be artificially high if the target has
#             a strong trend.
# STRENGTHS - the cross-dataset rule prevents the
#             "model A on dataset 1 has R^2=0.9, model
#             B on dataset 2 has R^2=0.8, A is
#             better" fallacy; adjusted R^2 penalizes
#             extra features fairly.
# WEAKNESSES- adjusted R^2 isn't built into sklearn
#             — compute manually; trend dominance on
#             time series is sometimes desired.
#
import numpy as np
from sklearn.metrics import r2_score

r2 = r2_score(y_test, y_pred)
n  = len(y_test)
p  = X_test.shape[1]
adj_r2 = 1 - (1 - r2) * (n - 1) / (n - p - 1)
print(f"R^2 {r2:.3f}  adjusted {adj_r2:.3f}")

# Time-series caveat: detrend before computing R^2 if
# the target has a strong trend
y_trend = np.polyval(np.polyfit(t, y_test, 1), t)
r2_residual = r2_score(y_test - y_trend, y_pred - y_trend)

# Decision rule:
#   single dataset, regression baseline     -> r2_score (or .score())
#   compare models with different #features -> adjusted R^2
#   compare across datasets                 -> use RMSE / MAE instead
#   time-series with strong trend           -> detrend or quote residual R^2
#   negative R^2                            -> model is worse than the mean
#   need a single intuitive number          -> R^2 still works as a summary
#
# Anti-pattern: trusting training R^2 as a quality signal
#   Training R^2 only goes UP as you add features (even noise ones); it
#   doesn't measure generalization. Always report cross-validated R^2 on
#   held-out folds. Also: never compare R^2 across datasets — variance
#   in y differs, so the baseline differs; use RMSE/MAE for that compare.
```

## Decision Rule

```text
single dataset, regression baseline     -> r2_score (or .score())
compare models with different #features -> adjusted R^2
compare across datasets                 -> use RMSE / MAE instead
time-series with strong trend           -> detrend or quote residual R^2
negative R^2                            -> model is worse than the mean
need a single intuitive number          -> R^2 still works as a summary
```

## Anti-Pattern

> [!warning] Anti-pattern
> trusting training R^2 as a quality signal
>   Training R^2 only goes UP as you add features (even noise ones); it
>   doesn't measure generalization. Always report cross-validated R^2 on
>   held-out folds. Also: never compare R^2 across datasets — variance
>   in y differs, so the baseline differs; use RMSE/MAE for that compare.

## Tips

- R² = 1 perfect, 0 no improvement over mean baseline, <0 worse than mean
- Not scale-invariant; difficult to compare across datasets
- Adjusted R² penalizes additional features for multivariate comparison

## Common Mistake

> [!warning] Comparing R² scores across different datasets; use adjusted R² or RMSE instead.

## Shorthand (Junior → Senior)

**Junior:**
```python
from sklearn.metrics import r2_score
import numpy as np
y_true = np.array([3.0, -0.5, 2.0, 7.0, 4.5])
y_pred = np.array([2.5, 0.0, 2.0, 8.0, 4.0])
```

**Senior:**
```python
print(f'\nBaseline (mean) R²: {baseline_r2:.3f}')
```

## See Also

- [[Sections/ml/evaluation/accuracy_score|accuracy_score (Machine Learning)]]
- [[Sections/ml/evaluation/precision_recall_f1|precision_score, recall_score, f1_score (Machine Learning)]]
- [[Sections/ml/evaluation/confusion_matrix|confusion_matrix (Machine Learning)]]
- [[Sections/ml/evaluation/classification_report|classification_report (Machine Learning)]]
- [[Sections/ml/evaluation/_Index|Machine Learning → Model Evaluation]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
