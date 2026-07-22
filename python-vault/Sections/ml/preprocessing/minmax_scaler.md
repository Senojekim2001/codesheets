---
type: "entry"
domain: "python"
file: "ml"
section: "preprocessing"
id: "minmax_scaler"
title: "MinMaxScaler"
category: "Feature Scaling"
subtitle: "Bounds scaling to [0, 1]"
signature_short: "MinMaxScaler(feature_range=(0, 1)).fit_transform(X)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "MinMaxScaler"
  - "minmax_scaler"
tags:
  - "python"
  - "python/ml"
  - "python/ml/preprocessing"
  - "category/feature-scaling"
  - "tier/tiered"
---

# MinMaxScaler

> Bounds scaling to [0, 1]

## Overview

Rescales features to a fixed interval, commonly [0, 1], preserving the shape of the original distribution and outlier presence.

## Signature

```python
MinMaxScaler(feature_range=(0, 1)).fit_transform(X)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - scale every feature into [0, 1]. Min
#             becomes 0, max becomes 1.
# STRENGTHS - simplest "bound my features" pattern.
# WEAKNESSES- fragile to outliers — one extreme value
#             squashes everything else.
#
from sklearn.preprocessing import MinMaxScaler

scaler = MinMaxScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s  = scaler.transform(X_test)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday MinMax surface: feature_range
#             = (0, 1) default, ( -1, 1) for some
#             models, integrate into a Pipeline.
# STRENGTHS - covers the common ranges; Pipeline use
#             is the standard leakage-proof pattern.
# WEAKNESSES- doesn't address outlier handling or the
#             "test data outside train range" gotcha
#             — senior tier.
#
from sklearn.preprocessing import MinMaxScaler
from sklearn.pipeline import Pipeline

# Common ranges
MinMaxScaler(feature_range=(0, 1))         # default — for many neural nets
MinMaxScaler(feature_range=(-1, 1))        # tanh-friendly

# Pipeline integration
pipe = Pipeline([
    ("scaler", MinMaxScaler()),
    ("model",  some_estimator),
])
pipe.fit(X_train, y_train)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production MinMax: clip outliers BEFORE
#             scaling (one extreme value crushes the
#             rest); test data outside the train range
#             produces values outside [0, 1] (allow it
#             with clip=False, the default, OR force
#             with clip=True in newer sklearn).
# STRENGTHS - explicit outlier handling makes MinMax
#             usable on real data; clip=True caps
#             out-of-range test values.
# WEAKNESSES- pre-clipping requires a percentile
#             choice; clip=True hides distribution shift.
#
import numpy as np
from sklearn.preprocessing import MinMaxScaler

# 1. Clip outliers BEFORE scaling
lo, hi = np.percentile(X_train, [1, 99], axis=0)
X_train_clip = np.clip(X_train, lo, hi)
X_test_clip  = np.clip(X_test,  lo, hi)         # use TRAIN bounds

scaler = MinMaxScaler()
X_train_s = scaler.fit_transform(X_train_clip)
X_test_s  = scaler.transform(X_test_clip)

# 2. Force test data into [0, 1] (sklearn 1.2+)
scaler = MinMaxScaler(clip=True)
X_train_s = scaler.fit_transform(X_train)
X_test_s  = scaler.transform(X_test)            # capped at train range

# Decision rule:
#   normal-ish features                    -> StandardScaler
#   outliers dominate                      -> RobustScaler
#   bounded input required, no outliers    -> MinMaxScaler
#   bounded input required, with outliers  -> clip then MinMax, OR clip=True
#   sparse / sign-preserving               -> MaxAbsScaler
#
# Anti-pattern: scaling a column where one outlier dominates the range
#   With one row at 10^6 and the rest under 100, MinMax squeezes 99% of
#   data into [0, 0.0001] — the model effectively sees a constant feature.
#   The fix is to clip percentiles (1/99) on TRAIN, then scale; or switch
#   to RobustScaler. Never compute clip bounds from the full X (leakage).
```

## Decision Rule

```text
normal-ish features                    -> StandardScaler
outliers dominate                      -> RobustScaler
bounded input required, no outliers    -> MinMaxScaler
bounded input required, with outliers  -> clip then MinMax, OR clip=True
sparse / sign-preserving               -> MaxAbsScaler
```

## Anti-Pattern

> [!warning] Anti-pattern
> scaling a column where one outlier dominates the range
>   With one row at 10^6 and the rest under 100, MinMax squeezes 99% of
>   data into [0, 0.0001] — the model effectively sees a constant feature.
>   The fix is to clip percentiles (1/99) on TRAIN, then scale; or switch
>   to RobustScaler. Never compute clip bounds from the full X (leakage).

## Tips

- Use MinMaxScaler when features need bounded ranges (e.g., neural networks)
- Sensitive to outliers; consider clipping extreme values first
- Preserves the original distribution shape better than StandardScaler
- When outliers dominate the column, switch to `RobustScaler` (median / IQR); for sparse / sign-preserving data use `MaxAbsScaler`

## Common Mistake

> [!warning] Using MinMaxScaler on data with extreme outliers without handling them first.

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

- [[Sections/ml/preprocessing/standard_scaler|StandardScaler (Machine Learning)]]
- [[Sections/ml/preprocessing/_Index|Machine Learning → Data Preprocessing]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
