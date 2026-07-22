---
type: "entry"
domain: "python"
file: "pandas"
section: "transform"
id: "assign"
title: ".assign()"
category: "Transform"
subtitle: "Add computed columns without intermediate variables"
signature_short: "df.assign(new_col=lambda df: ..., col2=value)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".assign()"
  - "assign"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/transform"
  - "category/transform"
  - "tier/tiered"
---

# .assign()

> Add computed columns without intermediate variables

## Overview

assign() adds or replaces columns and returns a new DataFrame — enabling method chaining. Lambdas receive the current DataFrame, including columns added earlier in the same assign() call.

## Signature

```python
df.assign(new_col=lambda df: ..., col2=value)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - add a constant or simple computed column with assign,
#             returning a new DataFrame.
# STRENGTHS - chain-friendly: no df["x"] = ... assignment needed,
#             no broken pipelines.
# WEAKNESSES- doesn't yet show the lambda form (which is what
#             unlocks "use the current frame's columns") or
#             multi-column declarations.
#
import pandas as pd

df = df.assign(source="imported", version=2)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - lambda form for computed columns, multiple
#             assignments in one call, mixing constants and
#             expressions, and using pd.cut inline for binning.
# STRENGTHS - matches how assign appears in real code: a single
#             call adds 3-5 columns, the lambda sees the LATEST
#             frame state including columns added earlier in the
#             same assign().
# WEAKNESSES- doesn't address the rare "name is also a Python
#             keyword" edge case or chain-friendly debugging via
#             pipe(print) — senior tier covers those.
#
import pandas as pd

df = (df
    .assign(
        full_name = lambda d: d["first"] + " " + d["last"],
        salary_k  = lambda d: d["salary"] / 1000,
        is_senior = lambda d: d["years"] >= 5,
        grade     = lambda d: pd.cut(
            d["score"], bins=[0, 60, 70, 80, 90, 100],
            labels=["F", "D", "C", "B", "A"]),
    )
)

# Earlier columns are visible to later lambdas in the SAME assign():
df = df.assign(
    tax = lambda d: d["salary"] * 0.3,
    net = lambda d: d["salary"] - d["tax"],   # uses tax just defined
)

# Conditional flag with map (or np.where)
df = df.assign(
    flag = lambda d: d["score"].gt(90).map({True: "A", False: "B"}),
)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production assign: build entire pipelines as a
#             single chain, use **kwargs unpacking for dynamic
#             column names, sprinkle pipe(print) for debugging
#             without breaking the chain, and prefer assign +
#             query + pipe over imperative df["x"] = ... mutation.
# STRENGTHS - one expression captures the full transformation;
#             dynamic column names handle "feature engineering by
#             config"; chain-friendly debugging keeps the code
#             linear under review.
# WEAKNESSES- chained assigns can become hard to debug when one
#             lambda silently produces NaN (use pipe with assert);
#             dict-unpack assign() is 3.7+ only; very long chains
#             become hard to diff in code review.
#
import pandas as pd

# 1. Dynamic columns via **kwargs unpacking
new_cols = {
    f"{c}_log": (lambda c=c: lambda d: (d[c] + 1).pipe("np".__import__().log))()
    for c in ["amount", "score"]
}
# (Real code would just compute these inline — kwargs-unpacking shines for
#  config-driven feature builds, e.g. {**dynamic_features})

# 2. Chain-friendly debugging
def trace(df, label=""):
    print(f"{label}: shape={df.shape}, na={df.isna().sum().sum()}")
    return df

clean = (df
    .pipe(trace, "raw")
    .query("amount > 0")
    .assign(amount_log=lambda d: (d["amount"] + 1).pipe(lambda s: s.transform("log")))
    .pipe(trace, "after log")
    .assign(grade=lambda d: pd.cut(d["score"], bins=[0,60,80,100], labels=list("FBA")))
    .pipe(trace, "final"))

# 3. Decision rule — assign vs df["x"] = ...
#    Mutating with df["x"] = ... is fine in scratch notebooks.
#    In pipelines / functions / tests:
#       - assign() returns a new frame -> safer with shared state
#       - chain stays linear -> easier to review and refactor
#       - copy semantics are explicit -> no SettingWithCopyWarning

# 4. Anti-pattern: f-string named args (not allowed)
#    df.assign(f"{name}_log" = ...)   # syntax error
#    Use unpacking:
#    df.assign(**{f"{name}_log": fn})

# Decision rule:
#   Add one or more derived columns             -> df.assign(x=df.a + df.b)
#   Reference a freshly-assigned col              -> use a callable: assign(x=..., y=lambda d: d.x*2)
#   Method chain (no intermediate var)            -> .pipe / .assign / .query keep one expression
#   Conditional assignment                         -> assign(flag=lambda d: np.where(d.x>0,1,0))
#   Replace existing column                        -> assign(x=...) (last-write wins)
#   Side-effect-free pipeline                      -> assign returns a COPY; original unchanged
#   Can't use **kwargs (Python keyword)            -> use a dict-unpack: assign(**{"my col": ...})
#   In-place if perf demands it                    -> df["x"] = ... (mutates)
#
# Anti-pattern: assign() for in-place mutation
#   df.assign(x=...) returns a new frame and DROPS THE RESULT if you don't bind.
#   "df.assign(x=...)" alone is a no-op: assignments must be either df = df.assign(...)
#   or chained. For mutation pick df["x"] = ... explicitly.
```

## Decision Rule

```text
Add one or more derived columns             -> df.assign(x=df.a + df.b)
Reference a freshly-assigned col              -> use a callable: assign(x=..., y=lambda d: d.x*2)
Method chain (no intermediate var)            -> .pipe / .assign / .query keep one expression
Conditional assignment                         -> assign(flag=lambda d: np.where(d.x>0,1,0))
Replace existing column                        -> assign(x=...) (last-write wins)
Side-effect-free pipeline                      -> assign returns a COPY; original unchanged
Can't use **kwargs (Python keyword)            -> use a dict-unpack: assign(**{"my col": ...})
In-place if perf demands it                    -> df["x"] = ... (mutates)
```

## Anti-Pattern

> [!warning] Anti-pattern
> assign() for in-place mutation
>   df.assign(x=...) returns a new frame and DROPS THE RESULT if you don't bind.
>   "df.assign(x=...)" alone is a no-op: assignments must be either df = df.assign(...)
>   or chained. For mutation pick df["x"] = ... explicitly.

## Tips

- assign() is the chain-friendly alternative to `df["col"] = value` — returns a new DataFrame
- Each lambda receives the DataFrame including columns added earlier in the same `.assign()` call
- Wrap long chains in `( )` for clean multi-line formatting without backslashes
- Use `df.copy()` if you need to mutate inside assign — assign itself does not mutate

## Common Mistake

> [!warning] Assigning with `df["col"] = value` inside a method chain — it breaks the chain and returns None. Use `.assign(col=value)` to stay chainable.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
df = (df
.assign(
full_name = lambda d: d['first'] + ' ' + d['last'],
```

**Senior:**
```python
df.assign(flag=lambda d: d['score'].gt(90).map({True: 'A', False: 'B'}))
```

## See Also

- [[Sections/pandas/transform/sort-values|.sort_values() (Pandas)]]
- [[Sections/pandas/transform/sort-index|.sort_index() (Pandas)]]
- [[Sections/pandas/transform/rename|.rename() (Pandas)]]
- [[Sections/pandas/transform/drop|.drop() (Pandas)]]
- [[Sections/pandas/transform/_Index|Pandas → Transforming Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]
