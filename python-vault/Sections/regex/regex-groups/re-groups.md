---
type: "entry"
domain: "python"
file: "regex"
section: "regex-groups"
id: "re-groups"
title: "Capture groups, named groups, match.group(), match.groups()"
category: "Regex"
subtitle: "() for groups, (?P<name>) for named groups, .group() and .groups()"
signature_short: "re.search(r\"(\\w+)@(\\w+)\", text).group(1)  |  match.groups()  |  match.group(\"name\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Capture groups, named groups, match.group(), match.groups()"
  - "re-groups"
tags:
  - "python"
  - "python/regex"
  - "python/regex/regex-groups"
  - "category/regex"
  - "tier/tiered"
---

# Capture groups, named groups, match.group(), match.groups()

> () for groups, (?P<name>) for named groups, .group() and .groups()

## Overview

Parentheses () create capture groups — they extract parts of a match. Numbered groups: \1, \2... or match.group(1), match.group(2)... Named groups (?P<name>...) are more readable: (?P<domain>\w+). match.group(0) or match.group() returns the entire match. match.groups() returns a tuple of all groups. Nesting works: (()). Groups enable sophisticated data extraction from structured text.

## Signature

```python
re.search(r"(\w+)@(\w+)", text).group(1)  |  match.groups()  |  match.group("name")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Parentheses capture; access by index with m.group(1), m.group(2)...
# STRENGTHS - Pulls structured pieces out of a single match in one regex call.
# WEAKNESSES- Numbered groups become unreadable past 3-4 captures.
import re

m = re.search(r"(\w+)\s+\((\d+)\)", "Alice (30)")
print(m.group(0))   # 'Alice (30)'    -- the whole match
print(m.group(1))   # 'Alice'          -- first group
print(m.group(2))   # '30'             -- second group
print(m.groups())   # ('Alice', '30')  -- all groups as a tuple
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Named groups (?P<name>...) + m["name"] subscript; groupdict() for one-shot dict, with defaults for optional groups.
# STRENGTHS - Self-documenting patterns; Match supports m["name"] like a dict.
# WEAKNESSES- Optional groups that didn't match return None -- must coalesce or .get() if you treat groupdict like data.
import re

LOG = re.compile(r"(?P<ts>\d{4}-\d{2}-\d{2})\s+(?P<level>\w+)\s+(?P<msg>.+)")

m = LOG.search("2026-04-30 ERROR disk full")
print(m["ts"], m["level"])             # '2026-04-30' 'ERROR'
print(m.groupdict())                    # {'ts': ..., 'level': ..., 'msg': ...}

# Optional groups -- handle None at the boundary.
PHONE = re.compile(r"(?P<cc>\+\d{1,3})?[-\s]?(?P<num>\d{7,12})")
parts = PHONE.match("+1-5551234567").groupdict(default="")
print(parts)                            # {'cc': '+1', 'num': '5551234567'}

# Direct unpack via groupdict() into a dataclass.
from dataclasses import dataclass
@dataclass
class LogEvt:
    ts: str; level: str; msg: str

evt = LogEvt(**LOG.search("2026-04-30 ERROR disk full").groupdict())
print(evt.level)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Named groups exclusively in production; constructor adapter for typed records; .lastgroup for branched alternation.
# STRENGTHS - Patterns survive refactoring (renaming a group is local); typed records replace dict[str, str] downstream.
# WEAKNESSES- Group names share a flat namespace per pattern; 'name' twice is a SyntaxError, even across alternations.
from __future__ import annotations
import re
from dataclasses import dataclass
from typing import Self

# 1) Typed record built from a Match -- isolates parsing in one place.
@dataclass(frozen=True, slots=True)
class HTTPLog:
    ip: str
    user: str
    ts: str
    method: str
    path: str
    status: int
    bytes_: int

    _RE = re.compile(r"""
        ^
        (?P<ip>\S+)\s+-\s+(?P<user>\S+)\s+
        \[(?P<ts>[^\]]+)\]\s+
        "(?P<method>[A-Z]+)\s+(?P<path>\S+)\s+HTTP/[\d.]+"\s+
        (?P<status>\d{3})\s+(?P<bytes_>\d+|-)
    """, re.VERBOSE)

    @classmethod
    def parse(cls, line: str) -> Self | None:
        m = cls._RE.match(line)
        if not m: return None
        gd = m.groupdict()
        return cls(
            ip     = gd["ip"],
            user   = gd["user"],
            ts     = gd["ts"],
            method = gd["method"],
            path   = gd["path"],
            status = int(gd["status"]),
            bytes_ = 0 if gd["bytes_"] == "-" else int(gd["bytes_"]),
        )

# 2) Tag-which-alternative-fired with .lastgroup (named alternations only).
TOKEN = re.compile(r"""
    (?P<num>\d+)
    | (?P<word>[A-Za-z_]\w*)
    | (?P<sym>[+\-*/=])
""", re.VERBOSE)

def lex(s: str) -> list[tuple[str, str]]:
    return [(m.lastgroup, m.group()) for m in TOKEN.finditer(s) if m.lastgroup]

# 3) Conflict-free naming: branches with the SAME group name share that one
#    capture across branches. mypy-style "discriminated union" is the lex pattern above.

# Decision rule:
#   <=2 groups in a one-off              -> numbered groups are fine
#   parser / data extraction              -> named groups, period
#   need typed output                    -> dataclass.parse(line) -> Self | None
#   alternation, want to know which       -> Match.lastgroup with named branches
#   optional captures                    -> groupdict(default="") OR explicit None handling
#   nested groups                        -> count by '(' that are NOT '(?:' or '(?='
#                                          (named groups (?P<x>...) DO count)
#   regex too complex to read             -> re.VERBOSE + comments inside the pattern
#
# Anti-pattern: extracting fields with positional groups, then accessing by
# index 4 layers later. The pattern grows, you insert a group, every index
# downstream is off by one and tests "still pass" because the strings happen
# to look right. Use named groups; let renames stay local.
```

