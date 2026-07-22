---
type: "entry"
domain: "python"
file: "ml"
section: "evaluation"
id: "classification_report"
title: "classification_report"
category: "Classification Metrics"
subtitle: "Per-class metrics summary"
signature_short: "classification_report(y_true, y_pred)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "classification_report"
tags:
  - "python"
  - "python/ml"
  - "python/ml/evaluation"
  - "category/classification-metrics"
  - "tier/tiered"
---

# classification_report

> Per-class metrics summary

## Overview

Provides precision, recall, F1-score, and support for each class, ideal for multiclass problems and comprehensive model evaluation.

## Signature

```python
classification_report(y_true, y_pred)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - per-class precision/recall/F1/support in
#             one printed table.
# STRENGTHS - the most useful one-liner for
#             classification model evaluation.
# WEAKNESSES- doesn't yet show output_dict or
#             target_names.
#
from sklearn.metrics import classification_report
print(classification_report(y_true, y_pred))
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday options: target_names=
#             for readable labels, output_dict=True
#             for programmatic access, digits= for
#             precision tuning.
# STRENGTHS - output_dict is the cleanest way to log
#             metrics into a tracking system.
# WEAKNESSES- doesn't address zero_division or the
#             "macro vs weighted" diagnostic — senior.
#
from sklearn.metrics import classification_report

# Readable labels
print(classification_report(
    y_true, y_pred,
    target_names=["benign", "malignant"],
    digits=3,
))

# As a dict — extract specific values
report = classification_report(y_true, y_pred, output_dict=True)
report["malignant"]["f1-score"]
report["weighted avg"]["f1-score"]
report["macro avg"]["f1-score"]
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production reporting: macro vs weighted
#             tells you class-balance story; large gap
#             == one class dominates the weighted
#             metrics. Set zero_division=0 to avoid
#             warnings when a class has no predictions.
# STRENGTHS - the macro/weighted diff is a free
#             imbalance check; zero_division silences
#             the noisy warning while keeping output
#             honest.
# WEAKNESSES- zero_division=0 hides genuinely-broken
#             classes — pair with confusion_matrix
#             to see which classes are zero.
#
from sklearn.metrics import classification_report

report = classification_report(
    y_true, y_pred,
    target_names=class_names,
    digits=3,
    output_dict=True,
    zero_division=0,                     # silence "no positive predictions" noise
)

macro    = report["macro avg"]["f1-score"]
weighted = report["weighted avg"]["f1-score"]
gap = weighted - macro

if gap > 0.10:
    print("WARNING: weighted >> macro — minority classes are weak")
elif gap < -0.10:
    print("WARNING: macro >> weighted — majority class is weak")
# Log the per-class metrics for monitoring
# log_metrics({f"f1_{cls}": report[cls]["f1-score"] for cls in class_names})

# Decision rule:
#   per-class precision/recall/F1   -> classification_report (always start here)
#   programmatic access             -> output_dict=True
#   readable per-class names        -> target_names=class_names
#   imbalance check                 -> compare macro avg vs weighted avg
#   class with no predictions       -> zero_division=0 (suppress warning)
#   minority class is the goal      -> read its specific row, not the average
#   confusion source explanation    -> pair with confusion_matrix
#
# Anti-pattern: using only the "weighted avg" line on imbalanced data
#   The weighted average is dominated by the majority class — it can be
#   high while the minority class has F1 ~ 0. Always read the per-class
#   rows AND macro avg; a large weighted-vs-macro gap is the canonical
#   "your model only learned the majority class" signal.
```

## Decision Rule

```text
per-class precision/recall/F1   -> classification_report (always start here)
programmatic access             -> output_dict=True
readable per-class names        -> target_names=class_names
imbalance check                 -> compare macro avg vs weighted avg
class with no predictions       -> zero_division=0 (suppress warning)
minority class is the goal      -> read its specific row, not the average
confusion source explanation    -> pair with confusion_matrix
```

## Anti-Pattern

> [!warning] Anti-pattern
> using only the "weighted avg" line on imbalanced data
>   The weighted average is dominated by the majority class — it can be
>   high while the minority class has F1 ~ 0. Always read the per-class
>   rows AND macro avg; a large weighted-vs-macro gap is the canonical
>   "your model only learned the majority class" signal.

## Tips

- Support shows number of samples for each class
- Weighted average accounts for class imbalance
- Use output_dict=True for programmatic access to metrics

## Common Mistake

> [!warning] Not using target_names; output harder to interpret.

## Shorthand (Junior → Senior)

**Junior:**
```python
from sklearn.metrics import classification_report
import numpy as np
y_true = np.array([0, 1, 2, 0, 1, 2, 0, 1, 2, 0])
y_pred = np.array([0, 1, 1, 0, 2, 2, 0, 1, 2, 0])
```

**Senior:**
```python
print(f'Weighted average F1: {report_dict["weighted avg"]["f1-score"]:.3f}')
```

## See Also

- [[Sections/ml/evaluation/accuracy_score|accuracy_score (Machine Learning)]]
- [[Sections/ml/evaluation/precision_recall_f1|precision_score, recall_score, f1_score (Machine Learning)]]
- [[Sections/ml/evaluation/confusion_matrix|confusion_matrix (Machine Learning)]]
- [[Sections/ml/evaluation/roc_auc_score|roc_auc_score, roc_curve (Machine Learning)]]
- [[Sections/ml/evaluation/_Index|Machine Learning → Model Evaluation]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
