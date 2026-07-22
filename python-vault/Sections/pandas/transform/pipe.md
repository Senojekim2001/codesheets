---
type: "entry"
domain: "python"
file: "pandas"
section: "transform"
id: "pipe"
title: ".pipe()"
category: "Transform"
subtitle: "Wrap custom transformation functions into a chain"
signature_short: "df.pipe(fn, *args, **kwargs)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".pipe()"
  - "pipe"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/transform"
  - "category/transform"
  - "tier/tiered"
---

# .pipe()

> Wrap custom transformation functions into a chain

## Overview

pipe() calls fn(df, *args, **kwargs) and returns the result. It lets you include any custom transformation function inside a method chain, keeping code linear and readable.

## Signature

```python
df.pipe(fn, *args, **kwargs)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - the simplest pipe: pass df into a function that
#             returns a new df. Same as fn(df), but chainable.
# STRENGTHS - one line that turns any function into a chain stage;
#             zero magic.
# WEAKNESSES- the value of pipe only shows when there are 2+
#             custom transforms in the pipeline — the next tier
#             demonstrates that.
#
import pandas as pd

def add_total(df):
    return df.assign(total=df["a"] + df["b"])

result = df.pipe(add_total)
# Equivalent: result = add_total(df)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday pattern: a chain mixing built-in
#             pandas methods (.query, .sort_values) with custom
#             functions via pipe. Use pipe(log_shape) for inline
#             debugging without breaking the chain.
# STRENGTHS - linear top-down code reads exactly like the
#             pipeline does; the inline log helper is the trick
#             that keeps long chains debuggable.
# WEAKNESSES- still a sequential chain — pipe by itself doesn't
#             handle branching, conditional steps, or per-input
#             debugging cleanly. Senior tier covers those.
#
import pandas as pd

def add_features(df, threshold=50):
    return df.assign(above=df["value"] > threshold)

def normalize(df, col):
    mn, mx = df[col].min(), df[col].max()
    return df.assign(**{col: (df[col] - mn) / (mx - mn)})

def log_shape(df, label=""):
    print(f"{label}: {df.shape}")
    return df

result = (df
    .query("active == True")
    .pipe(log_shape, label="after filter")
    .pipe(add_features, threshold=100)
    .pipe(normalize, col="score")
    .sort_values("score", ascending=False))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production-grade pipelines: pipe() as the building
#             block for reusable transform functions, the
#             (callable, kwarg_name) form when df should be passed
#             in a non-first position, and the "pure functions
#             only" rule that keeps pipelines testable.
# STRENGTHS - small, named, pure transforms compose into readable
#             pipelines; the kwarg-name form lets you reuse
#             external functions that don't take df first; pure
#             functions are trivial to unit-test in isolation.
# WEAKNESSES- requires team discipline (no in-place mutation
#             inside pipe functions); forces every step to return
#             a DataFrame; debugging deep chains still requires
#             trace helpers (junior tier).
#
import pandas as pd

# 1. Pure transform functions — easy to unit-test
def winsorize(df: pd.DataFrame, col: str, p: float = 0.01) -> pd.DataFrame:
    lo, hi = df[col].quantile([p, 1 - p])
    return df.assign(**{col: df[col].clip(lo, hi)})

def join_lookup(df: pd.DataFrame, lookup: pd.DataFrame, on: str) -> pd.DataFrame:
    return df.merge(lookup, on=on, how="left")

# 2. Compose into a single, linear pipeline
result = (df
    .query("status == 'active'")
    .pipe(winsorize, col="amount", p=0.005)
    .pipe(join_lookup, lookup=customers, on="customer_id")
    .assign(amount_per_customer=lambda d: d["amount"] / d["customer_size"])
    .sort_values("amount_per_customer", ascending=False))

# 3. (callable, kwarg_name) form — when df isn't the first arg
#    e.g. some_fn(threshold, df) instead of some_fn(df, threshold)
# result = df.pipe((some_fn, "df"), threshold=10)

# 4. Anti-pattern: pipe a function that mutates input then returns it
#    Wrong:
#       def bad(df): df["x"] = 1; return df          # mutates caller
#    Right:
#       def good(df): return df.assign(x=1)          # returns new frame

# Decision rule:
#   Apply a function in a chain                 -> df.pipe(my_fn, arg1, kwarg=...)
#   Function expects the frame as 1st arg         -> .pipe(fn) directly
#   Function expects df as a non-first arg         -> .pipe((fn, "df_arg"), other_args)
#   Build complex pipelines without temp vars     -> pipe + assign + query + groupby
#   Side-effect-free transformations               -> functional style fits .pipe
#   Need to inspect mid-chain                     -> .pipe(lambda d: print(d.shape) or d) for debug
#   Performance: just a wrapper                    -> no overhead vs direct call
#   Heavy stats / sklearn                          -> wrap fn(df) with .pipe to keep chaining
#
# Anti-pattern: nested function calls instead of .pipe in long pipelines
#   foo(bar(baz(df.query(...).assign(...)))) reads inside-out and is hard to
#   debug. df.query(...).assign(...).pipe(baz).pipe(bar).pipe(foo) reads
#   left-to-right and lets you comment-out a single .pipe to bisect.
```

## Decision Rule

```text
Apply a function in a chain                 -> df.pipe(my_fn, arg1, kwarg=...)
Function expects the frame as 1st arg         -> .pipe(fn) directly
Function expects df as a non-first arg         -> .pipe((fn, "df_arg"), other_args)
Build complex pipelines without temp vars     -> pipe + assign + query + groupby
Side-effect-free transformations               -> functional style fits .pipe
Need to inspect mid-chain                     -> .pipe(lambda d: print(d.shape) or d) for debug
Performance: just a wrapper                    -> no overhead vs direct call
Heavy stats / sklearn                          -> wrap fn(df) with .pipe to keep chaining
```

## Anti-Pattern

> [!warning] Anti-pattern
> nested function calls instead of .pipe in long pipelines
>   foo(bar(baz(df.query(...).assign(...)))) reads inside-out and is hard to
>   debug. df.query(...).assign(...).pipe(baz).pipe(bar).pipe(foo) reads
>   left-to-right and lets you comment-out a single .pipe to bisect.

## Tips

- pipe() makes any function chain-compatible — the function just needs df as its first argument
- Use `pipe(log_shape)` for inline debugging without breaking a chain
- `df.copy()` inside pipe functions prevents mutating the input DataFrame
- Combine with assign() for fully declarative, linear transformation pipelines

## Common Mistake

> [!warning] Trying to use pipe() with a function that does not return a DataFrame. The result of pipe() is whatever your function returns — if it returns None, the chain ends.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
def add_features(df, threshold=50):
return df.assign(above=df['value'] > threshold)
def normalize(df, col):
```

**Senior:**
```python
df2 = normalize(df2, col='score')
```

## See Also

- [[Sections/pandas/transform/sort-values|.sort_values() (Pandas)]]
- [[Sections/pandas/transform/sort-index|.sort_index() (Pandas)]]
- [[Sections/pandas/transform/rename|.rename() (Pandas)]]
- [[Sections/pandas/transform/drop|.drop() (Pandas)]]
- [[Sections/pandas/transform/_Index|Pandas → Transforming Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]
