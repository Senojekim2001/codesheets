---
type: "entry"
domain: "python"
file: "regex"
section: "regex-basics"
id: "re-compile"
title: "re.compile()"
category: "Regex"
subtitle: "Pattern objects for repeated matching, flags, and debugging"
signature_short: "re.compile(pattern, flags=0)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "re.compile()"
  - "re-compile"
tags:
  - "python"
  - "python/regex"
  - "python/regex/regex-basics"
  - "category/regex"
  - "tier/tiered"
---

# re.compile()

> Pattern objects for repeated matching, flags, and debugging

## Overview

re.compile() returns a Pattern object that you can call methods on multiple times: .match(), .search(), .findall(), .sub(), etc. Compiling is beneficial when you use the same pattern repeatedly — the pattern is compiled to bytecode once. Also makes code more readable and enables patterns to have names. You can inspect pattern properties: .pattern, .flags, .groups.

## Signature

```python
re.compile(pattern, flags=0)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Compile a pattern once; call .search/.findall/.sub on the Pattern object.
# STRENGTHS - One canonical pattern per use; faster than re-parsing the source string each call.
# WEAKNESSES- The 're' module already caches recently-used patterns -- the speed win matters most for many distinct patterns.
import re

EMAIL = re.compile(r"[\w.+-]+@[\w.-]+\.\w{2,}")

print(EMAIL.search("contact alice@x.com").group())   # 'alice@x.com'
print(EMAIL.findall("alice@x.com, bob@y.org"))       # ['alice@x.com', 'bob@y.org']
print(EMAIL.sub("***", "ping bob@y.org"))            # 'ping ***'
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Define module-level UPPER_CASE patterns; flags pinned in the compile call; named groups for parsers.
# STRENGTHS - Parsers read like grammar; flags travel with the pattern; types stay stable.
# WEAKNESSES- Compiled patterns have type re.Pattern[str] OR re.Pattern[bytes] -- mixing breaks at call time.
import re

# Module scope: compile once, reuse forever.
USER_TAG = re.compile(r"@(?P<user>\w+)")
ISO_DATE = re.compile(r"\b(?P<y>\d{4})-(?P<m>\d{2})-(?P<d>\d{2})\b")
IPV4     = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")
HEADER   = re.compile(r"^(?P<key>[\w-]+):\s*(?P<value>.+?)\s*$", re.MULTILINE)

def mentions(text: str) -> list[str]:
    return [m["user"] for m in USER_TAG.finditer(text)]

def parse_headers(blob: str) -> dict[str, str]:
    return {m["key"]: m["value"] for m in HEADER.finditer(blob)}

# Inspect for debugging:
print(USER_TAG.pattern)                # source string
print(USER_TAG.groups)                 # number of groups
print(USER_TAG.groupindex)             # {'user': 1}
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - One module owns the regex catalog; flags expressed inline (?i)/(?x); test patterns the same way you test code; benchmark before optimizing.
# STRENGTHS - Single source of truth; future readers see grammar, not noise; flags can't drift between call sites.
# WEAKNESSES- Inline flag groups (?i:...) limit a flag to a sub-pattern -- handy, but extra cognitive load.
from __future__ import annotations
import re
from typing import Final

# 1) Verbose, commented patterns -- shipped with re.VERBOSE OR inline (?x).
ISO_DATETIME: Final = re.compile(
    r"""(?x)                          # verbose mode
    \A
    (?P<y>\d{4})-(?P<m>\d{2})-(?P<d>\d{2})    # date
    [T\s]                              # separator
    (?P<H>\d{2}):(?P<M>\d{2}):(?P<S>\d{2})    # time
    (?:\.(?P<frac>\d+))?               # optional fractional seconds
    (?P<tz>Z|[+-]\d{2}:?\d{2})?         # optional offset
    \Z
    """,
)

# 2) Inline flags scoped to a subpattern -- e.g., case-insensitive ONLY for a tag.
TAG_CI: Final = re.compile(r"<(?i:script|style)>")

# 3) Patterns as a typed catalog -- modules import the constant, not the string.
class Patterns:
    USER:      Final = re.compile(r"@(\w+)")
    HASHTAG:   Final = re.compile(r"#(\w+)")
    URL:       Final = re.compile(r"https?://\S+")
    UUID:      Final = re.compile(
        r"\A[\dA-Fa-f]{8}-[\dA-Fa-f]{4}-"
        r"[\dA-Fa-f]{4}-[\dA-Fa-f]{4}-"
        r"[\dA-Fa-f]{12}\Z"
    )

# 4) Test the patterns directly -- they're values, not strings.
def test_iso_datetime() -> None:
    m = ISO_DATETIME.match("2026-04-30T12:34:56.789Z")
    assert m is not None
    assert m["y"] == "2026" and m["tz"] == "Z"
    assert ISO_DATETIME.match("not a date") is None

# 5) Benchmark before assuming compile() helps:
#    For SHORT patterns reused < ~5 times in tight code, the 're' module's
#    LRU cache already amortizes parsing. compile() pays off when:
#      - the pattern is long / VERBOSE (parsing cost),
#      - you reuse it across many callers,
#      - you reuse the Pattern object (not the source string).

# Decision rule:
#   pattern reused more than once         -> re.compile + UPPER_CASE module constant
#   pattern is long / annotated           -> re.VERBOSE or (?x); ship comments inside the pattern
#   flag should apply to a SUB-pattern    -> inline group flag (?i:...) (Python 3.6+)
#   pattern parameterized at runtime      -> compile inside the helper, cache via functools.lru_cache
#   patterns scattered across files       -> centralize in patterns.py with type Final
#   regression-prone pattern              -> write tests against canonical strings; assert .groupindex
#
# Anti-pattern: 'p = re.compile(...)' inside a hot loop. Each iteration burns
# the parsing cost; the cache helps only if you stayed inside re.search()
# semantics. Compile module-globally, or memoize via lru_cache when the
# pattern is constructed dynamically.
```

