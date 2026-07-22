---
type: "entry"
domain: "python"
file: "core"
section: "stdlib"
id: "collections-counter-deque"
title: "collections (Counter, defaultdict, deque, namedtuple)"
category: "Data Structures"
subtitle: "Efficient alternatives to dict and list for specific use cases"
signature_short: "from collections import Counter, defaultdict, deque, namedtuple"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "collections (Counter, defaultdict, deque, namedtuple)"
  - "collections-counter-deque"
tags:
  - "python"
  - "python/core"
  - "python/core/stdlib"
  - "category/data-structures"
  - "tier/tiered"
---

# collections (Counter, defaultdict, deque, namedtuple)

> Efficient alternatives to dict and list for specific use cases

## Overview

collections module provides optimized data structures. Counter counts occurrences, defaultdict avoids KeyError, deque is a fast double-ended queue, namedtuple creates lightweight tuple subclasses with named fields.

## Signature

```python
from collections import Counter, defaultdict, deque, namedtuple
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Counter for histograms; defaultdict to skip "if key in dict"; deque for queues; namedtuple for tuple-with-fields.
# STRENGTHS - Each replaces a 5-line idiom with one call.
# WEAKNESSES- See the earlier 'collections-deque' entry for deque-specific patterns.
from collections import Counter, defaultdict, deque, namedtuple

Counter("abracadabra").most_common(2)         # [('a', 5), ('b', 2)]

groups = defaultdict(list)
for w in "the quick brown fox".split():
    groups[len(w)].append(w)                   # no KeyError
# {3: ['the', 'fox'], 5: ['quick', 'brown']}

Point = namedtuple("Point", ["x", "y"])
p = Point(1, 2)
p.x, p.y                                       # 1, 2 — also tuple-indexable
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Counter arithmetic for set ops; defaultdict(int) for counting; namedtuple._replace for immutable updates; ChainMap for layered configs.
# STRENGTHS - Counter + - & | are perfect for diffing inventories; ChainMap stacks dict-like contexts.
# WEAKNESSES- For richer typed records, prefer @dataclass over namedtuple; for typed Counter use dict[K,int].
from collections import Counter, defaultdict, namedtuple, ChainMap

# Counter arithmetic — like multiset algebra.
inv  = Counter(apples=10, oranges=5)
sold = Counter(apples=3, oranges=1)
remaining = inv - sold                         # {'apples': 7, 'oranges': 4}

# Group-by pattern via defaultdict(list).
people = [("eng", "Ada"), ("ops", "Tim"), ("eng", "Bob")]
by_team = defaultdict(list)
for team, name in people: by_team[team].append(name)

# namedtuple + defaults + immutable update.
Color = namedtuple("Color", "r g b", defaults=(0, 0, 0))
red = Color(255).copy() if hasattr(Color(255), "copy") else Color(255)._replace(r=255)
darker = red._replace(r=red.r // 2)

# ChainMap: layered lookups, no merge cost.
defaults = {"host": "localhost", "port": 80}
overrides = {"port": 8080}
cfg = ChainMap(overrides, defaults)            # overrides win; falls back to defaults
print(cfg["port"], cfg["host"])
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - For deque deep dive see the earlier 'collections-deque' entry; for typed records prefer @dataclass over namedtuple in new code; OrderedDict is mostly redundant in 3.7+.
# STRENGTHS - Match the data shape to the problem: counter for frequency, defaultdict for grouping, ChainMap for layered config, dataclass for typed records.
# WEAKNESSES- defaultdict's factory is implicit — readers often miss the default; consider passing default_factory= explicitly when reviewing.
from __future__ import annotations
from collections import Counter, defaultdict, ChainMap
from dataclasses import dataclass

# Counter: top-K, total volume, ratio analysis.
def top_k_with_share(events: list[str], k: int) -> list[tuple[str, int, float]]:
    c = Counter(events)
    total = sum(c.values()) or 1
    return [(k_, n, n / total) for k_, n in c.most_common(k)]

# defaultdict(set) for membership graphs.
edges = [("a", "b"), ("a", "c"), ("b", "c")]
adj: dict[str, set[str]] = defaultdict(set)
for u, v in edges: adj[u].add(v)

# ChainMap for layered config (env > file > defaults).
import os
defaults = {"timeout": 30, "host": "localhost"}
file_cfg = {"host": "prod.example.com"}
env_cfg  = {k.removeprefix("APP_").lower(): v
            for k, v in os.environ.items() if k.startswith("APP_")}
config = ChainMap(env_cfg, file_cfg, defaults)

# In NEW code, prefer @dataclass over namedtuple for typed records.
@dataclass(frozen=True, slots=True)
class Point:
    x: float; y: float

# Decision rule:
#   counting / frequency / multiset arithmetic    -> Counter
#   group-by / "dict of lists or sets"            -> defaultdict(list / set)
#   FIFO queue / sliding window                    -> deque (see earlier entry)
#   layered lookup (env > file > defaults)        -> ChainMap (no copying)
#   simple typed record, immutable                -> @dataclass(frozen=True, slots=True) (preferred)
#                                                    OR typing.NamedTuple (typed namedtuple)
#   ordered dict                                   -> regular dict (insertion order is guaranteed since 3.7)
#
# Anti-pattern: writing your own counter via 'if k in d: d[k] += 1 else: d[k] = 1'.
# Counter or defaultdict(int) makes the intent clear AND is faster.
```

## Decision Rule

```text
counting / frequency / multiset arithmetic    -> Counter
group-by / "dict of lists or sets"            -> defaultdict(list / set)
FIFO queue / sliding window                    -> deque (see earlier entry)
layered lookup (env > file > defaults)        -> ChainMap (no copying)
simple typed record, immutable                -> @dataclass(frozen=True, slots=True) (preferred)
                                                 OR typing.NamedTuple (typed namedtuple)
ordered dict                                   -> regular dict (insertion order is guaranteed since 3.7)
```

## Anti-Pattern

> [!warning] Anti-pattern
> writing your own counter via 'if k in d: d[k] += 1 else: d[k] = 1'.
> Counter or defaultdict(int) makes the intent clear AND is faster.

## Tips

- Counter most_common(n) returns top N items — efficient for finding most frequent
- defaultdict avoids try/except or .get() for missing keys — cleaner code
- deque with maxlen auto-evicts oldest when full — perfect for sliding windows
- namedtuple lightweight than dataclass, no methods — use for simple data containers

## Common Mistake

> [!warning] Using regular dict when defaultdict would simplify code. defaultdict eliminates if key in dict checks.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = []
for x in items:
    if x > 0:
        result.append(x)
```

**Senior:**
```python
result = [x for x in items if x > 0]
```

## See Also

- [[Sections/core/stdlib/_Index|Core Syntax & Built-ins → Standard Library]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]
