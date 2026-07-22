---
type: "entry"
domain: "python"
file: "filesystem"
section: "os-shutil"
id: "shutil-copy"
title: "shutil.copy(), shutil.copy2(), shutil.copytree(), shutil.rmtree()"
category: "File Operations"
subtitle: "Copy and remove files/dirs"
signature_short: "shutil.copy(src, dst), shutil.copy2(src, dst), shutil.copytree(src, dst), shutil.rmtree(path)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "shutil.copy(), shutil.copy2(), shutil.copytree(), shutil.rmtree()"
  - "shutil-copy"
tags:
  - "python"
  - "python/filesystem"
  - "python/filesystem/os-shutil"
  - "category/file-operations"
  - "tier/tiered"
---

# shutil.copy(), shutil.copy2(), shutil.copytree(), shutil.rmtree()

> Copy and remove files/dirs

## Overview

copy() duplicates file; copy2() preserves metadata. copytree() recursively copies directories. rmtree() removes entire directory trees.

## Signature

```python
shutil.copy(src, dst), shutil.copy2(src, dst), shutil.copytree(src, dst), shutil.rmtree(path)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Copy a file, copy a folder, delete a folder. The basics.
# STRENGTHS - One-liners; covers 80% of script-level file moving.
# WEAKNESSES- copy() loses metadata; rmtree() has no undo.
import shutil

# Copy a single file (overwrites if dst exists).
shutil.copy('source.txt', 'destination.txt')

# Copy + preserve mtime/permissions -- use this for backups.
shutil.copy2('source.txt', 'backup.txt')

# Recursively copy a directory tree.
shutil.copytree('src_dir', 'dst_dir')

# Remove a tree -- there is no recycle bin.
shutil.rmtree('unwanted_dir')
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - dirs_exist_ok for re-runs, ignore patterns to skip junk, onerror for forced delete.
# STRENGTHS - Idempotent copy; survives read-only files on Windows.
# WEAKNESSES- ignore_patterns is glob-only; for complex rules write a callable.
import os
import shutil
import stat

# Idempotent recursive copy (Python 3.8+).
shutil.copytree(
    'src',
    'dst',
    dirs_exist_ok=True,
    ignore=shutil.ignore_patterns('*.tmp', '__pycache__', '.git', 'node_modules'),
)

# Custom ignore callable -- skip files larger than 100MB.
def skip_huge(dirname, names):
    return [n for n in names
            if os.path.isfile(os.path.join(dirname, n))
            and os.path.getsize(os.path.join(dirname, n)) > 100 * 1024 * 1024]

shutil.copytree('archive', 'mirror', ignore=skip_huge, dirs_exist_ok=True)

# rmtree on Windows: read-only files raise PermissionError. onexc clears the bit.
def force_writable(func, path, exc):
    os.chmod(path, stat.S_IWRITE)
    func(path)

shutil.rmtree('build', onexc=force_writable)   # Python 3.12+; use onerror< 3.12

# Disk free check before a big copy.
total, used, free = shutil.disk_usage('.')
print(f'free: {free // (1<<30)} GiB')
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - shutil for trees, copyfileobj+sendfile for big files, atomic publish, hash-verify.
# STRENGTHS - sendfile() is zero-copy on Linux; atomic publish never leaves a torn file visible.
# WEAKNESSES- shutil.copytree is single-threaded; for 100k+ files use rsync or a parallel walker.
import hashlib
import os
import shutil
import tempfile
from pathlib import Path

def copy_atomic(src: Path, dst: Path, *, verify: bool = True) -> None:
    """
    Copy src -> dst so that readers never see a half-written dst.
    Strategy: write to temp on the SAME filesystem as dst, fsync, rename.
    """
    dst.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=dst.parent, prefix='.tmp.', suffix=dst.suffix)
    try:
        with os.fdopen(fd, 'wb') as wf, src.open('rb') as rf:
            # copyfileobj uses os.sendfile on Linux when possible -- zero-copy.
            shutil.copyfileobj(rf, wf, length=1024 * 1024)
            wf.flush()
            os.fsync(wf.fileno())                     # data hits disk
        shutil.copystat(src, tmp, follow_symlinks=False)
        os.replace(tmp, dst)                          # atomic on POSIX & NTFS
    except BaseException:
        Path(tmp).unlink(missing_ok=True)
        raise

    if verify and _sha256(src) != _sha256(dst):
        dst.unlink(missing_ok=True)
        raise IOError(f'hash mismatch after copy: {src} -> {dst}')

def _sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()

def safe_rmtree(target: Path, sandbox: Path) -> None:
    """rmtree with a tripwire: target must live INSIDE sandbox."""
    target = target.resolve()
    sandbox = sandbox.resolve()
    if not target.is_relative_to(sandbox):           # 3.9+
        raise ValueError(f'refusing to delete outside sandbox: {target}')
    shutil.rmtree(target, ignore_errors=False)

# Decision rule:
#   single small file                    -> shutil.copy2 (preserves metadata)
#   directory tree, re-runnable          -> copytree(..., dirs_exist_ok=True)
#   publishing a build artifact          -> copy_atomic (tmp + fsync + replace)
#   100k+ files or remote                -> rsync / cloud SDK, NOT shutil
#   destructive delete on user input     -> safe_rmtree with sandbox check
#
# Anti-pattern: shutil.rmtree(user_input) without a sandbox guard.
# A relative '..' or absolute '/' wipes the wrong tree -- there is no undo.
```

## Decision Rule

```text
single small file                    -> shutil.copy2 (preserves metadata)
directory tree, re-runnable          -> copytree(..., dirs_exist_ok=True)
publishing a build artifact          -> copy_atomic (tmp + fsync + replace)
100k+ files or remote                -> rsync / cloud SDK, NOT shutil
destructive delete on user input     -> safe_rmtree with sandbox check
```

## Anti-Pattern

> [!warning] Anti-pattern
> shutil.rmtree(user_input) without a sandbox guard.
> A relative '..' or absolute '/' wipes the wrong tree -- there is no undo.

## Tips

- copy2() better for backups; preserves modification time and permissions
- copytree() fails if destination exists; use dirs_exist_ok=True in Python 3.8+
- rmtree() is dangerous; ensure you specify correct path

## Common Mistake

> [!warning] Using os.remove() for directories; use shutil.rmtree() instead

## Shorthand (Junior → Senior)

**Junior:**
```python
import os
import shutil
src = 'old_project'
dst = 'old_project_backup'
shutil.copytree(src, dst)
shutil.rmtree(src)
```

**Senior:**
```python
import shutil
shutil.copytree('old_project', 'old_project_backup')
shutil.rmtree('old_project')
```

## See Also

- [[Sections/filesystem/os-shutil/shutil-move-archive|shutil.move(), shutil.make_archive(), shutil.unpack_archive() (Filesystem & Paths)]]
- [[Sections/filesystem/os-shutil/_Index|Filesystem & Paths → OS & shutil — System Operations]]
- [[Sections/filesystem/_Index|Filesystem & Paths index]]
- [[_Index|Vault index]]
