---
type: "entry"
domain: "python"
file: "advanced"
section: "advanced-patterns-py"
id: "singleton-pattern"
title: "Singleton Pattern — Global Unique Instance"
category: "Design Patterns"
subtitle: "Singleton via metaclass, module-level, __new__ override"
signature_short: "class SingletonMeta(type): _instances = {}  |  _instance = None in __new__"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Singleton Pattern — Global Unique Instance"
  - "singleton-pattern"
tags:
  - "python"
  - "python/advanced"
  - "python/advanced/advanced-patterns-py"
  - "category/design-patterns"
  - "tier/tiered"
---

# Singleton Pattern — Global Unique Instance

> Singleton via metaclass, module-level, __new__ override

## Overview

The Singleton pattern guarantees exactly one instance of a class. Common approaches: (1) metaclass intercepts __call__ to return cached instance, (2) module-level instance accessed as a constant, (3) __new__ override returns the singleton. Module-level singletons are simpler and Pythonic. Metaclass singletons work across multiple inheritance. Thread-safe singletons require locking (threading.Lock).

## Signature

```python
class SingletonMeta(type): _instances = {}  |  _instance = None in __new__
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Module-level instance — Python's most natural singleton
# STRENGTHS - No metaclass tricks; just a constant; thread-safe by import semantics
# WEAKNESSES- No class-encapsulated form; no __new__ trick
#
# logger.py
class _Logger:
    def __init__(self): self.entries = []
    def log(self, msg): self.entries.append(msg)

log = _Logger()                            # ONE per process, by import

# anywhere.py
# from logger import log
# log.log("hello")
# Same 'log' object across all imports — Python caches modules.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - The three classic mechanisms: module-level, metaclass, __new__
# STRENGTHS - Compare side-by-side; pick the simplest that fits
# WEAKNESSES- No threading concerns; senior tier covers them
#
# 1) Module-level (simplest, Pythonic)
class _Cache:
    def __init__(self): self._d = {}
    def get(self, k): return self._d.get(k)
    def set(self, k, v): self._d[k] = v

cache = _Cache()                                  # exported singleton

# 2) Metaclass — works across multiple classes that need to be singletons
class SingletonMeta(type):
    _instances: dict[type, object] = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class Settings(metaclass=SingletonMeta):
    def __init__(self, env="dev"): self.env = env

assert Settings() is Settings("prod")             # second call ignores args (subtle!)

# 3) __new__ override — class-local, no metaclass
class Connection:
    _instance = None
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    def __init__(self, dsn=""):
        if hasattr(self, "_inited"): return       # guard re-init on every call
        self._inited = True
        self.dsn = dsn
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Thread safety, why singleton is usually wrong, dependency injection alternative
# STRENGTHS - The doctrine that prevents singleton-ridden codebases
# WEAKNESSES- N/A
#
import threading
from functools import lru_cache

# 1) Thread-safe lazy singleton — double-checked lock
class ThreadSafeMeta(type):
    _instances: dict[type, object] = {}
    _lock = threading.Lock()
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:              # fast path (no lock)
            with cls._lock:
                if cls not in cls._instances:      # re-check after acquiring
                    cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

# 2) lru_cache as a singleton factory — no metaclass, lazy, thread-safe enough
@lru_cache(maxsize=1)
def get_db(dsn: str = "default"):
    return Database(dsn)

# 3) When singleton is THE WRONG TOOL
#    a) Tests can't reset state -> shared state leaks between tests
#    b) Hidden global dependencies -> code looks pure but depends on env
#    c) Hard to mock -> "singleton.replace_with_fake()" smell
#
#    Better: dependency injection. Pass the resource as a parameter or
#    Depends() in FastAPI; let the caller decide which instance.
def query(sql: str, *, conn):                      # conn comes IN, not from a global
    return conn.execute(sql)

# 4) When a singleton IS appropriate
#    - module-level loggers (logging.getLogger by name is itself a registry)
#    - process-wide configuration loaded once at startup
#    - integration with stateful C libraries that demand a single instance

# 5) Subtle gotcha — Singleton + __init__ runs every CALL
#    With the metaclass approach, __init__ is called every time you "construct"
#    the singleton. The args are silently ignored. Either:
#       - guard inside __init__ (if hasattr ...)
#       - or move __init__ work into __new__ once

# Decision rule:
#   "I want one logger / cache / pool"            -> module-level instance
#   "Several classes need this pattern"            -> metaclass + lazy lock
#   "It's expensive and might never be used"       -> @lru_cache(maxsize=1) factory
#   "Different envs need different instances"      -> drop singleton; use DI
#   "I can't write tests for this anymore"         -> drop singleton; use DI
#
# Anti-pattern: Singleton(metaclass=...) for a Database connection holder
#   Tests can't swap it; multi-tenant code can't hold two; threadsafety claims
#   often hide bugs. Pass a connection in via Depends() / a constructor instead.

class Database:
    def __init__(self, dsn): self.dsn = dsn
```

## Decision Rule

```text
"I want one logger / cache / pool"            -> module-level instance
"Several classes need this pattern"            -> metaclass + lazy lock
"It's expensive and might never be used"       -> @lru_cache(maxsize=1) factory
"Different envs need different instances"      -> drop singleton; use DI
"I can't write tests for this anymore"         -> drop singleton; use DI
```

## Anti-Pattern

> [!warning] Anti-pattern
> Singleton(metaclass=...) for a Database connection holder
>   Tests can't swap it; multi-tenant code can't hold two; threadsafety claims
>   often hide bugs. Pass a connection in via Depends() / a constructor instead.

## Tips

- Module-level singletons (assigning _instance at module scope) are the most Pythonic — no metaclass complexity.
- Metaclass singletons need a double-checked lock for thread safety; `@lru_cache(maxsize=1)` on a factory function is a simpler lazy, thread-safe-enough alternative.
- __new__-override singletons must guard `__init__` (e.g. `if hasattr(self, "_inited"): return`) — otherwise the metaclass / __new__ pattern silently re-runs init and ignores the new args every call.
- Logging uses module-level singletons — logging.getLogger(__name__) returns the same Logger per module name. When tests can't reset state or mocking gets ugly, that's the singleton telling you to switch to dependency injection (pass the resource into the function/route).

## Common Mistake

> [!warning] Singleton(metaclass=...) for a Database connection holder — tests can't swap it, multi-tenant code can't hold two, threadsafety claims often hide bugs. Pass the connection in via a constructor / Depends() instead. Reach for singleton only for module-level loggers, process-wide config loaded at startup, or stateful C libraries that demand one instance.

## Shorthand (Junior → Senior)

**Junior:**
```python
class SingletonMeta(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]
```

**Senior:**
```python
# At module level
_instance = ClassName()

def get_instance():
    return _instance
```

## See Also

- [[Sections/advanced/advanced-patterns-py/observer-pattern|Observer Pattern — Event System & Pub/Sub (Advanced Python)]]
- [[Sections/advanced/advanced-patterns-py/mixin-pattern|Mixin Pattern — Composable Behaviors (Advanced Python)]]
- [[Sections/advanced/advanced-patterns-py/_Index|Advanced Python → Advanced Patterns]]
- [[Sections/advanced/_Index|Advanced Python index]]
- [[_Index|Vault index]]
