---
type: "entry"
domain: "python"
file: "core"
section: "data-types"
id: "fstrings"
title: "f-strings"
category: "Strings"
subtitle: "The fastest and most readable string formatting — f\"{val:.2f}\""
signature_short: "f\"{val}\" | f\"{val:.2f}\" | f\"{val:>10}\" | f\"{val=}\""
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "f-strings"
  - "fstrings"
tags:
  - "python"
  - "python/core"
  - "python/core/data-types"
  - "category/strings"
  - "tier/tiered"
---

# f-strings

> The fastest and most readable string formatting — f"{val:.2f}"

## Overview

f-strings (Python 3.6+) embed expressions directly in string literals. The format spec after `:` controls alignment, padding, numeric formatting, and more. The `=` specifier (3.8+) prints both the expression and its value — invaluable for debugging.

## Signature

```python
f"{val}" | f"{val:.2f}" | f"{val:>10}" | f"{val=}"
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - show the simplest call: defaults only, no options, no error handling.
# STRENGTHS - fastest to read; teaches the core idea without distraction;
#             matches what you'd type into a REPL or a quick script.
# WEAKNESSES- relies on default behavior that may not fit real inputs;
#             skips edge cases, validation, and any production concerns.
#
# GOAL: Basic embedding — variables and expressions
name, score = 'Alice', 0.9253
f"Hello, {name}!"          # → 'Hello, Alice!'
f"Score: {score}"          # → 'Score: 0.9253'
f"Result: {2 + 2}"         # → 'Result: 4'
f"Upper: {name.upper()}"   # → 'Upper: ALICE'
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - layer in the common parameters, idioms, and patterns a working
#             developer reaches for daily (cast inputs, format output, options).
# STRENGTHS - covers the 80% case for real projects; teaches the parameters you'll
#             meet in code reviews; balances clarity with practical control.
# WEAKNESSES- still trusts inputs and skips deeper concerns like logging,
#             retries, performance tuning, or graceful failure modes.
#
# GOAL: Number format specs — the most common ones
pi = 3.14159
f"{pi:.2f}"          # → '3.14'       2 decimal places
f"{0.9253:.1%}"      # → '92.5%'      percentage
f"{1234567:,}"       # → '1,234,567'  thousands separator
f"{255:#x}"          # → '0xff'       hex with prefix
f"{42:05d}"          # → '00042'      zero-padded

# GOAL: Alignment in a fixed-width field
f"{'left':<10}"      # → 'left      '
f"{'right':>10}"     # → '     right'
f"{'center':^10}"    # → '  center  '
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - address production concerns: validation, observability, resource
#             handling, and signaling intent (stderr, flush, logging, retries).
# STRENGTHS - safe to ship; handles edge cases and failure modes; integrates
#             with logging/monitoring; communicates engineering intent to teammates.
# WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;
#             assumes a system context (logging, stderr) that may not exist yet.
#
# GOAL: f"{val=}" for debugging — prints name and value (3.8+)
x, y = 42, 'hello'
f"{x=}"       # → 'x=42'
f"{x=!r}"     # → "x=42"         repr format
f"{y=}"       # → "y='hello'"

# GOAL: Multiline f-strings and nested quotes
query = (
    f"SELECT * FROM {table!r} "
    f"WHERE date >= '{start_date}' "
    f"LIMIT {limit}"
)

# GOAL: Format spec from a variable
width, precision = 10, 3
f"{pi:{width}.{precision}f}"   # → '     3.142'
# WHY: Nested {} lets you compute format spec dynamically

# NOTE: f-strings are faster than .format() and % — use them by default
#
# Decision rule:
#   any new code, single string                  -> f-string f"{x}"
#   debugging quick print                        -> f"{x=}" (3.8+)
#   logging library messages                     -> NEVER f-string; use logger.info("...%s", x)
#   user-controlled input (SQL/HTML/shell)       -> NEVER format; use parameterized API
#   template stored in config / DB / file        -> str.format() / Jinja (f-strings need source)
#   joining many pieces                          -> "".join(parts) (NOT += in loop)
#   percent formatting on legacy code            -> "%s" % val (still common, legacy only)
#   numeric / date formatting                    -> f"{n:,.2f}" / f"{dt:%Y-%m-%d}"
#   long template, many fields                   -> str.format() with named placeholders
#
# Anti-pattern: f-string interpolation into SQL, HTML, shell, or log records.
#   `db.execute(f"SELECT * FROM users WHERE id={user_id}")` is a SQL injection. Use the
#   driver's parameter binding: `db.execute("SELECT ... WHERE id=?", (user_id,))`. Same with
#   logging: `log.info(f"got {x}")` evaluates the f-string even if the level is filtered;
#   write `log.info("got %s", x)` so the formatter only runs when needed (and PII filters work).
```

## Decision Rule

```text
any new code, single string                  -> f-string f"{x}"
debugging quick print                        -> f"{x=}" (3.8+)
logging library messages                     -> NEVER f-string; use logger.info("...%s", x)
user-controlled input (SQL/HTML/shell)       -> NEVER format; use parameterized API
template stored in config / DB / file        -> str.format() / Jinja (f-strings need source)
joining many pieces                          -> "".join(parts) (NOT += in loop)
percent formatting on legacy code            -> "%s" % val (still common, legacy only)
numeric / date formatting                    -> f"{n:,.2f}" / f"{dt:%Y-%m-%d}"
long template, many fields                   -> str.format() with named placeholders
```

## Anti-Pattern

> [!warning] Anti-pattern
> f-string interpolation into SQL, HTML, shell, or log records.
>   `db.execute(f"SELECT * FROM users WHERE id={user_id}")` is a SQL injection. Use the
>   driver's parameter binding: `db.execute("SELECT ... WHERE id=?", (user_id,))`. Same with
>   logging: `log.info(f"got {x}")` evaluates the f-string even if the level is filtered;
>   write `log.info("got %s", x)` so the formatter only runs when needed (and PII filters work).

## Tips

- `f"{val=}"` (3.8+) prints both the variable name and value — the best quick debugging tool
- `f"{n:,}"` adds thousands separators with no import
- f-strings are faster than `.format()` and `%` — always prefer them in new code

## Common Mistake

> [!warning] Concatenating strings with `+` in a loop: `s += str(x)`. This is O(n²). Use `"".join(str(x) for x in items)` or build a list and join at the end.

## See Also

- [[Sections/core/data-types/str-methods|str methods (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/re-module|re module (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/_Index|Core Syntax & Built-ins → Data Types & Strings]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]
