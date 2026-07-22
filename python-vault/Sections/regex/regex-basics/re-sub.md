---
type: "entry"
domain: "python"
file: "regex"
section: "regex-basics"
id: "re-sub"
title: "re.sub() and re.subn()"
category: "Regex"
subtitle: "Substitution with fixed strings, backreferences, or dynamic replacements"
signature_short: "re.sub(pattern, repl, string, count=0, flags=0)  |  re.subn(...)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "re.sub() and re.subn()"
  - "re-sub"
tags:
  - "python"
  - "python/regex"
  - "python/regex/regex-basics"
  - "category/regex"
  - "tier/tiered"
---

# re.sub() and re.subn()

> Substitution with fixed strings, backreferences, or dynamic replacements

## Overview

re.sub() replaces all matches (or first count matches) and returns the new string. re.subn() is identical but returns a tuple (new_string, num_replacements). The replacement can be a literal string (with backreferences \1, \g<name>), a function, or a lambda. Functions receive a Match object and must return a string. Use sub() for simple replacements; use a callable for complex logic.

## Signature

```python
re.sub(pattern, repl, string, count=0, flags=0)  |  re.subn(...)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - re.sub(pattern, replacement, text); replacement is a string (with \1 backrefs) or a function.
# STRENGTHS - One-line transforms; replaces all matches by default.
# WEAKNESSES- Without count=, replaces ALL hits -- easy to over-rewrite.
import re

# Plain replace.
print(re.sub(r"Hello", "Hi", "Hello World, Hello Python"))
# 'Hi World, Hi Python'

# Cap the number of replacements:
print(re.sub(r"Hello", "Hi", "Hello Hello Hello", count=1))
# 'Hi Hello Hello'

# Callable replacement gets the Match object:
print(re.sub(r"\d+", lambda m: f"[{int(m.group()):03d}]", "a 7 b 42"))
# 'a [007] b [042]'
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Backreferences in the replacement (\1, \g<name>); subn for "did anything change?"; callable for non-trivial transforms.
# STRENGTHS - Most string-rewriting tasks fit one of these three forms.
# WEAKNESSES- Replacement-string syntax (\1) is NOT regex syntax -- common confusion when copy-pasting from search patterns.
import re

# Numbered backref in replacement: swap "Last, First" -> "First Last".
print(re.sub(r"(\w+),\s+(\w+)", r"\2 \1", "Smith, John; Doe, Jane"))
# 'John Smith; Jane Doe'

# Named groups: clearer for non-trivial templates.
text = "Name: Alice, Age: 30"
print(re.sub(r"Name: (?P<n>\w+), Age: (?P<a>\d+)",
             r"\g<a>-year-old \g<n>", text))
# '30-year-old Alice'

# subn returns (new_string, count) -- decide whether to write back.
new, n = re.subn(r"\bcolour\b", "color", "favourite colour, neutral colour")
if n: print(f"changed {n}: {new}")

# Callable: when the replacement depends on the matched text.
def title_acronym(m: re.Match) -> str:
    word = m.group()
    return word.upper() if len(word) <= 3 else word.title()

print(re.sub(r"\b\w+\b", title_acronym, "the api gw routes http requests"))
# 'THE API GW Routes HTTP Requests'
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Compile once; callable replacement is the safe form; escape user-provided replacements; chain with subn for idempotence checks.
# STRENGTHS - Predictable rewrites, no accidental regex semantics in replacement strings, chain-safe pipelines.
# WEAKNESSES- str.replace() is faster for fixed strings; reach for re.sub only when the pattern actually varies.
from __future__ import annotations
import re

# 1) Compile + callable -- the production form.
WORD = re.compile(r"\b(\w+)\b")

def lower_long_words(m: re.Match[str]) -> str:
    w = m.group(1)
    return w.lower() if len(w) > 6 else w

print(WORD.sub(lower_long_words, "Architecture beats Inheritance every Time"))
# 'architecture beats inheritance every Time'

# 2) re.escape is mandatory when ANY part of the pattern OR replacement comes
#    from user data. Replacement strings interpret \1, \g<name>, etc.
def safe_replace_literal(text: str, needle: str, replacement: str) -> str:
    return re.sub(re.escape(needle), lambda _: replacement, text)
# Without the lambda you'd need re.sub(escaped, replacement.replace('\\', '\\\\'), text).
# The callable side-steps replacement-string parsing entirely.

# 3) Idempotence sanity: re-running the rewrite should be a no-op. Use subn:
def normalize_dashes(text: str) -> str:
    out, n1 = re.subn(r"\s*--\s*", " - ", text)
    out, n2 = re.subn(r"\s+", " ", out)
    if re.search(r"\s{2,}|\s--\s", out):       # invariant
        raise AssertionError("normalization not idempotent")
    return out

# 4) re.sub on huge text -- prefer streaming via finditer + write to a buffer
#    when the rewrite is expensive (e.g., calls into another service per match).
def rewrite_streaming(pat: re.Pattern[str], s: str, fn) -> str:
    parts: list[str] = []
    cur = 0
    for m in pat.finditer(s):
        parts.append(s[cur:m.start()])
        parts.append(fn(m))
        cur = m.end()
    parts.append(s[cur:])
    return "".join(parts)
# Equivalent to pat.sub(fn, s) but you can early-stop, log, or batch.

# Decision rule:
#   fixed needle, fixed replacement     -> str.replace()  (faster, no regex needed)
#   regex needle, FIXED replacement     -> re.sub(pat, "lit", s)  (escape if user-supplied)
#   regex needle, DYNAMIC replacement   -> re.sub(pat, callable, s)
#   want count of changes               -> re.subn(...)
#   user-supplied replacement string    -> callable form, NEVER raw r"..." with user data
#   huge text, side-effects per match   -> finditer + manual buffer; can early-exit
#   need atomic 'replace OR fail'       -> subn + assert n == expected
#
# Anti-pattern: building the replacement string with f-strings that include
# user input. Backslashes and \g<name> in user data become regex directives.
# Always pass a callable when ANY part of the replacement is user-controlled.
```