## Decision Rule

```text
pattern reused more than once         -> re.compile + UPPER_CASE module constant
pattern is long / annotated           -> re.VERBOSE or (?x); ship comments inside the pattern
flag should apply to a SUB-pattern    -> inline group flag (?i:...) (Python 3.6+)
pattern parameterized at runtime      -> compile inside the helper, cache via functools.lru_cache
patterns scattered across files       -> centralize in patterns.py with type Final
regression-prone pattern              -> write tests against canonical strings; assert .groupindex
```

## Anti-Pattern

> [!warning] Anti-pattern
> 'p = re.compile(...)' inside a hot loop. Each iteration burns
> the parsing cost; the cache helps only if you stayed inside re.search()
> semantics. Compile module-globally, or memoize via lru_cache when the
> pattern is constructed dynamically.

## Tips

- Compile patterns at module level (outside functions) — compute once, reuse everywhere.
- The `re` module already caches recently-used patterns, so the speed win matters most when you have many distinct patterns or a long/VERBOSE pattern (parsing cost).
- Use descriptive names: DATE_PATTERN, EMAIL_PATTERN — much clearer than anonymous r"\d{4}...".
- Compiled patterns remember flags — case_insensitive_pattern doesn't require re.IGNORECASE on each call.
- For long patterns, use re.VERBOSE (or inline (?x)) and ship comments INSIDE the pattern; scope a flag to a sub-pattern with (?i:...). Centralize patterns in a typed Final catalog and write tests against canonical positive + negative strings.

## Common Mistake

> [!warning] Compiling the same pattern inside a loop or function every time it's called — defeats the purpose. Compile once at module level.

## Shorthand (Junior → Senior)

**Junior:**
```python
for email in emails:
    if re.search(r"[\w.+-]+@[\w.-]+\.\w{2,}", email):
        print(email)
```

**Senior:**
```python
pattern = re.compile(r"[\w.+-]+@[\w.-]+\.\w{2,}")
for email in emails:
    if pattern.search(email):
        print(email)
```

## See Also

- [[Sections/regex/regex-basics/re-match|re.match() vs re.search() vs re.fullmatch() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-findall|re.findall() and re.finditer() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-sub|re.sub() and re.subn() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-split|re.split() (Regular Expressions)]]
- [[Sections/regex/regex-basics/_Index|Regular Expressions → Basics & Matching]]
- [[Sections/regex/_Index|Regular Expressions index]]
- [[_Index|Vault index]]
