---
type: "entry"
domain: "python"
file: "pandas"
section: "cleaning"
id: "categorical"
title: "pd.Categorical"
category: "Cleaning"
subtitle: "Memory-efficient strings with sortable order for low-cardinality columns"
signature_short: "df[\"col\"].astype(\"category\") | pd.Categorical(values, categories, ordered)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pd.Categorical"
  - "categorical"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/cleaning"
  - "category/cleaning"
  - "tier/tiered"
---

# pd.Categorical

> Memory-efficient strings with sortable order for low-cardinality columns

## Overview

The category dtype stores a column as integer codes pointing to a lookup table of unique values. This can reduce memory by 10x for low-cardinality string columns. Ordered categoricals support comparison operators and correct sort order.

## Signature

```python
df["col"].astype("category") | pd.Categorical(values, categories, ordered)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - cast a low-cardinality string column to "category" and
#             measure the memory before/after.
# STRENGTHS - shows the immediate win in three lines: same data,
#             much smaller memory footprint.
# WEAKNESSES- doesn't surface ordered categoricals, the codes/
#             categories accessors, or the observed= flag in
#             groupby — those are the everyday extras.
#
import pandas as pd

before = df["city"].memory_usage(deep=True)
df["city"] = df["city"].astype("category")
after  = df["city"].memory_usage(deep=True)
print(f"{before/1024:.0f} KB -> {after/1024:.0f} KB")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday categorical surface: cat.categories,
#             cat.codes, ordered categoricals via CategoricalDtype,
#             and observed=True in groupby (essential — otherwise
#             empty categories produce empty groups).
# STRENGTHS - covers what you need to actually USE a categorical
#             after creating it; ordered categoricals are how
#             "S/M/L/XL" sorts correctly without bespoke code.
# WEAKNESSES- doesn't address the cardinality trap (categorizing
#             high-cardinality strings makes things WORSE) or the
#             arrow-string alternative — senior tier.
#
import pandas as pd
from pandas.api.types import CategoricalDtype

# Basic conversion + introspection
df["status"] = df["status"].astype("category")
df["status"].cat.categories                   # the lookup table
df["status"].cat.codes                        # integer encoding per row

# Add or prune categories
df["status"] = df["status"].cat.add_categories(["archived"])
df["status"] = df["status"].cat.remove_unused_categories()

# Ordered categorical — comparisons and sort use the declared order
size_type = CategoricalDtype(
    categories=["S", "M", "L", "XL"],
    ordered=True,
)
df["size"] = df["size"].astype(size_type)

df[df["size"] >= "L"]                         # works because ordered
df.sort_values("size")                        # sorts in category order

# Always use observed=True in groupby with categoricals
df.groupby("status", observed=True)["revenue"].sum()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - measure before you categorize: high-cardinality columns
#             can use MORE memory as category. Compare against
#             string[pyarrow]. Use a fixed CategoricalDtype across
#             pipelines so concat/merge stay aligned.
# STRENGTHS - prevents the "I categorized everything and used more
#             memory" footgun; pyarrow strings often beat category
#             above a few thousand uniques; pinned CategoricalDtype
#             survives round-trips through parquet.
# WEAKNESSES- cardinality threshold is empirical (depends on string
#             length distribution); pyarrow string requires pandas
#             >= 2.0; CategoricalDtype mismatches between two frames
#             cause subtle merge bugs.
#
import pandas as pd
from pandas.api.types import CategoricalDtype

# 1. Decide BEFORE casting — measurement-driven
def best_string_dtype(s: pd.Series) -> str:
    n = len(s)
    nunique = s.nunique(dropna=True)
    avg_len = s.dropna().astype(str).str.len().mean() or 0
    cat_bytes   = nunique * avg_len + 4 * n         # codes + categories
    arrow_bytes = avg_len * n * 1.0                  # arrow string overhead
    return "category" if cat_bytes < arrow_bytes else "string[pyarrow]"

# 2. Pinned dtype across the pipeline — concat/merge stay correct
STATUS_DTYPE = CategoricalDtype(
    categories=["active", "pending", "inactive", "archived"],
    ordered=False,
)
df["status"] = df["status"].astype(STATUS_DTYPE)
df.to_parquet("snap.parquet")
# Loaded back with the same categories thanks to the pinned dtype.

# 3. Concatenation gotcha — categories union or align by intent
a = pd.Series(["x"], dtype=CategoricalDtype(["x", "y"]))
b = pd.Series(["z"], dtype=CategoricalDtype(["x", "z"]))
pd.concat([a, b])                     # dtype falls back to object!
# Fix: union the categories first
pd.concat([a, b]).astype(
    CategoricalDtype(sorted(set(a.cat.categories) | set(b.cat.categories)))
)

# 4. Always observed=True; default behavior creates empty groups
df.groupby("status", observed=True)["revenue"].agg(["sum", "count"])

# Decision rule:
#   Low-cardinality string (< 50% unique)       -> .astype("category") (10-100x memory)
#   Ordered category (Low < Med < High)          -> pd.Categorical(values, categories=..., ordered=True)
#   Need to add new categories later             -> cat.add_categories([...])
#   GroupBy on a categorical                     -> respects defined order in result
#   Encoding for ML                              -> pd.get_dummies or sklearn OneHotEncoder
#   Cross frames                                 -> reuse pd.api.types.CategoricalDtype object
#   Save to disk                                 -> parquet preserves; csv loses
#   Cardinality > ~10000                         -> category overhead may exceed gain; profile
#
# Anti-pattern: comparing a string-typed column to a categorical of the same values
#   The comparison silently returns all False — pandas treats them as different
#   dtypes. Either convert both sides to category (sharing CategoricalDtype) or
#   coerce both to plain string. Don't mix.
```

