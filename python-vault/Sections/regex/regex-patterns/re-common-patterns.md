---
type: "entry"
domain: "python"
file: "regex"
section: "regex-patterns"
id: "re-common-patterns"
title: "Practical regex patterns"
category: "Regex"
subtitle: "Email, URL, phone number, ISO date, IPv4 address"
signature_short: "re.findall(email_pattern, text)  |  re.match(phone_pattern, phone_num)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Practical regex patterns"
  - "re-common-patterns"
tags:
  - "python"
  - "python/regex"
  - "python/regex/regex-patterns"
  - "category/regex"
  - "tier/tiered"
---

# Practical regex patterns

> Email, URL, phone number, ISO date, IPv4 address

## Overview

Common regex patterns for validating and extracting real-world data. Email, URL, phone numbers, dates, and IP addresses each have standard formats. These patterns are starting points — production systems often use dedicated libraries (email_validator, validators, etc.) for robustness. But regex is lightweight and useful for quick validation, parsing, and extraction tasks.

## Signature

```python
re.findall(email_pattern, text)  |  re.match(phone_pattern, phone_num)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Off-the-shelf patterns for email/URL/date/phone/IP -- great for quick extraction.
# STRENGTHS - One line each; covers most casual text-mining tasks.
# WEAKNESSES- "Casual" is the operative word -- these patterns ALL have edge cases that fail in production.
import re

EMAIL = r"[\w.+-]+@[\w.-]+\.\w{2,}"
URL   = r"https?://[\w.-]+\.\w{2,}(?:/\S*)?"
DATE  = r"\d{4}-\d{2}-\d{2}"
IPV4  = r"\b(?:\d{1,3}\.){3}\d{1,3}\b"

text = "ping alice@x.com on 2026-04-30 from 10.0.0.5; visit https://x.com/about"
print(re.findall(EMAIL, text))   # ['alice@x.com']
print(re.findall(URL,   text))   # ['https://x.com/about']
print(re.findall(DATE,  text))   # ['2026-04-30']
print(re.findall(IPV4,  text))   # ['10.0.0.5']
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Cheap regex extraction + a real validator for "is this actually correct?".
# STRENGTHS - Fast scan, then targeted parse with stdlib (urllib, ipaddress, datetime, email.utils).
# WEAKNESSES- Two-step: regex catches FORM, validator catches MEANING. Skip step two and ".com" matches.
import re
import ipaddress
from datetime import date
from urllib.parse import urlparse

# 1) Extract candidates with regex (loose), then validate with stdlib.
def find_ips(text: str) -> list[str]:
    out = []
    for m in re.finditer(r"\b(?:\d{1,3}\.){3}\d{1,3}\b", text):
        try:
            ipaddress.IPv4Address(m.group())          # 256.0.0.1 raises here
            out.append(m.group())
        except ValueError:
            continue
    return out

def find_dates(text: str) -> list[date]:
    out: list[date] = []
    for m in re.finditer(r"\b(\d{4})-(\d{2})-(\d{2})\b", text):
        try:
            out.append(date(*map(int, m.groups())))   # 2026-02-30 raises here
        except ValueError:
            continue
    return out

def find_urls(text: str) -> list[str]:
    out = []
    for m in re.finditer(r"https?://\S+", text):
        u = urlparse(m.group().rstrip(".,);"))         # strip trailing punctuation
        if u.scheme in ("http", "https") and u.netloc:
            out.append(u.geturl())
    return out

# 2) Common micro-patterns:
HASHTAG = re.compile(r"(?<!\w)#(\w+)")        # #python in "#python", NOT in "abc#python"
MENTION = re.compile(r"(?<!\w)@(\w+)")
UUID    = re.compile(r"\A[\dA-Fa-f]{8}-[\dA-Fa-f]{4}-[\dA-Fa-f]{4}-"
                     r"[\dA-Fa-f]{4}-[\dA-Fa-f]{12}\Z")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Use regex to LOCATE; use the right specialized parser to VALIDATE; never ship handwritten regex as the source of truth for emails/URLs/HTML.
# STRENGTHS - Correct semantics (Unicode emails, IDN domains, CIDR, ISO 8601); auditable; less to maintain.
# WEAKNESSES- More dependencies; specialized libs evolve. Pin them and pin the test corpus.
from __future__ import annotations
import re
import ipaddress
from datetime import datetime
from email.headerregistry import Address                # stdlib email parser
from urllib.parse import urlparse

# 1) Email -- regex finds candidates; 'email_validator' validates per RFC 5322
#    + DNS check if you want it. 'email.headerregistry.Address' is stdlib and
#    handles most of the syntactic checks for free.
EMAIL_LOOSE = re.compile(r"[^\s,;<>]+@[^\s,;<>]+\.[^\s,;<>]+")
def emails(text: str) -> list[str]:
    out = []
    for m in EMAIL_LOOSE.finditer(text):
        try:
            addr = Address(addr_spec=m.group())
            out.append(f"{addr.username}@{addr.domain}")
        except Exception:
            continue
    return out

# 2) URL -- urlparse handles RFC 3986; check scheme allowlist + netloc.
URL_LOOSE = re.compile(r"\bhttps?://\S+")
def urls(text: str, *, schemes: set[str] = {"http", "https"}) -> list[str]:
    out = []
    for m in URL_LOOSE.finditer(text):
        candidate = m.group().rstrip(".,);'\"")
        u = urlparse(candidate)
        if u.scheme in schemes and u.netloc and "." in u.netloc:
            out.append(candidate)
    return out

# 3) IPs -- regex catches v4/v6 hex pairs; ipaddress.ip_address validates.
IP_LOOSE = re.compile(r"\b(?:[0-9a-fA-F:]{2,39}|(?:\d{1,3}\.){3}\d{1,3})\b")
def ips(text: str) -> list[ipaddress.IPv4Address | ipaddress.IPv6Address]:
    out = []
    for m in IP_LOOSE.finditer(text):
        try: out.append(ipaddress.ip_address(m.group()))
        except ValueError: continue
    return out

# 4) Datetimes -- regex narrows; datetime.fromisoformat (3.11+ accepts most ISO 8601)
#    handles the actual parse including timezone offsets.
ISO_LOOSE = re.compile(
    r"\b\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?\b"
)
def datetimes(text: str) -> list[datetime]:
    out: list[datetime] = []
    for m in ISO_LOOSE.finditer(text):
        try: out.append(datetime.fromisoformat(m.group().replace("Z", "+00:00")))
        except ValueError: continue
    return out

# 5) Phone numbers -- DON'T hand-roll. Use 'phonenumbers' (Google's libphonenumber).
#    import phonenumbers
#    for m in phonenumbers.PhoneNumberMatcher(text, "US"):
#        ... use m.number ...

# Decision rule:
#   email                 -> regex narrows; email.headerregistry.Address OR email_validator validates
#   URL                   -> regex narrows; urlparse + scheme allowlist
#   IPv4 / IPv6           -> regex narrows; ipaddress.ip_address validates
#   datetime              -> regex narrows; datetime.fromisoformat / dateutil parses
#   phone                 -> NEVER regex-only; use 'phonenumbers'
#   credit card / IBAN    -> regex for shape; Luhn / mod-97 in code; PCI scope -- prefer tokenization
#   HTML / JSON / SQL     -> NEVER regex; use html.parser, json, sqlglot
#
# Anti-pattern: shipping a "validates email" regex pulled off Stack Overflow.
# RFC-correct emails permit IP-literal domains, IDN, quoted local-parts, and
# more. The regex passes review, fails on a real customer at 2 AM. Use the
# specialized parser; the regex's job is to find candidates fast.
```

