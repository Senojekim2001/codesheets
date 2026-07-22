---
type: "entry"
domain: "python"
file: "ml"
section: "preprocessing"
id: "column_transformer"
title: "ColumnTransformer"
category: "Feature Engineering"
subtitle: "Selective column preprocessing"
signature_short: "ColumnTransformer(transformers=[('numeric', scaler, num_cols), ('categorical', encoder, cat_cols)])"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "ColumnTransformer"
  - "column_transformer"
tags:
  - "python"
  - "python/ml"
  - "python/ml/preprocessing"
  - "category/feature-engineering"
  - "tier/tiered"
---

# ColumnTransformer

> Selective column preprocessing

## Overview

Applies different preprocessing pipelines to different column subsets, enabling simultaneous scaling of numeric and encoding of categorical features.

## Signature

```python
ColumnTransformer(transformers=[('numeric', scaler, num_cols), ('categorical', encoder, cat_cols)])
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - apply different transforms to different
#             column subsets in one call.
# STRENGTHS - the right tool for "scale numerics and
#             encode categoricals" without two passes.
# WEAKNESSES- doesn't yet show remainder=, column
#             selectors, or Pipeline integration.
#
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

ct = ColumnTransformer([
    ("num", StandardScaler(),  ["age", "income"]),
    ("cat", OneHotEncoder(),   ["city"]),
])
X_train_t = ct.fit_transform(X_train)
X_test_t  = ct.transform(X_test)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday CT surface: remainder= to
#             control unlisted columns, column selectors
#             via make_column_selector, integrate into
#             a Pipeline with a model.
# STRENGTHS - make_column_selector by dtype is the
#             cleanest "all numerics" / "all
#             categoricals" pattern; remainder= avoids
#             surprise drops.
# WEAKNESSES- doesn't address get_feature_names_out
#             for downstream column tracking — senior.
#
from sklearn.compose import (
    ColumnTransformer, make_column_selector as selector)
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression

# Auto-select by dtype
ct = ColumnTransformer([
    ("num", StandardScaler(),                       selector(dtype_include="number")),
    ("cat", OneHotEncoder(handle_unknown="ignore"), selector(dtype_include="object")),
], remainder="drop")                                    # explicit drop policy

# Full pipeline
pipe = Pipeline([
    ("pre", ct),
    ("clf", LogisticRegression(max_iter=1000)),
])
pipe.fit(X_train, y_train)
pipe.score(X_test, y_test)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production ColumnTransformer: per-type
#             nested Pipeline (impute -> encode), use
#             remainder="passthrough" for engineered
#             features that should bypass preprocessing,
#             call get_feature_names_out for downstream
#             interpretability (SHAP, feature importance).
# STRENGTHS - nested per-type Pipelines handle imputation
#             + encoding cleanly per column type;
#             passthrough preserves features that are
#             already model-ready; named output columns
#             unlock interpretability tooling.
# WEAKNESSES- nested Pipelines look intimidating;
#             get_feature_names_out only works when every
#             estimator implements it.
#
from sklearn.compose import (
    ColumnTransformer, make_column_selector as selector)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer

num_pipe = Pipeline([
    ("imp",   SimpleImputer(strategy="median",
                              add_indicator=True)),
    ("scale", StandardScaler()),
])
cat_pipe = Pipeline([
    ("imp", SimpleImputer(strategy="most_frequent")),
    ("ohe", OneHotEncoder(handle_unknown="ignore")),
])

ct = ColumnTransformer([
    ("num", num_pipe, selector(dtype_include="number")),
    ("cat", cat_pipe, selector(dtype_include="object")),
], remainder="passthrough",                       # keep engineered features
   verbose_feature_names_out=False)               # cleaner output names

ct.fit(X_train)
feature_names = ct.get_feature_names_out()        # for SHAP / importance plots

# Decision rule:
#   mixed numeric + categorical            -> ColumnTransformer
#   per-type pipeline (impute then encode) -> nest Pipeline inside CT
#   want columns by dtype, not by name     -> make_column_selector
#   keep some columns untouched            -> remainder="passthrough"
#   drop everything not listed             -> remainder="drop" (default)
#   need readable feature names            -> verbose_feature_names_out=False
#   different transforms within one type   -> multiple tuples to same dtype
#
# Anti-pattern: applying transforms in two passes outside ColumnTransformer
#   Manually scaling X[num_cols] and one-hot encoding X[cat_cols] then
#   concatenating works once but breaks under cross-validation (each fold
#   needs to refit) and at inference (column order drift). Always wrap
#   per-column logic in ColumnTransformer inside a Pipeline.
```

## Decision Rule

```text
mixed numeric + categorical            -> ColumnTransformer
per-type pipeline (impute then encode) -> nest Pipeline inside CT
want columns by dtype, not by name     -> make_column_selector
keep some columns untouched            -> remainder="passthrough"
drop everything not listed             -> remainder="drop" (default)
need readable feature names            -> verbose_feature_names_out=False
different transforms within one type   -> multiple tuples to same dtype
```

## Anti-Pattern

> [!warning] Anti-pattern
> applying transforms in two passes outside ColumnTransformer
>   Manually scaling X[num_cols] and one-hot encoding X[cat_cols] then
>   concatenating works once but breaks under cross-validation (each fold
>   needs to refit) and at inference (column order drift). Always wrap
>   per-column logic in ColumnTransformer inside a Pipeline.

## Tips

- Specify column indices or names to apply transformations selectively
- Use remainder="drop" to discard unused columns
- Combine with Pipeline for end-to-end preprocessing and modeling

## Common Mistake

> [!warning] Not specifying remainder parameter, causing errors with uncovered columns.

## Shorthand (Junior → Senior)

**Junior:**
```python
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
import numpy as np
X = np.array([
```

**Senior:**
```python
print(X_transformed)
```

## See Also

- [[Sections/ml/preprocessing/_Index|Machine Learning → Data Preprocessing]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
