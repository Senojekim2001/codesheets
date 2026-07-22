---
type: "entry"
domain: "python"
file: "ml"
section: "regression"
id: "elasticnet_regression"
title: "ElasticNet"
category: "Linear Models"
subtitle: "Hybrid L1/L2 penalty"
signature_short: "ElasticNet(alpha=0.1, l1_ratio=0.5, random_state=42)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "ElasticNet"
  - "elasticnet_regression"
tags:
  - "python"
  - "python/ml"
  - "python/ml/regression"
  - "category/linear-models"
  - "tier/tiered"
---

# ElasticNet

> Hybrid L1/L2 penalty

## Overview

Combines Ridge (L2) and Lasso (L1) penalties, providing both feature selection and coefficient shrinkage for balanced regularization.

## Signature

```python
ElasticNet(alpha=0.1, l1_ratio=0.5, random_state=42)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - ElasticNet = L1 + L2 mixed. l1_ratio
#             controls the mix (0=Ridge, 1=Lasso).
# STRENGTHS - the best of both — selection from L1,
#             stability from L2.
# WEAKNESSES- doesn't yet show ElasticNetCV or scaling.
#
from sklearn.linear_model import ElasticNet

reg = ElasticNet(alpha=0.1, l1_ratio=0.5)
reg.fit(X_train, y_train)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday ElasticNet surface: scale
#             first, ElasticNetCV tunes both alpha and
#             l1_ratio simultaneously, max_iter cranked
#             up for convergence on stiff problems.
# STRENGTHS - ElasticNetCV is the right tool for
#             tuning the two hyperparameters together;
#             the model handles correlated features
#             far more gracefully than Lasso alone.
# WEAKNESSES- doesn't address how to interpret the
#             chosen l1_ratio — senior tier.
#
import numpy as np
from sklearn.linear_model import ElasticNetCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

pipe = Pipeline([
    ("scale", StandardScaler()),
    ("en", ElasticNetCV(
        l1_ratio=[0.1, 0.5, 0.7, 0.9, 0.99, 1.0],
        alphas=np.logspace(-4, 1, 30),
        cv=5, random_state=42, max_iter=10_000,
    )),
])
pipe.fit(X_train, y_train)
en = pipe.named_steps["en"]
print(f"alpha={en.alpha_:.5f} l1_ratio={en.l1_ratio_}")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production ElasticNet: l1_ratio is
#             diagnostic — values near 1 mean Lasso
#             behavior was preferred (clear feature
#             selection), values near 0 mean Ridge
#             behavior (correlated features). Use the
#             chosen l1_ratio to inform whether to
#             simplify the model.
# STRENGTHS - the l1_ratio tells you what your data
#             needs; pairs naturally with the
#             Ridge/Lasso decision rule.
# WEAKNESSES- still scales O(p) per coordinate descent
#             iteration; for extreme p, switch to SGD
#             or feature-pre-selection first.
#
import numpy as np
from sklearn.linear_model import ElasticNetCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

pipe = Pipeline([
    ("scale", StandardScaler()),
    ("en", ElasticNetCV(
        l1_ratio=[0.1, 0.3, 0.5, 0.7, 0.9, 0.95, 0.99, 1.0],
        alphas=np.logspace(-5, 2, 50),
        cv=5, random_state=42, max_iter=20_000,
        n_jobs=-1,
    )),
])
pipe.fit(X_train, y_train)
en = pipe.named_steps["en"]

# Diagnostic interpretation
if en.l1_ratio_ >= 0.95:
    print("Lasso-like solution -> consider switching to LassoCV for clarity")
elif en.l1_ratio_ <= 0.2:
    print("Ridge-like solution -> consider switching to RidgeCV for speed")
else:
    print("True mix -> ElasticNet is the right choice")

# Decision rule:
#   uncertain about correlation        -> ElasticNet (then check l1_ratio)
#   l1_ratio chooses ~1 in CV          -> LassoCV
#   l1_ratio chooses ~0 in CV          -> RidgeCV
#   selected mix sits 0.3..0.7         -> ElasticNet IS the right tool
#   need feature selection + stability -> ElasticNet over Lasso
#   want one CV-tuned model in 2 lines -> ElasticNetCV
#
# Anti-pattern: tuning only alpha and leaving l1_ratio at the default 0.5
#   ElasticNet has TWO knobs; locking l1_ratio at 0.5 forfeits its main
#   advantage. Pass a list of ratios (e.g. [.1, .5, .7, .9, .95, .99, 1])
#   to ElasticNetCV. Also: too small a max_iter silently converges to a
#   worse solution — bump max_iter to 10,000+ when warnings appear.
```

## Decision Rule

```text
uncertain about correlation        -> ElasticNet (then check l1_ratio)
l1_ratio chooses ~1 in CV          -> LassoCV
l1_ratio chooses ~0 in CV          -> RidgeCV
selected mix sits 0.3..0.7         -> ElasticNet IS the right tool
need feature selection + stability -> ElasticNet over Lasso
want one CV-tuned model in 2 lines -> ElasticNetCV
```

## Anti-Pattern

> [!warning] Anti-pattern
> tuning only alpha and leaving l1_ratio at the default 0.5
>   ElasticNet has TWO knobs; locking l1_ratio at 0.5 forfeits its main
>   advantage. Pass a list of ratios (e.g. [.1, .5, .7, .9, .95, .99, 1])
>   to ElasticNetCV. Also: too small a max_iter silently converges to a
>   worse solution — bump max_iter to 10,000+ when warnings appear.

## Tips

- l1_ratio=0 becomes Ridge, l1_ratio=1 becomes Lasso; 0.5 balances both
- Better than Lasso when many correlated features exist
- Tune both alpha and l1_ratio via cross-validation

## Common Mistake

> [!warning] Not tuning l1_ratio; default 0.5 may not be optimal for your data.

## Shorthand (Junior → Senior)

**Junior:**
```python
from sklearn.linear_model import ElasticNet
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np
```

**Senior:**
```python
print(f'Non-zero coefficients: {np.sum(model.coef_ != 0)}')
```

## See Also

- [[Sections/ml/classification/logistic_regression|LogisticRegression (Machine Learning)]]
- [[Sections/ml/regression/linear_regression|LinearRegression (Machine Learning)]]
- [[Sections/ml/regression/ridge_regression|Ridge (Machine Learning)]]
- [[Sections/ml/regression/lasso_regression|Lasso (Machine Learning)]]
- [[Sections/ml/regression/_Index|Machine Learning → Regression Models]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
