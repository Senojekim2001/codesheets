---
type: "entry"
domain: "python"
file: "regex"
section: "regex-basics"
id: "re-split"
title: "re.split()"
category: "Regex"
subtitle: "Flexible string splitting with pattern-based separators"
signature_short: "re.split(pattern, string, maxsplit=0, flags=0)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "re.split()"
  - "re-split"
tags:
  - "python"
  - "python/regex"
  - "python/regex/regex-basics"
  - "category/regex"
  - "tier/tiered"
---

# re.split()

> Flexible string splitting with pattern-based separators

## Overview

re.split() works like str.split() but accepts regex patterns instead of fixed strings. Captures groups are included in the result. maxsplit limits the number of splits. Useful for splitting on multiple delimiters, whitespace variations, or complex boundaries. Compare: str.split(", ") splits on exactly ", "; re.split(r",\s*") splits on comma followed by any whitespace.

## Signature

```python
re.split(pattern, string, maxsplit=0, flags=0)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - re.split takes a pattern as the delimiter -- like str.split, but with regex.
# STRENGTHS - Multiple delimiters in one call; collapses runs of whitespace.
# WEAKNESSES- Capture groups in the pattern leak into the result; non-capturing groups avoid that.
import re

# Multiple delimiters at once.
print(re.split(r"[,;:]", "apple, banana; orange: grape"))
# ['apple', ' banana', ' orange', ' grape']

# Collapse runs of whitespace.
print(re.split(r"\s+", "one   two\tthree\nfour"))
# ['one', 'two', 'three', 'four']
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - maxsplit to keep the tail intact; capture group to keep delimiters; lookahead split for camelCase / boundaries.
# STRENGTHS - One regex handles cases that need three str.split + str.replace combos.
# WEAKNESSES- A leading or trailing match yields '' at the edges -- filter with a comprehension.
import re

# Keep the rest after N splits.
print(re.split(r":", "a:b:c:d:e", maxsplit=2))
# ['a', 'b', 'c:d:e']

# Keep delimiters in the result via a capture group.
print(re.split(r"(\d+)", "Hello123World456Python"))
# ['Hello', '123', 'World', '456', 'Python']

# Use a non-capturing group when you DON'T want delimiters back.
print(re.split(r"(?:\d+)", "a1b22c"))
# ['a', 'b', 'c']

# Split on a position WITHOUT consuming -- camelCase via lookahead.
print(re.split(r"(?=[A-Z])", "oneTwoThreeFour"))
# ['one', 'Two', 'Three', 'Four']

# Drop empties from edges.
parts = [p for p in re.split(r"\W+", " hello, world! ") if p]
# ['hello', 'world']
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Split for tokenization where order of separators matters; reach for str methods or csv module when the format actually has rules.
# STRENGTHS - Surgical separation that respects context (lookahead boundaries, multi-delim with kept-or-dropped tags).
# WEAKNESSES- Regex split can't handle nested or quoted delimiters -- "a, \"b, c\", d" needs the csv module, not split.
from __future__ import annotations
import csv
import io
import re

# 1) Tokenize while preserving delimiter info -- split into (token, sep) pairs.
TOKEN = re.compile(r"(\s+|[,;:!?])")
def tokens_with_seps(s: str) -> list[tuple[str, str]]:
    parts = TOKEN.split(s)
    # parts is [tok, sep, tok, sep, ...] possibly ending in tok.
    return list(zip(parts[0::2], parts[1::2] + [""]))

# 2) Split honoring word boundaries instead of fixed punctuation.
def words(s: str) -> list[str]:
    return [w for w in re.split(r"\W+", s, flags=re.UNICODE) if w]

# 3) When NOT to use re.split: CSV with quoted fields containing the delimiter.
#    csv module handles quoting / escaping; regex split silently corrupts it.
def parse_csv_line(line: str) -> list[str]:
    return next(csv.reader(io.StringIO(line)))

# parse_csv_line('a,"b,c",d')   ->  ['a', 'b,c', 'd']    (correct)
# re.split(r",", 'a,"b,c",d')    ->  ['a', '"b', 'c"', 'd']  (wrong)

# 4) Multi-line records (split a log file by section header).
SECTION = re.compile(r"^=== (?P<title>.+) ===$", re.MULTILINE)
def by_section(text: str) -> dict[str, str]:
    parts = SECTION.split(text)              # ['', title1, body1, title2, body2, ...]
    return dict(zip(parts[1::2], parts[2::2]))

# 5) Keep delimiters AND know which one matched -- alternation in a capture.
DELIMS = re.compile(r"(--|//|;)")
def split_keep_kind(s: str) -> list[tuple[str, str | None]]:
    out: list[tuple[str, str | None]] = []
    parts = DELIMS.split(s)
    for tok, sep in zip(parts[0::2], parts[1::2] + [None]):
        out.append((tok, sep))
    return out

# Decision rule:
#   simple multi-delimiter                  -> re.split(r"[,;:]", s)
#   variable whitespace                     -> re.split(r"\s+", s)
#   need delimiters back                    -> capture group
#   need POSITIONS not consumed             -> lookahead/lookbehind in the split pattern
#   quoted / nested format (CSV, JSON-ish)  -> proper parser, NOT split
#   maxsplit "first N tokens"               -> str.split(maxsplit=N) is faster for fixed delim
#   build a tokenizer                       -> finditer + scanner pattern, NOT a split chain
#   tokenize then re-emit                   -> capture-group split + zip pairs
#
# Anti-pattern: re.split(r",", csv_line). It "works" until the first quoted
# field with a comma inside, then silently breaks every consumer downstream.
# Use the csv module for CSV. Use a real parser for anything with quoting,
# escapes, or nesting.
```

