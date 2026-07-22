---
type: "entry"
domain: "python"
file: "ml"
section: "evaluation"
id: "roc_auc_score"
title: "roc_auc_score, roc_curve"
category: "Classification Metrics"
subtitle: "Area under ROC curve"
signature_short: "roc_auc_score(y_true, y_score), roc_curve(y_true, y_score)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "roc_auc_score, roc_curve"
  - "roc_auc_score"
tags:
  - "python"
  - "python/ml"
  - "python/ml/evaluation"
  - "category/classification-metrics"
  - "tier/tiered"
---

# roc_auc_score, roc_curve

> Area under ROC curve

## Overview

Measures classification performance across all thresholds via ROC curve (true positive vs false positive rates), robust to class imbalance.

## Signature

```python
roc_auc_score(y_true, y_score), roc_curve(y_true, y_score)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - feed PROBABILITIES (not predictions) to
#             roc_auc_score. AUC = 0.5 random, 1.0
#             perfect.
# STRENGTHS - threshold-independent, robust to class
#             imbalance.
# WEAKNESSES- doesn't yet show roc_curve or
#             threshold-tuning.
#
from sklearn.metrics import roc_auc_score
proba = clf.predict_proba(X_test)[:, 1]
roc_auc_score(y_test, proba)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - roc_curve gives the full FPR/TPR sweep;
#             pick a threshold that maximizes Youden's
#             J statistic (TPR - FPR) for balanced
#             cost; multi_class= for multiclass AUC.
# STRENGTHS - explicit threshold choice from the
#             curve is the right answer when 0.5 isn't
#             optimal.
# WEAKNESSES- doesn't address PR-AUC vs ROC-AUC
#             tradeoff for highly imbalanced data —
#             senior tier.
#
import numpy as np
from sklearn.metrics import roc_auc_score, roc_curve

proba = clf.predict_proba(X_test)[:, 1]

# Curve + Youden's J optimal threshold
fpr, tpr, thr = roc_curve(y_test, proba)
j = tpr - fpr
best_thr = thr[np.argmax(j)]
print(f"AUC: {roc_auc_score(y_test, proba):.3f}, "
       f"best threshold: {best_thr:.3f}")

# Multiclass — one-vs-rest by default
proba_mc = clf.predict_proba(X_test)
roc_auc_score(y_test, proba_mc, multi_class="ovr",
              average="macro")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production rule: ROC-AUC is misleading
#             on heavily imbalanced data (it counts a
#             large baseline of true negatives that
#             aren't interesting). Use Precision-
#             Recall AUC (average_precision_score)
#             instead. Calibrate probabilities before
#             setting thresholds.
# STRENGTHS - PR-AUC is the right metric when the
#             positive class is rare (fraud, ad
#             clicks); calibration ensures the chosen
#             threshold actually corresponds to the
#             intended FP rate in production.
# WEAKNESSES- PR-AUC has its own quirks (no chance
#             baseline of 0.5); calibration adds
#             compute and a held-out set requirement.
#
from sklearn.metrics import (
    roc_auc_score, average_precision_score)
from sklearn.calibration import CalibratedClassifierCV

# Imbalanced data — PR-AUC is more honest
ap = average_precision_score(y_test, proba)         # Precision-Recall AUC

# Calibration before threshold tuning
cal = CalibratedClassifierCV(clf, method="isotonic", cv=5)
cal.fit(X_train, y_train)
proba_cal = cal.predict_proba(X_test)[:, 1]
# Now proba_cal corresponds to true probabilities

# Decision rule:
#   balanced classes, ranking quality      -> roc_auc_score
#   highly imbalanced (rare positives)     -> average_precision_score
#   threshold matters in production        -> calibrate first
#   multiclass                             -> roc_auc_score(multi_class="ovr")
#   need a single number for tuning        -> AUC works fine as scoring=
#   compare across imbalance ratios        -> PR-AUC, NOT ROC-AUC
#
# Anti-pattern: feeding clf.predict() to roc_auc_score
#   Hard 0/1 labels collapse the curve to two points and the AUC degenerates
#   to (TPR + (1-FPR)) / 2. roc_auc_score expects scores or probabilities:
#   pass clf.predict_proba(X)[:, 1] (binary) or decision_function(X). For
#   models without predict_proba (LinearSVC), wrap in CalibratedClassifierCV.
```

## Decision Rule

```text
balanced classes, ranking quality      -> roc_auc_score
highly imbalanced (rare positives)     -> average_precision_score
threshold matters in production        -> calibrate first
multiclass                             -> roc_auc_score(multi_class="ovr")
need a single number for tuning        -> AUC works fine as scoring=
compare across imbalance ratios        -> PR-AUC, NOT ROC-AUC
```

## Anti-Pattern

> [!warning] Anti-pattern
> feeding clf.predict() to roc_auc_score
>   Hard 0/1 labels collapse the curve to two points and the AUC degenerates
>   to (TPR + (1-FPR)) / 2. roc_auc_score expects scores or probabilities:
>   pass clf.predict_proba(X)[:, 1] (binary) or decision_function(X). For
>   models without predict_proba (LinearSVC), wrap in CalibratedClassifierCV.

## Tips

- ROC AUC of 0.5 = random, 1.0 = perfect classification
- Robust to class imbalance unlike accuracy
- Use predict_proba() output as y_score, not hard predictions
- On highly imbalanced problems (rare positives), ROC AUC stays optimistic — switch to `average_precision_score` (PR-AUC) for a stricter signal

## Common Mistake

> [!warning] Using hard predictions instead of probabilities for roc_auc_score.

## Shorthand (Junior → Senior)

**Junior:**
```python
from sklearn.metrics import roc_auc_score, roc_curve
import numpy as np
y_true = np.array([0, 1, 1, 0, 1, 0, 1, 1, 0, 0])
y_scores = np.array([0.1, 0.8, 0.9, 0.2, 0.7, 0.3, 0.85, 0.75, 0.15, 0.25])
```

**Senior:**
```python
print(f'\nOptimal threshold: {optimal_threshold:.3f}')
```

## See Also

- [[Sections/ml/evaluation/accuracy_score|accuracy_score (Machine Learning)]]
- [[Sections/ml/evaluation/precision_recall_f1|precision_score, recall_score, f1_score (Machine Learning)]]
- [[Sections/ml/evaluation/confusion_matrix|confusion_matrix (Machine Learning)]]
- [[Sections/ml/evaluation/classification_report|classification_report (Machine Learning)]]
- [[Sections/ml/evaluation/_Index|Machine Learning → Model Evaluation]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
