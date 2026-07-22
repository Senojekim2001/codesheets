---
type: "entry"
domain: "python"
file: "pandas"
section: "io"
id: "series-constructor"
title: "pd.Series()"
category: "I/O"
subtitle: "A single column — the building block of a DataFrame"
signature_short: "pd.Series(data, index=None, name=None, dtype=None)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pd.Series()"
  - "series-constructor"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/io"
  - "category/i-o"
  - "tier/tiered"
---

# pd.Series()

> A single column — the building block of a DataFrame

## Overview

pd.Series is a 1D labeled array. Every DataFrame column is a Series. Understanding Series operations is essential because most pandas methods return a Series. A Series has both values (numpy array) and an index.

## Signature

```python
pd.Series(data, index=None, name=None, dtype=None)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - simplest Series: from a Python list, default integer
#             index, no name, no special dtype.
# STRENGTHS - shows the data structure in 3 lines; reveals that a Series
#             is "values + index" with nothing extra.
# WEAKNESSES- doesn't yet show name=, dict input, or alignment
#             behavior — those are what makes Series different from a list.
#
import pandas as pd

s = pd.Series([10, 20, 30, 40])
s.values        # array([10, 20, 30, 40])
s.index         # RangeIndex(start=0, stop=4, step=1)
s.dtype         # int64
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - construct from list, dict, scalar; show how a Series
#             behaves inside a DataFrame, and the everyday properties
#             you'll inspect (values, index, name, dtype).
# STRENGTHS - covers the common Series patterns; introduces .name as
#             "the column name when this Series is put in a DataFrame".
# WEAKNESSES- skips the alignment gotcha — adding two Series with
#             mismatched indexes silently produces NaN. Senior tier
#             surfaces it.
#
import pandas as pd

# Construct
s = pd.Series([10, 20, 30], index=["a", "b", "c"])
s = pd.Series({"a": 1, "b": 2, "c": 3})           # dict keys become index
s = pd.Series(0, index=["a", "b", "c"])           # scalar broadcast
s = pd.Series([1, 2, 3], name="score")            # name = future column name

# Series come from DataFrames too
df = pd.DataFrame({"age": [30, 25], "score": [92, 88]})
col = df["age"]                  # column -> Series
row = df.iloc[0]                 # row    -> Series

# Properties worth knowing
s.values, s.index, s.name, s.dtype, s.shape

# Series <-> DataFrame
s.to_frame()                                       # 1-col DataFrame
pd.DataFrame({"a": col, "b": col + 1})             # build a DF from Series
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - call out index alignment (the #1 Series footgun), use
#             nullable extension dtypes for missing-aware integers and
#             strings, and prefer .to_numpy() over .values for clarity.
# STRENGTHS - prevents silent NaN bugs from mismatched indexes; keeps
#             ints integer when nulls appear; .to_numpy() is the
#             pandas-recommended accessor.
# WEAKNESSES- nullable dtypes still surprise downstream code that
#             expects numpy ints; alignment behavior can't be turned off,
#             so you have to plan around it (.reset_index, .reindex).
#
import pandas as pd

# 1. Index alignment — pandas matches by LABEL, not position
a = pd.Series([1, 2, 3], index=["x", "y", "z"])
b = pd.Series([10, 20, 30], index=["y", "z", "w"])
a + b
# w     NaN     <- present only in b
# x     NaN     <- present only in a
# y    12.0
# z    23.0     <- aligned by label, not position

# To add by position, drop or reset the index first:
(a.reset_index(drop=True) + b.reset_index(drop=True))   # 11, 22, 33

# 2. Nullable dtypes keep semantics intact in the presence of NaN
ids = pd.Series([1, 2, None, 4], dtype="Int64")     # capital I = nullable int
names = pd.Series(["a", None, "c"], dtype="string") # nullable string ext type
ids.isna()        # boolean Series
ids.sum()         # 7   — null skipped, no float coercion

# 3. Prefer .to_numpy() over .values (pandas-recommended; supports nullable)
arr = ids.to_numpy(dtype="float64", na_value=float("nan"))

# Decision rule:
#   Numeric column from list                  -> pd.Series(values) (numpy default)
#   Need null support on integers              -> pd.Series(..., dtype="Int64")
#   Strings with frequent missing               -> dtype="string" (StringDtype, nullable)
#   Boolean with NaN                            -> dtype="boolean" (NOT bool — bool can't hold NA)
#   Datetime column                             -> pd.to_datetime(values, utc=True)
#   Index-aligned arithmetic with another Series -> set the same .index on both
#   One-off scalar broadcast                     -> pd.Series(scalar, index=existing.index)
#
# Anti-pattern: pd.Series([1, 2, None]) and expecting integer dtype
#   numpy int64 has no NaN; pandas silently upcasts to float64 — your "ints"
#   become 1.0, 2.0, NaN. Use dtype="Int64" (the nullable extension type) when
#   you need integers that survive missing values.
```

## Decision Rule

```text
Numeric column from list                  -> pd.Series(values) (numpy default)
Need null support on integers              -> pd.Series(..., dtype="Int64")
Strings with frequent missing               -> dtype="string" (StringDtype, nullable)
Boolean with NaN                            -> dtype="boolean" (NOT bool — bool can't hold NA)
Datetime column                             -> pd.to_datetime(values, utc=True)
Index-aligned arithmetic with another Series -> set the same .index on both
One-off scalar broadcast                     -> pd.Series(scalar, index=existing.index)
```

## Anti-Pattern

> [!warning] Anti-pattern
> pd.Series([1, 2, None]) and expecting integer dtype
>   numpy int64 has no NaN; pandas silently upcasts to float64 — your "ints"
>   become 1.0, 2.0, NaN. Use dtype="Int64" (the nullable extension type) when
>   you need integers that survive missing values.

## Tips

- Every DataFrame column is a Series — all Series methods apply to df["col"]
- `s.values` returns the underlying numpy array — use for fast numeric operations
- `s.to_frame()` converts back to a single-column DataFrame
- A Series index aligns operations — `s1 + s2` aligns on index labels, not position

## Common Mistake

> [!warning] Treating a Series like a list and ignoring the index. When two Series are added, pandas aligns by index label — not position. Mismatched indexes produce NaN.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
s = pd.Series([10, 20, 30, 40])
s = pd.Series([10, 20, 30], index=['a', 'b', 'c'])
s = pd.Series({'a': 1, 'b': 2, 'c': 3})
```

**Senior:**
```python
pd.DataFrame({'a': s1, 'b': s2}) # combine two Series
```

## See Also

- [[Sections/core/output/print|print() (Core Syntax & Built-ins)]]
- [[Sections/core/output/input|input() (Core Syntax & Built-ins)]]
- [[Sections/core/output/isinstance|isinstance() (Core Syntax & Built-ins)]]
- [[Sections/core/output/getattr|getattr() (Core Syntax & Built-ins)]]
- [[Sections/pandas/io/_Index|Pandas → Reading, Writing & Performance]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]
