---
type: "entry"
domain: "python"
file: "pandas"
section: "inspection"
id: "sample"
title: ".sample()"
category: "Inspection"
subtitle: "Random rows — better than head() for spotting data issues"
signature_short: "df.sample(n=5, frac=None, random_state=None)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".sample()"
  - "sample"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/inspection"
  - "category/inspection"
  - "tier/tiered"
---

# .sample()

> Random rows — better than head() for spotting data issues

## Overview

sample() returns a random subset of rows. More useful than head() for spotting data quality issues — head() only shows the first rows which may be sorted or homogeneous. Use random_state= for reproducibility.

## Signature

```python
df.sample(n=5, frac=None, random_state=None)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - the simplest call: pick N random rows. This is the right
#             default for "let me look at the data".
# STRENGTHS - one line, more honest than head() because rows are
#             representative of the middle of the file too.
# WEAKNESSES- non-reproducible without random_state; row count rather
#             than fraction makes pipelines awkward when data size
#             changes.
#
import pandas as pd

df.sample(5)                          # 5 random rows
df.sample(5, random_state=42)         # reproducible — pick a fixed seed
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday options: frac= for proportional sampling,
#             frac=1 to shuffle, axis=1 for random columns, weights=
#             for non-uniform sampling, and the manual train/test split.
# STRENGTHS - covers the patterns you reach for weekly: shuffle for
#             stochastic loops, fractional sampling for fast iteration,
#             weighted sampling for "more amount = more likely".
# WEAKNESSES- the manual train/test split looks fine but doesn't
#             stratify; for ML use sklearn.train_test_split with
#             stratify= (mentioned in senior tier).
#
import pandas as pd

df.sample(frac=0.1, random_state=42)              # 10% sample
df.sample(frac=1.0, random_state=42)              # shuffle all rows
df.sample(frac=1.0, random_state=42).reset_index(drop=True)

df.sample(3, axis=1)                              # 3 random columns

# Weighted sampling — bias toward higher-amount rows
df.sample(100, weights="amount", random_state=42)

# Quick train/test split (no stratification)
train = df.sample(frac=0.8, random_state=42)
test  = df.drop(train.index)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production-grade sampling: stratified splits per group,
#             reproducible group-aware sampling so a customer's rows
#             don't leak across train/test, and time-respecting
#             splits where chronology matters more than randomness.
# STRENGTHS - stratification keeps class balance for ML; group-level
#             splits prevent label leakage; chronological splits
#             reflect how the model will be used in production.
# WEAKNESSES- stratify= requires no NaN in the target; group-aware
#             splits require a stable group_id; chronological splits
#             give up the i.i.d. assumption (and that's the right call,
#             but be deliberate about it).
#
import pandas as pd
from sklearn.model_selection import train_test_split, GroupShuffleSplit

# 1. Stratified split — preserves class balance
train, test = train_test_split(
    df,
    test_size=0.2,
    random_state=42,
    stratify=df["target"],
)

# 2. Group-aware split — keep all rows for a customer on the same side
gss = GroupShuffleSplit(test_size=0.2, n_splits=1, random_state=42)
train_idx, test_idx = next(gss.split(df, groups=df["customer_id"]))
train = df.iloc[train_idx]
test  = df.iloc[test_idx]

# 3. Time-respecting split — train on past, test on future
df = df.sort_values("date")
cutoff = df["date"].quantile(0.8)
train = df[df["date"] <= cutoff]
test  = df[df["date"] >  cutoff]

# 4. Reproducibility checklist
#    - random_state pinned at every level (sample, splitter, model)
#    - sort first if order has meaning (datetime, group_id)
#    - log the random seed and the data hash with the run

# Decision rule:
#   Reproducible random sample                  -> df.sample(n=N, random_state=42)
#   Stratified by group                          -> df.groupby(g).sample(frac=0.1)
#   Weighted sampling                             -> weights=col (heavier rows more likely)
#   Without replacement (default)                 -> replace=False
#   With replacement (bootstrap)                  -> replace=True, n=len(df)
#   Random column subset                          -> df.sample(n=k, axis=1)
#   Need a holdout                                -> sklearn.model_selection.train_test_split
#   Massive data                                  -> SQL TABLESAMPLE or polars sample (faster)
#
# Anti-pattern: df.sample() without random_state in shareable analysis code
#   The "100 rows of weirdness" you screenshot today is gone tomorrow. Always
#   pass random_state=N (any int) so the sample is reproducible. Coworkers
#   running the same notebook get the same rows; bug reports stay reproducible.
```

## Decision Rule

```text
Reproducible random sample                  -> df.sample(n=N, random_state=42)
Stratified by group                          -> df.groupby(g).sample(frac=0.1)
Weighted sampling                             -> weights=col (heavier rows more likely)
Without replacement (default)                 -> replace=False
With replacement (bootstrap)                  -> replace=True, n=len(df)
Random column subset                          -> df.sample(n=k, axis=1)
Need a holdout                                -> sklearn.model_selection.train_test_split
Massive data                                  -> SQL TABLESAMPLE or polars sample (faster)
```

## Anti-Pattern

> [!warning] Anti-pattern
> df.sample() without random_state in shareable analysis code
>   The "100 rows of weirdness" you screenshot today is gone tomorrow. Always
>   pass random_state=N (any int) so the sample is reproducible. Coworkers
>   running the same notebook get the same rows; bug reports stay reproducible.

## Tips

- `sample()` beats `head()` for data quality checks — shows a representative cross-section
- `frac=1.0` shuffles the entire DataFrame — use before iterating in random order
- Always set `random_state=` when sampling for reproducible splits
- `df.sample(frac=0.01)` is a quick way to get a 1% subset for fast exploration of huge files

## Common Mistake

> [!warning] Using `df.head()` as the only data quality check. The first rows are often the cleanest — use `df.sample(20)` to get a random cross-section that reveals messy middle rows.

## Shorthand (Junior → Senior)

**Junior:**
```python
df.sample(5)                    # 5 random rows
df.sample(10, random_state=42)  # reproducible
df.sample(frac=0.1)             # 10% of rows
df.sample(frac=1.0)             # shuffle all rows
```

**Senior:**
```python
train, test = train_test_split(df, test_size=0.2, random_state=42)
```

## See Also

- [[Sections/pandas/inspection/info|.info() (Pandas)]]
- [[Sections/pandas/inspection/describe|.describe() (Pandas)]]
- [[Sections/pandas/inspection/value-counts|.value_counts() (Pandas)]]
- [[Sections/pandas/inspection/head-tail|.head() / .tail() (Pandas)]]
- [[Sections/pandas/inspection/_Index|Pandas → Inspecting Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]
