---
type: "entry"
domain: "python"
file: "regex"
section: "regex-patterns"
id: "re-character-classes"
title: "Character classes, quantifiers, escapes"
category: "Regex"
subtitle: "\\d \\w \\s [a-z] [^...] * + ? {n,m} . ^ $"
signature_short: "re.search(r\"\\d+\", string)  |  re.search(r\"[a-zA-Z_]\\w*\", string)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Character classes, quantifiers, escapes"
  - "re-character-classes"
tags:
  - "python"
  - "python/regex"
  - "python/regex/regex-patterns"
  - "category/regex"
  - "tier/tiered"
---

# Character classes, quantifiers, escapes

> \d \w \s [a-z] [^...] * + ? {n,m} . ^ $

## Overview

\d matches digits 0-9; \w matches word characters (letters, digits, underscore); \s matches whitespace. Character classes [a-z] match ranges, [abc] match specific chars, [^abc] match NOT those chars. Quantifiers: * (0+), + (1+), ? (0-1), {n} (exactly n), {n,m} (n to m). . matches any char except newline. ^ anchors to start, $ to end. \b word boundary. Escape special chars with backslash.

## Signature

```python
re.search(r"\d+", string)  |  re.search(r"[a-zA-Z_]\w*", string)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - \d \w \s for shorthand classes; [a-z] for ranges; * + ? {n,m} for counts; ^ $ \b for anchors.
# STRENGTHS - Compact patterns; covers 80% of real-world matching.
# WEAKNESSES- '.' does NOT match newlines by default; '[^...]' is NOT 'NOT a class' in regex outside [].
import re

print(re.findall(r"\d+", "42 apples, 17 oranges"))   # ['42', '17']
print(re.findall(r"\w+", "hello_world-123"))          # ['hello_world', '123']
print(re.split(r"\s+", "one   two\tthree"))         # ['one','two','three']

# Range and negation:
print(re.findall(r"[A-Z]", "Hello World"))             # ['H','W']
print(re.findall(r"[^0-9]+", "abc123def"))             # ['abc', 'def']

# Counts and anchors:
print(re.findall(r"a{2,4}", "a aa aaa aaaaa"))         # ['aa','aaa','aaaa']
print(re.search(r"world$", "hello world"))             # <Match>
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Greedy vs lazy quantifiers; precise {n,m}; bracket-class shortcuts; word boundaries vs lookaround.
# STRENGTHS - One-line precision; correct quantifier choice avoids 80% of "regex matches too much" bugs.
# WEAKNESSES- Greedy by default -- '<.+>' on '<a><b>' returns '<a><b>'; use '<.+?>' for lazy or '<[^>]+>' for explicit.
import re

# Greedy vs lazy.
html = "<a><b><c>"
print(re.findall(r"<.+>",  html))     # ['<a><b><c>']  -- one big greedy match
print(re.findall(r"<.+?>", html))     # ['<a>', '<b>', '<c>']  -- lazy, per-tag
print(re.findall(r"<[^>]+>", html))   # ['<a>', '<b>', '<c>']  -- explicit; faster than lazy

# Bracket-class shortcuts inside [].
print(re.findall(r"[\w.-]+", "a.b_c-d"))     # ['a.b_c-d']
print(re.findall(r"[^\s,]+",  "a, b, c"))     # ['a', 'b', 'c']

# Quantifier discipline.
print(re.findall(r"\d{3,4}", "12 345 6789"))           # ['345', '6789']
print(re.findall(r"colou?r",  "color and colour"))      # ['color', 'colour']

# Word boundary vs anchors.
print(re.findall(r"\bcat\b", "cat catalog cats scat")) # ['cat']

# Escape what regex steals: . * + ? ( ) [ ] { } | \ ^ $ /
print(re.findall(r"\$\d+\.\d{2}", "items: $9.99 and $42.00"))
# ['$9.99', '$42.00']
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Prefer character classes [^X]+ over .*?; possessive/atomic in 'regex' module to defuse backtracking; Unicode categories \p{...} via 'regex'; re.escape for fixed strings.
# STRENGTHS - Linear-time patterns; Unicode-correct without ASCII fallback; safer with hostile input.
# WEAKNESSES- \p{...} and possessive quantifiers are 'regex' module only; choose your engine deliberately.
from __future__ import annotations
import re

# 1) Replace lazy '.+?' with negated class '[^X]+' wherever possible -- it
#    eliminates a huge class of backtracking pathologies.
#    HTML attribute value (DON'T parse HTML with regex in production):
ATTR = re.compile(r'(\w+)="([^"]*)"')
print(ATTR.findall('a="1" b="hello world" c=""'))
# [('a', '1'), ('b', 'hello world'), ('c', '')]

# 2) Anchor + class for "balanced delimiter" matching:
#    quoted string with escapes -- linear in the number of input characters.
QUOTED = re.compile(r'"([^"\\]*(?:\\.[^"\\]*)*)"')
print(QUOTED.findall(r'"hi" and "say \"yes\"" and "x"'))
# ['hi', 'say \\"yes\\"', 'x']

# 3) Unicode-aware classes via the 'regex' module (\p{Letter}, \p{Cf}, \p{So}).
#    Stdlib has \w/\W and re.UNICODE (default in Py3) but no Unicode categories.
def is_emoji_run(s: str) -> bool:
    try:
        import regex
        return regex.fullmatch(r"\p{So}+", s) is not None
    except ImportError:
        # Stdlib fallback -- ranges drift with each Unicode update.
        return all(0x1F300 <= ord(c) <= 0x1FAFF or 0x2600 <= ord(c) <= 0x27BF
                   for c in s)

# 4) Build patterns from fixed strings safely with re.escape.
def any_of(words: list[str]) -> re.Pattern[str]:
    return re.compile(r"\b(?:" + "|".join(re.escape(w) for w in sorted(words, key=len, reverse=True)) + r")\b",
                      re.IGNORECASE)
# longest-first sort prevents 'foo' shadowing 'foobar' in the alternation.

# 5) Catastrophic-backtracking defusal.
#    Bad:  r"^(a+)+$"     on "aaaaaaaaaab" -- exponential
#    Good (single greedy): r"^a+$"
#    Good (separate suffix): r"^a+b?$"
#  If you NEED the nested structure, atomic group via 'regex': r"^(?>a+)+$"

# Decision rule:
#   "any chars between two delims"     -> [^delim]+   (NOT .*?)
#   precise count                      -> {n} or {n,m}
#   optional thing                     -> ? on the whole subpattern OR alternation
#   word match                         -> \b...\b   (Unicode-aware in Py3)
#   Unicode property classes           -> 'regex' module + \p{...}
#   user-supplied literal              -> re.escape() before insertion
#   nested quantifier                  -> rewrite to flat OR atomic group ('regex')
#   matching across newlines (HTML/JSON-ish) -> [\s\S]+? OR re.DOTALL; usually wrong tool, prefer a parser
#
# Anti-pattern: '.+?' as the universal "match anything between" pattern. It
# works but leaves the engine doing maximal backtracking on every character.
# Replace with '[^X]+' (where X is the delimiter) for linear-time matching.
```

