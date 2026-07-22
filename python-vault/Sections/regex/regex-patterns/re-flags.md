---
type: "entry"
domain: "python"
file: "regex"
section: "regex-patterns"
id: "re-flags"
title: "re.IGNORECASE, re.MULTILINE, re.DOTALL, re.VERBOSE"
category: "Regex"
subtitle: "Case-insensitive, multiline mode, dot matches newlines, verbose/comments"
signature_short: "re.search(pattern, string, flags=re.IGNORECASE)  |  re.IGNORECASE | re.MULTILINE"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "re.IGNORECASE, re.MULTILINE, re.DOTALL, re.VERBOSE"
  - "re-flags"
tags:
  - "python"
  - "python/regex"
  - "python/regex/regex-patterns"
  - "category/regex"
  - "tier/tiered"
---

# re.IGNORECASE, re.MULTILINE, re.DOTALL, re.VERBOSE

> Case-insensitive, multiline mode, dot matches newlines, verbose/comments

## Overview

re.IGNORECASE (re.I) — case-insensitive matching. re.MULTILINE (re.M) — ^ and $ match line boundaries, not just string start/end. re.DOTALL (re.S) — . matches newlines too. re.VERBOSE (re.X) — allow whitespace and # comments in pattern for readability. Flags can be combined with |. Also specify inline: (?i) for IGNORECASE, (?m) for MULTILINE, (?s) for DOTALL, (?x) for VERBOSE.

## Signature

```python
re.search(pattern, string, flags=re.IGNORECASE)  |  re.IGNORECASE | re.MULTILINE
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Pass flags as the last arg; combine with |.
# STRENGTHS - One flag turns "Hello"/"HELLO"/"hello" into one match; another lets ^/$ match line edges.
# WEAKNESSES- re.MULTILINE only changes ^/$; it does NOT make '.' match newlines (that's re.DOTALL).
import re

text = "Hello HELLO hello"
print(re.findall(r"hello", text, re.IGNORECASE))   # ['Hello','HELLO','hello']

multi = "start a\nstart b\nend"
print(re.findall(r"^start", multi, re.MULTILINE))  # ['start', 'start']

print(re.search(r"hello.world", "hello\nworld"))             # None
print(re.search(r"hello.world", "hello\nworld", re.DOTALL))  # <Match>
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Bake flags into the compiled pattern; combine with |; switch flag scope inline with (?i:...) (3.6+).
# STRENGTHS - Flags travel with the pattern; per-subpattern scope avoids polluting the rest.
# WEAKNESSES- re.LOCALE (re.L) is bytes-only and discouraged; re.ASCII narrows \w/\d/\b to ASCII.
import re

# Compile with combined flags.
EMAIL = re.compile(
    r"\b[\w.+-]+@[\w.-]+\.\w{2,}\b",
    re.IGNORECASE | re.ASCII,                    # ASCII keeps \w out of full Unicode
)

# Per-subpattern flag with (?flag:...).
TAG_CI = re.compile(r"<(?i:script|style)\b[^>]*>")
print(TAG_CI.search("<SCRIPT>"))                  # match
print(TAG_CI.search("<DIV>"))                     # None

# VERBOSE for legibility.
DATETIME = re.compile(r"""
    \A
    (?P<y>\d{4}) - (?P<m>\d{2}) - (?P<d>\d{2})
    [T\s]
    (?P<H>\d{2}) : (?P<M>\d{2}) : (?P<S>\d{2})
    \Z
""", re.VERBOSE)

# Inline-on / inline-off (legacy syntax (?-i)) -- prefer scoped (?i:...).
print(re.search(r"(?i)foo(?-i:Bar)", "fooBar"))   # match
print(re.search(r"(?i)foo(?-i:Bar)", "FOOBAR"))   # None
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - re.ASCII for protocol fields; re.MULTILINE only when patterns truly span lines; re.DEBUG to inspect compiled bytecode; never rely on re.LOCALE.
# STRENGTHS - Predictable Unicode behavior; tight control over what \w/\d/\b mean; debuggable patterns.
# WEAKNESSES- re.UNICODE is the default in Py3 -- if you forget re.ASCII for emails/usernames you accept Khmer digits as \d.
from __future__ import annotations
import re

# 1) Protocol fields: re.ASCII pins \w/\d/\b to ASCII semantics.
USERNAME = re.compile(r"\A[a-z][a-z0-9_]{2,31}\Z", re.ASCII)
ID_TOKEN = re.compile(r"\A[\w-]{16,64}\Z", re.ASCII)

# 2) Multi-line patterns: \A and \Z stay anchored to the WHOLE string even
#    under re.MULTILINE; only ^ and $ change to per-line semantics.
HEADERS = re.compile(r"^(?P<key>[\w-]+):\s*(?P<value>.+?)\s*$", re.MULTILINE)
def parse_headers(blob: str) -> dict[str, str]:
    return {m["key"]: m["value"] for m in HEADERS.finditer(blob)}

# 3) DOTALL for "blob between markers" -- but prefer [\s\S]+? if mixing with others.
SECTION = re.compile(r"^---\s*$(?P<body>.*?)^---\s*$",
                     re.MULTILINE | re.DOTALL)

# 4) re.DEBUG prints the parsed AST; useful when a pattern misbehaves.
def explain(pattern: str, flags: int = 0) -> None:
    re.compile(pattern, flags | re.DEBUG)
# explain(r"(?P<y>\d{4})-(\d{2})")  -- shows literal/group nodes, anchors, etc.

# 5) Flag combos worth memorizing:
#    Validator:        re.ASCII (and never re.IGNORECASE alone)
#    Header parser:    re.MULTILINE
#    Multi-line block: re.MULTILINE | re.DOTALL  (^/$ per line, '.' over newlines)
#    Long pattern:     re.VERBOSE  (or inline (?x))
#    Hot CI debug:     re.DEBUG    (one-shot, NEVER ship)
#    Bytes pattern:    plain bytes literals; ASCII-only \w by default

# 6) Common pitfalls and their fix:
#    "ignorecase doesn't ignore Turkish I"   -> re.IGNORECASE is locale-naive;
#                                                use casefold() on input then ASCII regex
#    "MULTILINE breaks my anchored validator" -> use \A...\Z (always whole-string)
#                                                instead of ^...$
#    "DOTALL eats too much"                   -> negated class [^X]+ is usually
#                                                what you actually wanted

# Decision rule:
#   ASCII-only protocol fields              -> re.ASCII + \A...\Z
#   user-visible text                       -> default Unicode; consider casefold() before matching
#   per-line ^/$                            -> re.MULTILINE
#   . crosses newlines                      -> re.DOTALL  OR rewrite to [\s\S]+?
#   long/verbose pattern                    -> re.VERBOSE (with comments)
#   need a flag only on a sub-pattern       -> (?flag:...) inline scoped
#   debug a parse                           -> re.DEBUG ONCE, then remove
#   bytes vs str                            -> the pattern type must match the input type
#
# Anti-pattern: 'flags=re.IGNORECASE | re.MULTILINE' on every regex out of
# habit. Each flag changes semantics in ways that bite: \w widens, ^/$
# moves, '.' grows. Reach for the SPECIFIC flag the pattern needs and
# document why.
```

