---
type: "entry"
domain: "python"
file: "advanced"
section: "context-managers"
id: "generators-advanced"
title: "Advanced Generators & Itertools"
category: "Generators"
subtitle: "yield, yield from, itertools, generator expressions"
signature_short: "yield value  |  yield from iterable  |  itertools.chain, islice, groupby"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Advanced Generators & Itertools"
  - "generators-advanced"
tags:
  - "python"
  - "python/advanced"
  - "python/advanced/context-managers"
  - "category/generators"
  - "tier/tiered"
---

# Advanced Generators & Itertools

> yield, yield from, itertools, generator expressions

## Overview

Generators produce values lazily — only computing the next value when requested. This enables processing datasets larger than memory. Generator pipelines chain transformations without intermediate lists. yield from delegates to sub-generators. itertools provides optimized building blocks: chain, islice, groupby, product, combinations, accumulate. Generator expressions are inline generators.

## Signature

```python
yield value  |  yield from iterable  |  itertools.chain, islice, groupby
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One generator that yields N items lazily
# STRENGTHS - The minimum: yield, iterate, no intermediate list
# WEAKNESSES- No pipeline composition; no itertools
#
def squares(n):
    for i in range(n):
        yield i * i                                # produced ONE at a time

for s in squares(5):
    print(s)                                       # 0, 1, 4, 9, 16
# squares(1_000_000) uses constant memory; [i*i for i in range(1_000_000)] doesn't.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Generator pipeline + yield from + the itertools you'll use most
# STRENGTHS - The shape that turns "load everything" into streaming
# WEAKNESSES- No send/throw; no async generators
#
import itertools

# 1) Pipeline: each stage processes ONE row at a time -> constant memory
def read_lines(path):
    with open(path) as f:
        for line in f:
            yield line.rstrip()

def only_errors(lines):
    for line in lines:
        if "ERROR" in line: yield line

def parse(lines):
    for line in lines:
        ts, _, msg = line.partition(" ")
        yield {"ts": ts, "msg": msg}

# Compose lazily; islice limits consumption without loading everything
for entry in itertools.islice(parse(only_errors(read_lines("app.log"))), 10):
    print(entry)

# 2) yield from — delegate AND properly forward send/throw/close
def flatten(xs):
    for x in xs:
        if isinstance(x, (list, tuple)):
            yield from flatten(x)                  # recursive delegation
        else:
            yield x

# 3) itertools cookbook — the calls you'll reach for daily
itertools.chain([1, 2], [3, 4])                    # 1, 2, 3, 4
itertools.islice(big_iter(), 100)                  # first 100; no negative index
itertools.product([1, 2], ["a", "b"])              # cartesian
itertools.combinations([1, 2, 3, 4], 2)            # (1,2), (1,3), ...
itertools.accumulate([1, 2, 3, 4])                 # running total: 1, 3, 6, 10

# 4) groupby REQUIRES sorted-by-key input
rows = [{"k": "a", "v": 1}, {"k": "a", "v": 2}, {"k": "b", "v": 3}]
rows.sort(key=lambda r: r["k"])
for key, grp in itertools.groupby(rows, key=lambda r: r["k"]):
    print(key, list(grp))

def big_iter(): return iter([])
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - send/throw/close, async generators, batched, tee gotchas, itertools recipes
# STRENGTHS - The features that distinguish "iterator" from "coroutine-shaped pipeline"
# WEAKNESSES- N/A
#
import asyncio
import itertools
from collections import deque

# 1) Bidirectional generator — send() into the running generator, throw() to inject errors
def echo():
    while True:
        msg = yield                                # yield expression on the RIGHT
        print("got:", msg)

g = echo(); next(g)                                 # advance to the first yield
g.send("hello"); g.send("world")
g.close()                                           # raises GeneratorExit inside the gen

# 2) Async generator — yield from inside an 'async def'
async def aitems(rows):
    for row in rows:
        await asyncio.sleep(0)                     # cooperative yield
        yield row

async def consume():
    async for r in aitems([1, 2, 3]):
        await handle(r)

# 3) batched (3.12+) — chunk an iterable
# from itertools import batched
# list(batched(range(10), 3))                       # [(0,1,2), (3,4,5), (6,7,8), (9,)]
def batched(it, n):                                 # back-port for older Pythons
    it = iter(it)
    while batch := tuple(itertools.islice(it, n)):
        yield batch

# 4) itertools.tee — multiple consumers of one iterator (memory trap)
a, b = itertools.tee([1, 2, 3, 4, 5], 2)
# tee BUFFERS items consumed by one branch but not the other.
# If a is fully drained before b starts, ALL items are buffered. Pull both
# in lockstep, or use a list if it fits.

# 5) Generator expression vs list comp — pick by lifetime
sum(x*x for x in range(10**6))                      # streaming; constant memory
[x*x for x in range(10**6)]                         # materialized; ~8 MB list

# 6) Stop on first match (any/all short-circuit)
def has_error(lines):
    return any("ERROR" in ln for ln in lines)

# 7) Drain into a windowed view efficiently — collections.deque
def last_n(it, n):
    return list(deque(it, maxlen=n))                # O(n) memory regardless of input

# Decision rule:
#   stream items, constant memory          -> generator function (yield)
#   inline / one-liner                       -> generator expression
#   delegate to a sub-generator               -> yield from
#   send values into the gen                  -> generator + .send() + priming
#   bounded N from a huge iterator             -> itertools.islice
#   chunks of N                                  -> itertools.batched (3.12+)
#   running totals / pairwise / sliding         -> itertools.accumulate / pairwise
#   need to consume a stream twice              -> list it OR itertools.tee (carefully)
#
# Anti-pattern: list(huge_generator()) "just to be safe"
#   You've thrown away the generator's whole point. If you genuinely need all
#   items, fine; otherwise iterate, or use islice / sum / any / max directly.

async def handle(_): pass
```

