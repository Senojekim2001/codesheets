---
type: "entry"
domain: "python"
file: "ml"
section: "preprocessing"
id: "onehot_encoder"
title: "OneHotEncoder"
category: "Preprocessing"
subtitle: "Multi-class binary encoding"
signature_short: "OneHotEncoder(sparse_output=False).fit_transform(X)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "OneHotEncoder"
  - "onehot_encoder"
tags:
  - "python"
  - "python/ml"
  - "python/ml/preprocessing"
  - "category/preprocessing"
  - "tier/tiered"
---

# OneHotEncoder

> Multi-class binary encoding

## Overview

Converts categorical features into one-hot encoded binary vectors, creating binary columns for each category level to represent nominal features.

## Signature

```python
OneHotEncoder(sparse_output=False).fit_transform(X)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - one binary column per category. sparse_
#             output=False returns a dense array.
# STRENGTHS - the standard nominal-feature encoding for
#             linear models / SVMs / neural nets.
# WEAKNESSES- doesn't yet show handle_unknown for unseen
#             categories or drop= for collinearity.
#
from sklearn.preprocessing import OneHotEncoder

ohe = OneHotEncoder(sparse_output=False)
X_cat_enc = ohe.fit_transform(X_train_cat)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday OHE surface: handle_unknown=
#             "ignore" for unseen test categories,
#             get_feature_names_out for column tracking,
#             drop="first" or "if_binary" for linear
#             models that don't tolerate collinearity.
# STRENGTHS - covers the production-readiness flags that
#             prevent inference-time errors.
# WEAKNESSES- doesn't address high-cardinality
#             alternatives or ColumnTransformer
#             integration — senior.
#
from sklearn.preprocessing import OneHotEncoder

# Production-friendly defaults
ohe = OneHotEncoder(
    sparse_output=False,
    handle_unknown="ignore",         # unseen -> all-zero row (no error)
    drop="if_binary",                # collapse 2-level cats into 1 col
)
X_cat_enc = ohe.fit_transform(X_train_cat)
ohe.get_feature_names_out()          # ['city_NYC', 'city_LA', 'sex_M']

# Inference — same encoder, transform only
X_test_enc = ohe.transform(X_test_cat)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production OHE: route categorical columns
#             through ColumnTransformer alongside numeric
#             scaling; for very high cardinality (>~50
#             unique), switch to TargetEncoder or hashing
#             — OHE explodes the column count.
# STRENGTHS - ColumnTransformer is the industry-standard
#             way to apply OHE to a subset of columns;
#             explicit cardinality decision rule prevents
#             the "10000-column OHE" failure.
# WEAKNESSES- ColumnTransformer increases setup verbosity;
#             TargetEncoder leaks target info if not
#             cross-validated (use within a Pipeline).
#
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression

num_cols = ["age", "income"]
cat_cols = ["city", "sex"]

pre = ColumnTransformer([
    ("num", StandardScaler(),                           num_cols),
    ("cat", OneHotEncoder(handle_unknown="ignore"),     cat_cols),
])

pipe = Pipeline([
    ("pre", pre),
    ("clf", LogisticRegression(max_iter=1000)),
])
pipe.fit(X_train, y_train)

# High-cardinality alternative
# from sklearn.preprocessing import TargetEncoder       # sklearn 1.3+
# ColumnTransformer([("cat", TargetEncoder(), cat_cols)])

# Decision rule:
#   <= 50 unique categories      -> OneHotEncoder
#   ordinal categories           -> OrdinalEncoder
#   > 50 unique, low signal      -> drop or hash
#   > 50 unique, high signal     -> TargetEncoder (CV-safe)
#
# Anti-pattern: pd.get_dummies on train and test separately
#   Calling pd.get_dummies(X_train) and pd.get_dummies(X_test) yields
#   different column sets when test has missing categories — silent
#   shape mismatches at inference. Use OneHotEncoder (fit on train,
#   transform on test) so the column set is fixed and unseen categories
#   are handled by handle_unknown="ignore".
```

## Decision Rule

```text
<= 50 unique categories      -> OneHotEncoder
ordinal categories           -> OrdinalEncoder
> 50 unique, low signal      -> drop or hash
> 50 unique, high signal     -> TargetEncoder (CV-safe)
```

## Anti-Pattern

> [!warning] Anti-pattern
> pd.get_dummies on train and test separately
>   Calling pd.get_dummies(X_train) and pd.get_dummies(X_test) yields
>   different column sets when test has missing categories — silent
>   shape mismatches at inference. Use OneHotEncoder (fit on train,
>   transform on test) so the column set is fixed and unseen categories
>   are handled by handle_unknown="ignore".

## Tips

- Set sparse_output=False for dense arrays, True for sparse matrices (memory-efficient)
- Use get_feature_names_out() to track feature names after encoding
- Automatically handles unseen categories with handle_unknown parameter
- Above ~50 unique categories with real signal, OneHot blows up dimensionality — switch to `TargetEncoder` (CV-safe) or hash; drop the column if signal is low

## Common Mistake

> [!warning] Using OneHotEncoder on ordinal features where order matters; use OrdinalEncoder instead.

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
