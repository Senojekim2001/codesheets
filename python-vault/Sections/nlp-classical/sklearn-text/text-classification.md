---
type: "entry"
domain: "python"
file: "nlp-classical"
section: "sklearn-text"
id: "text-classification"
title: "Text classification — Pipeline, baseline, hyperparameter tuning"
category: "sklearn-text"
subtitle: "Pipeline(TfidfVectorizer, LogisticRegression), GridSearchCV, class_weight, classification_report, calibration, when to consider transformers"
signature_short: "pipe = Pipeline([(\"tfidf\", TfidfVectorizer()), (\"clf\", LogisticRegression())]); pipe.fit(X, y)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Text classification — Pipeline, baseline, hyperparameter tuning"
  - "text-classification"
tags:
  - "python"
  - "python/nlp-classical"
  - "python/nlp-classical/sklearn-text"
  - "category/sklearn-text"
  - "tier/tiered"
---

# Text classification — Pipeline, baseline, hyperparameter tuning

> Pipeline(TfidfVectorizer, LogisticRegression), GridSearchCV, class_weight, classification_report, calibration, when to consider transformers

## Overview

For text classification (spam/ham, topic classification, sentiment, intent), the classical-ML baseline is hard to beat: TF-IDF features + linear classifier. `LogisticRegression` and `LinearSVC` are the standard picks; both handle high-dim sparse features natively. Wrap in a `Pipeline` so cross-validation properly fits the vectorizer per fold. The three examples solve the SAME concrete task — train a sentiment classifier (positive/negative) on review data and evaluate — at three depths: minimal Pipeline + LogisticRegression → hyperparameter tuning + calibration + class-imbalance handling → production with feature inspection, threshold tuning, comparison with transformer baseline.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Classify reviews as positive or negative.
- **Junior** — SAME — but tune hyperparameters via cross-validated grid search; handle class imbalance.
- **Senior** — SAME — production: feature inspection, calibration, save/load model, when to switch to transformers.

## Signature

```python
pipe = Pipeline([("tfidf", TfidfVectorizer()), ("clf", LogisticRegression())]); pipe.fit(X, y)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Classify reviews as positive or negative.
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# Pretend dataset:
docs = ["I loved this movie", "Terrible film, waste of time", "Amazing experience",
        "Boring and predictable", "Highly recommended", "Awful, would not watch again"]
labels = ["pos", "neg", "pos", "neg", "pos", "neg"]

X_train, X_test, y_train, y_test = train_test_split(docs, labels, test_size=0.3, random_state=42)

pipe = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1)),
    ("clf",   LogisticRegression(max_iter=1000)),
])
pipe.fit(X_train, y_train)
y_pred = pipe.predict(X_test)
print(classification_report(y_test, y_pred))

# Predict on new text:
print(pipe.predict(["Best movie ever!"]))             # ['pos']
print(pipe.predict_proba(["Best movie ever!"]))       # array of probabilities
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but tune hyperparameters via cross-validated grid
#             search; handle class imbalance.
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.metrics import classification_report

pipe = Pipeline([
    ("tfidf", TfidfVectorizer()),
    ("clf",   LogisticRegression(max_iter=2000, class_weight="balanced")),
    # class_weight="balanced" weighs minority class higher → useful when
    # one class is ~10x more common than another.
])

# Grid: try multiple ngram ranges, min_df, regularization strength.
param_grid = {
    "tfidf__ngram_range": [(1, 1), (1, 2)],
    "tfidf__min_df": [1, 2, 5],
    "tfidf__max_df": [0.95, 1.0],
    "tfidf__sublinear_tf": [True, False],
    "clf__C": [0.1, 1.0, 10.0],
    "clf__solver": ["liblinear", "lbfgs"],
}

# F1-macro is robust to class imbalance.
grid = GridSearchCV(pipe, param_grid, cv=5, scoring="f1_macro", n_jobs=-1, verbose=1)
grid.fit(X_train, y_train)

print(f"Best params: {grid.best_params_}")
print(f"Best F1: {grid.best_score_:.3f}")

best = grid.best_estimator_
print(classification_report(y_test, best.predict(X_test)))

# === Threshold tuning — change predict cutoff ===
# Default: predict_proba > 0.5 -> positive
# Sometimes you want higher precision (raise threshold) or recall (lower).
import numpy as np
proba = best.predict_proba(X_test)[:, list(best.classes_).index("pos")]
for threshold in [0.3, 0.5, 0.7]:
    y_pred_thresh = np.where(proba >= threshold, "pos", "neg")
    print(f"\nThreshold {threshold}:")
    print(classification_report(y_test, y_pred_thresh))

# === Class imbalance: alternative is resampling ===
# from imblearn.over_sampling import RandomOverSampler
# ros = RandomOverSampler(random_state=42)
# X_resampled, y_resampled = ros.fit_resample(X_train_tfidf, y_train)
# Note: imblearn requires features (X_train_tfidf) not raw text.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: feature inspection, calibration,
#             save/load model, when to switch to transformers.
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.calibration import CalibratedClassifierCV
import numpy as np

# === Probability calibration ===
# LogisticRegression's probabilities are well-calibrated by default;
# LinearSVC's "decision_function" output is NOT a probability — wrap.
# from sklearn.svm import LinearSVC
# clf = CalibratedClassifierCV(LinearSVC(), cv=5)        # adds calibrated predict_proba

pipe = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=2, sublinear_tf=True)),
    ("clf",   LogisticRegression(max_iter=2000, class_weight="balanced", C=1.0)),
])
pipe.fit(X_train, y_train)

# === Inspect: most predictive features per class ===
vec = pipe.named_steps["tfidf"]
clf = pipe.named_steps["clf"]
feature_names = vec.get_feature_names_out()

for class_idx, class_name in enumerate(clf.classes_):
    coefs = clf.coef_[class_idx if len(clf.classes_) > 2 else 0]
    if class_name == clf.classes_[0] and len(clf.classes_) == 2:
        coefs = -coefs                                  # flip for binary
    top_idx = coefs.argsort()[-20:][::-1]
    print(f"Top features for {class_name}:")
    for i in top_idx:
        print(f"  {feature_names[i]:30}  {coefs[i]:+.3f}")

# === Save / load ===
joblib.dump(pipe, "sentiment.joblib")
loaded = joblib.load("sentiment.joblib")

# === API endpoint (FastAPI) ===
# from fastapi import FastAPI
# app = FastAPI()
# model = joblib.load("sentiment.joblib")
# @app.post("/classify")
# async def classify(text: str):
#     pred = model.predict([text])[0]
#     proba = model.predict_proba([text])[0]
#     return {"label": pred, "scores": dict(zip(model.classes_, proba.tolist()))}

# Decision rule:
#   binary classification                 -> LogisticRegression (well-calibrated probs)
#   multi-class, large vocab              -> LinearSVC (faster, no probas without wrapper)
#   class imbalance                        -> class_weight="balanced" first; then resampling
#   need calibrated probs from SVC        -> CalibratedClassifierCV wrapper
#   feature interpretation                 -> coef_ on linear models
#   want >baseline accuracy                -> try transformers (sentence-transformers + classifier
#                                                head, or fine-tune a HF model)
#   want fast inference                    -> linear classifier; sub-ms per text; transformer ~50ms
#   too few examples (<100/class)         -> few-shot LLM prompting probably wins
#   thousands of classes                   -> hierarchical classification or transformer
#   model file size matters                -> sklearn model is KB; transformer is GB
#   threshold tuning                       -> use predict_proba; pick threshold on validation set
#   class imbalance >100x                  -> resampling (imblearn) + threshold tuning
#
# Anti-pattern: shipping a transformer for a binary classification
# task that TF-IDF + LR solves at 95% F1. Transformer adds ~50ms
# latency per request, ~100MB+ model size, GPU dependency, and
# fine-tuning complexity. For most classification tasks, the linear
# baseline is the right answer; reach for transformers only when the
# baseline isn't good enough (or when you need cross-domain transfer).
```

