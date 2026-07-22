---
type: "entry"
domain: "python"
file: "debugging-profiling"
section: "memory-profiling"
id: "gc-debugging"
title: "gc / weakref — diagnose reference cycles and stuck objects"
category: "Memory Profilers"
subtitle: "gc.collect, gc.get_referrers, gc.get_objects, gc.set_debug, weakref.ref / WeakValueDictionary, objgraph.show_backrefs, gc.disable"
signature_short: "gc.collect(); refs = gc.get_referrers(obj)   # who is still holding it?"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "gc / weakref — diagnose reference cycles and stuck objects"
  - "gc-debugging"
tags:
  - "python"
  - "python/debugging-profiling"
  - "python/debugging-profiling/memory-profiling"
  - "category/memory-profilers"
  - "tier/tiered"
---

# gc / weakref — diagnose reference cycles and stuck objects

> gc.collect, gc.get_referrers, gc.get_objects, gc.set_debug, weakref.ref / WeakValueDictionary, objgraph.show_backrefs, gc.disable

## Overview

Sometimes the leak isn't "we allocate too much" — it's "we allocate the right amount but never free". Python's reference-counted GC frees objects as soon as their refcount hits zero; the cycle collector runs periodically to break cycles. When an object outlives its expected scope, the cause is almost always (a) a cache, set, or dict still holding it, (b) a closure capturing self, (c) a __del__ that prevents collection, or (d) a circular reference between objects with non-trivial __del__. The three examples solve the SAME concrete task — an object you expected to be freed is still alive; find what's holding it — at three depths: gc.get_referrers + manual inspection → weakref.ref to confirm release + objgraph.show_backrefs visualization → production patterns (cache scoping, weak references, gc.disable for short workers, common cycle shapes).

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — An object you expected to be freed is still alive; find what's holding the reference.
- **Junior** — SAME — but verify with weakref that the object is actually freed once you fix the leak; visualize the reference graph when get_referrers output is too dense to read.
- **Senior** — SAME — production patterns: scoped caches, weakref-based registries, breaking cycles via __del__-free designs, tuning gc for short-lived workers.

## Signature

