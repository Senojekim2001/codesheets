---
type: "entry"
domain: "python"
file: "pandas"
section: "inspection"
id: "info"
title: ".info()"
category: "Inspection"
subtitle: "The first thing to call on any new DataFrame"
signature_short: "df.info(verbose=True, memory_usage=\"deep\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".info()"
  - "info"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/inspection"
  - "category/inspection"
  - "tier/tiered"
---

# .info()

> The first thing to call on any new DataFrame

## Overview

info() shows the index dtype, column dtypes, non-null counts, and memory usage in one call. It is the fastest way to spot wrong types, unexpected nulls, and memory problems before doing any analysis.

## Signature

```python
df.info(verbose=True, memory_usage="deep")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - one call. Look at the output. That's the whole feature.
# STRENGTHS - introduces the muscle-memory habit: every new DataFrame
#             gets df.info() before anything else.
# WEAKNESSES- doesn't yet cover the deep-memory option or the helpers
#             you'll reach for next (shape, dtypes, select_dtypes).
#
import pandas as pd

df.info()
# RangeIndex: 10000 entries, 0 to 9999
# Data columns (total 5 columns):
#  #   Column   Non-Null Count  Dtype
#  0   id       10000 non-null  int64
#  1   date      9850 non-null  object   <- wrong type + 150 nulls
#  2   amount   10000 non-null  float64
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the inspection cluster you actually use post-load:
#             info, shape, dtypes, columns.tolist, select_dtypes by
#             group. Treat info() as the hub, the rest as drill-downs.
# STRENGTHS - covers the daily diagnostic surface; selecting by dtype
#             is the cleanest way to apply per-type transforms next.
# WEAKNESSES- doesn't surface true memory usage for object columns —
#             a wide string-heavy frame can be 10x what info() reports
#             without deep=True (senior tier).
#
import pandas as pd

df.info()                          # types + non-null counts + naive memory

df.shape                           # (rows, cols)
df.dtypes                          # column -> dtype
df.columns.tolist()                # names as plain list (handy for code)

df.select_dtypes("object")         # likely strings (or mixed)
df.select_dtypes("number")         # all numerics
df.select_dtypes(include=["category", "datetime"])
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production diagnostic pass: info(memory_usage="deep") for
#             true cost, isna().sum() for per-column nulls, and the
#             "describe my types" idiom that catches dtype regressions
#             before they reach analysis.
# STRENGTHS - exposes the real memory bill (string content, not
#             pointer count); per-column null counts are what you act
#             on; type-pivoted summaries make schema review automatic.
# WEAKNESSES- deep=True can be slow on huge frames (it walks every
#             string); over-relying on info() output instead of
#             writing real schema tests is still brittle.
#
import pandas as pd

# 1. True memory — deep=True walks string content
df.info(memory_usage="deep")

mem_mb = df.memory_usage(deep=True).sort_values(ascending=False) / 1e6
mem_mb.head()                     # top offenders to target

# 2. Per-column null audit
nulls = df.isna().sum()
nulls[nulls > 0].sort_values(ascending=False)

# 3. Schema fingerprint — useful in CI / pipeline tests
schema = (df.dtypes
            .astype(str)
            .reset_index()
            .rename(columns={"index": "column", 0: "dtype"}))
# assert schema.set_index("column")["dtype"].equals(expected_schema)

# 4. Group columns by type for downstream pipelines
num  = df.select_dtypes("number").columns
cat  = df.select_dtypes(["category", "object"]).columns
date = df.select_dtypes("datetime").columns

# Standing rule: any time a frame enters a notebook from outside,
# run df.info(memory_usage="deep") + df.isna().sum() before anything else.

# Decision rule:
#   Quick null/dtype overview                   -> df.info()
#   Memory usage with object content            -> df.info(memory_usage="deep")
#   Wide DataFrame (>100 cols)                  -> df.info(verbose=False) or df.dtypes.value_counts()
#   Need only column dtypes                      -> df.dtypes (a Series)
#   Need null counts numerically                  -> df.isna().sum()
#   Programmatic schema inspection                -> df.columns + df.dtypes (skip info text)
#   Across many DataFrames                        -> stash df.dtypes; diff between schemas
#
# Anti-pattern: relying on df.info() for memory budgeting without deep=True
#   Default info() reports POINTER size (8 bytes) for object columns, hiding
#   the actual string content. A 1 GB-RAM DataFrame can show as 80 MB in info().
#   Always call df.info(memory_usage="deep") or df.memory_usage(deep=True).sum().
```

## Decision Rule

```text
Quick null/dtype overview                   -> df.info()
Memory usage with object content            -> df.info(memory_usage="deep")
Wide DataFrame (>100 cols)                  -> df.info(verbose=False) or df.dtypes.value_counts()
Need only column dtypes                      -> df.dtypes (a Series)
Need null counts numerically                  -> df.isna().sum()
Programmatic schema inspection                -> df.columns + df.dtypes (skip info text)
Across many DataFrames                        -> stash df.dtypes; diff between schemas
```

## Anti-Pattern

> [!warning] Anti-pattern
> relying on df.info() for memory budgeting without deep=True
>   Default info() reports POINTER size (8 bytes) for object columns, hiding
>   the actual string content. A 1 GB-RAM DataFrame can show as 80 MB in info().
>   Always call df.info(memory_usage="deep") or df.memory_usage(deep=True).sum().

## Tips

- `memory_usage="deep"` shows true memory — can be 10x the naive estimate for string columns
- A column showing `object` dtype when you expect `float64` means there are non-numeric values mixed in
- Non-null count < total rows means nulls — follow up with `df.isna().sum()` for per-column counts
- Call `df.info()` immediately after loading any new dataset — before any analysis

## Common Mistake

> [!warning] Skipping `df.info()` and going straight to analysis. You will spend hours debugging a calculation only to find a column is dtype `object` instead of `float64`.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
df.info()
df.info(memory_usage='deep')   # true memory including strings
df.shape                       # (rows, cols)
```

**Senior:**
```python
df.select_dtypes('number')     # numeric columns
```

## See Also

- [[Sections/pandas/inspection/describe|.describe() (Pandas)]]
- [[Sections/pandas/inspection/value-counts|.value_counts() (Pandas)]]
- [[Sections/pandas/inspection/head-tail|.head() / .tail() (Pandas)]]
- [[Sections/pandas/inspection/sample|.sample() (Pandas)]]
- [[Sections/pandas/inspection/_Index|Pandas → Inspecting Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]
