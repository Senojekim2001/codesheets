---
type: "entry"
domain: "python"
file: "regex"
section: "regex-basics"
id: "re-findall"
title: "re.findall() and re.finditer()"
category: "Regex"
subtitle: "findall returns list, finditer returns iterator"
signature_short: "re.findall(pattern, string)  |  re.finditer(pattern, string)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "re.findall() and re.finditer()"
  - "re-findall"
tags:
  - "python"
  - "python/regex"
  - "python/regex/regex-basics"
  - "category/regex"
  - "tier/tiered"
---

# re.findall() and re.finditer()

> findall returns list, finditer returns iterator

## Overview

re.findall() returns a list of all non-overlapping matches (strings or tuples if groups). re.finditer() returns an iterator of Match objects — memory-efficient for large strings. Use findall() for small result sets or when you need quick list access. Use finditer() when processing large volumes or need Match metadata (position, groups, etc.). Both are case-sensitive by default; use re.IGNORECASE flag to ignore case.

## Signature

```python
re.findall(pattern, string)  |  re.finditer(pattern, string)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - findall returns plain strings (or tuples if there are groups); finditer streams Match objects.
# STRENGTHS - One-liner extraction; works on any string without setup.
# WEAKNESSES- findall hides positions; if you need .span() use finditer.
import re

text = "Emails: alice@x.com, bob@y.org"

# Plain strings:
print(re.findall(r"\w+@\w+\.\w+", text))
# ['alice@x.com', 'bob@y.org']

# All numbers in a string:
print(re.findall(r"\d+", "42 apples, 17 oranges"))   # ['42', '17']
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Use groups to get tuples; finditer for streaming + positions; named groups for self-documenting code.
# STRENGTHS - Avoids parsing the result by index; large texts handled lazily.
# WEAKNESSES- findall with ONE group returns a list of STRINGS, with 2+ returns a list of TUPLES -- shape changes.
import re

# Pairs via groups -- list of tuples.
pairs = re.findall(r"(\w+):(\d+)", "Alice:30, Bob:25, Charlie:35")
# [('Alice', '30'), ('Bob', '25'), ('Charlie', '35')]
for name, age in pairs:
    print(f"{name} is {age}")

# finditer for big files -- one Match at a time, with span() and groupdict().
LOG = re.compile(r"(?P<ts>\d{4}-\d{2}-\d{2})\s+(?P<level>\w+)\s+(?P<msg>.+)")
with open("app.log") as f:
    for line in f:
        if m := LOG.match(line):
            print(m["ts"], m["level"], m["msg"][:60])

# Count without materializing -- sum(1 for _ in finditer(...)) beats len(findall(...)) on huge text.
def count_matches(pat, s):
    return sum(1 for _ in pat.finditer(s))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - finditer + memoryview/mmap for files larger than RAM; iterate Matches; never findall on untrusted input.
# STRENGTHS - Constant memory; can stop early; works on multi-GB logs; predictable allocation profile.
# WEAKNESSES- Multi-GB regex still scans linearly -- use grep/ripgrep first to narrow, then finditer the candidates.
from __future__ import annotations
import mmap
import re
from collections.abc import Iterator
from pathlib import Path

# 1) findall vs finditer -- pick by what you'll do next.
def first_n(pat: re.Pattern[str], s: str, n: int) -> list[str]:
    out: list[str] = []
    for i, m in enumerate(pat.finditer(s)):
        if i >= n: break
        out.append(m.group())
    return out

# 2) Stream a multi-GB file -- mmap + bytes pattern + finditer.
#    Patterns must be bytes when scanning bytes (mmap returns bytes).
LINE_RE = re.compile(rb"(?P<ip>\d+\.\d+\.\d+\.\d+)\s+(?P<status>\d{3})")

def scan_access_log(path: Path) -> Iterator[tuple[str, int]]:
    with path.open("rb") as f, mmap.mmap(f.fileno(), 0, access=mmap.ACCESS_READ) as mm:
        for m in LINE_RE.finditer(mm):
            yield m["ip"].decode(), int(m["status"])

# 3) findall's two-shape return is a footgun -- normalize at the boundary.
def find_pairs(pat: re.Pattern[str], s: str) -> list[tuple[str, ...]]:
    """Always return a list of tuples, regardless of group count."""
    raw = pat.findall(s)
    if not raw: return []
    return [(x,) if isinstance(x, str) else tuple(x) for x in raw]

# 4) Overlapping matches: findall/finditer skip overlaps. Use lookahead trick:
#    r"(?=(pattern))" -- ZERO-WIDTH match captures, advances by 1, finds overlaps.
def overlapping(pat: str, s: str) -> list[str]:
    return re.findall(f"(?=({pat}))", s)

# overlapping("aa", "aaaa") -> ['aa', 'aa', 'aa']      (vs findall -> ['aa', 'aa'])

# Decision rule:
#   small string, list at hand              -> findall (string-list or tuple-list)
#   need positions / spans                  -> finditer + Match.span()
#   stream a file                           -> mmap (bytes) + bytes Pattern + finditer
#   stop after K hits                       -> finditer + break (do NOT findall + slice)
#   overlapping matches                     -> wrap in (?=(pattern)); zero-width trick
#   counting only                           -> sum(1 for _ in pat.finditer(s)); avoids the list
#   grouped output that's unstable in shape -> normalize at the boundary, never trust findall's shape
#
# Anti-pattern: re.findall(pat, huge_text) when you only need the first match.
# It builds the entire list before returning, paying O(N) memory for one item.
# Use re.search(pat, huge_text) or 'next(pat.finditer(s), None)' instead.
```

