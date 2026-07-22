---
type: "entry"
domain: "python"
file: "ml"
section: "tuning"
id: "randomized_search_cv"
title: "RandomizedSearchCV"
category: "Hyperparameter Search"
subtitle: "Random parameter sampling"
signature_short: "RandomizedSearchCV(estimator, param_distributions, n_iter=10, cv=5)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "RandomizedSearchCV"
  - "randomized_search_cv"
tags:
  - "python"
  - "python/ml"
  - "python/ml/tuning"
  - "category/hyperparameter-search"
  - "tier/tiered"
---

# RandomizedSearchCV

> Random parameter sampling

## Overview

Randomly samples hyperparameters from distributions, more efficient than GridSearchCV for large parameter spaces.

## Signature

```python
RandomizedSearchCV(estimator, param_distributions, n_iter=10, cv=5)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - sample n_iter random combinations from
#             distributions instead of trying all.
# STRENGTHS - far cheaper than GridSearch on large
#             search spaces.
# WEAKNESSES- doesn't yet show scipy.stats
#             distributions or n_iter sizing.
#
from sklearn.model_selection import RandomizedSearchCV

search = RandomizedSearchCV(model, param_distributions=params,
                             n_iter=20, cv=5, random_state=42)
search.fit(X_train, y_train)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - use scipy.stats distributions (uniform,
#             loguniform, randint) for continuous and
#             discrete parameters; n_iter typically
#             20-50 for good coverage.
# STRENGTHS - log-uniform is the right distribution
#             for hyperparameters that span orders of
#             magnitude (C, learning_rate, alpha).
# WEAKNESSES- doesn't address conditional parameters
#             — senior tier.
#
from sklearn.model_selection import RandomizedSearchCV
from scipy.stats import randint, uniform, loguniform

param_dist = {
    "n_estimators":      randint(50, 500),
    "max_depth":         [3, 5, 10, None],
    "min_samples_split": randint(2, 20),
    "max_features":      ["sqrt", "log2"],
}
# For C, learning_rate, alpha — log scale
# "C": loguniform(1e-3, 1e3)

search = RandomizedSearchCV(
    estimator, param_dist,
    n_iter=30,                              # 30 random combos
    cv=5, scoring="f1_weighted",
    n_jobs=-1, random_state=42,
)
search.fit(X_train, y_train)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production search: RandomizedSearchCV
#             is the default for >100 combos;
#             HalvingRandomSearchCV is faster still
#             for huge spaces; for serious tuning use
#             Optuna / Hyperopt for Bayesian-guided
#             search that beats random.
# STRENGTHS - HalvingRandom is the bridge between
#             Random and Grid; Optuna is the
#             industry-standard for >$100k of compute.
# WEAKNESSES- Halving discards candidates early
#             (sometimes wrongly); Optuna is a
#             dependency.
#
from sklearn.experimental import enable_halving_search_cv  # noqa
from sklearn.model_selection import HalvingRandomSearchCV
from scipy.stats import loguniform, randint

search = HalvingRandomSearchCV(
    estimator,
    param_distributions={
        "C":            loguniform(1e-3, 1e3),
        "max_depth":    randint(3, 20),
        "n_estimators": randint(100, 1000),
    },
    n_candidates="exhaust",                 # use all of the budget
    factor=3,
    cv=5, scoring="f1_weighted",
    random_state=42, n_jobs=-1,
)
search.fit(X_train, y_train)

# When sklearn isn't enough — Bayesian search
# import optuna
# def objective(trial):
#     params = {"C": trial.suggest_loguniform("C", 1e-3, 1e3),
#                "max_depth": trial.suggest_int("max_depth", 3, 20)}
#     return cross_val_score(model.set_params(**params), X, y, cv=5).mean()
# study = optuna.create_study(direction="maximize")
# study.optimize(objective, n_trials=100)

# Decision rule (n_combinations of the search space):
#   <= 50              -> GridSearchCV
#   50 .. 1000          -> RandomizedSearchCV (n_iter=20-50)
#   > 1000              -> HalvingRandomSearchCV
#   serious budget      -> Optuna (Bayesian / TPE)
#
# Decision rule:
#   small grid (< 50)                -> GridSearchCV (exhaustive)
#   medium grid (50..1000)           -> RandomizedSearchCV(n_iter=50)
#   continuous params, large space   -> RandomizedSearchCV with scipy.stats
#   huge space, fixed compute budget -> HalvingRandomSearchCV
#   compute is expensive             -> Optuna / Hyperopt (Bayesian)
#   want to tune learning rate (LR)  -> loguniform, NOT linear uniform
#   integer hyperparameters          -> scipy.stats.randint
#
# Anti-pattern: using RandomizedSearchCV with default uniform on log-scale params
#   For C, gamma, learning_rate, alpha: a uniform(1e-3, 1e3) wastes 99%
#   of trials in the >1.0 region. Use scipy.stats.loguniform(1e-3, 1e3)
#   so each decade gets equal sampling. Also: leaving n_iter=10 (default)
#   on a 5-dim space rarely covers it — bump n_iter to 50-200 trials.
```

## Decision Rule

```text
small grid (< 50)                -> GridSearchCV (exhaustive)
medium grid (50..1000)           -> RandomizedSearchCV(n_iter=50)
continuous params, large space   -> RandomizedSearchCV with scipy.stats
huge space, fixed compute budget -> HalvingRandomSearchCV
compute is expensive             -> Optuna / Hyperopt (Bayesian)
want to tune learning rate (LR)  -> loguniform, NOT linear uniform
integer hyperparameters          -> scipy.stats.randint
```

## Anti-Pattern

> [!warning] Anti-pattern
> using RandomizedSearchCV with default uniform on log-scale params
>   For C, gamma, learning_rate, alpha: a uniform(1e-3, 1e3) wastes 99%
>   of trials in the >1.0 region. Use scipy.stats.loguniform(1e-3, 1e3)
>   so each decade gets equal sampling. Also: leaving n_iter=10 (default)
>   on a 5-dim space rarely covers it — bump n_iter to 50-200 trials.

## Tips

- More efficient than GridSearchCV for large spaces
- Use scipy.stats distributions (randint, uniform, expon) for parameter ranges
- Set n_iter based on computational budget

## Common Mistake

> [!warning] Using only 5-10 iterations; typically need 20-50 for good coverage.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = []
for x in items:
    if x > 0:
        result.append(x)
```

**Senior:**
```python
result = [x for x in items if x > 0]
```

## See Also

- [[Sections/ml/tuning/grid_search_cv|GridSearchCV (Machine Learning)]]
- [[Sections/ml/tuning/validation_curve|validation_curve (Machine Learning)]]
- [[Sections/ml/tuning/_Index|Machine Learning → Hyperparameter Tuning]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