```python
gc.collect(); refs = gc.get_referrers(obj)   # who is still holding it?
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - An object you expected to be freed is still alive; find
#             what's holding the reference.
# APPROACH  - gc.collect() to drop any pending cycles; gc.get_referrers(obj)
#             returns the objects that still point at the target.
# STRENGTHS - Stdlib; immediate answer for "who is keeping X alive?"
# WEAKNESSES- Output is a list of Python objects — interpreting them takes
#             practice; for graphs, reach for objgraph (junior tier).
import gc

class BigThing:
    def __init__(self, n):
        self.payload = [0] * n

# A cache that "shouldn't" keep things alive but accidentally does.
CACHE = {}

def process(x: BigThing):
    CACHE[id(x)] = x                                  # OOPS — this strong-refs x
    return x.payload[0]

obj = BigThing(1_000_000)
process(obj)

# Drop the local reference. obj LOOKS like it can be freed.
del obj

# Force a GC cycle in case it's a cycle keeping it alive.
gc.collect()

# Find any BigThing objects still alive.
import sys
candidates = [o for o in gc.get_objects() if isinstance(o, BigThing)]
print(f"BigThing instances still alive: {len(candidates)}")     # 1

# Who's referring to it?
for c in candidates:
    refs = gc.get_referrers(c)
    print(f"  {len(refs)} referrers")
    for r in refs:
        print(f"    -> {type(r).__name__}: {repr(r)[:80]}")
# Output reveals: -> dict: {139... : <BigThing>}  <- the CACHE module-level dict
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but verify with weakref that the object is actually
#             freed once you fix the leak; visualize the reference graph
#             when get_referrers output is too dense to read.
# APPROACH  - weakref.ref(obj) returns a callable that yields obj if alive,
#             None if collected. objgraph.show_backrefs draws a PNG of
#             the reference graph rooted at obj.
# STRENGTHS - Definitive "is it freed?" probe; visualization makes ref
#             graphs comprehensible at a glance.
# WEAKNESSES- objgraph requires graphviz; show_backrefs(depth=N) blows
#             up combinatorially for high N.
import gc, weakref

class BigThing:
    def __init__(self, n): self.payload = [0] * n

CACHE = {}                                            # the bug from intro tier

def process(x: BigThing):
    CACHE[id(x)] = x
    return x.payload[0]

obj = BigThing(1_000_000)
process(obj)
ref = weakref.ref(obj)                                 # weak — won't keep obj alive
del obj
gc.collect()

if ref() is not None:
    print(f"LEAK: {ref()} is still alive after gc.collect()")

    # Visualize: pip install objgraph graphviz
    import objgraph
    target = ref()
    # Render a PNG showing what's keeping target alive (3 hops out).
    objgraph.show_backrefs([target], max_depth=3, filename="leak.png")
    # The PNG shows: target <- CACHE dict <- module globals.

# Fix: use WeakValueDictionary so the cache doesn't keep entries alive.
CACHE = weakref.WeakValueDictionary()                  # entries auto-vanish when value GC'd

obj = BigThing(1_000_000)
CACHE[id(obj)] = obj
ref = weakref.ref(obj)
del obj
gc.collect()
print(f"After fix: alive? {ref() is not None}")        # False — the value was GC'd

# Other useful gc tools:
gc.set_debug(gc.DEBUG_LEAK)                            # verbose collection logs
print(gc.garbage)                                      # objects collector couldn't free (cycles + __del__)
print(gc.get_count())                                  # (gen0, gen1, gen2) thresholds
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production patterns: scoped caches, weakref-based
#             registries, breaking cycles via __del__-free designs,
#             tuning gc for short-lived workers.
# APPROACH  - WeakValueDictionary for caches that should not extend life;
#             explicit cycle-breaking via setattr in __exit__; gc.disable
#             on short-lived child processes (huge CPU win); finalize via
#             weakref.finalize instead of __del__.
# STRENGTHS - Whole class of leaks structurally impossible; faster startup
#             on multiprocess workers; deterministic finalization.
# WEAKNESSES- Requires understanding the lifecycle of EVERY object in
#             the cache — easy to over-apply weak refs and hit "object
#             vanished mid-use" bugs.
import gc, weakref
from typing import Any

# 1) WeakValueDictionary — cache that does NOT extend object lifetime.
class IdentityCache:
    """Cache by id; entries vanish as soon as the referent is GC'd."""
    def __init__(self):
        self._d: weakref.WeakValueDictionary[int, Any] = weakref.WeakValueDictionary()

    def put(self, key: int, value: Any) -> None:
        self._d[key] = value                           # held weakly

    def get(self, key: int) -> Any | None:
        return self._d.get(key)                        # may return None — value GC'd

# 2) weakref.finalize — modern alternative to __del__, doesn't break cycles.
class TempFile:
    def __init__(self, path: str):
        self.path = path
        # Cleanup runs when self is collected; does NOT make the object
        # uncollectable (unlike __del__ on cycle members).
        self._finalizer = weakref.finalize(self, self._cleanup, path)

    @staticmethod
    def _cleanup(path: str) -> None:
        import os
        try: os.unlink(path)
        except FileNotFoundError: pass

# 3) Breaking a cycle explicitly in __exit__ — self.parent <-> self.child.
class Node:
    def __init__(self, parent: "Node | None" = None):
        self.parent = parent
        self.children: list["Node"] = []

    def __enter__(self): return self
    def __exit__(self, *_):
        # Without this, parent.children -> child -> parent forms a cycle.
        # Cycle collector handles it eventually, but breaking it explicitly
        # gives deterministic release.
        for c in self.children:
            c.parent = None
        self.children.clear()

# 4) gc.disable() for short-lived workers — measurable CPU win on
#    fork-and-exit workloads (gunicorn pre-fork, multiprocessing pool
#    workers running a single batch).
def short_worker(batch):
    gc.disable()                                       # we're going to exit; cycle collector is overhead
    try:
        return [process(x) for x in batch]
    finally:
        # On exit interpreter shuts down; no need to re-enable.
        pass

# 5) Find all instances of a class, anywhere — useful in tests + debug.
def all_instances(cls):
    return [o for o in gc.get_objects() if isinstance(o, cls)]

# 6) Catch leaks in a test — assert a class has no instances after teardown.
def assert_no_leaks(cls):
    gc.collect()
    leaks = all_instances(cls)
    assert not leaks, f"{cls.__name__}: {len(leaks)} instances leaked"

# Decision rule:
#   "what's holding obj alive?"            -> gc.get_referrers(obj) — quick triage
#   "is obj freed yet?"                    -> weakref.ref(obj); ref() returns None when freed
#   "draw the ref graph"                   -> objgraph.show_backrefs (needs graphviz)
#   cache that must NOT extend lifetime    -> WeakValueDictionary or WeakSet
#   cleanup hook on collection             -> weakref.finalize (NOT __del__)
#   __del__ + cycle = uncollectable        -> redesign without __del__; use finalize
#   short-lived child process              -> gc.disable() at start; saves cycle-collector CPU
#   leak detection in tests                -> assert all_instances(MyClass) == [] after teardown
#   uncollectable cycle ended in gc.garbage -> always means __del__ on a cycle member
#   high-frequency allocator               -> tune gc.set_threshold(...) — DON'T disable in long-running
#
# Anti-pattern: writing __del__ on objects that participate in cycles.
# When a cycle exists and any member has __del__, Python cannot decide a
# safe finalization order — the whole cycle goes into gc.garbage and is
# never freed. weakref.finalize achieves the same goal (run code on
# collection) without making the object uncollectable. New code should
# never write __del__; it's a footgun whose only legitimate use case
# (cleanup that can't be expressed via context managers) is now better
# served by finalize().
```

