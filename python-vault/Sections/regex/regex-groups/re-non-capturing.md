---
type: "entry"
domain: "python"
file: "regex"
section: "regex-groups"
id: "re-non-capturing"
title: "Non-capturing groups, lookahead, lookbehind"
category: "Regex"
subtitle: "(?:...) non-capturing, (?=...) positive lookahead, (?!...) negative lookahead, (?<=...) lookbehind"
signature_short: "(?:...) non-capturing  |  (?=foo) lookahead  |  (?<=foo) lookbehind (fixed width)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Non-capturing groups, lookahead, lookbehind"
  - "re-non-capturing"
tags:
  - "python"
  - "python/regex"
  - "python/regex/regex-groups"
  - "category/regex"
  - "tier/tiered"
---

# Non-capturing groups, lookahead, lookbehind

> (?:...) non-capturing, (?=...) positive lookahead, (?!...) negative lookahead, (?<=...) lookbehind

## Overview

Non-capturing groups (?:...) group patterns for alternation or quantifiers without creating a numbered group. Lookahead (?=...) and (?!...) assert that what follows matches/doesn't match, without consuming it. Lookbehind (?<=...) and (?<!...) assert what precedes matches/doesn't match. Lookbehind is fixed-width in Python. These are zero-width assertions — useful for conditional matching and complex patterns.

## Signature

```python
(?:...) non-capturing  |  (?=foo) lookahead  |  (?<=foo) lookbehind (fixed width)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - (?:...) groups WITHOUT capturing; (?=...) and (?!...) assert the next chars without consuming.
# STRENGTHS - Group for alternation/quantifiers; assert context without including it in the match.
# WEAKNESSES- Look-arounds confuse readers -- a comment on the FIRST one in a file pays for itself.
import re

# Non-capturing group: alternation without polluting m.groups().
m = re.search(r"(?:hello|hi)\s+(world|universe)", "hi universe")
print(m.groups())              # ('universe',) -- only the second group counts

# Positive lookahead: 'foo' immediately followed by 'bar', without consuming 'bar'.
print(re.search(r"foo(?=bar)", "foobar").group())   # 'foo'
print(re.search(r"foo(?=bar)", "foobaz"))            # None
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Lookbehind for "preceded by", lookahead for "followed by"; combine for surgical extraction.
# STRENGTHS - Extract values without their delimiters; keeps the matched text exactly what you want.
# WEAKNESSES- stdlib lookbehind is FIXED-WIDTH; (?<=ab|c) is invalid because the alternatives differ in length.
import re

# Money values without the $ sign.
print(re.findall(r"(?<=\$)\d+(?:\.\d{2})?", "$100, $42.50, then 7 (free)"))
# ['100', '42.50']

# Numbers that are NOT negative (negative lookbehind for '-').
print(re.findall(r"(?<![-\d])\d+", "score: 5, change: -3, level: 12"))
# ['5', '12']

# CSS class extraction -- the period isn't part of the class name.
css = ".btn.primary {color:red} .btn.secondary{}"
print(re.findall(r"(?<=\.)[a-zA-Z][\w-]*", css))
# ['btn', 'primary', 'btn', 'secondary']

# Combined: words that are NOT 'the' (case-insensitive).
print(re.findall(r"\b(?!the\b)\w+", "the cat and The dog", flags=re.IGNORECASE))
# ['cat', 'and', 'dog']
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Variable-width lookbehind via the 'regex' library; atomic groups / possessive quantifiers to defuse catastrophic backtracking; never construct lookarounds from user input.
# STRENGTHS - Express constraints that stdlib can't; convert exponential patterns to linear; safer parsing of untrusted text.
# WEAKNESSES- Atomic groups + possessive quantifiers are 'regex' library only (PCRE-style); patterns become non-portable to JS / Go regex.
from __future__ import annotations
import re

# 1) ReDoS-defusing rewrite: nested quantifiers blow up.
#    Bad:  r"(a+)+$"           -> exponential on "aaaaaab"
#    Good: r"(?>a+)$"          -> atomic group; engine never re-enters the alternative
#    Or:   r"(a++)+$"          -> possessive; same idea, different syntax
#  Stdlib 're' supports NEITHER. Use the 'regex' module:
#  import regex
#  regex.search(r"(?>a+)$", text, timeout=0.05)

# 2) Variable-width lookbehind in 'regex' (still not in stdlib):
#  regex.search(r"(?<=https?://)[^/]+", "see http://x and https://example.org")

# 3) Anchor-based extraction without consuming:
#    "URLs that come after the word 'see'":
def urls_after_see(text: str) -> list[str]:
    # \K resets the match start; supported in 'regex' only.
    import regex
    return regex.findall(r"\bsee\s+\K\bhttps?://\S+", text)

# 4) "Followed by AND not followed by" -- chain lookarounds:
#    'class=' followed by a value but NOT immediately by 'private'.
NOT_PRIVATE = re.compile(r'class="(?=\w)(?!private\b)([^"]+)"')

# 5) Lookbehind for delimiter trimming -- find dollar amounts but emit just the digits.
#    Stdlib version (fixed-width):
def dollar_amounts(text: str) -> list[str]:
    return re.findall(r"(?<=\$)\d+(?:\.\d{2})?", text)

# 6) Word-boundary tightening: \b doesn't see Unicode quotes.
#    re.compile(r"(?<!\w)foo(?!\w)") replaces \bfoo\b when text contains
#    custom punctuation that \w doesn't classify as a non-word char.

# Decision rule:
#   group without capture                      -> (?:...)
#   "X right after Y" without taking Y          -> (?<=Y)X
#   "X NOT preceded by Y"                      -> (?<!Y)X
#   "X right before Y"                         -> X(?=Y)
#   "X NOT followed by Y"                      -> X(?!Y)
#   variable-width lookbehind                  -> 'regex' module (stdlib forbids)
#   exponential pattern danger                  -> atomic group (?>...) / possessive (?+, ?+, ?+) -- 'regex' module
#   'reset' the match start (skip a prefix)    -> \K, 'regex' module
#   pattern compiled from user input           -> reject lookarounds, OR use 'regex' with timeout=
#
# Anti-pattern: 'wrap any nested quantifier in (?:...)'. Non-capturing doesn't
# fix backtracking. r"(?:a+)+$" is just as exponential as r"(a+)+$". Atomic
# groups, possessive quantifiers, or rewriting the pattern are the real fixes.
```

