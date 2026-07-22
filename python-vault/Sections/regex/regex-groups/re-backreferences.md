---
type: "entry"
domain: "python"
file: "regex"
section: "regex-groups"
id: "re-backreferences"
title: "Backreferences in patterns and replacements"
category: "Regex"
subtitle: "\\1, \\g<name> in patterns; \\1, \\g<name> in replacements"
signature_short: "pattern: r\"(\\w+)\\s+\\1\"  |  replacement: r\"\\1\\2\"  or r\"\\g<name>\""
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Backreferences in patterns and replacements"
  - "re-backreferences"
tags:
  - "python"
  - "python/regex"
  - "python/regex/regex-groups"
  - "category/regex"
  - "tier/tiered"
---

# Backreferences in patterns and replacements

> \1, \g<name> in patterns; \1, \g<name> in replacements

## Overview

Backreferences allow you to match the same text that was previously captured. In patterns, \1 refers to group 1, \2 to group 2, etc. In replacements, \1 and \g<1> both work; for named groups use \g<name>. This is powerful for finding repeated words, matching balanced pairs, or swapping matched groups. Python regex backreferences are numbered, not named, in the pattern itself — use \g<name> for named group backreferences.

## Signature

```python
pattern: r"(\w+)\s+\1"  |  replacement: r"\1\2"  or r"\g<name>"
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - \1 in the PATTERN matches the same text the first group captured; \1 in the REPLACEMENT inserts that text.
# STRENGTHS - Detect duplicates; swap fields; keep a delimiter consistent.
# WEAKNESSES- ALWAYS use raw strings -- "\1" is a control character; r"\1" is the backreference.
import re

# Find doubled words ("the the").
print(re.findall(r"\b(\w+)\s+\1\b", "The the quick fox fox jumps"))
# ['the', 'fox']

# Swap two words.
print(re.sub(r"(\w+)\s+(\w+)", r"\2 \1", "Alice Bob Charlie David"))
# 'Bob Alice David Charlie'
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Named backrefs (?P=name) in patterns, \g<name> in replacements; matching quotes; collapse repeats.
# STRENGTHS - Self-documenting transforms; pairs that 'travel together' (open/close quote, same year, same separator).
# WEAKNESSES- Backrefs across alternations are subtle; (a|b)\1 only matches if the FIRST alternative's text recurs literally.
import re

# Match a quoted string with the SAME opening and closing quote.
QUOTED = re.compile(r"(?P<q>['\"])(.*?)(?P=q)")
print(QUOTED.findall('he said "hi" and \'bye\''))
# [('"', 'hi'), ("'", 'bye')]

# Collapse three-or-more repeats to two ("aaaaa" -> "aa") via backref.
print(re.sub(r"(.)\1{2,}", r"\1\1", "aaaaaa bbb c"))
# 'aa bb c'

# Replace "First Last" with "LAST, First" using named groups.
text = "Alice Smith and Bob Jones"
print(re.sub(
    r"(?P<first>\w+)\s+(?P<last>\w+)",
    lambda m: f"{m['last'].upper()}, {m['first']}",
    text,
))
# 'SMITH, Alice and JONES, Bob'

# Patterns + replacement together: dedupe consecutive whitespace AND newlines.
print(re.sub(r"(\s)\1+", r"\1", "a   b\n\n\nc"))
# 'a b\nc'
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Backrefs for invariants (matching delimiters, repeated tokens); callable replacement when transformation logic exceeds template syntax; never use backrefs to parse balanced/nested structures.
# STRENGTHS - Tight invariants in one regex (open quote = close quote, matching tag); re-readable rewrites via named groups.
# WEAKNESSES- Backreferences cannot match BALANCED nesting -- "(a(b)c)" is regular-language poison. Use a parser.
from __future__ import annotations
import re

# 1) Matching tag pairs at ONE level (NOT nested). 'regex' module supports
#    recursive patterns (?R); stdlib does not. Be explicit about the limit.
TAG_PAIR = re.compile(r"<(?P<t>[a-zA-Z][\w-]*)\b[^>]*>(?P<body>.*?)</(?P=t)>", re.DOTALL)
# Works for one level; doesn't support <a><a></a></a> properly. For real HTML,
# use html.parser or BeautifulSoup -- not regex.

# 2) Quoted-string lexer: backref keeps quotes balanced.
STRING = re.compile(r"""
    (?P<q>['"])              # opening quote
    (?P<val>(?:\\.|(?!(?P=q)).)*)  # body: escapes or non-quote chars
    (?P=q)                    # SAME quote closes
""", re.VERBOSE)

def quoted_strings(s: str) -> list[str]:
    return [m["val"] for m in STRING.finditer(s)]

# 3) Replacement-side: callables beat \g templates when the transform is non-trivial.
#    Backrefs in r"..." replacements interpret \g<name>, \1, \\, etc. -- a callable
#    avoids that minefield AND lets you raise on invalid input.
def fix_phone(s: str) -> str:
    PHONE = re.compile(r"(?P<a>\d{3})[.\s-]?(?P<b>\d{3})[.\s-]?(?P<c>\d{4})")
    def fmt(m: re.Match[str]) -> str:
        return f"({m['a']}) {m['b']}-{m['c']}"
    return PHONE.sub(fmt, s)

# 4) Conditional pattern (?(name)yes|no) -- "if group 'name' matched, expect X, else Y".
#    Stdlib supports it. Useful for optional prefixes whose presence implies a suffix.
SCHEMED = re.compile(r"(https?://)?(www\.)?(?P<host>[\w.-]+)(?(2)/|\b)")
# Reads: an optional protocol, optional 'www.', a host, then if 'www.' was
# matched (group 2) require a slash, else a word boundary.

# Decision rule:
#   detect duplicates / repeats              -> (\w+)\s+\1   in the pattern
#   matching delimiter pair (quotes, tags)   -> (?P<q>['"])...(?P=q)   single-level only
#   swap fields                              -> r"\2 \1" replacement, OR a callable
#   transform with logic / formatting        -> CALLABLE replacement, NEVER raw r"\g<...>" + f-string
#   recursive / balanced structures          -> NOT regex; use a parser (lark, pyparsing, ast, html.parser)
#   "if optional prefix, then..." rules      -> (?(group)yes|no) conditional pattern
#   user-supplied text in the replacement    -> callable; replacement strings interpret \1
#
# Anti-pattern: trying to parse JSON / HTML / SQL / nested parens with backrefs.
# Backreferences make a regex non-regular but still cannot recognize balanced
# nesting beyond a fixed depth. Use a real parser; you'll spend less time on
# the regex than on debugging the cases it handles 90% of.
```

