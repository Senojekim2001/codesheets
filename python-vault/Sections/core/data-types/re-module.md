---
type: "entry"
domain: "python"
file: "core"
section: "data-types"
id: "re-module"
title: "re module"
category: "Strings"
subtitle: "search, findall, sub, split, compile — always use raw strings r\"\""
signature_short: "re.search(r\"pattern\", text) | re.findall() | re.sub()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "re module"
  - "re-module"
tags:
  - "python"
  - "python/core"
  - "python/core/data-types"
  - "category/strings"
  - "tier/tiered"
---

# re module

> search, findall, sub, split, compile — always use raw strings r""

## Overview

The re module provides full regular expression support. Always use raw strings r"" for patterns to avoid double-escaping backslashes. Compile patterns with re.compile() when reusing them. re.search() scans anywhere; re.match() only matches at the start.

## Signature

```python
re.search(r"pattern", text) | re.findall() | re.sub()
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
# GOAL: Find a pattern anywhere in a string
import re
text = "Order #1234 shipped on 2024-01-15"

m = re.search(r'd{4}-d{2}-d{2}', text)
m.group()   # → '2024-01-15'

# GOAL: Find all matches
re.findall(r'd+', text)   # → ['1234', '2024', '01', '15']
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
# GOAL: Replace with sub
import re
re.sub(r's+', ' ', 'too   many  spaces')  # → 'too many spaces'

# GOAL: Split on a pattern
re.split(r'[,;s]+', 'a, b;  c d')   # → ['a','b','c','d']

# GOAL: Compile for reuse — avoids recompiling on every call
date_re = re.compile(r'(d{4})-(d{2})-(d{2})')
m = date_re.search(text)
m.group(1), m.group(2), m.group(3)  # → '2024','01','15'
m.groups()                           # → ('2024','01','15')
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
# GOAL: Named groups — more readable than numeric groups
import re
pattern = re.compile(r'(?P<year>d{4})-(?P<month>d{2})-(?P<day>d{2})')
m = pattern.search('shipped on 2024-01-15')
m.group('year')    # → '2024'
m.groupdict()      # → {'year':'2024','month':'01','day':'15'}

# GOAL: Flags — case-insensitive and multiline
re.findall(r'^order', text, re.IGNORECASE | re.MULTILINE)

# GOAL: Backreference in sub — reformat dates to DD/MM/YYYY
re.sub(r'(d{4})-(d{2})-(d{2})', r'\3/\2/\1', '2024-01-15')
# → '15/01/2024'

# NOTE: re.match() only matches at the START of the string
# re.search() scans anywhere — use search() by default
#
# Decision rule:
#   simple literal contains check                 -> "x" in s (NOT regex)
#   replace fixed substring                       -> s.replace(old, new)
#   match anywhere in string                      -> re.search
#   match start of string only                    -> re.match (anchor-implicit)
#   match whole string                             -> re.fullmatch
#   all non-overlapping matches                   -> re.findall / re.finditer
#   substitute by pattern                         -> re.sub
#   reused pattern in hot path                    -> re.compile once, then .search() on it
#   parse structured grammar                       -> a real parser (lark / pyparsing), NOT regex
#   match case-insensitive                        -> re.IGNORECASE flag
#
# Anti-pattern: parsing HTML, JSON, CSV, or email addresses with hand-rolled regex.
#   These grammars have edge cases (nested tags, quoted commas, RFC 5322) that regex cannot
#   handle robustly; you'll ship something that "works on the dev sample" and fails in prod.
#   Use html.parser / BeautifulSoup, json.loads, csv.reader, email.utils.parseaddr — purpose
#   built parsers. Reserve regex for genuine pattern matching on flat text.
```

## Decision Rule

```text
simple literal contains check                 -> "x" in s (NOT regex)
replace fixed substring                       -> s.replace(old, new)
match anywhere in string                      -> re.search
match start of string only                    -> re.match (anchor-implicit)
match whole string                             -> re.fullmatch
all non-overlapping matches                   -> re.findall / re.finditer
substitute by pattern                         -> re.sub
reused pattern in hot path                    -> re.compile once, then .search() on it
parse structured grammar                       -> a real parser (lark / pyparsing), NOT regex
match case-insensitive                        -> re.IGNORECASE flag
```

## Anti-Pattern

> [!warning] Anti-pattern
> parsing HTML, JSON, CSV, or email addresses with hand-rolled regex.
>   These grammars have edge cases (nested tags, quoted commas, RFC 5322) that regex cannot
>   handle robustly; you'll ship something that "works on the dev sample" and fails in prod.
>   Use html.parser / BeautifulSoup, json.loads, csv.reader, email.utils.parseaddr — purpose
>   built parsers. Reserve regex for genuine pattern matching on flat text.

## Tips

- Always use raw strings `r"\d+"` — avoids double-escaping (`\\d` vs `\d`)
- `re.compile()` once and reuse — avoids recompiling on every call in a loop
- Named groups `(?P<name>...)` make complex patterns self-documenting

## Common Mistake

> [!warning] Using `re.match()` expecting it to search the whole string. `re.match()` only matches at the very start. Use `re.search()` to find a pattern anywhere.

## See Also

- [[Sections/core/data-types/fstrings|f-strings (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/str-methods|str methods (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/_Index|Core Syntax & Built-ins → Data Types & Strings]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]