## Decision Rule

```text
simple multi-delimiter                  -> re.split(r"[,;:]", s)
variable whitespace                     -> re.split(r"\s+", s)
need delimiters back                    -> capture group
need POSITIONS not consumed             -> lookahead/lookbehind in the split pattern
quoted / nested format (CSV, JSON-ish)  -> proper parser, NOT split
maxsplit "first N tokens"               -> str.split(maxsplit=N) is faster for fixed delim
build a tokenizer                       -> finditer + scanner pattern, NOT a split chain
tokenize then re-emit                   -> capture-group split + zip pairs
```

## Anti-Pattern

> [!warning] Anti-pattern
> re.split(r",", csv_line). It "works" until the first quoted
> field with a comma inside, then silently breaks every consumer downstream.
> Use the csv module for CSV. Use a real parser for anything with quoting,
> escapes, or nesting.

## Tips

- Capture groups in the pattern are included in the result — use non-capturing groups (?:...) if you want splitting without capturing.
- re.split(r"\s+") is a regex version of str.split() with no args — it handles multiple spaces, tabs, newlines.
- Split on class boundaries: re.split(r"(?=[A-Z])", "camelCase") splits before uppercase letters without consuming them.
- Empty strings in result signal consecutive delimiters — filter with [x for x in result if x].

## Common Mistake

> [!warning] `re.split(r",", csv_line)` — it works until the first quoted field with a comma inside, then silently corrupts every consumer downstream. Use the csv module for CSV; use a real parser for anything with quoting, escapes, or nesting. Also: capture groups are included in the result; use (?:...) when you don't want delimiters back.

## Shorthand (Junior → Senior)

**Junior:**
```python
import re
text = "apple, banana; orange"
parts = text.replace(";", ",").split(",")
result = [p.strip() for p in parts]
```

**Senior:**
```python
result = re.split(r"[,;]\s*", text)
```

## See Also

- [[Sections/regex/regex-basics/re-match|re.match() vs re.search() vs re.fullmatch() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-findall|re.findall() and re.finditer() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-sub|re.sub() and re.subn() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-compile|re.compile() (Regular Expressions)]]
- [[Sections/regex/regex-basics/_Index|Regular Expressions → Basics & Matching]]
- [[Sections/regex/_Index|Regular Expressions index]]
- [[_Index|Vault index]]