## Decision Rule

```text
detect duplicates / repeats              -> (\w+)\s+\1   in the pattern
matching delimiter pair (quotes, tags)   -> (?P<q>['"])...(?P=q)   single-level only
swap fields                              -> r"\2 \1" replacement, OR a callable
transform with logic / formatting        -> CALLABLE replacement, NEVER raw r"\g<...>" + f-string
recursive / balanced structures          -> NOT regex; use a parser (lark, pyparsing, ast, html.parser)
"if optional prefix, then..." rules      -> (?(group)yes|no) conditional pattern
user-supplied text in the replacement    -> callable; replacement strings interpret \1
```

## Anti-Pattern

> [!warning] Anti-pattern
> trying to parse JSON / HTML / SQL / nested parens with backrefs.
> Backreferences make a regex non-regular but still cannot recognize balanced
> nesting beyond a fixed depth. Use a real parser; you'll spend less time on
> the regex than on debugging the cases it handles 90% of.

## Tips

- Backreferences in patterns (\1, \2) find repeated captured text — perfect for duplicate detection.
- Backreferences in replacements: \1 or \g<1> for numbered groups; \g<name> for named groups.
- Backreferences only work if the group actually matched — for optional groups, use \1? or handle None.
- Use (?P=name) to backreference a named group within the pattern itself; conditional pattern (?(name)yes|no) means "if group name matched, expect X, else Y".

## Common Mistake

> [!warning] Trying to parse JSON / HTML / SQL / nested parens with backrefs — backreferences make a regex non-regular but still cannot recognize balanced nesting. Use a real parser (lark, pyparsing, ast, html.parser); you'll spend less time than debugging the cases regex handles 90% of.

## Shorthand (Junior → Senior)

**Junior:**
```python
import re
text = "Alice Bob"
parts = text.split()
result = f"{parts[1]} {parts[0]}"
```

**Senior:**
```python
import re
result = re.sub(r"(\w+)\s+(\w+)", r"\2 \1", text)
```

## See Also

- [[Sections/regex/regex-basics/re-match|re.match() vs re.search() vs re.fullmatch() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-findall|re.findall() and re.finditer() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-sub|re.sub() and re.subn() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-split|re.split() (Regular Expressions)]]
- [[Sections/regex/regex-groups/_Index|Regular Expressions → Groups & Captures]]
- [[Sections/regex/_Index|Regular Expressions index]]
- [[_Index|Vault index]]
