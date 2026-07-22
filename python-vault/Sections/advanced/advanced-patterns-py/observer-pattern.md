---
type: "entry"
domain: "python"
file: "advanced"
section: "advanced-patterns-py"
id: "observer-pattern"
title: "Observer Pattern — Event System & Pub/Sub"
category: "Design Patterns"
subtitle: "Observer, event system, callbacks, weakref, publish-subscribe"
signature_short: "subject.subscribe(callback)  |  subject.notify()  |  weakref.WeakSet()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Observer Pattern — Event System & Pub/Sub"
  - "observer-pattern"
tags:
  - "python"
  - "python/advanced"
  - "python/advanced/advanced-patterns-py"
  - "category/design-patterns"
  - "tier/tiered"
---

# Observer Pattern — Event System & Pub/Sub

> Observer, event system, callbacks, weakref, publish-subscribe

## Overview

Observer pattern decouples event producers from consumers. Subjects maintain a list of observers and notify them of changes. Callbacks enable flexible observer registration. weakref prevents memory leaks when observers disappear. Use for: UI event handling, state changes, real-time updates, logging hooks.

## Signature

```python
subject.subscribe(callback)  |  subject.notify()  |  weakref.WeakSet()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Subject keeps a list of callbacks and calls them all
# STRENGTHS - Smallest pub/sub: one subject, two observers
# WEAKNESSES- No event types, no weakref, no error isolation
#
class Subject:
    def __init__(self):
        self._listeners = []
    def subscribe(self, cb): self._listeners.append(cb)
    def fire(self, event):
        for cb in self._listeners:
            cb(event)

s = Subject()
s.subscribe(lambda e: print("A:", e))
s.subscribe(lambda e: print("B:", e))
s.fire("ready")                                    # A: ready / B: ready
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Typed event bus with subscribe / publish + per-event-name routing
# STRENGTHS - The shape that scales past one event type
# WEAKNESSES- No weakref; observers leak if forgotten
#
from collections import defaultdict
from typing import Callable

class EventBus:
    def __init__(self):
        self._subs: dict[str, list[Callable]] = defaultdict(list)
    def on(self, event: str, cb: Callable):
        self._subs[event].append(cb)
    def off(self, event: str, cb: Callable):
        self._subs[event].remove(cb)
    def emit(self, event: str, **payload):
        for cb in list(self._subs.get(event, [])):  # COPY: safe vs unsubscribe in callback
            cb(**payload)

bus = EventBus()
bus.on("order.placed", lambda *, id, total: print("email:", id, total))
bus.on("order.placed", lambda *, id, total: print("push :", id))

bus.emit("order.placed", id="ORD-1", total=99.99)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - WeakSet for auto-cleanup, per-callback isolation, async observers
# STRENGTHS - The patterns that make pub/sub robust in real systems
# WEAKNESSES- N/A
#
import asyncio
import logging
import weakref
from collections import defaultdict
from typing import Callable, Awaitable

log = logging.getLogger(__name__)

# 1) WeakSet — observers garbage-collected when callers drop their refs
class WeakSubject:
    def __init__(self):
        # WeakSet works for METHODS only via WeakMethod; for plain functions use WeakSet
        self._cbs: weakref.WeakSet[Callable] = weakref.WeakSet()
    def subscribe(self, cb): self._cbs.add(cb)
    def fire(self, event):
        for cb in list(self._cbs):                  # snapshot
            try:
                cb(event)
            except Exception:
                log.exception("observer failed; continuing")    # ISOLATE failures

# 2) Bound method observers need WeakMethod wrappers (otherwise instance is pinned)
class _MethodObservers:
    def __init__(self):
        self._refs: list[weakref.WeakMethod] = []
    def add(self, method):
        self._refs.append(weakref.WeakMethod(method))
    def call(self, *a, **kw):
        alive = []
        for r in self._refs:
            if (m := r()) is not None:               # method's instance still alive
                try: m(*a, **kw)
                except Exception: log.exception("observer error")
                alive.append(r)
        self._refs = alive                            # purge dead refs

# 3) Async event bus — publish() awaits all handlers concurrently
class AsyncBus:
    def __init__(self):
        self._subs: dict[str, list[Callable[..., Awaitable]]] = defaultdict(list)
    def on(self, event, cb): self._subs[event].append(cb)
    async def emit(self, event, **payload):
        results = await asyncio.gather(
            *(cb(**payload) for cb in self._subs.get(event, [])),
            return_exceptions=True,
        )
        for r in results:
            if isinstance(r, Exception):
                log.error("async observer error: %s", r)

# 4) Don't roll your own when a real broker fits better
#    - cross-process / cross-host         -> Redis pub/sub, NATS, Kafka
#    - in-process, sync                    -> blinker, pyee
#    - in-process, async                   -> aiopubsub, or this AsyncBus

# Decision rule:
#   in-process, single subject              -> WeakSet + try/except per callback
#   many event TYPES                          -> EventBus (event -> [callbacks])
#   methods that should auto-unsubscribe      -> weakref.WeakMethod
#   async handlers                             -> AsyncBus + asyncio.gather
#   cross-process / multi-host                  -> external broker; not Python pubsub
#   need ordering / replay / persistence        -> Kafka or similar; observer pattern is in-memory
#
# Anti-pattern: storing observers in a plain list / set
#   Subscribed objects can't be garbage-collected because the list pins them.
#   Memory grows; callbacks fire on stale objects. Use WeakSet / WeakMethod, OR
#   require explicit unsubscribe() in a finalizer.
```