## Decision Rule

```text
"any chars between two delims"     -> [^delim]+   (NOT .*?)
precise count                      -> {n} or {n,m}
optional thing                     -> ? on the whole subpattern OR alternation
word match                         -> \b...\b   (Unicode-aware in Py3)
Unicode property classes           -> 'regex' module + \p{...}
user-supplied literal              -> re.escape() before insertion
nested quantifier                  -> rewrite to flat OR atomic group ('regex')
matching across newlines (HTML/JSON-ish) -> [\s\S]+? OR re.DOTALL; usually wrong tool, prefer a parser
```

## Anti-Pattern

> [!warning] Anti-pattern
> '.+?' as the universal "match anything between" pattern. It
> works but leaves the engine doing maximal backtracking on every character.
> Replace with '[^X]+' (where X is the delimiter) for linear-time matching.

## Tips

- \w is [a-zA-Z0-9_] — includes underscore, useful for identifiers.
- [^...] negation matches anything NOT in the class — [^0-9] matches non-digits.
- {n,m} is more precise than * or +: {2,4} matches 2-4 occurrences.
- . matches any char except newline — use re.DOTALL to include newlines.
- Prefer the negated class `[^X]+` over lazy `.+?` for "any chars between two delimiters" — eliminates a huge class of backtracking pathologies and runs in linear time. When building alternations from fixed strings, sort longest-first so "foo" doesn't shadow "foobar".

## Common Mistake

> [!warning] `.+?` as the universal "match anything between" pattern — it works but leaves the engine doing maximal backtracking on every character. Replace with `[^X]+` (X = the delimiter) for linear-time matching. Also: forgetting to escape special regex chars — . matches any char, not a literal dot.

## Shorthand (Junior → Senior)

**Junior:**
```python
import re
text = "The price is $19.99"
for i, char in enumerate(text):
    if char.isdigit():
        print(char)
```

**Senior:**
```python
import re
digits = re.findall(r"\d", text)
```

## See Also

- [[Sections/regex/regex-basics/re-match|re.match() vs re.search() vs re.fullmatch() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-findall|re.findall() and re.finditer() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-sub|re.sub() and re.subn() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-split|re.split() (Regular Expressions)]]
- [[Sections/regex/regex-patterns/_Index|Regular Expressions → Patterns & Flags]]
- [[Sections/regex/_Index|Regular Expressions index]]
- [[_Index|Vault index]]