## Decision Rule

```text
Low-cardinality string (< 50% unique)       -> .astype("category") (10-100x memory)
Ordered category (Low < Med < High)          -> pd.Categorical(values, categories=..., ordered=True)
Need to add new categories later             -> cat.add_categories([...])
GroupBy on a categorical                     -> respects defined order in result
Encoding for ML                              -> pd.get_dummies or sklearn OneHotEncoder
Cross frames                                 -> reuse pd.api.types.CategoricalDtype object
Save to disk                                 -> parquet preserves; csv loses
Cardinality > ~10000                         -> category overhead may exceed gain; profile
```

## Anti-Pattern

> [!warning] Anti-pattern
> comparing a string-typed column to a categorical of the same values
>   The comparison silently returns all False — pandas treats them as different
>   dtypes. Either convert both sides to category (sharing CategoricalDtype) or
>   coerce both to plain string. Don't mix.

## Tips

- Convert when `nunique / len(df) < 0.5` — the category dtype saves the most memory then
- Ordered categoricals give correct sort order for things like T-shirt sizes, severity levels
- `observed=True` in `groupby()` skips empty categories — always use it with categoricals
- `cat.codes` gives the integer encoding — useful for ML models that need numeric input

## Common Mistake

> [!warning] Converting high-cardinality columns (emails, names, free text) to `"category"`. Each unique value still gets stored — memory may actually increase. Check cardinality first.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
from pandas.api.types import CategoricalDtype
df['status'] = df['status'].astype('category')
df['city']   = df['city'].astype('category')
```

**Senior:**
```python
df.groupby('status', observed=True)['revenue'].sum()
```

## See Also

- [[Sections/pandas/cleaning/isna|.isna() (Pandas)]]
- [[Sections/pandas/cleaning/duplicated|.duplicated() / .drop_duplicates() (Pandas)]]
- [[Sections/pandas/cleaning/dropna|.dropna() (Pandas)]]
- [[Sections/pandas/cleaning/fillna|.fillna() (Pandas)]]
- [[Sections/pandas/cleaning/_Index|Pandas → Cleaning Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]
