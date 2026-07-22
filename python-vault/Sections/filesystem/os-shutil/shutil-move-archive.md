---
type: "entry"
domain: "python"
file: "filesystem"
section: "os-shutil"
id: "shutil-move-archive"
title: "shutil.move(), shutil.make_archive(), shutil.unpack_archive()"
category: "File Operations"
subtitle: "Move and archive operations"
signature_short: "shutil.move(src, dst), shutil.make_archive(base_name, format, root_dir), shutil.unpack_archive(filename, extract_dir)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "shutil.move(), shutil.make_archive(), shutil.unpack_archive()"
  - "shutil-move-archive"
tags:
  - "python"
  - "python/filesystem"
  - "python/filesystem/os-shutil"
  - "category/file-operations"
  - "tier/tiered"
---

# shutil.move(), shutil.make_archive(), shutil.unpack_archive()

> Move and archive operations

## Overview

move() renames or moves files/dirs (like mv command). make_archive() creates zip/tar files. unpack_archive() extracts them.

## Signature

```python
shutil.move(src, dst), shutil.make_archive(base_name, format, root_dir), shutil.unpack_archive(filename, extract_dir)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Rename, zip up a folder, unzip somewhere.
# STRENGTHS - One-liners; cross-platform; no install.
# WEAKNESSES- No progress reporting; archives held entirely in memory chains.
import shutil

# Rename / move (handles cross-filesystem moves -- os.rename does not).
shutil.move('old_name.txt', 'new_name.txt')

# Zip a folder into backup.zip.
shutil.make_archive('backup', 'zip', 'data')

# tar.gz it instead.
shutil.make_archive('backup', 'gztar', 'data')

# Extract -- format auto-detected from extension.
shutil.unpack_archive('backup.zip', 'extracted_data')
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Use zipfile/tarfile directly when you need control: filtering, member-by-member, security.
# STRENGTHS - Stream archives, list contents before extract, set compression level.
# WEAKNESSES- More boilerplate than make_archive; you own the loop.
import shutil
import tarfile
import zipfile
from pathlib import Path

# Move with explicit conflict handling.
src, dst = Path('report.pdf'), Path('archive/report.pdf')
if dst.exists():
    dst.unlink()                  # or rename to a backup
shutil.move(src, dst)

# Inspect a zip before extracting (avoid surprises).
with zipfile.ZipFile('upload.zip') as z:
    for info in z.infolist():
        print(info.filename, info.file_size)

# Build a zip with explicit compression.
with zipfile.ZipFile('out.zip', 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as z:
    for p in Path('data').rglob('*'):
        if p.is_file():
            z.write(p, arcname=p.relative_to('data'))

# Stream a tar.gz line by line for huge archives.
with tarfile.open('logs.tar.gz', 'r:gz') as tf:
    for member in tf:
        if member.name.endswith('.log') and member.size < 10_000_000:
            f = tf.extractfile(member)
            if f:
                first_line = f.readline()
                print(member.name, first_line[:80])
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Same-FS rename for atomicity, deterministic archives, tar filter for CVE-2007-4559.
# STRENGTHS - Reproducible builds (sorted, fixed mtime), safe extraction of untrusted archives.
# WEAKNESSES- Deterministic mode requires Python 3.9+ (zipfile) / 3.12+ (tarfile filter).
import os
import tarfile
import zipfile
from pathlib import Path

def atomic_rename(src: Path, dst: Path) -> None:
    """
    os.replace is atomic only on the SAME filesystem.
    For cross-FS moves, copy + fsync + replace + unlink source.
    """
    src, dst = Path(src), Path(dst)
    if src.stat().st_dev == dst.parent.stat().st_dev:
        os.replace(src, dst)
    else:
        # cross-FS -> shutil.move handles copy + delete, but we want fsync.
        import shutil
        tmp = dst.with_suffix(dst.suffix + '.part')
        shutil.copy2(src, tmp)
        with open(tmp, 'rb') as f:
            os.fsync(f.fileno())
        os.replace(tmp, dst)
        src.unlink()

def deterministic_zip(out_path: Path, root: Path) -> None:
    """
    Build a zip whose bytes are identical for the same input -- useful for
    cache keys, supply-chain attestations, build reproducibility.
    """
    files = sorted(p for p in root.rglob('*') if p.is_file())
    with zipfile.ZipFile(out_path, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for p in files:
            info = zipfile.ZipInfo(filename=str(p.relative_to(root)),
                                   date_time=(1980, 1, 1, 0, 0, 0))
            info.external_attr = 0o644 << 16
            with p.open('rb') as f:
                z.writestr(info, f.read())

def safe_extract_tar(archive: Path, dest: Path) -> None:
    """
    CVE-2007-4559: tar can write outside dest via '../' or absolute paths.
    Python 3.12 added a 'data' filter; older code must validate manually.
    """
    dest = dest.resolve()
    with tarfile.open(archive) as tf:
        if hasattr(tarfile, 'data_filter'):           # 3.12+
            tf.extractall(dest, filter='data')
            return
        for m in tf.getmembers():
            target = (dest / m.name).resolve()
            if not target.is_relative_to(dest):
                raise ValueError(f'unsafe path in archive: {m.name}')
        tf.extractall(dest)

# Decision rule:
#   quick move on same FS                 -> os.replace (atomic)
#   move across FS / unknown              -> shutil.move
#   zip a directory, one shot             -> shutil.make_archive
#   reproducible / deterministic archive  -> zipfile.ZipInfo with fixed mtime
#   extracting an UNTRUSTED archive       -> tarfile filter='data' or manual path check
#
# Anti-pattern: tarfile.extractall(untrusted) without filter or path validation.
# A malicious tarball with '../../etc/cron.d/x' will plant a cron job in /etc.
```

## Decision Rule

```text
quick move on same FS                 -> os.replace (atomic)
move across FS / unknown              -> shutil.move
zip a directory, one shot             -> shutil.make_archive
reproducible / deterministic archive  -> zipfile.ZipInfo with fixed mtime
extracting an UNTRUSTED archive       -> tarfile filter='data' or manual path check
```

## Anti-Pattern

> [!warning] Anti-pattern
> tarfile.extractall(untrusted) without filter or path validation.
> A malicious tarball with '../../etc/cron.d/x' will plant a cron job in /etc.

## Tips

- move() auto-detects file vs directory; works across filesystems
- Supported formats: zip, tar, gztar, bztar, xztar
- unpack_archive() auto-detects format from filename

## Common Mistake

> [!warning] Using os.rename() across filesystems; use shutil.move() instead

## Shorthand (Junior → Senior)

**Junior:**
```python
import shutil
import os
src = 'project'
backup = 'project_backup'
os.rename(src, backup)
shutil.make_archive(backup, 'zip', '.', src)
```

**Senior:**
```python
import shutil
shutil.make_archive('project_backup', 'zip', 'project')
```

## See Also

- [[Sections/filesystem/os-shutil/shutil-copy|shutil.copy(), shutil.copy2(), shutil.copytree(), shutil.rmtree() (Filesystem & Paths)]]
- [[Sections/filesystem/os-shutil/_Index|Filesystem & Paths → OS & shutil — System Operations]]
- [[Sections/filesystem/_Index|Filesystem & Paths index]]
- [[_Index|Vault index]]