## Decision Rule

```text
in-process, single subject              -> WeakSet + try/except per callback
many event TYPES                          -> EventBus (event -> [callbacks])
methods that should auto-unsubscribe      -> weakref.WeakMethod
async handlers                             -> AsyncBus + asyncio.gather
cross-process / multi-host                  -> external broker; not Python pubsub
need ordering / replay / persistence        -> Kafka or similar; observer pattern is in-memory
```

## Anti-Pattern

> [!warning] Anti-pattern
> storing observers in a plain list / set
>   Subscribed objects can't be garbage-collected because the list pins them.
>   Memory grows; callbacks fire on stale objects. Use WeakSet / WeakMethod, OR
>   require explicit unsubscribe() in a finalizer.

## Tips

- Use WeakSet for observers to prevent memory leaks — when observers are deleted elsewhere, they automatically disappear from the set.
- Event buses decouple publishers and subscribers — services don't need to know about each other.
- Bound methods need `weakref.WeakMethod` (a plain WeakSet pins the underlying instance via the bound method); for async handlers, gather all callbacks with `asyncio.gather(..., return_exceptions=True)` so one failure doesn't kill the rest.
- Always wrap each callback in try/except inside the dispatch loop — without isolation, one bad observer raises and the rest never fire. Cross-process / multi-host? Drop the in-memory observer pattern and reach for an external broker (Kafka, NATS, Redis pub/sub).

## Common Mistake

> [!warning] Storing observers in a plain list/set with NO failure isolation — subscribed objects can't be garbage-collected because the list pins them, AND one raising callback aborts the dispatch loop so later observers never see the event. Use WeakSet/WeakMethod plus per-callback try/except.

## Shorthand (Junior → Senior)

**Junior:**
```python
class Subject:
    def __init__(self):
        self._observers = []

    def subscribe(self, callback):
        self._observers.append(callback)

    def notify(self, **data):
        for obs in self._observers:
            obs(**data)
```

**Senior:**
```python
from weakref import WeakSet

class Subject:
    def __init__(self):
        self._observers = WeakSet()

    def subscribe(self, callback):
        self._observers.add(callback)
```

## See Also

- [[Sections/advanced/advanced-patterns-py/singleton-pattern|Singleton Pattern — Global Unique Instance (Advanced Python)]]
- [[Sections/advanced/advanced-patterns-py/mixin-pattern|Mixin Pattern — Composable Behaviors (Advanced Python)]]
- [[Sections/advanced/advanced-patterns-py/_Index|Advanced Python → Advanced Patterns]]
- [[Sections/advanced/_Index|Advanced Python index]]
- [[_Index|Vault index]]