## Decision Rule

```text
stream items, constant memory          -> generator function (yield)
inline / one-liner                       -> generator expression
delegate to a sub-generator               -> yield from
send values into the gen                  -> generator + .send() + priming
bounded N from a huge iterator             -> itertools.islice
chunks of N                                  -> itertools.batched (3.12+)
running totals / pairwise / sliding         -> itertools.accumulate / pairwise
need to consume a stream twice              -> list it OR itertools.tee (carefully)
```

## Anti-Pattern

> [!warning] Anti-pattern
> list(huge_generator()) "just to be safe"
>   You've thrown away the generator's whole point. If you genuinely need all
>   items, fine; otherwise iterate, or use islice / sum / any / max directly.

## Tips

- Generator pipelines process one item at a time — memory usage stays constant regardless of data size.
- yield from is more than syntactic sugar — it properly propagates .send(), .throw(), and .close().
- itertools.groupby requires SORTED input — group by key on unsorted data gives wrong results.
- Use generator expressions (x for x in ...) instead of list comprehensions when you only iterate once. For chunking use `itertools.batched` (3.12+); for sliding windows of the last N items, `collections.deque(it, maxlen=n)` keeps O(n) memory; `itertools.tee` BUFFERS items consumed by one branch but not the other — pull both in lockstep or it's a memory bomb.

## Common Mistake

> [!warning] Calling list() on a huge generator defeats the purpose — it loads everything into memory. Iterate lazily or use itertools.islice() to limit consumption.

## Shorthand (Junior → Senior)

**Junior:**
```python
def flatten(nested):
    for item in nested:
        if isinstance(item, (list, tuple)):
            for sub in flatten(item):
                yield sub
        else:
            yield item
```

**Senior:**
```python
def flatten(nested):
    for item in nested:
        if isinstance(item, (list, tuple)):
            yield from flatten(item)
        else:
            yield item
```

## See Also

- [[Sections/advanced/context-managers/_Index|Advanced Python → Context Managers & Generators]]
- [[Sections/advanced/_Index|Advanced Python index]]
- [[_Index|Vault index]]
