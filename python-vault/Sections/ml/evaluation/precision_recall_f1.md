---
type: "entry"
domain: "python"
file: "ml"
section: "evaluation"
id: "precision_recall_f1"
title: "precision_score, recall_score, f1_score"
category: "Classification Metrics"
subtitle: "Precision, recall, F1-score"
signature_short: "precision_score(y_true, y_pred), recall_score(y_true, y_pred), f1_score(y_true, y_pred)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "precision_score, recall_score, f1_score"
  - "precision_recall_f1"
tags:
  - "python"
  - "python/ml"
  - "python/ml/evaluation"
  - "category/classification-metrics"
  - "tier/tiered"
---

# precision_score, recall_score, f1_score

> Precision, recall, F1-score

## Overview

Precision = TP/(TP+FP) — of the items we predicted positive, how many really were. Recall = TP/(TP+FN) — of the actual positives, how many did we catch. F1 is their harmonic mean. Essential for imbalanced and cost-sensitive problems.

## Signature

```python
precision_score(y_true, y_pred), recall_score(y_true, y_pred), f1_score(y_true, y_pred)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - precision = TP / (TP+FP); recall = TP /
#             (TP+FN); F1 = harmonic mean.
# STRENGTHS - the canonical imbalanced-data metric
#             trio.
# WEAKNESSES- doesn't yet show the average= flag for
#             multiclass.
#
from sklearn.metrics import precision_score, recall_score, f1_score
precision_score(y_true, y_pred)
recall_score(y_true, y_pred)
f1_score(y_true, y_pred)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday surface: average= for
#             multiclass (macro=unweighted, weighted=
#             by support, micro=global), pos_label= to
#             pick the positive class explicitly.
# STRENGTHS - average= is the single most-confused
#             argument; the macro-vs-weighted choice
#             tells you whether you care about all
#             classes equally or about overall volume.
# WEAKNESSES- doesn't address PR-curve vs ROC choice
#             — senior.
#
from sklearn.metrics import f1_score, classification_report

# Multiclass — pick average=
f1_score(y_true, y_pred, average="macro")        # all classes equally
f1_score(y_true, y_pred, average="weighted")     # by support
f1_score(y_true, y_pred, average="micro")        # = global accuracy

# Per-class scores (no aggregation)
f1_score(y_true, y_pred, average=None)           # array, one per class

# Prefer classification_report for the full picture
print(classification_report(y_true, y_pred))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production rule: business cost decides
#             which to optimize. Maximizing F1 is fine
#             when FP and FN cost roughly the same.
#             Otherwise pick a threshold to optimize
#             precision-at-recall or recall-at-
#             precision; use precision_recall_curve to
#             find it.
# STRENGTHS - threshold tuning at the metric layer is
#             the right answer when the default
#             threshold (0.5) doesn't match the
#             business objective.
# WEAKNESSES- requires predict_proba; some models
#             (LinearSVC) don't have it without
#             calibration.
#
import numpy as np
from sklearn.metrics import precision_recall_curve, f1_score

proba = clf.predict_proba(X_test)[:, 1]
prec, rec, thr = precision_recall_curve(y_test, proba)

# Optimize F1 across thresholds
f1 = 2 * prec * rec / (prec + rec + 1e-12)
best = np.argmax(f1)
best_thr = thr[best] if best < len(thr) else 0.5
print(f"best F1 {f1[best]:.3f} at threshold {best_thr:.3f}")

# Operating point: "minimum precision 0.9, maximize recall"
ok = prec >= 0.9
best_at_min_prec = np.argmax(rec[ok])

# Decision rule:
#   FP and FN cost equal              -> max F1
#   FP costly (spam, fraud alerts)    -> set high precision threshold
#   FN costly (cancer screening)      -> set high recall threshold
#   ranking, not classification       -> roc_auc_score / average_precision
#   multiclass with class imbalance   -> f1_score(average="macro") or "weighted"
#   multilabel target                 -> f1_score(average="samples")
#
# Anti-pattern: tuning the decision threshold on the test set
#   Sweeping thresholds and picking the one that maximizes F1 against
#   y_test leaks test info into the model. Choose the threshold on a
#   held-out validation fold (or via cross_val_predict + PR curve), then
#   freeze it before computing the final F1 on test.
```

## Decision Rule

```text
FP and FN cost equal              -> max F1
FP costly (spam, fraud alerts)    -> set high precision threshold
FN costly (cancer screening)      -> set high recall threshold
ranking, not classification       -> roc_auc_score / average_precision
multiclass with class imbalance   -> f1_score(average="macro") or "weighted"
multilabel target                 -> f1_score(average="samples")
```

## Anti-Pattern

> [!warning] Anti-pattern
> tuning the decision threshold on the test set
>   Sweeping thresholds and picking the one that maximizes F1 against
>   y_test leaks test info into the model. Choose the threshold on a
>   held-out validation fold (or via cross_val_predict + PR curve), then
>   freeze it before computing the final F1 on test.

## Tips

- Precision: "of positive predictions, how many correct?" (TP / (TP + FP))
- Recall: "of actual positives, how many found?" (TP / (TP + FN))
- F1-score: harmonic mean balancing precision and recall

## Common Mistake

> [!warning] Optimizing only precision or only recall; F1-score or Precision-Recall curve better.

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

- [[Sections/ml/evaluation/accuracy_score|accuracy_score (Machine Learning)]]
- [[Sections/ml/evaluation/confusion_matrix|confusion_matrix (Machine Learning)]]
- [[Sections/ml/evaluation/classification_report|classification_report (Machine Learning)]]
- [[Sections/ml/evaluation/roc_auc_score|roc_auc_score, roc_curve (Machine Learning)]]
- [[Sections/ml/evaluation/_Index|Machine Learning → Model Evaluation]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
