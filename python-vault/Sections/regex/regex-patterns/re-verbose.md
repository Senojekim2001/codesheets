---
type: "entry"
domain: "python"
file: "regex"
section: "regex-patterns"
id: "re-verbose"
title: "re.VERBOSE for readable multi-line patterns"
category: "Regex"
subtitle: "Multi-line patterns with # comments for maintainability"
signature_short: "re.compile(pattern, re.VERBOSE)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "re.VERBOSE for readable multi-line patterns"
  - "re-verbose"
tags:
  - "python"
  - "python/regex"
  - "python/regex/regex-patterns"
  - "category/regex"
  - "tier/tiered"
---

# re.VERBOSE for readable multi-line patterns

> Multi-line patterns with # comments for maintainability

## Overview

re.VERBOSE (re.X) allows you to write regex patterns across multiple lines with comments. Whitespace is ignored unless escaped (or in character classes). This makes complex patterns much more readable and maintainable. Comments start with # and go to end of line. Essential for production patterns that others will need to understand and modify.

## Signature

```python
re.compile(pattern, re.VERBOSE)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - re.VERBOSE (or inline (?x)) lets you write multi-line patterns with comments.
# STRENGTHS - Reads top-to-bottom like a grammar; reviewers can comment on EACH line.
# WEAKNESSES- Whitespace inside the pattern is IGNORED -- if you need a literal space, use \s or [ ].
import re

EMAIL = re.compile(r"""
    \b
    [\w.+-]+        # local part
    @
    [\w.-]+         # domain
    \.
    [a-z]{2,}        # TLD (case-insensitive flag below)
    \b
""", re.VERBOSE | re.IGNORECASE)

print(EMAIL.search("Contact Alice@Example.COM").group())   # 'Alice@Example.COM'
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Verbose patterns at module scope; named groups; comments next to each piece; dataclass adapter for output.
# STRENGTHS - The pattern IS the documentation; renaming a part is a one-line edit; tests assert the pieces.
# WEAKNESSES- VERBOSE means '#' starts a comment -- to match a literal '#', escape it as '\#' or put it in [].
import re
from dataclasses import dataclass

DATETIME = re.compile(r"""
    (?P<y>\d{4}) - (?P<m>\d{2}) - (?P<d>\d{2})        # date
    (?:                                                # optional time
        [T\s]+
        (?P<H>\d{2}) : (?P<M>\d{2})
        (?: : (?P<S>\d{2}) )?                          # optional seconds
        (?P<tz>Z | [+-] \d{2} :? \d{2})?              # optional offset
    )?
""", re.VERBOSE)

@dataclass(frozen=True)
class WhenWhere:
    y: str; m: str; d: str
    H: str | None; M: str | None
    S: str | None; tz: str | None

def parse(s: str) -> WhenWhere | None:
    m = DATETIME.search(s)
    return WhenWhere(**m.groupdict()) if m else None

print(parse("Event: 2026-04-30T12:34:56+02:00"))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - VERBOSE for any pattern over ~30 chars; named groups; tests next to the pattern; one constant per regex.
# STRENGTHS - The team can review regex like code; CI runs unit tests on each pattern's positive AND negative corpus.
# WEAKNESSES- Long verbose patterns in YAML/TOML lose syntax highlighting; keep them in .py modules.
from __future__ import annotations
import re
from typing import Final

# 1) HTTP request line.
HTTP_REQUEST: Final = re.compile(r"""
    \A
    (?P<method>GET | POST | PUT | DELETE | PATCH | HEAD | OPTIONS)
    \s+
    (?P<path>/ \S*)
    \s+
    HTTP/ (?P<version>\d \. \d)
    \Z
""", re.VERBOSE)

# 2) Apache combined log format.
APACHE_LOG: Final = re.compile(r"""
    \A
    (?P<ip>\S+) \s -\s (?P<user>\S+) \s
    \[ (?P<ts>[^\]]+) \] \s
    " (?P<method>[A-Z]+) \s (?P<path>\S+) \s HTTP/[\d.]+ " \s
    (?P<status>\d{3}) \s (?P<size>\d+|-) \s
    " (?P<referer>[^"]*) " \s
    " (?P<ua>[^"]*) "
""", re.VERBOSE)

# 3) Python identifier (PEP 3131-aware via Unicode).
PY_IDENT: Final = re.compile(r"""
    \A
    [^\W\d]              # start: letter or underscore (NOT a digit, NOT non-word)
    \w*                    # rest:  word chars (Unicode)
    \Z
""", re.VERBOSE | re.UNICODE)

# 4) Tests live with the pattern -- run via pytest, fail at lint time.
def _test_apache_log() -> None:
    s = '127.0.0.1 - alice [30/Apr/2026:12:00:00 +0000] "GET /home HTTP/1.1" 200 532 "-" "curl/8"'
    m = APACHE_LOG.match(s); assert m is not None
    assert m["status"] == "200" and m["method"] == "GET"

def _test_http_request() -> None:
    assert HTTP_REQUEST.match("POST /api/v1 HTTP/1.1") is not None
    assert HTTP_REQUEST.match("CUSTOM /api HTTP/1.1") is None

# 5) Production hygiene checklist for verbose patterns:
#    - module-level Final constant, UPPER_CASE name
#    - \A ... \Z anchors when the input is "exactly one record"
#    - named groups, no positional indexing in callers
#    - inline comments per piece (verbose mode is the only place this is cheap)
#    - one test for the positive case, at least one for a tricky negative
#    - benchmark on a 1MB+ sample if it runs in a hot path

# Decision rule:
#   pattern fits 60 chars in source                  -> normal raw string is fine
#   pattern grows beyond ~60 chars OR uses 3+ groups -> re.VERBOSE; comment each part
#   need both verbose and case-insensitive            -> re.VERBOSE | re.IGNORECASE
#   include literal whitespace                        -> \s or [ ]; NEVER a bare space
#   include a literal '#'                             -> \# or [#]
#   readability inside an expression                  -> inline (?x:...) for that subpattern only
#   patterns shared across modules                    -> central patterns.py with type Final
#   regression tests                                  -> assert positive + negative cases per pattern
#
# Anti-pattern: a 200-character single-line regex in a module that nobody
# touches because "it works". The next bug fix takes a half-day to even read
# the pattern. re.VERBOSE costs nothing at runtime; pay it once.
```

