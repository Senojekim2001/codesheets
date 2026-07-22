---
type: "entry"
domain: "python"
file: "ml"
section: "evaluation"
id: "mean_squared_error"
title: "mean_squared_error"
category: "Regression Metrics"
subtitle: "MSE and RMSE"
signature_short: "mean_squared_error(y_true, y_pred, squared=False)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "mean_squared_error"
tags:
  - "python"
  - "python/ml"
  - "python/ml/evaluation"
  - "category/regression-metrics"
  - "tier/tiered"
---

# mean_squared_error

> MSE and RMSE

## Overview

Calculates average of squared differences between predictions and actuals, penalizing large errors; RMSE when squared=False.

## Signature

```python
mean_squared_error(y_true, y_pred, squared=False)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - MSE: avg of squared errors. RMSE: sqrt
#             of MSE, in original units. MAE: mean
#             absolute error.
# STRENGTHS - the three core regression error metrics.
# WEAKNESSES- doesn't yet show when to pick which.
#
import numpy as np
from sklearn.metrics import (
    mean_squared_error, mean_absolute_error)

mse  = mean_squared_error(y_true, y_pred)
rmse = np.sqrt(mse)                                  # root_mean_squared_error in 1.4+
mae  = mean_absolute_error(y_true, y_pred)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday choice: MSE/RMSE penalize
#             large errors more (squared); MAE is
#             outlier-robust. RMSE is the most
#             interpretable for stakeholders (same
#             units as y).
# STRENGTHS - the metric-by-objective rule prevents
#             the "we optimized RMSE but care about
#             MAE" mismatch.
# WEAKNESSES- doesn't address relative error metrics
#             (MAPE) or quantile loss — senior.
#
import numpy as np
from sklearn.metrics import (
    mean_squared_error, mean_absolute_error,
    root_mean_squared_error)        # sklearn >= 1.4

# Standard regression metric panel
mse  = mean_squared_error(y_test, y_pred)
rmse = root_mean_squared_error(y_test, y_pred)        # or np.sqrt(mse)
mae  = mean_absolute_error(y_test, y_pred)
print(f"RMSE {rmse:.3f}  MAE {mae:.3f}  MSE {mse:.3f}")

# Decision rule:
#   want stakeholders to read it    -> RMSE (same units as y)
#   outlier-robust                   -> MAE
#   penalize large errors most        -> MSE
#   optimization target                -> MSE / RMSE (smooth, differentiable)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production regression metrics: scale-
#             aware (MAPE for relative error), domain
#             metrics (mean_pinball_loss for quantile
#             regression), residual analysis to spot
#             heteroscedasticity / bias. Always
#             compare to a baseline (mean predictor).
# STRENGTHS - MAPE is the right metric when relative
#             error matters more than absolute (sales
#             forecasting); pinball loss is the
#             metric for quantile predictions; the
#             baseline-compare habit catches "model
#             is worse than predicting the mean".
# WEAKNESSES- MAPE explodes when y is near zero;
#             pinball loss requires multiple
#             quantiles; baselines are dataset-
#             specific.
#
import numpy as np
from sklearn.metrics import (
    mean_squared_error, mean_absolute_error,
    mean_absolute_percentage_error, mean_pinball_loss)

# Relative error (sales / financial forecasting)
mape = mean_absolute_percentage_error(y_test, y_pred)

# Quantile-regression score
pinball_50 = mean_pinball_loss(y_test, y_pred_q50, alpha=0.5)
pinball_90 = mean_pinball_loss(y_test, y_pred_q90, alpha=0.9)

# Baseline — predict the mean
baseline_pred = np.full_like(y_test, y_train.mean())
baseline_rmse = np.sqrt(mean_squared_error(y_test, baseline_pred))
print(f"model RMSE {np.sqrt(mean_squared_error(y_test, y_pred)):.2f}")
print(f"baseline    {baseline_rmse:.2f}")

# Decision rule:
#   absolute error in y units       -> RMSE / MAE
#   relative / percentage error     -> MAPE (avoid near y=0)
#   quantile predictions            -> mean_pinball_loss(alpha=q)
#   stakeholder reporting           -> RMSE + a baseline comparison
#   outliers shouldn't dominate     -> MAE (or HuberLoss training)
#   you want to penalize big misses -> MSE / RMSE (squared loss)
#   compare across target scales    -> MAPE or normalized RMSE
#
# Anti-pattern: comparing RMSE values on differently-scaled targets
#   "Model A's RMSE is 50, model B's is 0.5 — A is worse" is wrong if A
#   predicts revenue ($) and B predicts log-revenue. RMSE is in target
#   units; always compare to the target's std or use R^2 / NRMSE for
#   cross-target comparison. Also: compare to a mean-predictor baseline
#   before declaring a model "good".
```

## Decision Rule

```text
absolute error in y units       -> RMSE / MAE
relative / percentage error     -> MAPE (avoid near y=0)
quantile predictions            -> mean_pinball_loss(alpha=q)
stakeholder reporting           -> RMSE + a baseline comparison
outliers shouldn't dominate     -> MAE (or HuberLoss training)
you want to penalize big misses -> MSE / RMSE (squared loss)
compare across target scales    -> MAPE or normalized RMSE
```

## Anti-Pattern

> [!warning] Anti-pattern
> comparing RMSE values on differently-scaled targets
>   "Model A's RMSE is 50, model B's is 0.5 — A is worse" is wrong if A
>   predicts revenue ($) and B predicts log-revenue. RMSE is in target
>   units; always compare to the target's std or use R^2 / NRMSE for
>   cross-target comparison. Also: compare to a mean-predictor baseline
>   before declaring a model "good".

## Tips

- MSE penalizes large errors more; RMSE in original units
- MAE more interpretable; less sensitive to outliers
- Lower is better; compare to baseline (e.g., mean of y_true)

## Common Mistake

> [!warning] Using MSE alone; combine with MAE or RMSE for better understanding.

## Shorthand (Junior → Senior)

**Junior:**
```python
from sklearn.metrics import mean_squared_error, mean_absolute_error
import numpy as np
y_true = np.array([3.0, -0.5, 2.0, 7.0])
y_pred = np.array([2.5, 0.0, 2.0, 8.0])
```

**Senior:**
```python
print(f'\nManual MSE: {manual_mse:.3f}')
```

## See Also

- [[Sections/ml/evaluation/_Index|Machine Learning → Model Evaluation]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
