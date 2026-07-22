---
type: "file-index"
domain: "python"
file: "filesystem"
title: "Filesystem & Paths"
tags:
  - "python"
  - "python/filesystem"
  - "index"
---

# Filesystem & Paths

> 15 entries across 3 sections.

## pathlib — Modern Path Handling · 5

- [[Sections/filesystem/pathlib/path-basics|Path()]] — Decompose paths into components: .name, .stem, .suffix, .parent, .parts
- [[Sections/filesystem/pathlib/path-operations|.exists(), .is_file(), .is_dir(), .mkdir(), .rename(), .unlink()]] — Check existence, type, create, rename, and delete paths
- [[Sections/filesystem/pathlib/path-glob|.glob(), .rglob()]] — Find files matching patterns: wildcards, **, recursive search
- [[Sections/filesystem/pathlib/path-read-write|Path.read_text(), Path.write_text(), Path.read_bytes(), Path.write_bytes()]] — Read and write entire file contents in one call
- [[Sections/filesystem/pathlib/path-joinpath|/ operator, .joinpath(), .resolve()]] — Combine paths, resolve to absolute paths

## File I/O — Reading & Writing · 5

- [[Sections/filesystem/file-io/open-modes|open()]] — File modes: r, w, a, rb, wb, context manager, encoding
- [[Sections/filesystem/file-io/file-read-methods|.read(), .readline(), .readlines(), iteration]] — Methods to read file contents: entire file, single line, all lines, streaming
- [[Sections/filesystem/file-io/file-write-methods|.write(), .writelines(), flushing, buffering]] — Write strings and lists to files; control buffering and flushing
- [[Sections/filesystem/file-io/csv-module|csv.reader(), csv.writer(), csv.DictReader(), csv.DictWriter()]] — Parse and write CSV files using dictionaries and lists
- [[Sections/filesystem/file-io/json-module-fs|json.load(), json.dump(), json.loads(), json.dumps(), indent=]] — Parse and serialize JSON; pretty-print with indent parameter

## OS & shutil — System Operations · 5

- [[Sections/filesystem/os-shutil/os-path|os.path.join(), os.path.exists(), os.getcwd(), os.listdir(), os.environ]] — Legacy path operations, directory listing, environment variables
- [[Sections/filesystem/os-shutil/shutil-copy|shutil.copy(), shutil.copy2(), shutil.copytree(), shutil.rmtree()]] — Copy files and directories recursively; remove directory trees
- [[Sections/filesystem/os-shutil/shutil-move-archive|shutil.move(), shutil.make_archive(), shutil.unpack_archive()]] — Move/rename paths; create and extract archives (zip, tar, etc.)
- [[Sections/filesystem/os-shutil/tempfile|tempfile.NamedTemporaryFile(), tempfile.TemporaryDirectory(), mkdtemp()]] — Create temporary files and directories that auto-clean
- [[Sections/filesystem/os-shutil/glob-fnmatch|glob.glob(), glob.iglob(), fnmatch.fnmatch()]] — Pattern matching for filenames and paths; glob expansion