## Decision Rule

```text
group without capture                      -> (?:...)
"X right after Y" without taking Y          -> (?<=Y)X
"X NOT preceded by Y"                      -> (?<!Y)X
"X right before Y"                         -> X(?=Y)
"X NOT followed by Y"                      -> X(?!Y)
variable-width lookbehind                  -> 'regex' module (stdlib forbids)
exponential pattern danger                  -> atomic group (?>...) / possessive (?+, ?+, ?+) -- 'regex' module
'reset' the match start (skip a prefix)    -> \K, 'regex' module
pattern compiled from user input           -> reject lookarounds, OR use 'regex' with timeout=
```

## Anti-Pattern

> [!warning] Anti-pattern
> 'wrap any nested quantifier in (?:...)'. Non-capturing doesn't
> fix backtracking. r"(?:a+)+$" is just as exponential as r"(a+)+$". Atomic
> groups, possessive quantifiers, or rewriting the pattern are the real fixes.

## Tips

- Non-capturing groups (?:...) reduce group count — useful when you want alternation but don't need to extract it.
- Lookahead/lookbehind don't consume characters — great for checking conditions without shifting the match position.
- Lookbehind must be fixed-width in Python (no quantifiers) — (?<=[0-9]{1,3}) fails, use (?<=[0-9]{3}). The third-party `regex` module supports variable-width lookbehind plus \K for resetting the match start.
- Negative lookahead (?!...) is powerful for exclusion patterns — find words not containing a substring.

## Common Mistake

> [!warning] Wrapping a nested quantifier in (?:...) and thinking you've "fixed" backtracking — non-capturing doesn't change anything. r"(?:a+)+$" is just as exponential as r"(a+)+$". The real fix is atomic groups (?>...) or possessive quantifiers via the `regex` module, or rewriting the pattern flat. Never compile lookaround patterns from user input without a timeout.

## Shorthand (Junior → Senior)

**Junior:**
```python
import re
text = "The cat and the dog"
words = re.findall(r"\w+", text)
result = [w for w in words if w.lower() != "the"]
```

**Senior:**
```python
import re
result = re.findall(r"\b(?!the\b)\w+", text, re.IGNORECASE)
```

## See Also

- [[Sections/regex/regex-basics/re-match|re.match() vs re.search() vs re.fullmatch() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-findall|re.findall() and re.finditer() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-sub|re.sub() and re.subn() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-split|re.split() (Regular Expressions)]]
- [[Sections/regex/regex-groups/_Index|Regular Expressions → Groups & Captures]]
- [[Sections/regex/_Index|Regular Expressions index]]
- [[_Index|Vault index]]
