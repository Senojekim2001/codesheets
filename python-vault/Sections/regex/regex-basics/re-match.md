---
type: "entry"
domain: "python"
file: "regex"
section: "regex-basics"
id: "re-match"
title: "re.match() vs re.search() vs re.fullmatch()"
category: "Regex"
subtitle: "Match at start vs anywhere vs entire string"
signature_short: "re.match(pattern, string)  |  re.search(pattern, string)  |  re.fullmatch(pattern, string)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "re.match() vs re.search() vs re.fullmatch()"
  - "re-match"
tags:
  - "python"
  - "python/regex"
  - "python/regex/regex-basics"
  - "category/regex"
  - "tier/tiered"
---

# re.match() vs re.search() vs re.fullmatch()

> Match at start vs anywhere vs entire string

## Overview

re.match() checks only the beginning of the string. re.search() scans the entire string and returns the first match. re.fullmatch() requires the entire string to match the pattern. All three return a Match object (truthy) on success, None on failure. Use match() when you expect a prefix, search() for general "find this anywhere" queries, fullmatch() to validate entire strings.

## Signature

```python
re.match(pattern, string)  |  re.search(pattern, string)  |  re.fullmatch(pattern, string)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Pick match/search/fullmatch by where in the string the pattern lives.
# STRENGTHS - Three named functions; truthy on hit, None on miss -- fits an if-statement.
# WEAKNESSES- match() at the START surprises people who meant search(); the names invite the bug.
import re

text = "The quick brown fox"

# match: anchored to the START.
print(re.match(r"The", text))         # <Match ...>
print(re.match(r"quick", text))       # None

# search: anywhere in the string.
print(re.search(r"quick", text))      # <Match ...>

# fullmatch: must consume the entire string.
print(re.fullmatch(r"The .+ fox", text))   # <Match ...>
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - search() everywhere; fullmatch() for validators; walrus binds the Match for the next line.
# STRENGTHS - Reads top-to-bottom; one Match handle for span + groups + groupdict.
# WEAKNESSES- Always use raw strings (r"...") for patterns -- otherwise \d becomes \\d at write time.
import re

EMAIL = r"[\w.+-]+@[\w.-]+\.\w{2,}"

def is_valid_email(s: str) -> bool:
    # fullmatch: validator semantics -- ENTIRE string must satisfy the pattern.
    return re.fullmatch(EMAIL, s) is not None

# Extract first hit + position with the walrus operator (3.8+).
text = "Hi alice@example.com -- ping bob@x.io about the issue"
if m := re.search(EMAIL, text):
    print(m.group(), m.span())            # 'alice@example.com' (3, 21)

# Iterate hits with finditer (lazy) -- preferred over findall when you need positions.
for m in re.finditer(EMAIL, text):
    print(m.start(), m.group())

# match() makes sense for prefix-anchored protocols, e.g. log line keys:
if m := re.match(r"\[(?P<level>\w+)\]\s+", "[ERROR] disk full"):
    print(m.group("level"))               # ERROR
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Compile once, anchor explicitly, set a timeout via the 'regex' module when patterns come from outside.
# STRENGTHS - Predictable performance; failure modes are obvious; safe against ReDoS in untrusted patterns.
# WEAKNESSES- stdlib 're' has NO timeout. The 'regex' package adds timeout=, but you must depend on it.
from __future__ import annotations
import re
# 'regex' is a drop-in superset of 're' with timeouts and Unicode property classes.
# pip install regex; same API, plus regex.compile(p).search(s, timeout=0.1).

# 1) ALWAYS compile when reused. Anchors live IN the pattern, not in the call site.
EMAIL_RE       = re.compile(r"\A[\w.+-]+@[\w.-]+\.\w{2,}\Z", re.ASCII)
LOG_PREFIX_RE  = re.compile(r"\A\[(?P<level>DEBUG|INFO|WARN|ERROR|FATAL)\]\s+")
ISO_DATE_RE    = re.compile(r"\A(?P<y>\d{4})-(?P<m>\d{2})-(?P<d>\d{2})\Z")

def parse_log_line(line: str) -> tuple[str, str] | None:
    if not (m := LOG_PREFIX_RE.match(line)):    # match() is fine: pattern starts with \A
        return None
    return m["level"], line[m.end():]

# 2) Validators: prefer fullmatch + ASCII flag for protocol fields. Unicode \w
#    is huge (matches things like Khmer digits) -- almost never what you want
#    for an email/username/hostname.
def is_username(s: str) -> bool:
    return re.fullmatch(r"[a-z][a-z0-9_-]{2,31}", s, re.ASCII) is not None

# 3) Untrusted patterns: NEVER feed them to stdlib 're' without bounds.
#    Either reject them, or use 'regex' with a timeout.
def safe_search(pattern: str, text: str, *, timeout_s: float = 0.05) -> bool:
    try:
        import regex                            # external lib
        return regex.search(pattern, text, timeout=timeout_s) is not None
    except ImportError:                          # fall back: severely length-limit
        if len(pattern) > 200:
            raise ValueError("pattern too long without 'regex' library")
        return re.search(pattern, text) is not None

# Decision rule:
#   pattern reused                         -> re.compile at module scope, ALL CAPS name
#   anchor at start of string              -> \A and \Z (NOT ^ and $) when re.MULTILINE may apply
#   protocol fields (email/uuid/hostname)  -> fullmatch() + re.ASCII + ANCHORED pattern
#   parsing hot path                       -> single compiled pattern with named groups; one .match
#   pattern comes from a user / config     -> 'regex' library + timeout, or pre-vet with length+structure check
#   need a custom early exit               -> use finditer + break, NOT findall + slice
#
# Anti-pattern: 'if re.match(pattern, s)' as a validator. match() is anchored
# only at the START, not the END -- 'foo@bar.com<script>' passes. Use fullmatch
# (or anchor with \A...\Z) for validation; reserve match() for explicit
# prefix-stripping in parsers.
```