## Decision Rule

```text
<=2 groups in a one-off              -> numbered groups are fine
parser / data extraction              -> named groups, period
need typed output                    -> dataclass.parse(line) -> Self | None
alternation, want to know which       -> Match.lastgroup with named branches
optional captures                    -> groupdict(default="") OR explicit None handling
nested groups                        -> count by '(' that are NOT '(?:' or '(?='
                                       (named groups (?P<x>...) DO count)
regex too complex to read             -> re.VERBOSE + comments inside the pattern
```

## Anti-Pattern

> [!warning] Anti-pattern
> extracting fields with positional groups, then accessing by
> index 4 layers later. The pattern grows, you insert a group, every index
> downstream is off by one and tests "still pass" because the strings happen
> to look right. Use named groups; let renames stay local.

## Tips

- Named groups are self-documenting — m.group("age") is clearer than m.group(2).
- m.groupdict() returns a dict of named groups — perfect for unpacking: {name, age, city} = m.groupdict()
- Nested groups work: ((\w+)@(\w+)) has 3 groups: entire part, domain, TLD.
- m.group(0) and m.group() are identical — both return the entire match.
- Wrap parsing in a `@classmethod parse(cls, line) -> Self | None` on a frozen dataclass so the regex stays local and the rest of the codebase deals in typed records, not dict[str, str]. For named alternations, Match.lastgroup tells you which branch fired.

## Common Mistake

> [!warning] Extracting fields with positional groups, then accessing by index 4 layers later — the pattern grows, you insert a group, every index downstream is off by one and tests "still pass" because the strings happen to look right. Use named groups; let renames stay local.

## Shorthand (Junior → Senior)

**Junior:**
```python
import re
text = "Alice 30"
name = text.split()[0]
age = text.split()[1]
```

**Senior:**
```python
import re
m = re.search(r"(?P<name>\w+)\s+(?P<age>\d+)", text)
name, age = m.group("name"), m.group("age")
```

## See Also

- [[Sections/regex/regex-basics/re-match|re.match() vs re.search() vs re.fullmatch() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-findall|re.findall() and re.finditer() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-sub|re.sub() and re.subn() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-split|re.split() (Regular Expressions)]]
- [[Sections/regex/regex-groups/_Index|Regular Expressions → Groups & Captures]]
- [[Sections/regex/_Index|Regular Expressions index]]
- [[_Index|Vault index]]
