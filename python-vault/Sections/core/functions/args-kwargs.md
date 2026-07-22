---
type: "entry"
domain: "python"
file: "core"
section: "functions"
id: "args-kwargs"
title: "*args / **kwargs"
category: "Functions"
subtitle: "*args collects extra positional args as tuple, **kwargs as dict"
signature_short: "def fn(*args, **kwargs) | fn(*lst, **dct)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "*args / **kwargs"
  - "args-kwargs"
tags:
  - "python"
  - "python/core"
  - "python/core/functions"
  - "category/functions"
  - "tier/tiered"
---

# *args / **kwargs

> *args collects extra positional args as tuple, **kwargs as dict

## Overview

*args captures extra positional arguments into a tuple. **kwargs captures extra keyword arguments into a dict. They can be combined with normal parameters in a defined order. The * and ** operators also unpack sequences/dicts when calling a function.

## Signature

```python
def fn(*args, **kwargs) | fn(*lst, **dct)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - show the simplest call: defaults only, no options, no error handling.
# STRENGTHS - fastest to read; teaches the core idea without distraction;
#             matches what you'd type into a REPL or a quick script.
# WEAKNESSES- relies on default behavior that may not fit real inputs;
#             skips edge cases, validation, and any production concerns.
#
# GOAL: accept any number of positional or keyword arguments
def add(*nums):
    return sum(nums)

add(1, 2, 3, 4)   # → 10  (nums is the tuple (1, 2, 3, 4))
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - layer in the common parameters, idioms, and patterns a working
#             developer reaches for daily (cast inputs, format output, options).
# STRENGTHS - covers the 80% case for real projects; teaches the parameters you'll
#             meet in code reviews; balances clarity with practical control.
# WEAKNESSES- still trusts inputs and skips deeper concerns like logging,
#             retries, performance tuning, or graceful failure modes.
#
# GOAL: collect extra keyword args and force keyword-only params
def configure(**options):
    for key, val in options.items():
        print(f"{key} = {val}")

configure(host="localhost", port=8080)
# → host = localhost
# → port = 8080

# WHY: bare * forces everything after it to be keyword-only — no positional accidents
def create(name, *, verbose=False, dry_run=False):
    print(f"Creating {name}")

create("file.txt", verbose=True)  # ok
# create("file.txt", True)        # TypeError — verbose must be keyword
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - address production concerns: validation, observability, resource
#             handling, and signaling intent (stderr, flush, logging, retries).
# STRENGTHS - safe to ship; handles edge cases and failure modes; integrates
#             with logging/monitoring; communicates engineering intent to teammates.
# WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;
#             assumes a system context (logging, stderr) that may not exist yet.
#
# GOAL: unpack lists and dicts into function calls
args   = [1, 2, 3]
kwargs = {"sep": ", ", "end": "!\n"}

print(*args, **kwargs)   # → 1, 2, 3!

# WHY: useful for forwarding arguments through wrapper functions
def wrapper(*args, **kwargs):
    print("before")
    result = real_function(*args, **kwargs)   # pass everything through
    print("after")
    return result

# NOTE: signature order must be: pos, /, normal, *args, kw_only, **kwargs
#
# Decision rule:
#   variable-length numeric / sequence input   -> *args
#   variable-length config / options           -> **kwargs
#   forwarding to wrapped function             -> *args, **kwargs (decorators)
#   force "boolean must be named"              -> def f(x, *, verbose=False)
#   forbid "value passed positionally"         -> bare * before kwargs
#   API where order shouldn't matter            -> all keyword-only after *
#   mostly-fixed signature, occasional extras   -> name params, *args for tail
#   spreading a list / dict into a call         -> f(*lst) / f(**d)
#
# Anti-pattern: using **kwargs as the function's only signature documentation.
#   `def configure(**kwargs)` hides every accepted option from IDE help, type checkers, and
#   reviewers, and forwards typos silently. List the options as named params (with sensible
#   defaults); use **kwargs only for genuine pass-through to a wrapped library or for
#   forward-compat extensibility — and document the accepted keys in the docstring.
```

## Decision Rule

```text
variable-length numeric / sequence input   -> *args
variable-length config / options           -> **kwargs
forwarding to wrapped function             -> *args, **kwargs (decorators)
force "boolean must be named"              -> def f(x, *, verbose=False)
forbid "value passed positionally"         -> bare * before kwargs
API where order shouldn't matter            -> all keyword-only after *
mostly-fixed signature, occasional extras   -> name params, *args for tail
spreading a list / dict into a call         -> f(*lst) / f(**d)
```

## Anti-Pattern

> [!warning] Anti-pattern
> using **kwargs as the function's only signature documentation.
>   `def configure(**kwargs)` hides every accepted option from IDE help, type checkers, and
>   reviewers, and forwards typos silently. List the options as named params (with sensible
>   defaults); use **kwargs only for genuine pass-through to a wrapped library or for
>   forward-compat extensibility — and document the accepted keys in the docstring.

## Tips

- Keyword-only parameters (after `*`) force callers to be explicit — great for boolean flags
- `*` in a signature with no name forces all following parameters to be keyword-only: `def fn(a, *, b)`
- `*args` is a tuple (immutable); `**kwargs` is a dict — iterate over them normally
- Unpack with `fn(*lst, **dct)` to pass a list/dict as positional/keyword arguments

## Common Mistake

> [!warning] Using `*args` when the function always receives a fixed number of arguments. Only use `*args` when the count genuinely varies — otherwise named parameters are clearer.

## See Also

- [[Sections/core/functions/def|def (Core Syntax & Built-ins)]]
- [[Sections/core/functions/lambda|lambda (Core Syntax & Built-ins)]]
- [[Sections/core/functions/generators|Generators (Core Syntax & Built-ins)]]
- [[Sections/core/functions/decorators|Decorators (Core Syntax & Built-ins)]]
- [[Sections/core/functions/_Index|Core Syntax & Built-ins → Functions]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]