## Decision Rule

```text
email                 -> regex narrows; email.headerregistry.Address OR email_validator validates
URL                   -> regex narrows; urlparse + scheme allowlist
IPv4 / IPv6           -> regex narrows; ipaddress.ip_address validates
datetime              -> regex narrows; datetime.fromisoformat / dateutil parses
phone                 -> NEVER regex-only; use 'phonenumbers'
credit card / IBAN    -> regex for shape; Luhn / mod-97 in code; PCI scope -- prefer tokenization
HTML / JSON / SQL     -> NEVER regex; use html.parser, json, sqlglot
```

## Anti-Pattern

> [!warning] Anti-pattern
> shipping a "validates email" regex pulled off Stack Overflow.
> RFC-correct emails permit IP-literal domains, IDN, quoted local-parts, and
> more. The regex passes review, fails on a real customer at 2 AM. Use the
> specialized parser; the regex's job is to find candidates fast.

## Tips

- These patterns are good starting points but may not cover all edge cases. For production, use validated libraries: email_validator, validators, etc.
- URL pattern (?:/\S*)? is optional trailing path — adjust for your needs.
- Phone patterns vary by region — NEVER hand-roll regex; use Google's `phonenumbers` library (libphonenumber port).
- IPv4 octets should be 0-255, but regex with \d{1,3} allows up to 999 — validate separately if needed.
- Two-step pattern: regex narrows (locates candidates), specialized parser validates. Use stdlib `urlparse` (URLs), `ipaddress.ip_address` (IPv4/v6), `datetime.fromisoformat` (ISO 8601), `email.headerregistry.Address` (emails).

## Common Mistake

> [!warning] Shipping a "validates email" regex pulled off Stack Overflow as the source of truth — RFC-correct emails permit IP-literal domains, IDN, quoted local-parts, and more. The regex passes review and fails on a real customer at 2 AM. Use the specialized parser; the regex's job is to find candidates fast.

## Shorthand (Junior → Senior)

**Junior:**
```python
import re
text = "Email: alice@example.com"
parts = text.split("@")
if len(parts) == 2 and "." in parts[1]:
    print("Maybe valid email")
```

**Senior:**
```python
import re
if re.search(r"[\w.+-]+@[\w.-]+\.\w{2,}", text):
    print("Possible email")
```

## See Also

- [[Sections/regex/regex-basics/re-match|re.match() vs re.search() vs re.fullmatch() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-findall|re.findall() and re.finditer() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-sub|re.sub() and re.subn() (Regular Expressions)]]
- [[Sections/regex/regex-basics/re-split|re.split() (Regular Expressions)]]
- [[Sections/regex/regex-patterns/_Index|Regular Expressions → Patterns & Flags]]
- [[Sections/regex/_Index|Regular Expressions index]]
- [[_Index|Vault index]]
