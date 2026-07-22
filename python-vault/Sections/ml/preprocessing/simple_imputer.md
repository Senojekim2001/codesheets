---
type: "entry"
domain: "python"
file: "ml"
section: "preprocessing"
id: "simple_imputer"
title: "SimpleImputer"
category: "Missing Values"
subtitle: "Fill NaN with mean, median, mode"
signature_short: "SimpleImputer(strategy='mean').fit_transform(X)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "SimpleImputer"
  - "simple_imputer"
tags:
  - "python"
  - "python/ml"
  - "python/ml/preprocessing"
  - "category/missing-values"
  - "tier/tiered"
---

# SimpleImputer

> Fill NaN with mean, median, mode

## Overview

Handles missing values by replacing them with mean, median, most frequent value, or constant, enabling models to accept incomplete datasets.

## Signature

```python
SimpleImputer(strategy='mean').fit_transform(X)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - replace NaN with the column mean. fit on
#             train ONLY.
# STRENGTHS - the simplest imputer; reads as "fill
#             gaps with the average".
# WEAKNESSES- mean imputation distorts variance and
#             biases models trained on the result.
#
from sklearn.impute import SimpleImputer

imp = SimpleImputer(strategy="mean")
X_train_imp = imp.fit_transform(X_train)
X_test_imp  = imp.transform(X_test)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday imputer surface: median for
#             skewed numeric, most_frequent for
#             categorical, constant for sentinel values,
#             missing-flag features as a separate column.
# STRENGTHS - covers what a real pipeline does;
#             missing-flags often add predictive signal
#             beyond the imputed value itself.
# WEAKNESSES- doesn't address KNNImputer / IterativeImputer
#             or Pipeline integration — senior tier.
#
from sklearn.impute import SimpleImputer

# Pick strategy by data type and skewness
imp_num = SimpleImputer(strategy="median")           # skewed numeric
imp_cat = SimpleImputer(strategy="most_frequent")    # categorical
imp_const = SimpleImputer(strategy="constant",
                            fill_value="MISSING")     # sentinel

# Track WHERE imputation happened — useful as ML features
imp = SimpleImputer(strategy="median", add_indicator=True)
X_train_imp = imp.fit_transform(X_train)
# Original cols + binary indicator cols for "was missing"
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production imputation: route per-dtype
#             through ColumnTransformer; KNNImputer for
#             non-MCAR (missing-not-at-random) data;
#             IterativeImputer when missingness has
#             feature-feature dependencies; ALWAYS
#             inside a Pipeline so train statistics
#             never leak into test.
# STRENGTHS - ColumnTransformer cleanly applies
#             different strategies per column type;
#             KNNImputer/IterativeImputer respect
#             feature correlations.
# WEAKNESSES- KNNImputer is O(n^2) — slow at scale;
#             IterativeImputer is iterative and stochastic
#             (set random_state); both are sensitive to
#             hyperparameters.
#
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import (
    SimpleImputer, KNNImputer, IterativeImputer)
from sklearn.experimental import enable_iterative_imputer  # noqa
from sklearn.preprocessing import OneHotEncoder, StandardScaler

num_cols = ["age", "income"]
cat_cols = ["city"]

pre = ColumnTransformer([
    ("num", Pipeline([
        ("imp",   SimpleImputer(strategy="median",
                                  add_indicator=True)),
        ("scale", StandardScaler()),
    ]), num_cols),
    ("cat", Pipeline([
        ("imp", SimpleImputer(strategy="most_frequent")),
        ("ohe", OneHotEncoder(handle_unknown="ignore")),
    ]), cat_cols),
])

# When mean/median isn't enough — KNN respects feature similarity
# pre = ColumnTransformer([("num", KNNImputer(n_neighbors=5), num_cols)])

# Decision rule:
#   small N, simple                 -> SimpleImputer(median/mode)
#   skewed numeric                  -> SimpleImputer(strategy="median")
#   categorical                     -> SimpleImputer(strategy="most_frequent")
#   feature correlations matter     -> KNNImputer(n_neighbors=5)
#   complex MAR patterns            -> IterativeImputer
#   want "was missing" as a feature -> add_indicator=True
#
# Anti-pattern: imputing the whole DataFrame before train_test_split
#   df.fillna(df.mean()) computes the mean over the test rows too — the
#   classic silent leak. Same for SimpleImputer().fit_transform(X) before
#   splitting. Always fit on train only (or wrap inside a Pipeline so CV
#   refits per fold). Also: never use mean on skewed data — use median.
```

## Decision Rule

```text
small N, simple                 -> SimpleImputer(median/mode)
skewed numeric                  -> SimpleImputer(strategy="median")
categorical                     -> SimpleImputer(strategy="most_frequent")
feature correlations matter     -> KNNImputer(n_neighbors=5)
complex MAR patterns            -> IterativeImputer
want "was missing" as a feature -> add_indicator=True
```

## Anti-Pattern

> [!warning] Anti-pattern
> imputing the whole DataFrame before train_test_split
>   df.fillna(df.mean()) computes the mean over the test rows too — the
>   classic silent leak. Same for SimpleImputer().fit_transform(X) before
>   splitting. Always fit on train only (or wrap inside a Pipeline so CV
>   refits per fold). Also: never use mean on skewed data — use median.

## Tips

- Use strategy="mean" for numeric, "median" for robust handling, "most_frequent" for categorical
- Fit on training data only, transform train and test separately
- Consider using KNNImputer or IterativeImputer for sophisticated imputation
- Pass `add_indicator=True` when "was this value missing?" itself carries signal — the imputer adds boolean columns alongside the filled values

## Common Mistake

> [!warning] Imputing before splitting data, causing information leakage from test set.

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