## Decision Rule

```text
small string, list at hand              -> findall (string-list or tuple-list)
need positions / spans                  -> finditer + Match.span()
stream a file                           -> mmap (bytes) + bytes Pattern + finditer
stop after K hits                       -> finditer + break (do NOT findall + slice)
overlapping matches                     -> wrap in (?=(pattern)); zero-width trick
counting only                           -> sum(1 for _ in pat.finditer(s)); avoids the list
grouped output that's unstable in shape -> normalize at the boundary, never trust findall's shape
```

## Anti-Pattern

> [!warning] Anti-pattern
> re.findall(pat, huge_text) when you only need the first match.
> It builds the entire list before returning, paying O(N) memory for one item.
> Use re.search(pat, huge_text) or 'next(pat.finditer(s), None)' instead.

## Tips

- findall() with groups returns tuples — unpack them: for name, age in re.findall(r"(\w+):(\d+)", text):
- finditer() is memory-efficient for large text — process matches one at a time instead of building a huge list.
- Use \w (word characters), \d (digits), \s (whitespace) for cleaner patterns.
- Non-overlapping means "aaa" in "aaaa" finds only one match (position 0-3), not two — use the lookahead trick `(?=(pattern))` for overlapping. For multi-GB files, mmap + bytes pattern + finditer scans in constant memory.

## Common Mistake

> [!warning] findall on huge text when you only need the first match — it builds the entire list before returning, paying O(N) memory for one item. Use re.search or `next(pat.finditer(s), None)`. Also: findall's shape changes (1 group → list of strings, 2+ groups → list of tuples); normalize at the boundary.

## Shorthand (Junior → Senior)

**Junior:**
```python
import re
text = "apple, banana, cherry, date"
words = []
for word in text.split(", "):
    words.append(word.strip())
```

**Senior:**
```python
import re
words = re.findall(r"\w+", text)
```

## See Also

- [[Sections/regex/regex-basics/re-match|re.match() vs re.search() vs re.fullmatch() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-sub|re.sub() and re.subn() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-split|re.split() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-compile|re.compile() (Regular Expressions)]]
- [[Sections/regex/regex-basics/_Index|Regular Expressions → Basics & Matching]]
- [[Sections/regex/_Index|Regular Expressions index]]
- [[_Index|Vault index]]
