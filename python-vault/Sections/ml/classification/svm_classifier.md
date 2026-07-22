---
type: "entry"
domain: "python"
file: "ml"
section: "classification"
id: "svm_classifier"
title: "SVC (Support Vector Classifier)"
category: "Kernel Methods"
subtitle: "Margin-based classifier"
signature_short: "SVC(kernel='rbf', C=1.0, gamma='scale', random_state=42)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "SVC (Support Vector Classifier)"
  - "svm_classifier"
tags:
  - "python"
  - "python/ml"
  - "python/ml/classification"
  - "category/kernel-methods"
  - "tier/tiered"
---

# SVC (Support Vector Classifier)

> Margin-based classifier

## Overview

Finds maximum-margin hyperplane separating classes using kernel methods, effective for high-dimensional data and complex non-linear boundaries.

## Signature

```python
SVC(kernel='rbf', C=1.0, gamma='scale', random_state=42)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - scale FIRST (SVM is distance-based),
#             default RBF kernel.
# STRENGTHS - the simplest SVM that won't quietly fail.
# WEAKNESSES- doesn't yet show C, kernel choice, or
#             probability=True.
#
from sklearn.svm import SVC
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

clf = Pipeline([
    ("scale", StandardScaler()),
    ("svm",   SVC(kernel="rbf", random_state=42)),
])
clf.fit(X_train, y_train)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday SVM surface: C controls
#             margin slack (lower = wider margin, more
#             reg), gamma controls RBF width, kernel=
#             choice, probability=True for predict_proba.
# STRENGTHS - covers the two-knob tuning (C, gamma)
#             that drives most SVM behavior;
#             probability=True unlocks scoring use cases.
# WEAKNESSES- doesn't address O(n^2) scaling pain or
#             the LinearSVC / SGDClassifier alternatives
#             — senior.
#
from sklearn.svm import SVC
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

clf = Pipeline([
    ("scale", StandardScaler()),
    ("svm",   SVC(
        kernel="rbf",
        C=1.0,                                  # lower = wider margin
        gamma="scale",                          # default; or float
        class_weight="balanced",
        probability=True,                       # enable predict_proba (slower)
        random_state=42,
    )),
])
clf.fit(X_train, y_train)
proba = clf.predict_proba(X_test)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production SVM: SVC scales O(n^2) — for
#             N > ~10k switch to LinearSVC (linear only)
#             or SGDClassifier (loss="hinge"). Tune C
#             and gamma via GridSearchCV with a Pipeline
#             so scaling refits per fold.
# STRENGTHS - the scale rule prevents SVC from becoming
#             a notebook-killing 30-minute fit; LinearSVC
#             handles linear cases at any scale;
#             SGDClassifier scales to millions of rows.
# WEAKNESSES- LinearSVC has no predict_proba (use
#             CalibratedClassifierCV); SGDClassifier
#             needs many epochs and careful learning-
#             rate tuning.
#
from sklearn.svm import SVC, LinearSVC
from sklearn.linear_model import SGDClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import GridSearchCV

# Tune C, gamma in CV — Pipeline keeps scaling leakage-proof
pipe = Pipeline([
    ("scale", StandardScaler()),
    ("svm",   SVC(kernel="rbf", random_state=42)),
])
grid = GridSearchCV(pipe, param_grid={
    "svm__C":     [0.1, 1.0, 10.0],
    "svm__gamma": ["scale", 0.01, 0.1, 1.0],
}, cv=5, n_jobs=-1)
grid.fit(X_train, y_train)

# Decision rule by sample size N:
#   N <= 10k, non-linear     -> SVC(kernel="rbf")
#   N <= 50k, linear OK       -> LinearSVC
#   N >> 50k                   -> SGDClassifier(loss="hinge")
#   need predict_proba         -> SVC(probability=True) OR
#                                  CalibratedClassifierCV(LinearSVC())
#
# Decision rule:
#   N < 10k, non-linear boundary       -> SVC(kernel="rbf")
#   N < 10k, mostly linear, fast       -> SVC(kernel="linear") or LinearSVC
#   N > 50k                            -> LinearSVC or SGDClassifier(hinge)
#   need probability outputs           -> SVC(probability=True) or calibrate
#   imbalanced classes                 -> class_weight="balanced"
#   features at very different scales  -> always StandardScaler in Pipeline
#   tabular tabular benchmark           -> try RF/GBM first, SVM rarely wins
#
# Anti-pattern: SVC on a 100k-row dataset without checking complexity
#   SVC training is O(n^2) to O(n^3); a routine "let me try SVM" turns
#   into a frozen notebook on big data. Either subsample to <=10k rows,
#   switch to LinearSVC / SGDClassifier(loss="hinge"), or use a kernel
#   approximation (Nystroem) before a linear classifier.
```

## Decision Rule

```text
N < 10k, non-linear boundary       -> SVC(kernel="rbf")
N < 10k, mostly linear, fast       -> SVC(kernel="linear") or LinearSVC
N > 50k                            -> LinearSVC or SGDClassifier(hinge)
need probability outputs           -> SVC(probability=True) or calibrate
imbalanced classes                 -> class_weight="balanced"
features at very different scales  -> always StandardScaler in Pipeline
tabular tabular benchmark           -> try RF/GBM first, SVM rarely wins
```

## Anti-Pattern

> [!warning] Anti-pattern
> SVC on a 100k-row dataset without checking complexity
>   SVC training is O(n^2) to O(n^3); a routine "let me try SVM" turns
>   into a frozen notebook on big data. Either subsample to <=10k rows,
>   switch to LinearSVC / SGDClassifier(loss="hinge"), or use a kernel
>   approximation (Nystroem) before a linear classifier.

## Tips

- Always scale features before SVM; use StandardScaler or MinMaxScaler
- Tune C parameter: higher C = stricter margins, lower = more tolerance
- Use kernel='rbf' for non-linear problems, kernel='linear' for linear separability

## Common Mistake

> [!warning] Not scaling features, leading to slow training and poor performance.

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

- [[Sections/ml/regression/svr_regressor|SVR (Support Vector Regressor) (Machine Learning)]]
- [[Sections/ml/classification/_Index|Machine Learning → Classification Models]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