## Decision Rule

```text
pattern reused                         -> re.compile at module scope, ALL CAPS name
anchor at start of string              -> \A and \Z (NOT ^ and $) when re.MULTILINE may apply
protocol fields (email/uuid/hostname)  -> fullmatch() + re.ASCII + ANCHORED pattern
parsing hot path                       -> single compiled pattern with named groups; one .match
pattern comes from a user / config     -> 'regex' library + timeout, or pre-vet with length+structure check
need a custom early exit               -> use finditer + break, NOT findall + slice
```

## Anti-Pattern

> [!warning] Anti-pattern
> 'if re.match(pattern, s)' as a validator. match() is anchored
> only at the START, not the END -- 'foo@bar.com<script>' passes. Use fullmatch
> (or anchor with \A...\Z) for validation; reserve match() for explicit
> prefix-stripping in parsers.

## Tips

- match() is fastest for patterns expected at the start (e.g., file headers, config keys).
- search() is the workhorse for finding patterns anywhere — use this when unsure.
- fullmatch() is ideal for validation — does this entire input satisfy the pattern?
- All three return a Match object with .group(), .start(), .end() methods if successful.
- For protocol fields (email/uuid/hostname), use fullmatch + re.ASCII + \A...\Z anchors — Unicode \w accepts surprising things (Khmer digits etc.). For untrusted patterns, stdlib re has NO timeout; use the third-party `regex` module with timeout= or reject overlong patterns.

## Common Mistake

> [!warning] `if re.match(pattern, s)` as a validator — match() is anchored only at the START, not the END, so "foo@bar.com<script>" passes. Use fullmatch (or anchor with \A...\Z); reserve match() for explicit prefix-stripping in parsers.

## Shorthand (Junior → Senior)

**Junior:**
```python
import re
text = "Contact us at help@example.com"
found = False
for word in text.split():
    if word.startswith("help"):
        found = True
        break
if found:
    print("Found help email")
```

**Senior:**
```python
import re
if re.search(r"help\S+@\S+", text):
    print("Found help email")
```

## See Also

- [[Sections/regex/regex-basics/re-findall|re.findall() and re.finditer() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-sub|re.sub() and re.subn() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-split|re.split() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-compile|re.compile() (Regular Expressions)]]
- [[Sections/regex/regex-basics/_Index|Regular Expressions → Basics & Matching]]
- [[Sections/regex/_Index|Regular Expressions index]]
- [[_Index|Vault index]]
