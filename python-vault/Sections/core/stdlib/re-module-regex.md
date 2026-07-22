---
type: "entry"
domain: "python"
file: "core"
section: "stdlib"
id: "re-module-regex"
title: "re Module (Regular Expressions)"
category: "Text Processing"
subtitle: "Search, split, and replace text with patterns"
signature_short: "import re
re.search(pattern, string)
re.match(pattern, string)
re.findall(pattern, string)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "re Module (Regular Expressions)"
  - "re-module-regex"
tags:
  - "python"
  - "python/core"
  - "python/core/stdlib"
  - "category/text-processing"
  - "tier/tiered"
---

# re Module (Regular Expressions)

> Search, split, and replace text with patterns

## Overview

re module provides regex functionality for pattern matching, extraction, substitution, and splitting. Compile patterns for reuse, use groups for extraction, leverage named groups for clarity.

## Signature

```python
import re
re.search(pattern, string)
re.match(pattern, string)
re.findall(pattern, string)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - search/match/findall/sub/split — the five regex verbs. Always raw strings r"...".
# STRENGTHS - Compact pattern matching, replacement, splitting.
# WEAKNESSES- For the deep dive — flags, atomic groups, ReDoS — see regex.js.
import re

if re.search(r"fox", "the quick brown fox"):
    print("found")

re.findall(r"\d+", "42 apples, 17 oranges")    # ['42', '17']
re.sub(r"\s+", " ", "many   spaces")            # 'many spaces'
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Compile reusable patterns; named groups via (?P<name>...); flags inline (?i) or as args.
# STRENGTHS - Self-documenting patterns; faster on hot paths; flags travel with the pattern.
# WEAKNESSES- See regex.js for full flag rules, lookbehind constraints, and named-group caveats.
import re

EMAIL = re.compile(r"(?P<user>[\w.+-]+)@(?P<domain>[\w.-]+)")
m = EMAIL.search("Contact: alice@example.com")
print(m["user"], m["domain"])                    # alice example.com

# Case-insensitive match.
re.findall(r"hello", "HELLO hello Hello", re.IGNORECASE)   # ['HELLO','hello','Hello']

# fullmatch for validators.
def is_phone(s: str) -> bool:
    return re.fullmatch(r"\d{3}-\d{3}-\d{4}", s) is not None
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - For ReDoS defenses, atomic groups, the regex library, named-group composition, and the full decision rule, see regex.js.
# STRENGTHS - regex.js covers ASCII vs Unicode flags, multiline anchors, validator vs extractor patterns.
# WEAKNESSES- Patterns from untrusted input need timeouts (the 'regex' module) or strict pre-validation.
import re

# Quick reference — full deep dive lives in regex.js senior tiers:
#   anchored validator        -> re.fullmatch(r"\A...\Z", s) with re.ASCII for protocol fields
#   compile once, reuse       -> module-level re.compile(...) with descriptive UPPER_CASE name
#   "negative lookbehind"     -> (?<!\$)\d+ — narrow what NOT to match
#   "between two delimiters"  -> [^X]+ instead of .+? to defuse backtracking
#   user-supplied pattern     -> 'regex' library with timeout=, OR reject

# Decision rule:
#   reused pattern in hot path                 -> re.compile + UPPER_CASE module constant
#   validator (whole string must match)        -> re.fullmatch with re.ASCII for protocol fields
#   extractor (data out of text)               -> re.finditer + named groups + dataclass
#   replacement with computed text             -> re.sub(pattern, callable, s) — NOT raw r"\1" with untrusted input
#   simple split on multi-char delimiter       -> re.split (not str.split)
#   parsing JSON / HTML / SQL / email          -> NOT regex; use a real parser (json, lxml, sqlglot, email)
#   user-supplied pattern                      -> 'regex' library with timeout= or reject
#   case-insensitive across alphabets          -> re.IGNORECASE | re.UNICODE; or s.casefold()
#
# Anti-pattern: using re.match where re.fullmatch is meant.
#   re.match anchors only at the START — `re.match(r"\d{3}", "1234abc")` succeeds because the
#   prefix matches. For "validate the entire input is digits", use re.fullmatch (or anchor
#   with \A...\Z). The bug is silent: validators pass on partial-match inputs and let bad
#   data through. Even simpler: prefer re.fullmatch for ALL validators so anchoring is
#   explicit and obvious. (See regex.js for the full discussion.)
```

## Decision Rule

```text
reused pattern in hot path                 -> re.compile + UPPER_CASE module constant
validator (whole string must match)        -> re.fullmatch with re.ASCII for protocol fields
extractor (data out of text)               -> re.finditer + named groups + dataclass
replacement with computed text             -> re.sub(pattern, callable, s) — NOT raw r"\1" with untrusted input
simple split on multi-char delimiter       -> re.split (not str.split)
parsing JSON / HTML / SQL / email          -> NOT regex; use a real parser (json, lxml, sqlglot, email)
user-supplied pattern                      -> 'regex' library with timeout= or reject
case-insensitive across alphabets          -> re.IGNORECASE | re.UNICODE; or s.casefold()
```

## Anti-Pattern

> [!warning] Anti-pattern
> using re.match where re.fullmatch is meant.
>   re.match anchors only at the START — `re.match(r"\d{3}", "1234abc")` succeeds because the
>   prefix matches. For "validate the entire input is digits", use re.fullmatch (or anchor
>   with \A...\Z). The bug is silent: validators pass on partial-match inputs and let bad
>   data through. Even simpler: prefer re.fullmatch for ALL validators so anchoring is
>   explicit and obvious. (See regex.js for the full discussion.)

## Tips

- Compile complex patterns once: pattern = re.compile(...), then reuse
- Use raw strings: r'...\d...' not '...\\d...' (backslash escaping cleaner)
- Named groups (?P<name>...) make patterns self-documenting
- Test regex: use regex101.com or regexpal.com before using in code

## Common Mistake

> [!warning] Not using raw strings (r'...') — backslashes need escaping in regular strings. Always use r'...' for regex patterns.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = []
for x in items:
    if x > 0:
        result.append(x)
```

**Senior:**
```python
result = [x for x in items if x > 0]
```

## See Also

- [[Sections/core/stdlib/_Index|Core Syntax & Built-ins → Standard Library]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]