## Decision Rule

```text
ASCII-only protocol fields              -> re.ASCII + \A...\Z
user-visible text                       -> default Unicode; consider casefold() before matching
per-line ^/$                            -> re.MULTILINE
. crosses newlines                      -> re.DOTALL  OR rewrite to [\s\S]+?
long/verbose pattern                    -> re.VERBOSE (with comments)
need a flag only on a sub-pattern       -> (?flag:...) inline scoped
debug a parse                           -> re.DEBUG ONCE, then remove
bytes vs str                            -> the pattern type must match the input type
```

## Anti-Pattern

> [!warning] Anti-pattern
> 'flags=re.IGNORECASE | re.MULTILINE' on every regex out of
> habit. Each flag changes semantics in ways that bite: \w widens, ^/$
> moves, '.' grows. Reach for the SPECIFIC flag the pattern needs and
> document why.

## Tips

- re.VERBOSE lets you comment and format regex patterns across multiple lines — essential for complex patterns.
- Inline flags (?i) are useful when you want to compile a pattern once with mixed case handling; (?i:...) scopes the flag to a sub-pattern only.
- re.MULTILINE changes ^ and $ behavior — ^ matches after \n, $ matches before \n. \A and \Z stay anchored to the WHOLE string regardless, so prefer them for validators.
- re.DOTALL makes . match \n too — useful for matching across newlines in multi-line strings.
- For protocol fields (email, username, hostname, UUID), pass re.ASCII — default Unicode \w/\d/\b accept things like Khmer digits as \d, which is almost never what you want.

## Common Mistake

> [!warning] `flags=re.IGNORECASE | re.MULTILINE` on every regex out of habit — each flag changes semantics in ways that bite (\w widens, ^/$ moves, . grows). Reach for the SPECIFIC flag the pattern needs and document why. Also: re.MULTILINE doesn't make . match newlines — that's re.DOTALL.

## Shorthand (Junior → Senior)

**Junior:**
```python
import re
text = "Hello and HELLO"
result = []
for word in text.split():
    if word.lower() == "hello":
        result.append(word)
```

**Senior:**
```python
import re
result = re.findall(r"hello", text, re.IGNORECASE)
```

## See Also

- [[Sections/regex/regex-basics/re-match|re.match() vs re.search() vs re.fullmatch() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-findall|re.findall() and re.finditer() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-sub|re.sub() and re.subn() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-split|re.split() (Regular Expressions)]]
- [[Sections/regex/regex-patterns/_Index|Regular Expressions → Patterns & Flags]]
- [[Sections/regex/_Index|Regular Expressions index]]
- [[_Index|Vault index]]
