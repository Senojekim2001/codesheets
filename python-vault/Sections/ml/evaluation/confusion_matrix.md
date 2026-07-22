---
type: "entry"
domain: "python"
file: "ml"
section: "evaluation"
id: "confusion_matrix"
title: "confusion_matrix"
category: "Classification Metrics"
subtitle: "TP, TN, FP, FN breakdown"
signature_short: "confusion_matrix(y_true, y_pred)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "confusion_matrix"
tags:
  - "python"
  - "python/ml"
  - "python/ml/evaluation"
  - "category/classification-metrics"
  - "tier/tiered"
---

# confusion_matrix

> TP, TN, FP, FN breakdown

## Overview

Tabulates true positives, true negatives, false positives, and false negatives, enabling detailed analysis of misclassification patterns.

## Signature

```python
confusion_matrix(y_true, y_pred)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - 2x2 (binary) or NxN (multiclass) matrix
#             of true vs predicted labels. Rows =
#             actual, columns = predicted.
# STRENGTHS - shows WHICH classes get confused, not
#             just the score.
# WEAKNESSES- doesn't yet show normalization or
#             visualization.
#
from sklearn.metrics import confusion_matrix
confusion_matrix(y_true, y_pred)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday surface: normalize="true"
#             for per-class recall, normalize="pred"
#             for per-class precision, ConfusionMatrix
#             Display.from_estimator for one-line plot.
# STRENGTHS - normalize= is the single most useful
#             flag; from_estimator skips the manual
#             predict step.
# WEAKNESSES- doesn't address custom labels= or
#             cost-sensitive analysis — senior.
#
import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay

# Normalized — per-class recall (rows sum to 1)
confusion_matrix(y_true, y_pred, normalize="true")

# One-line plot
ConfusionMatrixDisplay.from_estimator(
    clf, X_test, y_test, normalize="true",
    cmap="Blues", values_format=".2f")
plt.show()

# Binary metrics derived from CM
cm = confusion_matrix(y_true, y_pred)
tn, fp, fn, tp = cm.ravel()
specificity = tn / (tn + fp)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production confusion-matrix analysis:
#             specify labels= explicitly to control
#             order, normalize="true" for per-class
#             recall (most useful default), and pair
#             with classification_report so people see
#             both per-class metrics AND per-class
#             error patterns.
# STRENGTHS - explicit labels= prevents class-order
#             surprises; the matrix + report combo is
#             the standard "what's the model failing
#             at" diagnostic.
# WEAKNESSES- normalize choice is genuinely confusing
#             (true/pred/all); if classes are
#             imbalanced AND labels=None, sklearn
#             auto-orders alphabetically, which is
#             rarely what you want.
#
from sklearn.metrics import (
    confusion_matrix, ConfusionMatrixDisplay,
    classification_report)
import matplotlib.pyplot as plt

CLASSES = ["benign", "malignant"]                    # explicit order

# Normalized confusion matrix — per-class recall
cm = confusion_matrix(y_true, y_pred,
                       labels=CLASSES, normalize="true")

fig, ax = plt.subplots(figsize=(5, 5))
ConfusionMatrixDisplay(cm, display_labels=CLASSES).plot(
    cmap="Blues", values_format=".2f", ax=ax)

# Pair with full per-class metrics
print(classification_report(y_true, y_pred, target_names=CLASSES))

# Decision rule:
#   exact counts                       -> normalize=None
#   per-class recall                   -> normalize="true"
#   per-class precision                -> normalize="pred"
#   visual diagnostic                  -> ConfusionMatrixDisplay
#   imbalanced classes                 -> ALWAYS normalize="true"
#   want pos_label first               -> labels=[positive, negative] explicitly
#
# Anti-pattern: reading raw counts on imbalanced classes
#   With 990 negatives and 10 positives, 990 in the (neg, neg) cell looks
#   "great" while 7 false negatives are hidden — yet recall is only 30%.
#   Always plot with normalize="true" or pair with classification_report.
#   Also: passing labels= in inconsistent order between train and report
#   silently swaps which class is "positive" — pin labels= explicitly.
```

## Decision Rule

```text
exact counts                       -> normalize=None
per-class recall                   -> normalize="true"
per-class precision                -> normalize="pred"
visual diagnostic                  -> ConfusionMatrixDisplay
imbalanced classes                 -> ALWAYS normalize="true"
want pos_label first               -> labels=[positive, negative] explicitly
```

## Anti-Pattern

> [!warning] Anti-pattern
> reading raw counts on imbalanced classes
>   With 990 negatives and 10 positives, 990 in the (neg, neg) cell looks
>   "great" while 7 false negatives are hidden — yet recall is only 30%.
>   Always plot with normalize="true" or pair with classification_report.
>   Also: passing labels= in inconsistent order between train and report
>   silently swaps which class is "positive" — pin labels= explicitly.

## Tips

- Visualize with ConfusionMatrixDisplay for better understanding
- Analyze which classes are confused with each other
- Calculate custom metrics from TP, TN, FP, FN components

## Common Mistake

> [!warning] Not examining confusion matrix; may miss systematic misclassification patterns.

## Shorthand (Junior → Senior)

**Junior:**
```python
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay
import numpy as np
import matplotlib.pyplot as plt
y_true = np.array([0, 1, 1, 0, 1, 0, 1, 1, 0, 0])
```

**Senior:**
```python
print(f'Sensitivity (Recall): {sensitivity:.3f}')
```

## See Also

- [[Sections/ml/evaluation/accuracy_score|accuracy_score (Machine Learning)]]
- [[Sections/ml/evaluation/precision_recall_f1|precision_score, recall_score, f1_score (Machine Learning)]]
- [[Sections/ml/evaluation/classification_report|classification_report (Machine Learning)]]
- [[Sections/ml/evaluation/roc_auc_score|roc_auc_score, roc_curve (Machine Learning)]]
- [[Sections/ml/evaluation/_Index|Machine Learning → Model Evaluation]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