## Decision Rule

```text
binary classification                 -> LogisticRegression (well-calibrated probs)
multi-class, large vocab              -> LinearSVC (faster, no probas without wrapper)
class imbalance                        -> class_weight="balanced" first; then resampling
need calibrated probs from SVC        -> CalibratedClassifierCV wrapper
feature interpretation                 -> coef_ on linear models
want >baseline accuracy                -> try transformers (sentence-transformers + classifier
                                             head, or fine-tune a HF model)
want fast inference                    -> linear classifier; sub-ms per text; transformer ~50ms
too few examples (<100/class)         -> few-shot LLM prompting probably wins
thousands of classes                   -> hierarchical classification or transformer
model file size matters                -> sklearn model is KB; transformer is GB
threshold tuning                       -> use predict_proba; pick threshold on validation set
class imbalance >100x                  -> resampling (imblearn) + threshold tuning
```

## Anti-Pattern

> [!warning] Anti-pattern
> shipping a transformer for a binary classification
> task that TF-IDF + LR solves at 95% F1. Transformer adds ~50ms
> latency per request, ~100MB+ model size, GPU dependency, and
> fine-tuning complexity. For most classification tasks, the linear
> baseline is the right answer; reach for transformers only when the
> baseline isn't good enough (or when you need cross-domain transfer).

## Tips

- `Pipeline([("tfidf", ...), ("clf", ...)])` is essential — `GridSearchCV` then refits the vectorizer PER FOLD, which is the only correct way to cross-validate text classifiers.
- `class_weight="balanced"` adjusts the loss to weight minority class higher. Try this BEFORE resampling — usually enough for 1:5 imbalances.
- `f1_macro` is the right metric for imbalanced classes — averages F1 across classes equally. `accuracy` lies on imbalanced data.
- Threshold tuning (`predict_proba > T` instead of default `0.5`) is free precision/recall trade. Pick T on validation set, not test.
- For LinearSVC, wrap in `CalibratedClassifierCV` to get probability outputs (its raw `decision_function` isn't a probability).
- `joblib.dump(pipe, "model.joblib")` is the right way to persist sklearn models — handles numpy arrays efficiently. Use `compress=3` to reduce file size.

## Common Mistake

> [!warning] Shipping a transformer for a binary classification task that TF-IDF + LogisticRegression solves at 95% F1. Transformer adds ~50ms latency per request, ~100MB+ model size, GPU dependency, fine-tuning complexity. Try the linear baseline first; reach for transformers only when it's not good enough.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Transformer for binary classifier — overkill
from transformers import pipeline
clf = pipeline("text-classification", model="bert-base-uncased")
```

**Senior:**
```python
# TF-IDF + LR — usually 95%+ F1, ~1ms inference
pipe = Pipeline([("tfidf", TfidfVectorizer()),
                  ("clf", LogisticRegression(class_weight="balanced"))])
pipe.fit(X, y)
```

## See Also

- [[Sections/nlp-classical/sklearn-text/tfidf-vectorizer|TfidfVectorizer — text → numeric features (Classical NLP)]]
- [[Sections/nlp-classical/sklearn-text/topic-modeling|Topic modeling — LDA, NMF, embeddings + clustering (Classical NLP)]]
- [[Sections/nlp-classical/sklearn-text/_Index|Classical NLP → sklearn-text — TF-IDF, classification, topic modeling]]
- [[Sections/nlp-classical/_Index|Classical NLP index]]
- [[_Index|Vault index]]
