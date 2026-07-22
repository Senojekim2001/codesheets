---
type: "entry"
domain: "python"
file: "core"
section: "stdlib"
id: "json-module"
title: "json module"
category: "Standard Library"
subtitle: "loads/dumps for strings, load/dump for files"
signature_short: "json.dumps(obj, indent=2) | json.loads(string) | json.load(file)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "json module"
  - "json-module"
tags:
  - "python"
  - "python/core"
  - "python/core/stdlib"
  - "category/standard-library"
  - "tier/tiered"
---

# json module

> loads/dumps for strings, load/dump for files

## Overview

The json module converts between Python dicts/lists and JSON strings. dumps() serializes to a string; loads() parses a string. dump()/load() work with file objects. Only basic Python types are supported — custom objects need a custom encoder.

## Signature

```python
json.dumps(obj, indent=2) | json.loads(string) | json.load(file)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - dumps/loads for strings, dump/load for files; indent=2 for human, default for compact wire format.
# STRENGTHS - Stdlib; covers 99% of JSON I/O.
# WEAKNESSES- Only str/int/float/bool/None/list/dict are serializable by default.
import json

data = {"name": "Alice", "age": 30}
s = json.dumps(data)                          # '{"name": "Alice", "age": 30}'
s = json.dumps(data, indent=2)                # pretty
back = json.loads(s)                          # {"name": "Alice", "age": 30}

with open("data.json", "w") as f:
    json.dump(data, f, indent=2)
with open("data.json") as f:
    obj = json.load(f)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - default= callable for non-serializable types (datetime, Path, Decimal); ensure_ascii=False for Unicode; loads + JSONDecodeError for untrusted input.
# STRENGTHS - One default= function handles every odd type; ensure_ascii=False keeps non-ASCII readable.
# WEAKNESSES- json doesn't preserve type info on round-trip; datetime -> str -> str (unless you parse).
import json
from datetime import datetime, date
from pathlib import Path
from decimal import Decimal

def default(o):
    if isinstance(o, (datetime, date)): return o.isoformat()
    if isinstance(o, Path):              return str(o)
    if isinstance(o, Decimal):           return str(o)         # keep precision
    raise TypeError(f"unencodable {type(o).__name__}")

s = json.dumps({"ts": datetime.now(), "amount": Decimal("9.99")},
               default=default, ensure_ascii=False)

# Robust parsing of untrusted input.
try:
    obj = json.loads(raw)
except json.JSONDecodeError as e:
    print(f"bad JSON at line {e.lineno} col {e.colno}: {e.msg}")
    obj = None
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - msgspec/orjson for hot paths, ijson for streaming, parse_float=Decimal for money, atomic write.
# STRENGTHS - 10-50x faster JSON; type-safe deserialization; no precision loss on monetary values.
# WEAKNESSES- orjson dumps bytes (you must .decode() for str APIs); msgspec requires schema definition.
from __future__ import annotations
import json
import os
from decimal import Decimal
from pathlib import Path

def parse_money(raw: str) -> dict:
    # parse_float=Decimal -- keep monetary precision.
    return json.loads(raw, parse_float=Decimal)

def atomic_write_json(path: Path, obj, **kw) -> None:
    """Write JSON crash-safely: tmp + fsync + rename."""
    tmp = path.with_suffix(path.suffix + ".tmp")
    with tmp.open("w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, **kw)
        f.flush(); os.fsync(f.fileno())
    os.replace(tmp, path)

def stream_array(path: Path):
    """Iterate over a huge JSON array without loading it all."""
    import ijson
    with path.open("rb") as f:
        yield from ijson.items(f, "item")

# Decision rule:
#   small payload, stdlib only         -> json.dumps / json.loads
#   non-serializable types             -> default= callable, OR custom JSONEncoder
#   monetary / scientific precision    -> parse_float=Decimal on the way in
#   hot path (>10MB/s)                 -> orjson (3-10x faster) or msgspec (50x with schema)
#   huge file (won't fit in memory)    -> ijson; iterate items
#   write a config file safely          -> atomic_write_json (tmp + fsync + replace)
#   schema validation                  -> pydantic / msgspec (NOT json+isinstance towers)
#
# Anti-pattern: str(some_dict) for "JSON". Single quotes, None instead of null,
# True/False instead of true/false. Always json.dumps.
```

## Decision Rule

```text
small payload, stdlib only         -> json.dumps / json.loads
non-serializable types             -> default= callable, OR custom JSONEncoder
monetary / scientific precision    -> parse_float=Decimal on the way in
hot path (>10MB/s)                 -> orjson (3-10x faster) or msgspec (50x with schema)
huge file (won't fit in memory)    -> ijson; iterate items
write a config file safely          -> atomic_write_json (tmp + fsync + replace)
schema validation                  -> pydantic / msgspec (NOT json+isinstance towers)
```

## Anti-Pattern

> [!warning] Anti-pattern
> str(some_dict) for "JSON". Single quotes, None instead of null,
> True/False instead of true/false. Always json.dumps.

## Tips

- `json.dumps(obj, indent=2)` is the standard for writing human-readable JSON config files
- JSON only supports str, int, float, bool, None, list, dict — everything else needs a custom encoder
- `json.loads()` raises `json.JSONDecodeError` on invalid JSON — wrap in try/except for untrusted input
- For large JSON files, use `ijson` for streaming parsing instead of loading everything at once

## Common Mistake

> [!warning] Using str(obj) to serialize a Python dict gives invalid JSON with single quotes. Always use json.dumps() to produce valid JSON output.

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

- [[Sections/core/stdlib/itertools|itertools (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/collections-deque|collections.deque (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/functools|functools (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/datetime|datetime module (Core Syntax & Built-ins)]]
- [[Sections/core/stdlib/_Index|Core Syntax & Built-ins → Standard Library]]
- [[Sections/core/_Index|Core Syntax & Built-ins index]]
- [[_Index|Vault index]]
