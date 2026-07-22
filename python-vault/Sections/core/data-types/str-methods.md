---
type: "entry"
domain: "python"
file: "core"
section: "data-types"
id: "str-methods"
title: "str methods"
category: "Strings"
subtitle: "split, join, strip, find, replace, startswith, endswith"
signature_short: "s.split(sep) | sep.join(lst) | s.strip() | s.replace(old, new)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "str methods"
  - "str-methods"
tags:
  - "python"
  - "python/core"
  - "python/core/data-types"
  - "category/strings"
  - "tier/tiered"
---

# str methods

> split, join, strip, find, replace, startswith, endswith

## Overview

Python strings are immutable — all methods return new strings. The most important are split/join (converting between strings and lists), strip (whitespace removal), and replace/find (search and substitution).

## Signature

```python
s.split(sep) | sep.join(lst) | s.strip() | s.replace(old, new)
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
# GOAL: Case, whitespace, and testing
s = "  Hello, World!  "
s.strip()               # → 'Hello, World!'
s.lower()               # → '  hello, world!  '
s.upper()               # → '  HELLO, WORLD!  '
s.startswith('  Hello') # → True
s.endswith('!  ')       # → True
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
# GOAL: Split and join — the most-used string pattern
"a,b,c".split(',')          # → ['a', 'b', 'c']
"hello world".split()       # → ['hello', 'world']  (any whitespace)
",".join(['a', 'b', 'c'])   # → 'a,b,c'
"\n".join(['line1', 'line2'])

# GOAL: Find and replace
s = "Hello, World!"
s.find('World')     # → 7   (-1 if not found)
s.index('World')    # → 7   (ValueError if not found)
s.replace('World', 'Python')  # → 'Hello, Python!'
s.count('l')        # → 3

# NOTE: find() returns -1 on miss; index() raises ValueError
# Use find() when absence is expected; index() when absence is a bug
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
# GOAL: Partition — split on first occurrence, always 3 parts
'user@example.com'.partition('@')   # → ('user', '@', 'example.com')
'no-at-sign'.partition('@')         # → ('no-at-sign', '', '')

# GOAL: removeprefix / removesuffix (Python 3.9+)
'https://example.com'.removeprefix('https://')  # → 'example.com'
'report.csv'.removesuffix('.csv')               # → 'report'

# WHY: cleaner than s[len(prefix):] — only removes if actually present
'other.txt'.removesuffix('.csv')   # → 'other.txt'  (unchanged)

# GOAL: Efficient string building — never use + in a loop
# Slow: O(n²)
result = ''
for x in items:
    result += str(x)

# Fast: O(n)
result = ''.join(str(x) for x in items)
#
# Decision rule:
#   tokenize on whitespace                       -> s.split() (no arg, smart)
#   tokenize on a single char                    -> s.split(",")
#   tokenize on regex / multi-pattern            -> re.split(r"[,;]", s)
#   build string from list                        -> sep.join(parts) (NEVER += in loop)
#   strip whitespace ends                         -> s.strip() / lstrip / rstrip
#   strip a known prefix / suffix                 -> s.removeprefix() / .removesuffix() (3.9+)
#   substring exists?                             -> "x" in s (NOT s.find(...) >= 0)
#   pattern test, not just literal                -> re.search (NOT str.replace / find)
#   case-insensitive equality                     -> s.lower() == t.lower() / s.casefold()
#   normalize multiple spaces to one              -> " ".join(s.split())
#
# Anti-pattern: building a string by repeated `+=` inside a loop.
#   Each iteration creates a new immutable string and copies all previous content; total work
#   is O(n²). Append to a list and `"".join(parts)` at the end (O(n)). For really large
#   string assembly use `io.StringIO`. The same bug shape: `s = s.replace(...)` chained
#   thousands of times — collect all (old, new) pairs then run str.translate or a regex once.
```

## Decision Rule

```text
tokenize on whitespace                       -> s.split() (no arg, smart)
tokenize on a single char                    -> s.split(",")
tokenize on regex / multi-pattern            -> re.split(r"[,;]", s)
build string from list                        -> sep.join(parts) (NEVER += in loop)
strip whitespace ends                         -> s.strip() / lstrip / rstrip
strip a known prefix / suffix                 -> s.removeprefix() / .removesuffix() (3.9+)
substring exists?                             -> "x" in s (NOT s.find(...) >= 0)
pattern test, not just literal                -> re.search (NOT str.replace / find)
case-insensitive equality                     -> s.lower() == t.lower() / s.casefold()
normalize multiple spaces to one              -> " ".join(s.split())
```

## Anti-Pattern

> [!warning] Anti-pattern
> building a string by repeated `+=` inside a loop.
>   Each iteration creates a new immutable string and copies all previous content; total work
>   is O(n²). Append to a list and `"".join(parts)` at the end (O(n)). For really large
>   string assembly use `io.StringIO`. The same bug shape: `s = s.replace(...)` chained
>   thousands of times — collect all (old, new) pairs then run str.translate or a regex once.

## Tips

- `s.split()` with no argument splits on any whitespace and strips leading/trailing — handles tabs and multiple spaces
- `",".join(lst)` is much faster than concatenating with `+` in a loop
- `removeprefix`/`removesuffix` (3.9+) are safer than slicing — they only remove if the prefix/suffix actually exists

## Common Mistake

> [!warning] Using `str.replace()` for pattern-based substitution. `s.replace(r"\w+", "X")` treats the pattern as a literal string. Use `re.sub(r"\w+", "X", s)` for regex replacement.

## See Also

- [[Sections/core/data-types/fstrings|f-strings (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/re-module|re module (Core Syntax & Built-ins)]]
- [[Sections/core/data-types/_Index|Core Syntax & Built-ins → Data Types & Strings]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]
