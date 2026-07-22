---
type: "entry"
domain: "python"
file: "pandas"
section: "selection"
id: "query"
title: ".query()"
category: "Selection"
subtitle: "Cleaner alternative to boolean indexing for multiple conditions"
signature_short: "df.query(\"col > value and col2 == @var\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".query()"
  - "query"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/selection"
  - "category/selection"
  - "tier/tiered"
---

# .query()

> Cleaner alternative to boolean indexing for multiple conditions

## Overview

query() filters rows using a string expression. Column names are referenced directly. Use @ to inject local Python variables. Often more readable than boolean indexing for 3+ conditions.

## Signature

```python
df.query("col > value and col2 == @var")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - one filter, written as a string. Read it like a SQL WHERE.
# STRENGTHS - shows the cleanest possible filter syntax; immediately
#             obvious how it maps to "select rows where ...".
# WEAKNESSES- doesn't yet show local-variable injection (@) or chained
#             query() calls — those are the everyday patterns.
#
import pandas as pd

df.query("age > 30")
df.query("age > 30 and score >= 90")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday query surface: 'in'/'not in', .between() and
#             .str methods inline, @local for Python variables, and
#             readable chains via repeated .query() calls.
# STRENGTHS - matches how query() shows up in real code: filter chains
#             that read top-to-bottom; @-variables avoid string
#             interpolation; method-style operators (.str, .between)
#             keep the expression compact.
# WEAKNESSES- per-call overhead is real on tiny frames (parse cost
#             dominates); column names with spaces need backtick
#             quoting which surprises readers.
#
import pandas as pd

# 'in' / 'not in' / .between
df.query("city in ['NYC', 'LA', 'SF']")
df.query("city not in ['Chicago']")
df.query("score.between(80, 95)")

# Inject Python variables with @
min_age   = 25
threshold = df["score"].median()
df.query("age >= @min_age and score > @threshold")

# Backtick-quote column names with spaces
df.query("`first name` == 'Alice'")

# Method-style chaining reads top-down
result = (df
    .query("score >= 80")
    .query("dept != 'HR'")
    .sort_values("score", ascending=False)
    .head(10))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production hardening: parameterize via @, prefer eval-
#             engine="python" when expressions need pandas methods that
#             numexpr can't handle, and know when to drop back to
#             boolean indexing for hot loops.
# STRENGTHS - keeps query strings safe by passing variables (no
#             f-string injection); the "python" engine unlocks
#             .str/.dt accessors and arbitrary methods inside the
#             string; explicit fallback to boolean indexing avoids
#             the parse-overhead tax in tight loops.
# WEAKNESSES- engine="python" loses numexpr's speed advantage; query
#             strings are not type-checked, so refactors silently
#             break them; debugging errors points at the string, not
#             at a line number.
#
import pandas as pd

# 1. Pass variables via @ — never f-string into query()
def filter_by(df: pd.DataFrame, min_age: int, cities: list[str]) -> pd.DataFrame:
    return df.query("age >= @min_age and city in @cities")

# 2. Need .str / .dt methods? engine="python"
df.query(
    "name.str.startswith('A') and date.dt.year == 2024",
    engine="python",
)

# 3. Decision rule — when NOT to use query
# Hot inner loop on a small frame:
mask = (df["age"] > 30) & (df["score"] >= 90)
df[mask]                                # no parser overhead

# 4. Compose query strings safely
filters = ["score >= 80", "dept != 'HR'", "region in @regions"]
regions = ["WEST", "EAST"]
df.query(" and ".join(filters))         # variables still resolved via @

# Decision rule:
#   Long boolean expression, readable form      -> df.query("a > 0 and b == 'x'")
#   Reference an outside variable                -> df.query("a > @threshold")
#   Performance with numexpr installed           -> query gets ~2-5x speed on large frames
#   Column name has spaces / special chars        -> wrap the col name with backticks inside the query string
#   Need to mix with method chains                -> .query() returns a frame, chains nicely
#   Programmatic predicate building               -> use boolean-mask form, NOT query string
#   Super complex expressions                     -> step out to .loc[mask] for clarity
#   Want to log/inspect predicate                  -> assign to variable: q = "a>0"; df.query(q)
#
# Anti-pattern: building query strings by f-string concatenation with user input
#   Same SQL-injection risk as raw SQL: df.query(f"name == '{user}'") on user
#   = "x' or 1==1" gives you the full table. Use @-substitution instead:
#   df.query("name == @user"). The local-variable form is parsed safely.
```

## Decision Rule

```text
Long boolean expression, readable form      -> df.query("a > 0 and b == 'x'")
Reference an outside variable                -> df.query("a > @threshold")
Performance with numexpr installed           -> query gets ~2-5x speed on large frames
Column name has spaces / special chars        -> wrap the col name with backticks inside the query string
Need to mix with method chains                -> .query() returns a frame, chains nicely
Programmatic predicate building               -> use boolean-mask form, NOT query string
Super complex expressions                     -> step out to .loc[mask] for clarity
Want to log/inspect predicate                  -> assign to variable: q = "a>0"; df.query(q)
```

## Anti-Pattern

> [!warning] Anti-pattern
> building query strings by f-string concatenation with user input
>   Same SQL-injection risk as raw SQL: df.query(f"name == '{user}'") on user
>   = "x' or 1==1" gives you the full table. Use @-substitution instead:
>   df.query("name == @user"). The local-variable form is parsed safely.

## Tips

- `query()` shines with 3+ conditions — saves deeply nested parentheses
- Use `@var` to inject any Python object — lists, scalars, even other Series
- Column names with spaces need backtick quoting inside query()
- String methods work inline: `df.query("name.str.startswith('A')")`

## Common Mistake

> [!warning] `df[df.a > 1 and df.b < 5]` raises ValueError. Python `and` does not work on Series. Use `&` with parentheses, or switch to `.query("a > 1 and b < 5")`.

## Shorthand (Junior → Senior)

**Junior:**
```python
df.query("age > 30")
df.query("age > 30 and score >= 90")
df.query("city in ['NYC', 'LA', 'SF']")
df.query("city not in ['Chicago']")
```

**Senior:**
```python
)
```

## See Also

- [[Sections/pandas/selection/loc|.loc[] (Pandas)]]
- [[Sections/pandas/selection/iloc|.iloc[] (Pandas)]]
- [[Sections/pandas/selection/isin|.isin() (Pandas)]]
- [[Sections/pandas/selection/between|.between() (Pandas)]]
- [[Sections/pandas/selection/_Index|Pandas → Selecting, Filtering & MultiIndex]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]
