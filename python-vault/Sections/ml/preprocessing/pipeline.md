---
type: "entry"
domain: "python"
file: "ml"
section: "preprocessing"
id: "pipeline"
title: "Pipeline"
category: "Workflow"
subtitle: "Automate train/test workflow"
signature_short: "Pipeline(steps=[('scaler', StandardScaler()), ('model', LogisticRegression())])"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Pipeline"
  - "pipeline"
tags:
  - "python"
  - "python/ml"
  - "python/ml/preprocessing"
  - "category/workflow"
  - "tier/tiered"
---

# Pipeline

> Automate train/test workflow

## Overview

Combines multiple preprocessing and modeling steps into a single object, automatically fitting transformers and then the model, preventing data leakage.

## Signature

```python
Pipeline(steps=[('scaler', StandardScaler()), ('model', LogisticRegression())])
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - chain preprocess + model. fit/predict
#             treat it as one estimator.
# STRENGTHS - prevents leakage by design — scaler fits
#             only on train each time pipe.fit() runs.
# WEAKNESSES- doesn't yet show CV integration or
#             named_steps access.
#
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("clf",    LogisticRegression()),
])
pipe.fit(X_train, y_train)
pipe.score(X_test, y_test)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday Pipeline surface: cross_val_
#             score with a Pipeline (refits per fold —
#             leakage-proof CV), named_steps for inner
#             access, GridSearchCV with step__param
#             notation.
# STRENGTHS - Pipeline + CV is THE leakage-proof pattern;
#             step__param syntax tunes preprocessing
#             hyperparameters alongside the model.
# WEAKNESSES- doesn't address make_pipeline shorthand or
#             FunctionTransformer for custom steps —
#             senior tier.
#
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score, GridSearchCV

pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("clf",    LogisticRegression(max_iter=1000)),
])

# CV — scaler refits per fold (no leakage)
scores = cross_val_score(pipe, X, y, cv=5)
print(f"{scores.mean():.3f} +/- {scores.std():.3f}")

# Hyperparameter search across BOTH preprocessing and model
grid = GridSearchCV(pipe, param_grid={
    "scaler__with_mean": [True, False],
    "clf__C":             [0.1, 1.0, 10.0],
}, cv=5)
grid.fit(X_train, y_train)
print(grid.best_params_)

# Inner access
pipe.named_steps["clf"].coef_
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production Pipelines: make_pipeline for
#             auto-naming, FunctionTransformer for custom
#             feature engineering inside the Pipeline,
#             persist with joblib for deterministic
#             serving, validate set_output to switch
#             between numpy and pandas.
# STRENGTHS - end-to-end serializable artifact;
#             FunctionTransformer keeps custom logic
#             leakage-proof inside the Pipeline; pandas
#             output preserves feature names through
#             interpretability tools.
# WEAKNESSES- joblib pickles include the sklearn version
#             — version-pin in production; custom
#             FunctionTransformer must be importable
#             at load time.
#
import joblib
import numpy as np
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler, FunctionTransformer
from sklearn.linear_model import LogisticRegression

def add_log_features(X):
    return np.hstack([X, np.log1p(np.abs(X))])

# make_pipeline auto-names steps from class
pipe = make_pipeline(
    FunctionTransformer(add_log_features, validate=True),
    StandardScaler(),
    LogisticRegression(max_iter=1000),
)
pipe.set_output(transform="pandas")              # preserve column names

pipe.fit(X_train, y_train)

# Persist for serving
joblib.dump(pipe, "model.joblib")
loaded = joblib.load("model.joblib")
loaded.predict(X_new)                             # full pipeline applies

# Production checklist
#   - all preprocessing INSIDE the Pipeline (no leakage)
#   - random_state pinned on every random component
#   - sklearn version pinned in requirements.txt
#   - joblib artifact tested by loading & predicting on a held-out row
#
# Decision rule:
#   any preprocessing + model            -> Pipeline (always)
#   per-column preprocessing             -> ColumnTransformer inside Pipeline
#   custom feature engineering           -> FunctionTransformer step
#   want auto-named steps                -> make_pipeline
#   need to grid-search over a step      -> Pipeline + named steps__param
#   serialize for serving                -> joblib.dump(pipe, ...)
#   need pandas DataFrames at each step  -> pipe.set_output(transform="pandas")
#
# Anti-pattern: doing preprocessing outside the Pipeline, then CV-ing the model
#   X_scaled = scaler.fit_transform(X); cross_val_score(model, X_scaled, y)
#   leaks every fold's validation stats into the scaler. The CV score
#   is optimistically biased. Move the scaler into the Pipeline so
#   cross_val_score refits it per fold automatically.
```

## Decision Rule

```text
any preprocessing + model            -> Pipeline (always)
per-column preprocessing             -> ColumnTransformer inside Pipeline
custom feature engineering           -> FunctionTransformer step
want auto-named steps                -> make_pipeline
need to grid-search over a step      -> Pipeline + named steps__param
serialize for serving                -> joblib.dump(pipe, ...)
need pandas DataFrames at each step  -> pipe.set_output(transform="pandas")
```

## Anti-Pattern

> [!warning] Anti-pattern
> doing preprocessing outside the Pipeline, then CV-ing the model
>   X_scaled = scaler.fit_transform(X); cross_val_score(model, X_scaled, y)
>   leaks every fold's validation stats into the scaler. The CV score
>   is optimistically biased. Move the scaler into the Pipeline so
>   cross_val_score refits it per fold automatically.

## Tips

- Pipeline automatically applies fit_transform to transformers and fit to the final estimator
- Use named_steps to access individual steps: pipeline.named_steps['scaler']
- Prevents accidental data leakage by fitting transformers only on training data

## Common Mistake

> [!warning] Fitting preprocessing separately before the pipeline, causing inconsistent transformations.

## Shorthand (Junior → Senior)

**Junior:**
```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
```

**Senior:**
```python
print(f'Predictions: {y_pred}')
```

## See Also

- [[Sections/notebooks/workflow/nbformat-papermill|papermill — parameterized notebook execution (Notebooks)]]
- [[Sections/notebooks/workflow/jupytext-version-control|jupytext — pair .ipynb with .py for clean git diffs (Notebooks)]]
- [[Sections/notebooks/workflow/nbconvert-export|nbconvert — export notebooks to HTML, PDF, slides (Notebooks)]]
- [[Sections/ml/preprocessing/_Index|Machine Learning → Data Preprocessing]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
