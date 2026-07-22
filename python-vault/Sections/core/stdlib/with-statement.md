---
type: "entry"
domain: "python"
file: "core"
section: "stdlib"
id: "with-statement"
title: "with statement"
category: "Standard Library"
subtitle: "Guarantees cleanup even if an exception occurs"
signature_short: "with open(\"f\") as f: | with contextlib.contextmanager"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "with statement"
  - "with-statement"
tags:
  - "python"
  - "python/core"
  - "python/core/stdlib"
  - "category/standard-library"
  - "tier/tiered"
---

# with statement

> Guarantees cleanup even if an exception occurs

## Overview

The with statement calls __enter__ before the block and __exit__ after — even if an exception is raised. Used for file handles, database connections, locks, and temporary state. contextlib.contextmanager lets you write a context manager with a generator function.

## Signature

```python
with open("f") as f: | with contextlib.contextmanager
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - 'with X as y:' calls __enter__/__exit__; cleanup runs even on exception.
# STRENGTHS - One construct for files, locks, DB transactions, temp dirs.
# WEAKNESSES- See advanced.js for ExitStack, async with, and __exit__ details.
with open("data.txt") as f:
    content = f.read()                       # f closed even if read() raises

import threading
lock = threading.Lock()
with lock:
    counter += 1                              # lock released even on exception
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Multiple context managers on one with; @contextmanager for ad-hoc CMs; contextlib.suppress to ignore expected misses.
# STRENGTHS - Less indentation, more readable; generator-style CMs avoid class boilerplate.
# WEAKNESSES- @contextmanager generators can only yield ONCE; multi-yield needs a class.
from contextlib import contextmanager, suppress
import time

# Multiple files / locks at once.
with open("a.txt") as fa, open("b.txt", "w") as fb:
    fb.write(fa.read().upper())

# Quick custom CM via @contextmanager.
@contextmanager
def timed(label):
    t0 = time.perf_counter()
    try: yield
    finally: print(f"{label}: {time.perf_counter() - t0:.3f}s")

with timed("load"):
    data = open("big.csv").read()

# Ignore specific failures intentionally.
with suppress(FileNotFoundError):
    Path("/tmp/lock").unlink()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - For ExitStack, async with, suppress vs except, see advanced.js context-manager-patterns.
# STRENGTHS - One CM per resource, ExitStack to manage N at once, async with for awaitable resources.
# WEAKNESSES- Returning True from __exit__ swallows exceptions silently — almost always wrong.
from contextlib import ExitStack

# Open N files dynamically — ExitStack closes all on exit.
def merge_files(paths: list[str]) -> str:
    with ExitStack() as stack:
        files = [stack.enter_context(open(p)) for p in paths]
        return "".join(f.read() for f in files)

# Decision rule:
#   resource that needs cleanup            -> with statement (NOT try/finally)
#   variable number of resources            -> contextlib.ExitStack
#   async resource (DB pool, HTTP client)   -> async with X() as y
#   "if file is missing, just skip"          -> contextlib.suppress(FileNotFoundError)
#   custom resource type                     -> __enter__/__exit__ class OR @contextmanager
#   need to retry / handle errors            -> try/except INSIDE the with block, NOT around it
#
# Anti-pattern: returning True from __exit__ to "swallow this exception".
# Almost always hides bugs. Return False (or omit return) and let the
# exception propagate; if you must suppress, use contextlib.suppress with
# the SPECIFIC exception type.
```

## Decision Rule

```text
resource that needs cleanup            -> with statement (NOT try/finally)
variable number of resources            -> contextlib.ExitStack
async resource (DB pool, HTTP client)   -> async with X() as y
"if file is missing, just skip"          -> contextlib.suppress(FileNotFoundError)
custom resource type                     -> __enter__/__exit__ class OR @contextmanager
need to retry / handle errors            -> try/except INSIDE the with block, NOT around it
```

## Anti-Pattern

> [!warning] Anti-pattern
> returning True from __exit__ to "swallow this exception".
> Almost always hides bugs. Return False (or omit return) and let the
> exception propagate; if you must suppress, use contextlib.suppress with
> the SPECIFIC exception type.

## Tips

- with is cleaner than try/finally for resource cleanup — the intent is explicit
- Multiple context managers on one line: `with open(a) as f1, open(b) as f2:`
- @contextmanager turns a generator function into a context manager — yield is the with block
- contextlib.suppress is the cleanest way to ignore specific expected exceptions

## Common Mistake

> [!warning] Using try/finally for file handling: `f = open("x"); try: ... finally: f.close()`. Use with open("x") as f — it is shorter, clearer, and handles the exception-during-close edge case.

## Shorthand (Junior → Senior)

**Junior:**
```python
f = open("file.txt")
try:
    data = f.read()
finally:
    f.close()
```

**Senior:**
```python
with open("file.txt") as f:
    data = f.read()
```

## See Also

- [[Sections/core/stdlib/itertools|itertools (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/collections-deque|collections.deque (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/functools|functools (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/datetime|datetime module (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/_Index|Core Syntax & Built-ins → Standard Library]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]
