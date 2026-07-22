---
type: "entry"
domain: "python"
file: "ml"
section: "tuning"
id: "learning_curve"
title: "learning_curve"
category: "Diagnostic Curves"
subtitle: "Training size impact"
signature_short: "learning_curve(estimator, X, y, cv=5, train_sizes=np.linspace(0.1, 1.0, 10))"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "learning_curve"
tags:
  - "python"
  - "python/ml"
  - "python/ml/tuning"
  - "category/diagnostic-curves"
  - "tier/tiered"
---

# learning_curve

> Training size impact

## Overview

Analyzes model performance as training set size increases, diagnosing bias (underfitting) vs variance (overfitting) problems.

## Signature

```python
learning_curve(estimator, X, y, cv=5, train_sizes=np.linspace(0.1, 1.0, 10))
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - train and validation scores at varying
#             dataset sizes. Diagnoses bias vs
#             variance.
# STRENGTHS - the canonical "do I need more data?"
#             diagnostic.
# WEAKNESSES- doesn't yet show interpretation rules.
#
from sklearn.model_selection import learning_curve
import numpy as np

train_sizes, train_scores, val_scores = learning_curve(
    model, X, y, cv=5,
    train_sizes=np.linspace(0.1, 1.0, 10))
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday recipe: compute, average
#             across folds, plot train + val with
#             shaded std band, interpret the gap.
# STRENGTHS - the gap-interpretation rule is the
#             whole reason to plot the curve.
# WEAKNESSES- doesn't address what to do when each
#             diagnosis fires — senior tier.
#
import numpy as np, matplotlib.pyplot as plt
from sklearn.model_selection import learning_curve

ts, train_s, val_s = learning_curve(
    model, X, y,
    train_sizes=np.linspace(0.1, 1.0, 10),
    cv=5, n_jobs=-1, random_state=42,
)

train_m, train_sd = train_s.mean(1), train_s.std(1)
val_m,   val_sd   = val_s.mean(1),   val_s.std(1)

plt.plot(ts, train_m, label="train")
plt.fill_between(ts, train_m - train_sd, train_m + train_sd, alpha=0.2)
plt.plot(ts, val_m, label="val")
plt.fill_between(ts, val_m - val_sd, val_m + val_sd, alpha=0.2)
plt.xlabel("Training size"); plt.ylabel("Score"); plt.legend()

# Interpretation:
#   large gap, train high             -> overfitting (variance)
#   both low, gap small                -> underfitting (bias)
#   curves still rising at full data    -> more data would help
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production diagnosis: each pattern maps
#             to a different fix. Overfitting -> add
#             regularization or simplify model.
#             Underfitting -> increase model capacity
#             or feature richness. Curves still rising
#             -> collect more data. Plateau low ->
#             feature engineering needed.
# STRENGTHS - explicit fix-by-pattern decision rule
#             prevents the "I'll just try a different
#             model" wandering.
# WEAKNESSES- diagnoses are heuristic; sometimes both
#             fixes apply.
#
import numpy as np, matplotlib.pyplot as plt
from sklearn.model_selection import learning_curve

# Use a Pipeline so preprocessing fits per fold
ts, train_s, val_s = learning_curve(
    pipe, X, y, cv=5,
    train_sizes=np.linspace(0.1, 1.0, 10),
    n_jobs=-1, random_state=42,
)
train_m, val_m = train_s.mean(1), val_s.mean(1)
gap = train_m - val_m

# Diagnose
final_gap = gap[-1]
final_val = val_m[-1]
slope_at_end = (val_m[-1] - val_m[-3]) / (ts[-1] - ts[-3])

if final_gap > 0.10 and train_m[-1] > 0.85:
    print("OVERFITTING -> add regularization, more data, or simpler model")
elif final_val < 0.60 and final_gap < 0.05:
    print("UNDERFITTING -> increase model capacity or features")
elif slope_at_end > 0.005:
    print("STILL LEARNING -> collect more data")
else:
    print("PLATEAUED -> feature engineering / different algorithm")

# Decision rule:
#   train high, val low, big gap        -> overfitting (regularize / shrink)
#   both low, small gap                  -> underfitting (more capacity)
#   val curve still rising at full N     -> collect more data
#   both flat, gap tiny                  -> feature eng. or new algorithm
#   curves noisy across folds            -> raise n_splits or shuffle=True
#   long fits, want a fast read          -> use fewer train_sizes (5)
#   compare two models                   -> overlay both learning curves
#
# Anti-pattern: drawing a learning curve with the model fit OUTSIDE a Pipeline
#   If preprocessing happens before learning_curve, every train_sizes
#   slice gets the SAME (whole-data) preprocessing — train scores are
#   inflated and the diagnosis is wrong. Pass a Pipeline so each slice
#   refits its own scaler/encoder. Also: using shuffle=False on grouped
#   data hides leakage that the production model will hit.
```

## Decision Rule

```text
train high, val low, big gap        -> overfitting (regularize / shrink)
both low, small gap                  -> underfitting (more capacity)
val curve still rising at full N     -> collect more data
both flat, gap tiny                  -> feature eng. or new algorithm
curves noisy across folds            -> raise n_splits or shuffle=True
long fits, want a fast read          -> use fewer train_sizes (5)
compare two models                   -> overlay both learning curves
```

## Anti-Pattern

> [!warning] Anti-pattern
> drawing a learning curve with the model fit OUTSIDE a Pipeline
>   If preprocessing happens before learning_curve, every train_sizes
>   slice gets the SAME (whole-data) preprocessing — train scores are
>   inflated and the diagnosis is wrong. Pass a Pipeline so each slice
>   refits its own scaler/encoder. Also: using shuffle=False on grouped
>   data hides leakage that the production model will hit.

## Tips

- Large gap between train and val = overfitting; use regularization
- Low training score = underfitting; increase model complexity
- Converging curves suggest sufficient data

## Common Mistake

> [!warning] Not plotting curves; hard to diagnose bias-variance tradeoff visually.

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

- [[Sections/ml/tuning/_Index|Machine Learning → Hyperparameter Tuning]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
