---
type: "entry"
domain: "python"
file: "ml"
section: "evaluation"
id: "accuracy_score"
title: "accuracy_score"
category: "Classification Metrics"
subtitle: "Overall correctness"
signature_short: "accuracy_score(y_true, y_pred)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "accuracy_score"
tags:
  - "python"
  - "python/ml"
  - "python/ml/evaluation"
  - "category/classification-metrics"
  - "tier/tiered"
---

# accuracy_score

> Overall correctness

## Overview

Computes the proportion of correct predictions out of total samples, simple and intuitive but misleading for imbalanced datasets.

## Signature

```python
accuracy_score(y_true, y_pred)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - fraction correct. The simplest metric.
# STRENGTHS - intuitive, reads like a percentage.
# WEAKNESSES- silently misleading on imbalanced data.
#
from sklearn.metrics import accuracy_score
accuracy_score(y_true, y_pred)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - clf.score is accuracy by default;
#             always compare to a baseline (majority
#             class predictor); accuracy alone misleads
#             at >70% imbalance.
# STRENGTHS - the baseline-compare habit prevents
#             "95% accuracy on a 95% majority class".
# WEAKNESSES- doesn't address class_weight or
#             balanced_accuracy_score — senior.
#
from sklearn.metrics import accuracy_score
import numpy as np

# Same as model.score for classifiers
acc = clf.score(X_test, y_test)
acc = accuracy_score(y_test, clf.predict(X_test))

# Baseline — majority-class predictor
maj = np.bincount(y_train).argmax()
baseline = (y_test == maj).mean()
print(f"acc {acc:.3f}  vs baseline {baseline:.3f}")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production rule: accuracy is the wrong
#             metric for imbalanced data. Reach for
#             balanced_accuracy_score, F1, or
#             roc_auc_score by default. accuracy is
#             only honest when classes are roughly
#             balanced.
# STRENGTHS - balanced_accuracy averages per-class
#             recall — handles imbalance correctly;
#             explicit metric choice forces honest
#             reporting.
# WEAKNESSES- balanced_accuracy can mask absolute
#             scale differences between classes —
#             always pair with classification_report.
#
from sklearn.metrics import (
    accuracy_score, balanced_accuracy_score, f1_score)

# accuracy on a 95/5 imbalanced dataset
acc      = accuracy_score(y_test, y_pred)            # ~0.95 trivially
bal_acc  = balanced_accuracy_score(y_test, y_pred)   # honest
f1       = f1_score(y_test, y_pred,
                     average="macro")                  # multiclass-friendly

# Decision rule:
#   classes ~equal frequency         -> accuracy_score (clf.score is fine)
#   imbalanced classes               -> balanced_accuracy_score, F1, or AUC
#   you care about a specific class  -> precision/recall/F1 with pos_label=
#   ranking quality matters          -> roc_auc_score on predict_proba
#   multilabel target                -> hamming_loss / subset accuracy
#   need a per-class breakdown       -> classification_report
#
# Anti-pattern: reporting accuracy on a 99/1 fraud / churn dataset
#   "97% accurate" sounds great until you notice always-predict-majority
#   gives 99%. The model may be useless. On imbalance, default to
#   balanced_accuracy or F1 (or AUC for ranking), and ALWAYS compare to
#   a DummyClassifier(strategy="most_frequent") baseline before celebrating.
```

## Decision Rule

```text
classes ~equal frequency         -> accuracy_score (clf.score is fine)
imbalanced classes               -> balanced_accuracy_score, F1, or AUC
you care about a specific class  -> precision/recall/F1 with pos_label=
ranking quality matters          -> roc_auc_score on predict_proba
multilabel target                -> hamming_loss / subset accuracy
need a per-class breakdown       -> classification_report
```

## Anti-Pattern

> [!warning] Anti-pattern
> reporting accuracy on a 99/1 fraud / churn dataset
>   "97% accurate" sounds great until you notice always-predict-majority
>   gives 99%. The model may be useless. On imbalance, default to
>   balanced_accuracy or F1 (or AUC for ranking), and ALWAYS compare to
>   a DummyClassifier(strategy="most_frequent") baseline before celebrating.

## Tips

- Use accuracy only on balanced datasets; misleading on imbalanced data
- Combine with precision, recall, or F1-score for comprehensive evaluation
- Baseline: compare to random classifier or majority class predictor

## Common Mistake

> [!warning] Using accuracy as sole metric on imbalanced dataset; precision/recall more informative.

## Shorthand (Junior → Senior)

**Junior:**
```python
from sklearn.metrics import accuracy_score
import numpy as np
y_true = np.array([0, 1, 1, 0, 1, 0, 1, 1])
y_pred = np.array([0, 1, 1, 0, 0, 0, 1, 0])
```

**Senior:**
```python
print(f'Model accuracy: {model_accuracy:.3f}')
```

## See Also

- [[Sections/ml/evaluation/precision_recall_f1|precision_score, recall_score, f1_score (Machine Learning)]]
- [[Sections/ml/evaluation/confusion_matrix|confusion_matrix (Machine Learning)]]
- [[Sections/ml/evaluation/classification_report|classification_report (Machine Learning)]]
- [[Sections/ml/evaluation/roc_auc_score|roc_auc_score, roc_curve (Machine Learning)]]
- [[Sections/ml/evaluation/_Index|Machine Learning → Model Evaluation]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
