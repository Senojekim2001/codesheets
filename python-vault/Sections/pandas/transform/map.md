---
type: "entry"
domain: "python"
file: "pandas"
section: "transform"
id: "map"
title: ".map()"
category: "Transform"
subtitle: "Element-wise transformation or value substitution on a Series"
signature_short: "Series.map(dict) | Series.map(fn)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".map()"
  - "map"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/transform"
  - "category/transform"
  - "tier/tiered"
---

# .map()

> Element-wise transformation or value substitution on a Series

## Overview

map() applies a dict or function to each element of a Series, returning a new Series. With a dict, values not in the dict become NaN. Use map() for value substitution and simple element-wise transformations on a single Series.

## Signature

```python
Series.map(dict) | Series.map(fn)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - dict substitution on a single column. Each value
#             becomes its mapped output; values not in the dict
#             become NaN.
# STRENGTHS - the cleanest possible "encode A->Active, I->Inactive"
#             pattern.
# WEAKNESSES- the silent-NaN-for-missing-key behavior is the #1
#             surprise — junior tier addresses replace() for the
#             "keep unmatched" case.
#
import pandas as pd

df["status"] = df["code"].map({"A": "Active", "I": "Inactive"})
# any code not in the dict is now NaN
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday choices: map(dict) for encoding,
#             map(fn) for simple element-wise, replace(dict) when
#             unmatched values should stay unchanged, and
#             vectorized numpy when the function is numeric.
# STRENGTHS - the decision rules are right where you need them:
#             map vs replace vs vectorized for the three common
#             shapes of element-wise work.
# WEAKNESSES- doesn't address na_action= for explicit NaN
#             handling, or the "missing key in dict" early-warning
#             pattern — senior tier covers those.
#
import pandas as pd
import numpy as np

# Dict substitution — unmatched -> NaN
df["status"] = df["code"].map({"A": "Active", "I": "Inactive"})

# Function — element-wise transformation
df["clean"]     = df["name"].map(str.strip)

# Want to KEEP unmatched values? Use replace, not map
df["code_pretty"] = df["code"].replace({"A": "Active", "I": "Inactive"})
# unrecognized codes pass through unchanged

# For numeric functions, vectorized is much faster than map(fn)
df["log_price"] = np.log(df["price"])             # not df["price"].map(np.log)

# Quick rules of thumb
# map(dict)   - encode/lookup; missing -> NaN
# replace()   - substitute; missing -> unchanged
# map(fn)     - element-wise transform; numeric? prefer vectorized
# apply(axis=1) - DataFrame row logic only when nothing else fits
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production map: surface unmapped keys explicitly
#             (don't let them become silent NaN), use na_action=
#             "ignore" when NaN should pass through unchanged,
#             prefer Categorical.cat.rename_categories for true
#             encoded columns, and reach for merge() when the
#             "lookup" is really a join.
# STRENGTHS - turns silent failures into visible warnings;
#             rename_categories preserves the dtype; merge is the
#             right tool when the lookup table is itself a frame.
# WEAKNESSES- the "audit unmapped" pass costs a scan; merge is
#             more code than map for trivial encodings;
#             na_action="ignore" is sometimes too lenient (you
#             may want NaN to fail fast).
#
import pandas as pd

# 1. Surface unmapped keys instead of silently producing NaN
mapping = {"A": "Active", "I": "Inactive"}
unmapped = set(df["code"].dropna().unique()) - set(mapping)
if unmapped:
    raise ValueError(f"unmapped codes: {sorted(unmapped)}")
df["status"] = df["code"].map(mapping)

# 2. Pass NaN through unchanged when that's the intent
df["status_b"] = df["code"].map(mapping, na_action="ignore")

# 3. Categorical rename — when the column is a category
df["status_cat"] = df["code"].astype("category")
df["status_cat"] = df["status_cat"].cat.rename_categories(mapping)

# 4. Lookup table is a DataFrame -> use merge, not map
lookups = pd.DataFrame({
    "code":  ["A", "I"],
    "label": ["Active", "Inactive"],
    "color": ["green", "red"],
})
df = df.merge(lookups, on="code", how="left")    # carries multi-column metadata

# Decision rule, in order:
#   single-column dict  -> map(dict)
#   single-column dict, keep unmatched -> replace(dict)
#   numeric function    -> vectorized np / pandas
#   categorical rename  -> cat.rename_categories
#   multi-column lookup -> merge

# Decision rule:
#   Replace values from a dict                  -> s.map({"old":"new", ...})
#   Apply a Python fn elementwise                 -> s.map(lambda x: ...)
#   Map from another Series                       -> s.map(lookup_series)
#   NaN for missing keys (default)                 -> map() returns NaN for unmapped keys
#   Keep unmapped values                           -> s.map(lookup).fillna(s)
#   Vectorized: prefer .replace                    -> s.replace({"old":"new"}) handles partial mappings
#   DataFrame elementwise                          -> df.applymap (deprecated -> df.map in 2.1+)
#   Categorical                                    -> map preserves dtype if all keys covered
#
# Anti-pattern: s.map(dict) when the dict doesn't cover every value
#   Unmapped values become NaN — easy to lose silently. Either provide a default
#   (s.map(d).fillna(s)) or use s.replace(d) which preserves unmapped values.
#   Pandas 3.0 may also let you pass na_action="ignore" to keep originals.
```

## Decision Rule

```text
Replace values from a dict                  -> s.map({"old":"new", ...})
Apply a Python fn elementwise                 -> s.map(lambda x: ...)
Map from another Series                       -> s.map(lookup_series)
NaN for missing keys (default)                 -> map() returns NaN for unmapped keys
Keep unmapped values                           -> s.map(lookup).fillna(s)
Vectorized: prefer .replace                    -> s.replace({"old":"new"}) handles partial mappings
DataFrame elementwise                          -> df.applymap (deprecated -> df.map in 2.1+)
Categorical                                    -> map preserves dtype if all keys covered
```

## Anti-Pattern

> [!warning] Anti-pattern
> s.map(dict) when the dict doesn't cover every value
>   Unmapped values become NaN — easy to lose silently. Either provide a default
>   (s.map(d).fillna(s)) or use s.replace(d) which preserves unmapped values.
>   Pandas 3.0 may also let you pass na_action="ignore" to keep originals.

## Tips

- Dict mapping with `map()` sets unmatched values to NaN — use `replace()` to keep unmatched values
- For numeric functions use vectorized operations directly: `np.log(df["col"])` not `df["col"].map(np.log)`
- `map()` is element-wise on a single Series; `apply()` is more flexible but slower
- Combine `map()` with a dict for readable category encoding

## Common Mistake

> [!warning] Using `df["col"].map({"A": 1})` expecting unmapped values to stay unchanged. They become NaN. Use `df["col"].replace({"A": 1})` to preserve unmapped values.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = []
for x in numbers:
    result.append(x * 2)
```

**Senior:**
```python
result = list(map(lambda x: x * 2, numbers))
```

## See Also

- [[Sections/pandas/transform/sort-values|.sort_values() (Pandas)]]
- [[Sections/pandas/transform/sort-index|.sort_index() (Pandas)]]
- [[Sections/pandas/transform/rename|.rename() (Pandas)]]
- [[Sections/pandas/transform/drop|.drop() (Pandas)]]
- [[Sections/pandas/transform/_Index|Pandas → Transforming Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]
