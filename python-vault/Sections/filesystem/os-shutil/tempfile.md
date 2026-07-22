---
type: "entry"
domain: "python"
file: "filesystem"
section: "os-shutil"
id: "tempfile"
title: "tempfile.NamedTemporaryFile(), tempfile.TemporaryDirectory(), mkdtemp()"
category: "Temporary Files"
subtitle: "Safe temporary storage"
signature_short: "NamedTemporaryFile(mode=\"w+b\", delete=True), TemporaryDirectory(), mkdtemp(suffix=\"\", prefix=\"tmp\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "tempfile.NamedTemporaryFile(), tempfile.TemporaryDirectory(), mkdtemp()"
  - "tempfile"
tags:
  - "python"
  - "python/filesystem"
  - "python/filesystem/os-shutil"
  - "category/temporary-files"
  - "tier/tiered"
---

# tempfile.NamedTemporaryFile(), tempfile.TemporaryDirectory(), mkdtemp()

> Safe temporary storage

## Overview

NamedTemporaryFile and TemporaryDirectory auto-delete when closed/exited. Use with statement for safety. mkdtemp() returns path (manual cleanup).

## Signature

```python
NamedTemporaryFile(mode="w+b", delete=True), TemporaryDirectory(), mkdtemp(suffix="", prefix="tmp")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Use 'with' for tempfiles so they auto-delete; never juggle paths in /tmp by hand.
# STRENGTHS - No leftover litter; safe in test suites that run thousands of times.
# WEAKNESSES- delete=True closes the handle on context exit; can't reopen on Windows mid-block.
import tempfile
from pathlib import Path

# Auto-deleting file.
with tempfile.NamedTemporaryFile(mode='w+', delete=True) as f:
    f.write('hello')
    f.seek(0)
    print(f.read())              # 'hello'
# File is gone here.

# Auto-deleting directory.
with tempfile.TemporaryDirectory() as tmp:
    p = Path(tmp) / 'data.txt'
    p.write_text('payload')
    print(p.read_text())
# Whole tree is gone here.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - delete=False for Windows reopen, NamedTemporaryFile for fixtures, mkstemp for raw FDs.
# STRENGTHS - Plays nicely with subprocess that needs a real filename you can pass twice.
# WEAKNESSES- delete=False means you own cleanup; one missed exception leaks files into /tmp.
import os
import subprocess
import tempfile
from pathlib import Path

# Windows: a NamedTemporaryFile cannot be opened a second time while the first
# handle is alive. delete=False + manual unlink is the workaround.
tmp = tempfile.NamedTemporaryFile('w', suffix='.json', delete=False)
try:
    tmp.write('{"k": 1}')
    tmp.close()                                    # release the handle
    subprocess.run(['cat', tmp.name], check=True)  # second opener works now
finally:
    os.unlink(tmp.name)

# mkstemp returns (fd, path) -- low-level, but no race window.
fd, path = tempfile.mkstemp(prefix='app_', suffix='.tmp')
try:
    with os.fdopen(fd, 'w') as f:
        f.write('atomic write target')
finally:
    os.unlink(path)

# Pin tempdir into a known location (e.g., per-test isolation).
with tempfile.TemporaryDirectory(prefix='test_', dir='./.cache') as tmp:
    workspace = Path(tmp)
    (workspace / 'sub').mkdir()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - tempdir for sandboxes, mkstemp for atomic-write recipe, TMPDIR honored on cloud.
# STRENGTHS - Crash-safe writes; tests that can't pollute the repo; container-friendly.
# WEAKNESSES- /tmp may be tmpfs (RAM-backed) and small in containers -- size your data accordingly.
import os
import tempfile
from contextlib import contextmanager
from pathlib import Path

@contextmanager
def atomic_write(target: Path, mode: str = 'w', **kw):
    """
    Write to a temp file in target's directory, fsync, rename onto target.
    Readers either see the OLD bytes or the NEW bytes -- never partial.
    Crucial for config files, sqlite checkpoints, model weights.
    """
    target = Path(target)
    target.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=target.parent,
                               prefix=f'.{target.name}.',
                               suffix='.part')
    try:
        with os.fdopen(fd, mode, **kw) as f:
            yield f
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, target)                  # atomic on same FS
    except BaseException:
        try: os.unlink(tmp)
        except FileNotFoundError: pass
        raise

@contextmanager
def working_sandbox(prefix: str = 'job_'):
    """
    Isolated dir for a unit of work. Honors $TMPDIR (containers, k8s emptyDir).
    Cleans up on exit even if caller raises.
    """
    base = os.environ.get('TMPDIR') or tempfile.gettempdir()
    with tempfile.TemporaryDirectory(prefix=prefix, dir=base) as d:
        yield Path(d)

# Usage: write a JSON config so a partial write never corrupts the live file.
with atomic_write(Path('/etc/myapp/config.json')) as f:
    f.write('{"version": 7}')

with working_sandbox('etl_') as work:
    (work / 'in.csv').write_text('a,b\n1,2\n')
    # ... process in isolation, copy results out before the 'with' exits ...

# Decision rule:
#   need a path you'll pass to a subprocess        -> NamedTemporaryFile(delete=False)
#   need a sandboxed dir for a job/test            -> TemporaryDirectory()
#   atomic publish of a config / cache / weight    -> mkstemp in target dir + fsync + replace
#   want randomness w/o creating the file          -> mktemp() -- AVOID, race-prone
#
# Anti-pattern: tempfile.mktemp() (no 'k' missing -- the deprecated one).
# It only returns a name; another process can win the race and create that path
# before you do. Always use mkstemp() / NamedTemporaryFile / TemporaryDirectory.
```

## Decision Rule

```text
need a path you'll pass to a subprocess        -> NamedTemporaryFile(delete=False)
need a sandboxed dir for a job/test            -> TemporaryDirectory()
atomic publish of a config / cache / weight    -> mkstemp in target dir + fsync + replace
want randomness w/o creating the file          -> mktemp() -- AVOID, race-prone
```

## Anti-Pattern

> [!warning] Anti-pattern
> tempfile.mktemp() (no 'k' missing -- the deprecated one).
> It only returns a name; another process can win the race and create that path
> before you do. Always use mkstemp() / NamedTemporaryFile / TemporaryDirectory.

## Tips

- Always use with statement for NamedTemporaryFile and TemporaryDirectory
- delete=False in NamedTemporaryFile keeps file after closing (manual cleanup needed)
- mkdtemp() is lower-level; prefer TemporaryDirectory with with statement

## Common Mistake

> [!warning] Forgetting to clean up temporary files created with mkdtemp()

## Shorthand (Junior → Senior)

**Junior:**
```python
import tempfile
import os
import shutil
tmpdir = tempfile.mkdtemp()
# ... use tmpdir ...
shutil.rmtree(tmpdir)
```

**Senior:**
```python
import tempfile
with tempfile.TemporaryDirectory() as tmpdir:
    # ... use tmpdir ...
    pass  # Auto-cleaned
```

## See Also

- [[Sections/filesystem/os-shutil/_Index|Filesystem & Paths → OS & shutil — System Operations]]
- [[Sections/filesystem/_Index|Filesystem & Paths index]]
- [[_Index|Vault index]]
