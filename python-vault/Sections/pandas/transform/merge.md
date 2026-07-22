---
type: "entry"
domain: "python"
file: "pandas"
section: "transform"
id: "merge"
title: "pd.merge()"
category: "Transform"
subtitle: "inner, left, right, outer — with validate= and indicator="
signature_short: "pd.merge(left, right, on=\"key\", how=\"inner\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pd.merge()"
  - "merge"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/transform"
  - "category/transform"
  - "tier/tiered"
---

# pd.merge()

> inner, left, right, outer — with validate= and indicator=

## Overview

merge() performs SQL-style joins. how= controls join type: inner, left, right, outer. validate= checks cardinality. indicator=True adds a column showing where each row came from.

## Signature

```python
pd.merge(left, right, on="key", how="inner")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - inner join (the default) on a shared key column.
#             Reads like SQL: pick rows that match in both frames.
# STRENGTHS - shows the simplest case in one line; "on=" plus
#             default how="inner" covers most starter joins.
# WEAKNESSES- silently drops unmatched rows. For real ETL you
#             almost always want how="left" + indicator=True so
#             you can SEE what didn't match.
#
import pandas as pd

joined = pd.merge(emp, dept, on="dept_id")    # inner join
joined.shape                                  # may be smaller than emp!
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday merge surface: how= for join type,
#             different column names with left_on/right_on,
#             multi-key joins, indicator=True for join debugging,
#             validate= to assert cardinality, suffixes= for
#             clashing column names.
# STRENGTHS - covers what merge actually looks like in real ETL;
#             indicator=True is the single best debugging tool
#             for "why is my join short/wrong?".
# WEAKNESSES- doesn't yet address dtype mismatches (the silent
#             zero-match killer), merge_asof for time-series, or
#             the join-vs-merge index distinction — senior tier.
#
import pandas as pd

# Pick the join type explicitly
left_join = pd.merge(emp, dept, on="dept_id", how="left")     # all emps
outer     = pd.merge(emp, dept, on="dept_id", how="outer")    # union of keys

# Different column names per side
pd.merge(orders, customers, left_on="cust_id", right_on="id")

# Composite keys
pd.merge(df1, df2, on=["year", "month", "product"])

# Debug a surprising row count with indicator=True
audit = pd.merge(df1, df2, on="id", how="outer", indicator=True)
audit["_merge"].value_counts()
# both          9800
# left_only      150   <- in df1 but not df2
# right_only      50

# Assert expected cardinality — raises immediately on violation
pd.merge(emp, dept, on="dept_id", validate="m:1")             # many emp -> 1 dept

# Clashing column names get suffixes
pd.merge(a, b, on="id", suffixes=("_left", "_right"))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production merges: ALWAYS validate= and an explicit
#             indicator audit; check key dtypes before joining
#             (different ints/strings silently produce zero matches);
#             use merge_asof for time-series joins; consider
#             df.merge(other.set_index(key), on=key) for repeated
#             joins against the same lookup.
# STRENGTHS - the validate + indicator combo turns half a class
#             of "my totals are wrong after the join" bugs into
#             immediate exceptions; merge_asof is the right tool
#             for "join to the most recent prior event"; pre-
#             indexing speeds up repeated lookups.
# WEAKNESSES- validate=m:m doesn't actually check anything (it's
#             always valid); indicator audit costs an extra pass;
#             merge_asof requires sorted keys on both sides;
#             pre-indexing assumes the lookup is reused.
#
import pandas as pd

# 1. Pre-flight: same dtypes on both sides of the key
assert orders["customer_id"].dtype == customers["id"].dtype, (
    "key dtype mismatch -> merge will produce 0 matches"
)

# 2. Validate cardinality + audit unmatched rows
joined = pd.merge(
    orders, customers,
    left_on="customer_id", right_on="id",
    how="left",
    validate="m:1",                     # many orders per customer
    indicator=True,
)
unmatched = joined[joined["_merge"] == "left_only"]
assert len(unmatched) == 0, f"{len(unmatched)} orders had no customer record"
joined = joined.drop(columns="_merge")

# 3. Time-series join — "as of" the most recent prior timestamp
quotes = quotes.sort_values("ts")
trades = trades.sort_values("ts")
matched = pd.merge_asof(
    trades, quotes,
    on="ts",
    by="symbol",                        # match within symbol
    tolerance=pd.Timedelta("1s"),       # only if quote is within 1s of trade
    direction="backward",               # most recent quote BEFORE trade
)

# 4. Repeated lookup — pre-index once
customer_lookup = customers.set_index("id")
out = orders.join(customer_lookup, on="customer_id", how="left")    # uses index

# Anti-pattern: f-string composition of merge keys
#    pd.merge(df, other, on=f"{prefix}_id")    # silent typo risk
# Right: validate= forces the schema contract to be explicit.

# Decision rule:
#   SQL JOIN equivalent                          -> df.merge(other, on="key", how="left/inner/outer")
#   Different column names                        -> left_on="a", right_on="b"
#   Index alignment                               -> df.join(other) (faster, no key arg)
#   Validate cardinality                           -> validate="one_to_many" / "many_to_one"
#   Investigate join misses                        -> indicator=True (adds _merge column)
#   Many-to-many warning                            -> validate="one_to_one" raises if violated
#   Time-aware near-match                           -> pd.merge_asof (rolling join)
#   Big data                                        -> polars / duckdb beat pandas on joins
```

## Decision Rule

```text
SQL JOIN equivalent                          -> df.merge(other, on="key", how="left/inner/outer")
Different column names                        -> left_on="a", right_on="b"
Index alignment                               -> df.join(other) (faster, no key arg)
Validate cardinality                           -> validate="one_to_many" / "many_to_one"
Investigate join misses                        -> indicator=True (adds _merge column)
Many-to-many warning                            -> validate="one_to_one" raises if violated
Time-aware near-match                           -> pd.merge_asof (rolling join)
Big data                                        -> polars / duckdb beat pandas on joins
```

## Anti-Pattern

> [!warning] Anti-pattern
> f-string composition of merge keys
>    pd.merge(df, other, on=f"{prefix}_id")    # silent typo risk
> Right: validate= forces the schema contract to be explicit.

## Tips

- Always use `validate=` on important joins — catches unexpected duplicates that inflate row counts
- `indicator=True` is the fastest way to debug why a join produces unexpected results
- Check key dtypes before merging: `df1["id"].dtype` must equal `df2["id"].dtype`
- `validate="1:1"`, `"1:m"`, `"m:1"`, `"m:m"` — be explicit about expected cardinality

## Common Mistake

> [!warning] Merging on columns with different dtypes (int vs string ID). Pandas silently produces 0 matching rows. Always verify `df1["key"].dtype == df2["key"].dtype` before merging.

## Shorthand (Junior → Senior)

**Junior:**
```python
try:
    result = risky()
except ValueError as e:
    print(e)
```

**Senior:**
```python
try:
    result = risky()
except ValueError:
    result = None
```

## See Also

- [[Sections/pandas/transform/sort-values|.sort_values() (Pandas)]]
- [[Sections/pandas/transform/sort-index|.sort_index() (Pandas)]]
- [[Sections/pandas/transform/rename|.rename() (Pandas)]]
- [[Sections/pandas/transform/drop|.drop() (Pandas)]]
- [[Sections/pandas/transform/_Index|Pandas → Transforming Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]
