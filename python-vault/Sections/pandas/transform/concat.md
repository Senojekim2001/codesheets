---
type: "entry"
domain: "python"
file: "pandas"
section: "transform"
id: "concat"
title: "pd.concat()"
category: "Transform"
subtitle: "Vertical stack (UNION ALL) with axis=0, horizontal with axis=1"
signature_short: "pd.concat([df1, df2], axis=0, ignore_index=True)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pd.concat()"
  - "concat"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/transform"
  - "category/transform"
  - "tier/tiered"
---

# pd.concat()

> Vertical stack (UNION ALL) with axis=0, horizontal with axis=1

## Overview

concat() stacks DataFrames. axis=0 (default) stacks vertically — like SQL UNION ALL. axis=1 stacks side-by-side. ignore_index=True resets the index after stacking.

## Signature

```python
pd.concat([df1, df2], axis=0, ignore_index=True)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - vertical stack of two same-shape frames. Always
#             ignore_index=True to get a clean integer index.
# STRENGTHS - the simplest concat: SQL UNION ALL, in one call.
# WEAKNESSES- doesn't yet show many-file stacking, horizontal
#             concat, mismatched columns, or "where did this row
#             come from?" tracking.
#
import pandas as pd

combined = pd.concat([df1, df2], ignore_index=True)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday concat patterns: stacking N files from
#             a glob, tracking source via keys=, horizontal concat
#             on a shared index, and the join= flag for handling
#             column mismatches.
# STRENGTHS - matches what you actually do with concat in real
#             pipelines: read many files, stack, optionally tag
#             which file each row came from.
# WEAKNESSES- doesn't surface the categorical-fallback trap or
#             the dtype-promotion side effects of stacking — those
#             are senior-tier.
#
import pandas as pd
import glob

# Stack many CSVs into one frame
dfs = [pd.read_csv(f) for f in glob.glob("data/*.csv")]
combined = pd.concat(dfs, ignore_index=True)

# Track source via a hierarchical index, then drill in
labelled = pd.concat(dfs, keys=["jan", "feb", "mar"])
labelled.loc["jan"]                          # rows from first frame

# Horizontal stack — both sides must share an index
assert df1.index.equals(df2.index), "indexes must match for axis=1"
wide = pd.concat([df1, df2], axis=1)

# Mismatched columns: NaN-fill (default) vs keep-only-common
union = pd.concat([df1, df2], axis=0)                    # NaN-fill
inner = pd.concat([df1, df2], axis=0, join="inner")      # only shared cols
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production concat: turn keys= into a real source
#             column, harmonize dtypes BEFORE stacking (categorical
#             union, nullable Int64 vs int64, datetime tz), and
#             prefer pyarrow CSV reading when stacking dozens of
#             files.
# STRENGTHS - dtype pre-harmonization prevents the silent fall-
#             back to object dtype after concat; explicit source
#             tagging beats keys= for downstream filtering;
#             pyarrow reads are 2-5x faster on big batches.
# WEAKNESSES- harmonization adds a setup step; pyarrow engine
#             has subtly different error messages; "make all
#             dtypes match" is sometimes lossy (Int64 -> float).
#
import pandas as pd
from pandas.api.types import CategoricalDtype

# 1. Tag source explicitly — better than keys= for downstream code
def tagged(path: str) -> pd.DataFrame:
    return pd.read_csv(path).assign(_source=path)

combined = pd.concat(
    [tagged(p) for p in sorted(glob.glob("data/*.csv"))],
    ignore_index=True,
)

# 2. Categorical alignment — concat falls back to object without this
status_dtype = CategoricalDtype(["active", "pending", "inactive"])
df1["status"] = df1["status"].astype(status_dtype)
df2["status"] = df2["status"].astype(status_dtype)
combined = pd.concat([df1, df2], ignore_index=True)
combined["status"].dtype                 # category — preserved

# 3. Pre-flight: same dtypes for shared columns avoids object fallback
shared = set(df1.columns) & set(df2.columns)
mismatch = {c for c in shared if df1[c].dtype != df2[c].dtype}
assert not mismatch, f"dtype mismatch on {mismatch}"

# 4. Streaming concat for very many files — keep memory bounded
def aggregate_csvs(paths):
    running = []
    for p in paths:
        chunk = pd.read_csv(p, engine="pyarrow")
        running.append(chunk.groupby("region", observed=True)["amount"].sum())
    return pd.concat(running).groupby(level=0).sum()

# Anti-pattern: pd.concat([df1, df2]) without ignore_index= when
# stacking. Original indexes are preserved -> duplicate index labels
# silently break downstream .loc / .reindex calls.

# Decision rule:
#   Stack rows (same columns)                   -> pd.concat([df1, df2], axis=0, ignore_index=True)
#   Side-by-side columns                         -> pd.concat([df1, df2], axis=1)
#   Inner-join on index/columns                   -> join="inner" (drops misaligned)
#   Track origin                                  -> keys=["a","b"] (creates outer MultiIndex)
#   Performance with many small frames            -> collect ALL, then ONE concat — never in a loop
#   Need to reset index                            -> ignore_index=True
#   Append a single row                            -> pd.concat([df, pd.DataFrame([row])])
#   Cross schema                                   -> concat with sort=False for consistent order
```

## Decision Rule

```text
Stack rows (same columns)                   -> pd.concat([df1, df2], axis=0, ignore_index=True)
Side-by-side columns                         -> pd.concat([df1, df2], axis=1)
Inner-join on index/columns                   -> join="inner" (drops misaligned)
Track origin                                  -> keys=["a","b"] (creates outer MultiIndex)
Performance with many small frames            -> collect ALL, then ONE concat — never in a loop
Need to reset index                            -> ignore_index=True
Append a single row                            -> pd.concat([df, pd.DataFrame([row])])
Cross schema                                   -> concat with sort=False for consistent order
```

## Anti-Pattern

> [!warning] Anti-pattern
> pd.concat([df1, df2]) without ignore_index= when
> stacking. Original indexes are preserved -> duplicate index labels
> silently break downstream .loc / .reindex calls.

## Tips

- `ignore_index=True` resets the index — almost always what you want after vertical stacking
- `keys=["a","b"]` adds a MultiIndex level showing which DataFrame each row came from
- Vertical concat with different columns fills missing values with NaN — use `join="inner"` to keep only common columns
- `pd.concat([df] * 3)` repeats a DataFrame 3 times — useful for testing

## Common Mistake

> [!warning] Using `pd.concat([df1, df2])` without `ignore_index=True` when stacking rows. The original indexes are preserved — you end up with duplicate index values which causes bugs in later operations.

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

- [[Sections/pandas/transform/sort-values|.sort_values() (Pandas)]]
- [[Sections/pandas/transform/sort-index|.sort_index() (Pandas)]]
- [[Sections/pandas/transform/rename|.rename() (Pandas)]]
- [[Sections/pandas/transform/drop|.drop() (Pandas)]]
- [[Sections/pandas/transform/_Index|Pandas → Transforming Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]
