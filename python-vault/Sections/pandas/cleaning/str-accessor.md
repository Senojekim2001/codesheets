---
type: "entry"
domain: "python"
file: "pandas"
section: "cleaning"
id: "str-accessor"
title: ".str accessor"
category: "Cleaning"
subtitle: "Apply string methods to every element without a loop"
signature_short: "df[\"col\"].str.lower() | .str.contains() | .str.extract(r\"()\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - ".str accessor"
  - "str-accessor"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/cleaning"
  - "category/cleaning"
  - "tier/tiered"
---

# .str accessor

> Apply string methods to every element without a loop

## Overview

The .str accessor applies string methods element-wise to a Series, returning NaN for null values instead of crashing. Far faster than apply(lambda x: fn(x)) for string operations.

## Signature

```python
df["col"].str.lower() | .str.contains() | .str.extract(r"()")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - basics only: lowercase a column and check membership
#             with .str.contains. NaN-safe by default with na=False.
# STRENGTHS - the pattern is "df['col'].str.method(...)" — same
#             muscle memory as any Python string method, but
#             vectorized.
# WEAKNESSES- doesn't yet show extract/split/replace which are the
#             real reasons to reach for .str — that's the junior tier.
#
import pandas as pd

s = df["name"]
s.str.lower()
df[df["email"].str.contains("@example.com", na=False)]
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday .str surface: case/whitespace, predicates,
#             split-into-columns, regex extract, replace. The
#             vectorized form replaces apply(lambda) for strings.
# STRENGTHS - this is what .str usage looks like in real ETL: split
#             a column into two, extract a regex group into a new
#             column, normalize and filter.
# WEAKNESSES- ignores the pyarrow-string speed boost and the
#             extractall pattern for multiple matches per row.
#
import pandas as pd

s = df["name"]

# Case & whitespace
s.str.lower()
s.str.title()
s.str.strip()
s.str.replace(r"\s+", " ", regex=True)               # normalize spaces

# Predicates — always na=False to keep NaN out of masks
df[df["email"].str.contains("@company\.com", na=False)]
s.str.startswith("A")
s.str.endswith(".com")
s.str.len()

# Split into multiple columns at once
df[["first", "last"]] = df["name"].str.split(" ", n=1, expand=True)

# Regex extract — first capturing group
df["area_code"] = df["phone"].str.extract(r"\((\d{3})\)")

# Replace — literal vs regex
df["amount_str"] = df["amount_str"].str.replace("$", "", regex=False)
df["text"]       = df["text"].str.replace(r"[^\w\s]", "", regex=True)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production string handling: switch to string[pyarrow]
#             for big speedups, use str.extractall for multi-match,
#             keep regex compiled and explicit, and reach for a real
#             parser (urllib.parse, email.utils) instead of regex
#             when the format is well-defined.
# STRENGTHS - pyarrow-string can be 5-10x faster on .str ops;
#             extractall handles "one row, many matches" cleanly;
#             stdlib parsers are far more correct than ad-hoc regex.
# WEAKNESSES- pyarrow-string requires pandas >=2.0 and isn't
#             round-trippable through every storage format yet;
#             extractall returns a MultiIndex which surprises
#             readers; stdlib parsers don't vectorize.
#
import pandas as pd

# 1. pyarrow-backed strings — much faster .str ops on big frames
df["text"] = df["text"].astype("string[pyarrow]")

# 2. Multiple matches per row -> extractall (returns MultiIndex)
matches = df["body"].str.extractall(r"#(\w+)")        # all hashtags
hashtags_per_row = matches.groupby(level=0)[0].agg(list)
df["hashtags"] = hashtags_per_row.reindex(df.index).fillna("").apply(list)

# 3. Compile regex you reuse — clearer and slightly faster
import re
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
df["email_valid"] = df["email"].fillna("").map(lambda s: bool(EMAIL_RE.match(s)))

# 4. Use a real parser when one exists — regex is rarely the right
#    tool for emails, URLs, addresses, phone numbers
from urllib.parse import urlparse
df["host"] = df["url"].fillna("").map(lambda u: urlparse(u).netloc or pd.NA)

# 5. Anti-pattern: df["col"].apply(lambda x: x.lower())
#    Use df["col"].str.lower() — vectorized, NaN-safe, much faster.

# Decision rule:
#   Fixed-position substring                    -> s.str[0:3]
#   Containment search                            -> s.str.contains("pattern", regex=True/False)
#   Replace                                       -> s.str.replace("a","b", regex=False)
#   Split into multiple columns                   -> s.str.split(",", expand=True)
#   Extract groups                                -> s.str.extract(r"(w+)@(w+)")
#   Strip whitespace                              -> s.str.strip()
#   Case operations                               -> .str.lower() / .upper() / .title()
#   At scale -> faster                            -> dtype="string[pyarrow]" + same .str API
#
# Anti-pattern: regex=True (default) when matching a literal that contains regex metacharacters
#   s.str.contains("file.txt") matches "fileXtxt" because . means "any char".
#   Always pass regex=False for literal matches, or escape with re.escape().
#   The same applies to .replace and .extract — choose regex semantics deliberately.
```

## Decision Rule

```text
Fixed-position substring                    -> s.str[0:3]
Containment search                            -> s.str.contains("pattern", regex=True/False)
Replace                                       -> s.str.replace("a","b", regex=False)
Split into multiple columns                   -> s.str.split(",", expand=True)
Extract groups                                -> s.str.extract(r"(w+)@(w+)")
Strip whitespace                              -> s.str.strip()
Case operations                               -> .str.lower() / .upper() / .title()
At scale -> faster                            -> dtype="string[pyarrow]" + same .str API
```

## Anti-Pattern

> [!warning] Anti-pattern
> regex=True (default) when matching a literal that contains regex metacharacters
>   s.str.contains("file.txt") matches "fileXtxt" because . means "any char".
>   Always pass regex=False for literal matches, or escape with re.escape().
>   The same applies to .replace and .extract — choose regex semantics deliberately.

## Tips

- Always `na=False` in `.str.contains()` — without it NaN rows raise or return NaN in the mask
- `.str.extract()` returns the first capturing group; `.str.extractall()` returns all matches
- `.str.split(expand=True)` returns a DataFrame directly — assign multiple columns at once
- `.str` is always slower than a dedicated parser — use `pd.to_datetime()` not `.str` for dates

## Common Mistake

> [!warning] `apply(lambda x: x.lower())` for string ops. `df["col"].str.lower()` is vectorized, handles NaN, and is 5-10x faster.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
df = pd.DataFrame({
'name': ['Alice Cooper', 'Bob Dylan', 'Charlie Brown', None],
'email': ['alice@example.com', 'bob@test.org', 'charlie@demo.net', 'invalid'],
```

**Senior:**
```python
df[df['email'].str.contains('@company.com', na=False)]
```

## See Also

- [[Sections/pandas/cleaning/isna|.isna() (Pandas)]]
- [[Sections/pandas/cleaning/duplicated|.duplicated() / .drop_duplicates() (Pandas)]]
- [[Sections/pandas/cleaning/dropna|.dropna() (Pandas)]]
- [[Sections/pandas/cleaning/fillna|.fillna() (Pandas)]]
- [[Sections/pandas/cleaning/_Index|Pandas → Cleaning Data]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]
