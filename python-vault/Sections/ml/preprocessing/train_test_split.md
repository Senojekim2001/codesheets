---
type: "entry"
domain: "python"
file: "ml"
section: "preprocessing"
id: "train_test_split"
title: "train_test_split"
category: "Data Splitting"
subtitle: "Essential train/test partitioning"
signature_short: "train_test_split(X, y, test_size=0.2, random_state=42)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "train_test_split"
tags:
  - "python"
  - "python/ml"
  - "python/ml/preprocessing"
  - "category/data-splitting"
  - "tier/tiered"
---

# train_test_split

> Essential train/test partitioning

## Overview

Divides dataset into training and testing subsets to evaluate model performance on unseen data, preventing overfitting assessment.

## Signature

```python
train_test_split(X, y, test_size=0.2, random_state=42)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - 80/20 split with random_state for
#             reproducibility.
# STRENGTHS - the simplest valid pattern; introduces
#             reproducibility as the default habit.
# WEAKNESSES- doesn't yet show stratify=, group-aware
#             splits, or time-aware splits.
#
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday split surface: stratify= for
#             imbalanced classification, multiple-array
#             support, train/val/test three-way split via
#             two calls.
# STRENGTHS - stratify= is the single most useful flag —
#             prevents a class disappearing from the test
#             set on small/imbalanced data.
# WEAKNESSES- doesn't address group-aware leakage or
#             chronological splits — senior tier.
#
from sklearn.model_selection import train_test_split

# Stratify on y to preserve class balance
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)

# Three-way split: 60/20/20 via two calls
X_temp, X_test, y_temp, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)
X_train, X_val, y_train, y_val = train_test_split(
    X_temp, y_temp, test_size=0.25, random_state=42, stratify=y_temp)
# 0.25 of 80% = 20% of total -> 60/20/20
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production splitting: group-aware via
#             GroupShuffleSplit (no leakage when one
#             entity has multiple rows); time-aware via
#             chronological cut, never random; stratify
#             for imbalanced ML, group for repeated-
#             measures, time for forecasts.
# STRENGTHS - the right splitter per data shape — the #1
#             cause of "great validation, terrible
#             production" is using random splits on
#             grouped or time-series data.
# WEAKNESSES- group splits require a stable group_id;
#             time splits give up the i.i.d. assumption
#             (and that's correct, but be deliberate).
#
import pandas as pd
from sklearn.model_selection import (
    train_test_split, GroupShuffleSplit, TimeSeriesSplit)

# 1. Group-aware — keep all rows for a customer on the same side
gss = GroupShuffleSplit(test_size=0.2, n_splits=1, random_state=42)
train_idx, test_idx = next(gss.split(X, y, groups=df["customer_id"]))
X_train, X_test = X[train_idx], X[test_idx]

# 2. Time-aware — train on past, test on future
df = df.sort_values("date")
cutoff = df["date"].quantile(0.8)
train = df[df["date"] <= cutoff]
test  = df[df["date"]  > cutoff]

# 3. Cross-validation for time series
tscv = TimeSeriesSplit(n_splits=5)
for fold, (tr_idx, va_idx) in enumerate(tscv.split(X)):
    X_tr, X_va = X[tr_idx], X[va_idx]   # validation always after train

# Decision rule:
#   i.i.d. classification              -> train_test_split(stratify=y)
#   one entity has many rows           -> GroupShuffleSplit
#   time series / forecasting          -> chronological cut OR TimeSeriesSplit
#   never                              -> random split on time-series data
#
# Anti-pattern: random-splitting time-series or grouped data
#   People reach for train_test_split by reflex, then are baffled when
#   "97% accuracy" collapses in production. Random splits leak the future
#   into training (time series) or leak per-user behavior across the
#   train/test boundary (grouped data). Use TimeSeriesSplit / GroupKFold.
```

## Decision Rule

```text
i.i.d. classification              -> train_test_split(stratify=y)
one entity has many rows           -> GroupShuffleSplit
time series / forecasting          -> chronological cut OR TimeSeriesSplit
never                              -> random split on time-series data
```

## Anti-Pattern

> [!warning] Anti-pattern
> random-splitting time-series or grouped data
>   People reach for train_test_split by reflex, then are baffled when
>   "97% accuracy" collapses in production. Random splits leak the future
>   into training (time series) or leak per-user behavior across the
>   train/test boundary (grouped data). Use TimeSeriesSplit / GroupKFold.

## Tips

- Use test_size=0.2 for typical 80/20 split
- Always set random_state for reproducible splits
- For imbalanced data, use stratify=y to preserve class distribution
- When one entity (user/session) has many rows, use `GroupShuffleSplit` so the same group cannot appear in both train and test
- Time-series data should be cut chronologically (or use `TimeSeriesSplit`) — random splits leak the future

## Common Mistake

> [!warning] Forgetting to set random_state, causing non-reproducible results across runs.

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

- [[Sections/ml/preprocessing/_Index|Machine Learning → Data Preprocessing]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
