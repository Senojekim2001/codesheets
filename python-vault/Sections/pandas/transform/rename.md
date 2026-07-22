---
type: "entry"
domain: "python"
file: "pandas"
section: "transform"
id: "rename"
title: ".rename()"
category: "Transform"
subtitle: "Rename specific columns with a dict — no need to reassign all columns"
signature_short: "df.rename(columns={\"old\": \"new\"}) | df.rename(index={0: \"a\"})"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".rename()"
  - "rename"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/transform"
  - "category/transform"
  - "tier/tiered"
---

# .rename()

> Rename specific columns with a dict — no need to reassign all columns

## Overview

rename() renames specific columns or index labels using a mapping dict. Only the keys you specify are renamed — everything else stays the same. Also accepts a function to transform all names at once.

## Signature

```python
df.rename(columns={"old": "new"}) | df.rename(index={0: "a"})
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - dict-form rename for one or two columns. Reassign the
#             result.
# STRENGTHS - touches only the keys you list — the safest possible
#             rename. Other columns are untouched.
# WEAKNESSES- doesn't yet show function-form rename or column
#             normalization — those are the everyday extras.
#
import pandas as pd

df = df.rename(columns={"old_name": "new_name"})
df = df.rename(columns={"emp_id": "employee_id", "dept": "department"})
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday rename surface: function-form for bulk
#             normalization, lambda for clean-all-columns, the index
#             vs index-name distinction (rename_axis), and the
#             "post-aggregation cleanup" idiom.
# STRENGTHS - matches what rename actually does in real ETL: dict
#             for surgical changes, function for sweeping changes,
#             and the cleanup pass after groupby/agg.
# WEAKNESSES- doesn't address the brittleness of df.columns = [...]
#             (silent misalignment when column count changes) —
#             senior tier highlights the safe alternative.
#
import pandas as pd

# Function-form — applies to ALL labels
df = df.rename(columns=str.lower)
df = df.rename(columns=lambda c: c.strip().replace(" ", "_").lower())

# Rename the AXIS (the label of the index itself, not values)
df.index.name = "employee_id"
df = df.rename_axis("employee_id")

# Rename specific row index labels
df = df.rename(index={0: "first", 1: "second"})

# Post-aggregation: clean up the column you just produced
summary = df.groupby("dept").agg(avg=("sal", "mean"), n=("id", "count"))
summary = summary.rename(columns={"avg": "avg_salary"})
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production-grade column hygiene: a normalize_columns
#             helper that's idempotent and safe to call after every
#             load, errors="raise" to catch typos in dict-form
#             renames, and a contract test that fails the build if
#             expected columns aren't present.
# STRENGTHS - column names stop being a moving target across
#             sources; typo-protected renames catch drift early;
#             contract tests turn schema surprises into actionable
#             CI failures.
# WEAKNESSES- normalization rules are opinionated (snake_case,
#             ASCII fold) and may need tweaking per dataset;
#             contract checks add a small ops cost and need
#             maintenance as the schema evolves.
#
import pandas as pd
import re

def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Idempotent: snake_case, lowercase, ASCII-only column names."""
    def norm(c: str) -> str:
        c = c.strip().lower()
        c = re.sub(r"[^a-z0-9]+", "_", c)
        return c.strip("_")
    return df.rename(columns=norm)

df = normalize_columns(df)
df = normalize_columns(df)        # safe to call again — same output

# 1. Dict rename with errors="raise" catches typos
df = df.rename(columns={"emp_id": "employee_id"}, errors="raise")
# Raises KeyError if "emp_id" doesn't exist — protects against silent drift

# 2. Schema contract — fail loudly if expected columns are missing
EXPECTED = {"employee_id", "department", "salary", "hire_date"}
missing = EXPECTED - set(df.columns)
assert not missing, f"missing required columns: {missing}"

# 3. Anti-pattern: bulk-replace via df.columns = [...]
#    Wrong:
#       df.columns = ["a", "b", "c", "d"]
#    Silently misaligns if upstream adds/removes a column. Use
#    rename(columns={...}) with explicit mapping instead.

# Decision rule:
#   Specific renames                            -> df.rename(columns={"old":"new"})
#   Programmatic transform                       -> columns=str.lower (callable applies to all)
#   Both axes                                    -> rename(index={...}, columns={...})
#   Single-column setattr-style                   -> df.columns = [...] (whole list, in order)
#   Pipeline-friendly                             -> rename returns a copy; chains nicely
#   Lowercase / strip whitespace                   -> .rename(columns=lambda c: c.strip().lower())
#   Reorder columns                                -> df[["a","b","c"]] (NOT rename)
#   Multi-index columns                            -> df.rename(columns=...) operates on level 0
#
# Anti-pattern: assigning df.columns = [...] when you only want to rename one column
#   Easy to mis-count the list and silently shift labels (col 5 becomes col 4's data).
#   Always df.rename(columns={"a":"new_a"}) for targeted renames; reserve
#   df.columns = [...] for full-list reassignments where order is intentional.
```

## Decision Rule

```text
Specific renames                            -> df.rename(columns={"old":"new"})
Programmatic transform                       -> columns=str.lower (callable applies to all)
Both axes                                    -> rename(index={...}, columns={...})
Single-column setattr-style                   -> df.columns = [...] (whole list, in order)
Pipeline-friendly                             -> rename returns a copy; chains nicely
Lowercase / strip whitespace                   -> .rename(columns=lambda c: c.strip().lower())
Reorder columns                                -> df[["a","b","c"]] (NOT rename)
Multi-index columns                            -> df.rename(columns=...) operates on level 0
```

## Anti-Pattern

> [!warning] Anti-pattern
> assigning df.columns = [...] when you only want to rename one column
>   Easy to mis-count the list and silently shift labels (col 5 becomes col 4's data).
>   Always df.rename(columns={"a":"new_a"}) for targeted renames; reserve
>   df.columns = [...] for full-list reassignments where order is intentional.

## Tips

- dict-based rename only touches the keys you specify — safest way to rename specific columns
- `rename(columns=str.lower)` normalizes all column names in one call
- `lambda c: c.strip().replace(" ", "_").lower()` is a common clean-all-columns pattern
- `df.columns = [...]` replaces ALL column names — requires knowing every column name in order

## Common Mistake

> [!warning] Using `df.columns = new_names` when you only want to rename a few columns. If the column count or order ever changes, this silently assigns wrong names. Use `rename(columns={...})` for targeted renames.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
df.rename(columns={'old_name': 'new_name'})
df.rename(columns={
'emp_id':   'employee_id',
```

**Senior:**
```python
result.rename(columns={'avg': 'avg_salary'})
```

## See Also

- [[Sections/pandas/transform/sort-values|.sort_values() (Pandas)]]
- [[Sections/pandas/transform/sort-index|.sort_index() (Pandas)]]
- [[Sections/pandas/transform/drop|.drop() (Pandas)]]
- [[Sections/pandas/transform/reset-set-index|.reset_index() / .set_index() (Pandas)]]
- [[Sections/pandas/transform/_Index|Pandas → Transforming Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]
