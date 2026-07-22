---
type: "entry"
domain: "python"
file: "ml"
section: "preprocessing"
id: "label_encoder"
title: "LabelEncoder"
category: "Encoding"
subtitle: "Convert labels 0, 1, 2..."
signature_short: "LabelEncoder().fit(y).transform(y)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "LabelEncoder"
  - "label_encoder"
tags:
  - "python"
  - "python/ml"
  - "python/ml/preprocessing"
  - "category/encoding"
  - "tier/tiered"
---

# LabelEncoder

> Convert labels 0, 1, 2...

## Overview

Transforms categorical target variables into numeric labels (0, 1, 2...), useful for classification algorithms that require numeric inputs.

## Signature

```python
LabelEncoder().fit(y).transform(y)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - encode each unique label as an integer
#             (alphabetical by default). For TARGETS
#             only — never features.
# STRENGTHS - simplest target encoding for classification.
# WEAKNESSES- doesn't yet show inverse_transform or the
#             "for features, use OneHotEncoder/
#             OrdinalEncoder" rule.
#
from sklearn.preprocessing import LabelEncoder

le = LabelEncoder()
y_train_enc = le.fit_transform(y_train)
y_test_enc  = le.transform(y_test)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday LabelEncoder surface: the
#             classes_ attribute tells you the int->label
#             mapping; inverse_transform converts model
#             predictions back to original labels.
# STRENGTHS - covers the round trip needed for human-
#             readable output; classes_ documents the
#             encoding.
# WEAKNESSES- doesn't address the unseen-label trap or
#             the "use OneHotEncoder for features" rule
#             — senior.
#
from sklearn.preprocessing import LabelEncoder

le = LabelEncoder()
y_train_enc = le.fit_transform(y_train)

# Mapping: int -> string label
le.classes_                              # array(['bird', 'cat', 'dog'])

# Convert predictions back to strings
y_pred_int  = clf.predict(X_test)
y_pred_str  = le.inverse_transform(y_pred_int)

# Apply same encoding to test labels (must use TRANSFORM not fit_transform)
y_test_enc = le.transform(y_test)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production rules: LabelEncoder is for
#             TARGETS only; for features use
#             OneHotEncoder (nominal) or OrdinalEncoder
#             (ordinal). Handle unseen test labels
#             explicitly (LabelEncoder errors; the
#             feature encoders accept handle_unknown).
# STRENGTHS - the target-vs-feature distinction is the
#             single most important rule; explicit
#             handle_unknown prevents the production
#             "ValueError: y contains previously unseen
#             labels" failure.
# WEAKNESSES- OneHotEncoder explodes column count for
#             high-cardinality features; OrdinalEncoder
#             imposes an order even on nominal data.
#
import numpy as np
from sklearn.preprocessing import (
    LabelEncoder, OneHotEncoder, OrdinalEncoder)

# 1. TARGET — LabelEncoder is fine
y_le = LabelEncoder().fit_transform(y_train)

# 2. FEATURES — never LabelEncoder. Pick by semantics:
#    Nominal (no order): OneHotEncoder
ohe = OneHotEncoder(handle_unknown="ignore",      # silently zero unseen
                     sparse_output=False)
X_cat_enc = ohe.fit_transform(X_train_cat)

#    Ordinal (has order): OrdinalEncoder
oe = OrdinalEncoder(
    categories=[["S", "M", "L", "XL"]],            # explicit order
    handle_unknown="use_encoded_value",
    unknown_value=-1,
)
X_size_enc = oe.fit_transform(X_train_size)

# 3. Anti-pattern: LabelEncoder on features
#    LabelEncoder().fit_transform(X[:, 0])
#    -> imposes alphabetical order; tree models then split
#       at meaningless thresholds. Use OrdinalEncoder
#       (with explicit categories=) or OneHotEncoder.
#
# Decision rule:
#   classification target (y)             -> LabelEncoder
#   nominal feature, low cardinality      -> OneHotEncoder(handle_unknown="ignore")
#   ordinal feature with known order      -> OrdinalEncoder(categories=[...])
#   high-cardinality nominal (1000+)      -> TargetEncoder / hashing / embeddings
#   unseen labels possible at predict     -> handle_unknown="ignore" or "use_encoded_value"
#   tree-based model + nominal            -> OrdinalEncoder is OK (trees handle splits)
#
# Anti-pattern: using LabelEncoder on input features
#   LabelEncoder is documented as target-only and has no handle_unknown
#   argument. Applied to a feature column it imposes alphabetical order
#   and crashes at predict time on any unseen value. Use OneHotEncoder
#   (nominal) or OrdinalEncoder with explicit categories= (ordinal).
```

## Decision Rule

```text
classification target (y)             -> LabelEncoder
nominal feature, low cardinality      -> OneHotEncoder(handle_unknown="ignore")
ordinal feature with known order      -> OrdinalEncoder(categories=[...])
high-cardinality nominal (1000+)      -> TargetEncoder / hashing / embeddings
unseen labels possible at predict     -> handle_unknown="ignore" or "use_encoded_value"
tree-based model + nominal            -> OrdinalEncoder is OK (trees handle splits)
```

## Anti-Pattern

> [!warning] Anti-pattern
> using LabelEncoder on input features
>   LabelEncoder is documented as target-only and has no handle_unknown
>   argument. Applied to a feature column it imposes alphabetical order
>   and crashes at predict time on any unseen value. Use OneHotEncoder
>   (nominal) or OrdinalEncoder with explicit categories= (ordinal).

## Tips

- Fit only on training labels, transform train and test separately
- Use inverse_transform() to convert predictions back to original labels
- For ordinal relationships, consider OrdinalEncoder instead

## Common Mistake

> [!warning] Using LabelEncoder on multiple features; use OneHotEncoder or ColumnTransformer instead.

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
