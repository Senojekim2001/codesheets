---
type: "entry"
domain: "python"
file: "filesystem"
section: "file-io"
id: "json-module-fs"
title: "json.load(), json.dump(), json.loads(), json.dumps(), indent="
category: "Structured Data"
subtitle: "JSON file handling"
signature_short: "json.load(file), json.dump(obj, file), json.loads(str), json.dumps(obj), indent=N"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "json.load(), json.dump(), json.loads(), json.dumps(), indent="
  - "json-module-fs"
tags:
  - "python"
  - "python/filesystem"
  - "python/filesystem/file-io"
  - "category/structured-data"
  - "tier/tiered"
---

# json.load(), json.dump(), json.loads(), json.dumps(), indent=

> JSON file handling

## Overview

load/loads parse JSON; dump/dumps serialize to JSON. load/dump work with files; loads/dumps work with strings. indent parameter formats output for readability.

## Signature

```python
json.load(file), json.dump(obj, file), json.loads(str), json.dumps(obj), indent=N
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - load/dump for files; loads/dumps for strings
# STRENGTHS - The four functions you'll use 99% of the time
# WEAKNESSES- No custom encoder; no streaming
#
import json

# File <-> object
with open("config.json", "r", encoding="utf-8") as f:
    cfg = json.load(f)

with open("out.json", "w", encoding="utf-8") as f:
    json.dump(cfg, f, indent=2)                   # indent= for pretty output

# String <-> object
text = json.dumps({"a": 1}, indent=2)
print(json.loads(text)["a"])                      # 1
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - ensure_ascii=False, sort_keys, default= for unsupported types
# STRENGTHS - The four flags + the "default=" hook for stdlib types
# WEAKNESSES- No alternative libraries; no streaming
#
import json
from datetime import datetime, date
from decimal import Decimal

# 1) ensure_ascii=False — keep non-ASCII as actual characters, not "\uXXXX"
text = json.dumps({"name": "Café"}, ensure_ascii=False)
print(text)                                       # {"name": "Café"}

# 2) sort_keys=True — deterministic output (great for diffs / hashing)
print(json.dumps({"b": 2, "a": 1}, sort_keys=True))   # {"a": 1, "b": 2}

# 3) default= — handle types json doesn't know
def to_serializable(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, set):
        return sorted(obj)
    raise TypeError(f"Not serializable: {type(obj).__name__}")

text = json.dumps(
    {"when": datetime.now(), "amount": Decimal("9.99"), "tags": {"a", "b"}},
    default=to_serializable, ensure_ascii=False, indent=2,
)

# 4) Read NDJSON (newline-delimited JSON) — common log format; one obj per line
def read_ndjson(path):
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line: yield json.loads(line)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Custom encoder, streaming with ijson, atomic write, faster libs
# STRENGTHS - The patterns that handle JSON in production
# WEAKNESSES- N/A
#
import json
import os
import tempfile
from pathlib import Path
from datetime import datetime
from decimal import Decimal

# 1) JSONEncoder subclass — when you want to keep using json.dumps(... cls=...)
class AppEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime): return obj.isoformat()
        if isinstance(obj, Decimal):  return f"{obj}"   # string preserves precision
        if hasattr(obj, "to_dict"):   return obj.to_dict()
        return super().default(obj)                  # raises TypeError for unknown

text = json.dumps({"when": datetime.utcnow()}, cls=AppEncoder)

# 2) STREAM huge JSON — don't load 5 GB into memory.
#    json.load is all-or-nothing; ijson parses incrementally.
def stream_users(path: str):
    import ijson                                   # pip install ijson
    with open(path, "rb") as f:
        for user in ijson.items(f, "users.item"):
            yield user

# 3) ATOMIC write — same trick as text files, but for config/state JSON
def atomic_write_json(path: Path, obj, indent: int = 2):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=path.parent, prefix=".tmp-", suffix=".json")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(obj, f, ensure_ascii=False, indent=indent, sort_keys=True)
            f.flush(); os.fsync(f.fileno())
        os.replace(tmp, path)
    except Exception:
        Path(tmp).unlink(missing_ok=True)
        raise

# 4) FLOAT precision — json round-trips float64; Decimal becomes float by default
#    Use parse_float=Decimal to preserve precision on read
data = json.loads('{"price": 0.1}', parse_float=Decimal)

# 5) FASTER alternatives — when stdlib is too slow
#    orjson      Rust-backed; ~3x faster; returns bytes; supports datetime/Decimal natively
#    ujson       C-backed; ~2x faster; less strict
#    msgspec     fastest + schema-aware; struct-based
#
# import orjson
# orjson.dumps({"when": datetime.utcnow()}, option=orjson.OPT_INDENT_2)

# 6) JSON SCHEMA validation — for API payloads, prefer Pydantic over hand-rolled
#    json.load(f) gives you a dict; Pydantic gives you a typed, validated model.

# Decision rule:
#   stdlib types only                          -> json.dump / json.load
#   stdlib + datetime / Decimal                 -> default= or JSONEncoder subclass
#   millions of records, streaming               -> NDJSON (one obj per line) or ijson
#   schema validation needed                     -> Pydantic / msgspec
#   speed-critical hot path                      -> orjson or ujson
#   write that must survive a crash              -> atomic write + fsync + os.replace
#   preserve money / precision                   -> parse_float=Decimal on read
#
# Anti-pattern: trying to JSON-dump custom objects with no default= or encoder
#   TypeError: Object of type X is not JSON serializable. Either add a default=
#   callback, subclass JSONEncoder, or coerce to dict at the boundary (.to_dict()).
```

## Decision Rule

```text
stdlib types only                          -> json.dump / json.load
stdlib + datetime / Decimal                 -> default= or JSONEncoder subclass
millions of records, streaming               -> NDJSON (one obj per line) or ijson
schema validation needed                     -> Pydantic / msgspec
speed-critical hot path                      -> orjson or ujson
write that must survive a crash              -> atomic write + fsync + os.replace
preserve money / precision                   -> parse_float=Decimal on read
```

## Anti-Pattern

> [!warning] Anti-pattern
> trying to JSON-dump custom objects with no default= or encoder
>   TypeError: Object of type X is not JSON serializable. Either add a default=
>   callback, subclass JSONEncoder, or coerce to dict at the boundary (.to_dict()).

## Tips

- indent parameter improves readability but increases file size; use only for configs/debug output
- JSON supports: strings, numbers, bools, null, lists, dicts; custom types need JSONEncoder
- ensure_ascii=False preserves non-ASCII characters in output

## Common Mistake

> [!warning] Trying to JSON-serialize custom objects without JSONEncoder subclass

## Shorthand (Junior → Senior)

**Junior:**
```python
import json
with open('data.json', 'r') as f:
    json_str = f.read()
data = json.loads(json_str)
```

**Senior:**
```python
import json
with open('data.json', 'r') as f:
    data = json.load(f)
```

## See Also

- [[Sections/filesystem/file-io/csv-module|csv.reader(), csv.writer(), csv.DictReader(), csv.DictWriter() (Filesystem & Paths)]]
- [[Sections/filesystem/file-io/_Index|Filesystem & Paths → File I/O — Reading & Writing]]
- [[Sections/filesystem/_Index|Filesystem & Paths index]]
- [[_Index|Vault index]]