## Decision Rule

```text
fixed needle, fixed replacement     -> str.replace()  (faster, no regex needed)
regex needle, FIXED replacement     -> re.sub(pat, "lit", s)  (escape if user-supplied)
regex needle, DYNAMIC replacement   -> re.sub(pat, callable, s)
want count of changes               -> re.subn(...)
user-supplied replacement string    -> callable form, NEVER raw r"..." with user data
huge text, side-effects per match   -> finditer + manual buffer; can early-exit
need atomic 'replace OR fail'       -> subn + assert n == expected
```

## Anti-Pattern

> [!warning] Anti-pattern
> building the replacement string with f-strings that include
> user input. Backslashes and \g<name> in user data become regex directives.
> Always pass a callable when ANY part of the replacement is user-controlled.

## Tips

- Use raw strings (r"...") to avoid escaping backslashes — r"\d" is cleaner than "\\d".
- Backreferences: \1, \2... for positional groups; \g<name> for named groups.
- Callable replacement: def repl(m): return ... — you get the full Match object with position, groups, etc.
- re.subn() is useful when you need to know how many replacements were made (and for idempotence checks).
- For fixed needle + fixed replacement, str.replace() is faster — only reach for re.sub when the pattern actually varies. ALWAYS use a callable when any part of the replacement comes from user data; raw r"..." replacements interpret \1, \g<name>, etc. and can be hijacked.

## Common Mistake

> [!warning] Building the replacement string with f-strings that include user input — backslashes and \g<name> in user data become regex directives. Pass a callable when ANY part of the replacement is user-controlled. Also: forgetting raw strings — re.sub("\d", ...) treats \d as literal backslash-d.

## Shorthand (Junior → Senior)

**Junior:**
```python
import re
text = text.replace("colour", "color")
text = text.replace("flavour", "flavor")
text = text.replace("neighbour", "neighbor")
```

**Senior:**
```python
text = re.sub(r"(\w+)ou(r)", r"\1o\2", text)
```

## See Also

- [[Sections/regex/regex-basics/re-match|re.match() vs re.search() vs re.fullmatch() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-findall|re.findall() and re.finditer() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-split|re.split() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-compile|re.compile() (Regular Expressions)]]
- [[Sections/regex/regex-basics/_Index|Regular Expressions → Basics & Matching]]
- [[Sections/regex/_Index|Regular Expressions index]]
- [[_Index|Vault index]]