## Decision Rule

```text
pattern fits 60 chars in source                  -> normal raw string is fine
pattern grows beyond ~60 chars OR uses 3+ groups -> re.VERBOSE; comment each part
need both verbose and case-insensitive            -> re.VERBOSE | re.IGNORECASE
include literal whitespace                        -> \s or [ ]; NEVER a bare space
include a literal '#'                             -> \# or [#]
readability inside an expression                  -> inline (?x:...) for that subpattern only
patterns shared across modules                    -> central patterns.py with type Final
regression tests                                  -> assert positive + negative cases per pattern
```

## Anti-Pattern

> [!warning] Anti-pattern
> a 200-character single-line regex in a module that nobody
> touches because "it works". The next bug fix takes a half-day to even read
> the pattern. re.VERBOSE costs nothing at runtime; pay it once.

## Tips

- re.VERBOSE turns whitespace into "invisible" — it's ignored in the pattern. Use literal spaces inside [...] or \s to match actual spaces.
- Comments with # are powerful — explain what each part of the regex does. Future you will appreciate it.
- Combine re.VERBOSE with re.IGNORECASE and other flags using |: re.VERBOSE | re.IGNORECASE.
- Test verbose patterns with re.compile() at module level, not inline — much more readable.
- Type each pattern as `Final` in a central patterns.py and ship at least one positive + one tricky negative test per pattern; CI catches regressions before they reach production.

## Common Mistake

> [!warning] Forgetting that spaces in VERBOSE patterns are ignored unless in character classes — "a b" matches "ab", not "a b". Use \s or spaces inside [...] if you need literal spaces.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Complex pattern on one line — hard to read
pattern = r"[\w.+-]+@[\w.-]+\.\w{2,}|\d{4}-\d{2}-\d{2}|https?://[\w.-]+"
```

**Senior:**
```python
# Same pattern with VERBOSE — self-documenting
pattern = re.compile(r"""
    [\w.+-]+@[\w.-]+\.\w{2,}  # email
    |                              # OR
    \d{4}-\d{2}-\d{2}           # ISO date
    |                              # OR
    https?://[\w.-]+              # URL
""", re.VERBOSE)
```

## See Also

- [[Sections/regex/regex-basics/re-match|re.match() vs re.search() vs re.fullmatch() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-findall|re.findall() and re.finditer() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-sub|re.sub() and re.subn() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-split|re.split() (Regular Expressions)]]
- [[Sections/regex/regex-patterns/_Index|Regular Expressions → Patterns & Flags]]
- [[Sections/regex/_Index|Regular Expressions index]]
- [[_Index|Vault index]]