## Decision Rule

```text
"what's holding obj alive?"            -> gc.get_referrers(obj) — quick triage
"is obj freed yet?"                    -> weakref.ref(obj); ref() returns None when freed
"draw the ref graph"                   -> objgraph.show_backrefs (needs graphviz)
cache that must NOT extend lifetime    -> WeakValueDictionary or WeakSet
cleanup hook on collection             -> weakref.finalize (NOT __del__)
__del__ + cycle = uncollectable        -> redesign without __del__; use finalize
short-lived child process              -> gc.disable() at start; saves cycle-collector CPU
leak detection in tests                -> assert all_instances(MyClass) == [] after teardown
uncollectable cycle ended in gc.garbage -> always means __del__ on a cycle member
high-frequency allocator               -> tune gc.set_threshold(...) — DON'T disable in long-running
```

## Anti-Pattern

> [!warning] Anti-pattern
> writing __del__ on objects that participate in cycles.
> When a cycle exists and any member has __del__, Python cannot decide a
> safe finalization order — the whole cycle goes into gc.garbage and is
> never freed. weakref.finalize achieves the same goal (run code on
> collection) without making the object uncollectable. New code should
> never write __del__; it's a footgun whose only legitimate use case
> (cleanup that can't be expressed via context managers) is now better
> served by finalize().

## Tips

- gc.collect() before introspection — it forces the cycle collector to run, so anything that WAS garbage is gone, leaving only true holders in get_referrers().
- weakref.ref(obj) is the cleanest "is this freed?" probe. ref() returns the object if alive, None once it's collected. Pair with del + gc.collect() to verify a fix.
- WeakValueDictionary is the right cache type when you want "fast lookup, but don't keep the value alive". Any cache built with a regular dict extends every entry's lifetime to match the cache's lifetime — easy unintentional leak.
- Use weakref.finalize(obj, cleanup, *args) instead of __del__. finalize works on cycle members (whereas __del__ makes them uncollectable) and runs deterministically.
- For short-lived multiprocessing workers, gc.disable() at startup saves cycle-collection CPU you don't need (the process exits before generations matter). Don't do this in long-running services.
- gc.set_debug(gc.DEBUG_LEAK | gc.DEBUG_STATS) prints verbose collector logs to stderr. Useful for one-off investigation; way too noisy as a default.

## Common Mistake

> [!warning] Writing __del__ on objects that participate in cycles. Python cannot determine a safe finalization order for a cycle whose members have __del__, so the entire cycle is moved to gc.garbage and NEVER freed. The fix is structural: replace __del__ with weakref.finalize, which runs on collection without making the object uncollectable.

## Shorthand (Junior → Senior)

**Junior:**
```python
# __del__ + cycle = uncollectable forever
class Node:
    def __init__(self): self.children = []
    def __del__(self): print("freeing")   # blocks cycle collection
```

**Senior:**
```python
# weakref.finalize — cleanup that doesn't break GC
class Node:
    def __init__(self):
        self.children = []
        weakref.finalize(self, lambda: print("freeing"))
```

## See Also

- [[Sections/debugging-profiling/memory-profiling/tracemalloc-stdlib|tracemalloc — stdlib heap snapshot profiler (Debugging & Profiling)]]
- [[Sections/debugging-profiling/memory-profiling/memray-allocs|memray — production-grade allocation tracker with flame graphs (Debugging & Profiling)]]
- [[Sections/debugging-profiling/memory-profiling/_Index|Debugging & Profiling → Memory Profiling — tracemalloc, memray, gc]]
- [[Sections/debugging-profiling/_Index|Debugging & Profiling index]]
- [[_Index|Vault index]]
