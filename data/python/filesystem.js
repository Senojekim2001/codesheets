export const meta = {
  "title": "File System & I/O",
  "domain": "python",
  "sheet": "filesystem",
  "icon": "📁"
}

export const sections = [

  // ── Section 1: pathlib — Modern Path Handling ─────────────────────────────────────────
  {
    id: "pathlib",
    title: "pathlib — Modern Path Handling",
    entries: [
      {
        id: "path-basics",
        fn: "Path()",
        desc: "Decompose paths into components: .name, .stem, .suffix, .parent, .parts",
        category: "Path Decomposition",
        subtitle: "Access path components",
        signature: "Path.name, .stem, .suffix, .parent, .parts",
        descLong: "Path objects let you extract individual components: .name (filename), .stem (filename without extension), .suffix (extension), .parent (parent directory), .parts (tuple of all components).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Path() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom pathlib import Path\np = Path(\"/home/user/documents/report.pdf\")\nprint(p.name)        # 'report.pdf'\nprint(p.stem)        # 'report'\nprint(p.suffix)      # '.pdf'\nprint(p.parent)      # PosixPath('/home/user/documents')"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Path() — common patterns you'll see in production.\n# APPROACH  - Combine Path() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom pathlib import Path\np = Path(\"/home/user/code/data/archive.tar.gz\")\nprint(p.parts)        # ('/', 'home', 'user', 'code', 'data', 'archive.tar.gz')\nprint(p.parents[0])   # PosixPath('/home/user/code/data')   parent\nprint(p.parents[2])   # PosixPath('/home/user')              grandparent's parent\nprint(p.anchor)       # '/'                                   root marker\n# 1) Multi-suffix files — .suffix is only the LAST extension\nprint(p.suffix)       # '.gz'\nprint(p.suffixes)     # ['.tar', '.gz']\nprint(p.stem)         # 'archive.tar'   <-- still has '.tar'!\n# 2) Derive new paths without re-typing\nprint(p.with_suffix(\".zip\"))    # archive.tar.zip\nprint(p.with_stem(\"backup\"))    # /home/user/code/data/backup.gz   (3.9+)\nprint(p.with_name(\"other.bin\")) # /home/user/code/data/other.bin\n# 3) Path is HASHABLE — usable as dict key, set member\nseen: set[Path] = set()\nseen.add(p)\nprint(p in seen)      # True"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Path() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom pathlib import Path, PurePath, PurePosixPath, PureWindowsPath\n# 1) absolute vs resolve\n#    .absolute()   -> joins with cwd, NO filesystem access, doesn't follow symlinks\n#    .resolve()    -> follows symlinks, validates path; raises (or strict=True only)\np = Path(\"./data/../config.json\")\nprint(p.absolute())                              # /cwd/data/../config.json (lexical)\nprint(p.resolve())                                # /cwd/config.json (canonical)\nprint(p.resolve(strict=True))                     # raises if path doesn't exist (3.6+)\n# 2) Multi-extension stripping — peel off ALL suffixes\ndef strip_all_suffixes(p: Path) -> Path:\n    while p.suffix:\n        p = p.with_suffix(\"\")\n    return p\nprint(strip_all_suffixes(Path(\"a.tar.gz\")))       # PosixPath('a')\n# 3) PurePath family — pure path manipulation WITHOUT filesystem access.\n#    Useful when you're parsing paths from data (logs, S3 keys) on the wrong OS.\nprint(PurePosixPath(\"/home/user\").name)           # works on Windows\nprint(PureWindowsPath(r\"C:\\Users\\Alice\").name)  # works on Linux\n# PurePath also lets you check inheritance: isinstance(p, PurePath)\n# 4) Equality and hashing — STRING comparison after normalization\n#    Path(\"a/b\") == Path(\"a/b\")                        # True\n#    Path(\"a/b\") == Path(\"./a/b\")                       # False  (strings differ)\n#    Use .resolve() on both sides for SAME-FILE checks  (or .samefile())\nPath(__file__).samefile(Path(__file__).resolve())  # True; follows symlinks\n# 5) Path-traversal SAFETY — reject \"..\" escapes\ndef safe_under(base: Path, candidate: Path) -> bool:\n    try:\n        candidate.resolve().relative_to(base.resolve())\n        return True\n    except ValueError:\n        return False                              # candidate escapes base\n# Decision rule:\n#   one-line filename / extension manipulation       -> .name / .stem / .suffix\n#   multi-suffix file (\"file.tar.gz\")                 -> .suffixes / loop with_suffix(\"\")\n#   modify part of a path                              -> with_name / with_stem / with_suffix\n#   parsing a foreign-OS path (Windows on Linux)      -> PureWindowsPath / PurePosixPath\n#   need filesystem-aware absolute path                -> .resolve(strict=True)\n#   need lexical-only absolute path                    -> .absolute()\n#   \"is this path inside that base\"                    -> resolve + relative_to in try/except\n#\n# Anti-pattern: comparing Path objects with str on either side\n#   Path(\"a\") == \"a\"  -> False (different types). Use Path(\"a\") == Path(\"a\"),\n#   or coerce with str(p) when interfacing with non-Path APIs."
                  }
        ],
        tips: [
                  ".stem removes only the last suffix; use .suffixes for multiple extensions",
                  ".parent is equivalent to str(p)[:-len(p.name)] but cleaner",
                  ".parts returns a tuple; iterate safely without string splits"
        ],
        mistake: "Mixing str operations with Path objects loses benefits; always use Path methods",
        shorthand: {
          verbose: "import os\npath_str = '/home/user/documents/report.pdf'\nname = os.path.basename(path_str)\nstem = os.path.splitext(name)[0]\nsuffix = os.path.splitext(path_str)[1]\nparent = os.path.dirname(path_str)",
          concise: "from pathlib import Path\np = Path('/home/user/documents/report.pdf')\nname, stem, suffix, parent = p.name, p.stem, p.suffix, p.parent",
        },
      },
      {
        id: "path-operations",
        fn: ".exists(), .is_file(), .is_dir(), .mkdir(), .rename(), .unlink()",
        desc: "Check existence, type, create, rename, and delete paths",
        category: "Path Operations",
        subtitle: "Modify filesystem",
        signature: ".exists() → bool, .is_file() → bool, .is_dir() → bool, .mkdir(parents=False, exist_ok=False), .rename(target), .unlink(missing_ok=False)",
        descLong: "Path methods handle filesystem operations: check if path exists, test type (file vs directory), create directories, rename paths, and delete files. Use exist_ok=True to avoid errors if directory already exists.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .exists(), .is_file(), .is_dir(), .mkdir(), .rename(), .unlink() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom pathlib import Path\nd = Path(\"workdir\")\nd.mkdir(parents=True, exist_ok=True)             # mkdir -p\nprint(d.is_dir())                                 # True\np = d / \"data.txt\"\np.write_text(\"hello\")\nprint(p.exists(), p.is_file())                    # True True\np.unlink()                                        # delete the file\nd.rmdir()                                         # remove EMPTY dir"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .exists(), .is_file(), .is_dir(), .mkdir(), .rename(), .unlink() — common patterns you'll see in production.\n# APPROACH  - Combine .exists(), .is_file(), .is_dir(), .mkdir(), .rename(), .unlink() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom pathlib import Path\n# 1) Make sure a path exists or doesn't, IDEMPOTENTLY (no race)\nPath(\"logs/2024\").mkdir(parents=True, exist_ok=True)   # create -p, ignore if exists\nPath(\"old.log\").unlink(missing_ok=True)                # delete, ignore if missing (3.8+)\n# 2) stat() — size, mtime, mode in one call\np = Path(\"data.bin\")\nif p.exists():\n    info = p.stat()\n    print(info.st_size, info.st_mtime)            # bytes, epoch seconds\n# 3) iterdir() — list a directory (NOT recursive); returns Path objects\nfor child in Path(\".\").iterdir():\n    kind = \"DIR \" if child.is_dir() else \"FILE\"\n    print(kind, child.name)\n# 4) Rename / move within a filesystem\nsrc = Path(\"draft.txt\"); dst = Path(\"final.txt\")\nif src.exists():\n    src.rename(dst)                               # atomic on same filesystem"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .exists(), .is_file(), .is_dir(), .mkdir(), .rename(), .unlink() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport os\nimport tempfile\nfrom pathlib import Path\n# 1) ATOMIC WRITE — write to a sibling temp file, then os.replace() (atomic rename)\ndef atomic_write_text(target: Path, text: str, encoding: str = \"utf-8\"):\n    target = Path(target)\n    target.parent.mkdir(parents=True, exist_ok=True)\n    fd, tmp = tempfile.mkstemp(dir=target.parent, prefix=\".tmp-\", suffix=target.suffix)\n    try:\n        with os.fdopen(fd, \"w\", encoding=encoding) as f:\n            f.write(text)\n            f.flush(); os.fsync(f.fileno())       # crash-safe on POSIX\n        os.replace(tmp, target)                   # atomic on same filesystem\n    except Exception:\n        Path(tmp).unlink(missing_ok=True)\n        raise\n# 2) TOCTOU — never \"if not exists: create\"; the gap is a race\n#    BAD:\n#      if not p.exists(): p.mkdir()\n#    GOOD:\n#      p.mkdir(exist_ok=True)\n#    BAD:\n#      if p.exists(): p.unlink()\n#    GOOD:\n#      p.unlink(missing_ok=True)        # 3.8+\n# 3) Replace vs rename — semantics differ across filesystems / OSes\n#    os.replace(src, dst) — atomic, OVERWRITES dst (cross-platform)\n#    src.rename(dst)      — fails on Windows if dst exists; on POSIX it overwrites\n#    For \"I want to overwrite\", prefer os.replace.\n# 4) Permissions — chmod with explicit mode bits\nsecret = Path(\"token.txt\")\nsecret.write_text(\"...\", encoding=\"utf-8\")\nsecret.chmod(0o600)                                # rw for owner only\n# 5) hardlink_to / symlink_to — explicit linking\ntarget = Path(\"data.txt\"); link = Path(\"latest.txt\")\nif link.exists() or link.is_symlink():\n    link.unlink()\nlink.symlink_to(target)                            # symbolic link\n# 6) Walk a tree safely — Path.walk is in 3.12+; otherwise use rglob or os.walk\n# for root, dirs, files in Path(\"/var/log\").walk():\n#     ...\n# Decision rule:\n#   \"make sure dir exists\"                    -> mkdir(parents=True, exist_ok=True)\n#   \"delete if exists\"                          -> unlink(missing_ok=True)\n#   write that must survive crash               -> tempfile + os.replace (atomic)\n#   atomic rename across same filesystem        -> os.replace, NOT path.rename on Windows\n#   one-shot read of metadata                    -> .stat() once, not exists+is_file+stat\n#   recursive delete                              -> shutil.rmtree(p, ignore_errors=False)\n#   permissions on secrets                        -> chmod(0o600) explicitly\n#\n# Anti-pattern: \"if exists, then create\" / \"if exists, then delete\"\n#   Two threads / processes can race in the gap and either both create the dir\n#   (causing FileExistsError on the second) or both try to delete and one fails.\n#   Use the missing_ok / exist_ok flags so the operation is idempotent."
                  }
        ],
        tips: [
                  "Use parents=True to create intermediate directories",
                  "exist_ok=True prevents FileExistsError",
                  ".unlink() only works on files; use shutil.rmtree() for directories"
        ],
        mistake: "Checking .exists() before .mkdir() creates race conditions; use exist_ok=True instead",
        shorthand: {
          verbose: "import os\npath = 'data.txt'\nif not os.path.exists(path):\n    os.mkdir(path)\nif os.path.exists(path) and os.path.isfile(path):\n    os.remove(path)",
          concise: "from pathlib import Path\nPath('data.txt').mkdir(parents=True, exist_ok=True)\nPath('data.txt').unlink(missing_ok=True)",
        },
      },
      {
        id: "path-glob",
        fn: ".glob(), .rglob()",
        desc: "Find files matching patterns: wildcards, **, recursive search",
        category: "Pattern Matching",
        subtitle: "Search with patterns",
        signature: ".glob(pattern) → generator, .rglob(pattern) → generator",
        descLong: ".glob() finds files matching a pattern (e.g., \"*.txt\"). Use ** for recursive search. .rglob(pattern) is shorthand for .glob(\"**/\" + pattern).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .glob(), .rglob() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom pathlib import Path\n# All .txt files at the TOP level only\ntxts = list(Path(\".\").glob(\"*.txt\"))\n# All .py files at ANY depth (recursive)\npys = list(Path(\"src\").rglob(\"*.py\"))\nprint(len(txts), \"txt files;\", len(pys), \"py files\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .glob(), .rglob() — common patterns you'll see in production.\n# APPROACH  - Combine .glob(), .rglob() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom pathlib import Path\n# 1) glob is CASE-SENSITIVE on POSIX, INSENSITIVE on Windows\n#    \"*.PY\" won't match \"main.py\" on Linux/macOS. Either be deterministic:\nlist(Path(\".\").glob(\"*.[Pp][Yy]\"))                # explicit char classes\n# 2) ** matches MULTIPLE directories; * matches ONE level only\nlist(Path(\".\").glob(\"*.py\"))                       # only ./*.py\nlist(Path(\".\").glob(\"*/*.py\"))                     # ./dir/*.py\nlist(Path(\".\").glob(\"**/*.py\"))                    # ANY depth (rglob shorthand)\n# 3) glob returns a LAZY ITERATOR — convert when you need len/sort\ngen = Path(\".\").rglob(\"*.log\")                    # not yet executed\nfiles = sorted(gen, key=lambda p: p.stat().st_mtime, reverse=True)   # newest first\n# 4) Filter by metadata after the glob — pathlib doesn't filter on size/age\nbig_logs = [p for p in Path(\".\").rglob(\"*.log\") if p.stat().st_size > 1_000_000]"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .glob(), .rglob() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport os\nfrom pathlib import Path\n# 1) DOTFILES are NOT matched by * — explicit \".*\" or [.]* needed\nlist(Path(\".\").glob(\"*\"))                          # excludes .git, .env, .venv ...\nlist(Path(\".\").glob(\".*\"))                         # only dotfiles\nlist(Path(\".\").glob(\"[!.]*\"))                      # everything except dotfiles\n# 2) SYMLINK LOOPS — rglob can loop forever on a self-referential symlink.\n#    pathlib.Path.walk (3.12+) has follow_symlinks=False by default; rglob does NOT.\n#    Pre-3.12 safe walk:\ndef safe_rglob(root: Path, pattern: str):\n    seen: set[Path] = set()\n    for p in root.rglob(pattern):\n        try:\n            real = p.resolve()\n        except OSError:\n            continue\n        if real in seen: continue\n        seen.add(real)\n        yield p\n# 3) EXCLUDE noise (node_modules, __pycache__, .git, build/)\nEXCLUDES = {\".git\", \".venv\", \"node_modules\", \"__pycache__\", \"dist\", \"build\"}\ndef project_files(root: Path):\n    for p in root.rglob(\"*\"):\n        if any(part in EXCLUDES for part in p.parts):\n            continue\n        if p.is_file():\n            yield p\n# 4) Path.walk (3.12+) — like os.walk, but Path-typed, gives prune control\ndef walk_with_prune(root: Path):\n    for parent, dirs, files in root.walk():        # 3.12+\n        # prune in place — modifying dirs[:] skips traversal\n        dirs[:] = [d for d in dirs if d not in EXCLUDES]\n        for f in files:\n            yield parent / f\n# 5) Performance — rglob is fine for thousands of files, but for MILLIONS:\n#    - prefer os.scandir (returns DirEntry; is_file/is_dir don't re-stat)\n#    - or use OS tools (find / fd / rg) and parse stdout\n# 6) Cross-platform pattern handling — rglob uses fnmatch under the hood\n#    On Windows, \"*.py\" also matches \"*.PY\" because the FS is case-insensitive\n#    For deterministic case behavior, use explicit character classes.\n# Decision rule:\n#   one-shot dir scan                        -> Path.glob(\"*\")\n#   recursive search                          -> Path.rglob(pattern) or Path.walk (3.12+)\n#   need to PRUNE subtrees                    -> Path.walk + dirs[:] = filtered\n#   need DirEntry speed (millions of files)   -> os.scandir, not pathlib\n#   case-sensitive on every OS                -> explicit char classes \"*.[Pp][Yy]\"\n#   include dotfiles                            -> add a separate \".*\" glob (or \"*\" UNION \".*\")\n#\n# Anti-pattern: list(rglob(\"*\")) on a tree containing node_modules / .venv\n#   Pulls millions of irrelevant files into memory. Always exclude noise dirs\n#   in the iteration, or use Path.walk + prune."
                  }
        ],
        tips: [
                  ".glob() returns a generator; convert to list if you need to reuse results",
                  "** matches zero or more directories; use cautiously on large filesystems",
                  ".rglob(pattern) is cleaner than .glob(\"**/\" + pattern)"
        ],
        mistake: "Expecting .glob() to return a sorted list; always sort results if order matters",
        shorthand: {
          verbose: "import glob\nimport os\ntxt_files = glob.glob('*.txt')\npy_files = glob.glob('**/*.py', recursive=True)",
          concise: "from pathlib import Path\ntxt_files = list(Path('.').glob('*.txt'))\npy_files = list(Path('.').rglob('*.py'))",
        },
      },
      {
        id: "path-read-write",
        fn: "Path.read_text(), Path.write_text(), Path.read_bytes(), Path.write_bytes()",
        desc: "Read and write entire file contents in one call",
        category: "File I/O",
        subtitle: "Simple text/binary I/O",
        signature: ".read_text(encoding=\"utf-8\") → str, .write_text(text, encoding=\"utf-8\"), .read_bytes() → bytes, .write_bytes(data)",
        descLong: "Convenient methods to read/write entire files without manual file handling. read_text/write_text handle encoding; read_bytes/write_bytes for binary data.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Path.read_text(), Path.write_text(), Path.read_bytes(), Path.write_bytes() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom pathlib import Path\nPath(\"message.txt\").write_text(\"Hello, World!\", encoding=\"utf-8\")\nprint(Path(\"message.txt\").read_text(encoding=\"utf-8\"))\nPath(\"data.bin\").write_bytes(b\"\\x00\\x01\\x02\")\nprint(Path(\"data.bin\").read_bytes())"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Path.read_text(), Path.write_text(), Path.read_bytes(), Path.write_bytes() — common patterns you'll see in production.\n# APPROACH  - Combine Path.read_text(), Path.write_text(), Path.read_bytes(), Path.write_bytes() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom pathlib import Path\n# 1) NEVER omit encoding — \"utf-8\" is the right default everywhere\nPath(\"note.txt\").write_text(\"héllo\", encoding=\"utf-8\")\ntext = Path(\"note.txt\").read_text(encoding=\"utf-8\")\n# 2) Stream large files line-by-line (constant memory)\ndef grep(path: Path, needle: str):\n    with path.open(\"r\", encoding=\"utf-8\") as f:\n        for line_no, line in enumerate(f, 1):\n            if needle in line:\n                yield line_no, line.rstrip()\n# 3) Append vs overwrite — Path doesn't have append_text, drop to .open\ndef append_line(path: Path, line: str):\n    with path.open(\"a\", encoding=\"utf-8\") as f:\n        f.write(line + \"\\n\")\n# 4) Binary writes — bytes only, no encoding argument\nPath(\"logo.png\").write_bytes(downloaded_bytes())\ndef downloaded_bytes(): return b\"\""
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Path.read_text(), Path.write_text(), Path.read_bytes(), Path.write_bytes() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport os\nimport tempfile\nfrom pathlib import Path\n# 1) ATOMIC WRITE — never leave half-written files visible to readers\ndef atomic_write_text(target: Path, text: str, encoding: str = \"utf-8\"):\n    target = Path(target)\n    target.parent.mkdir(parents=True, exist_ok=True)\n    fd, tmp = tempfile.mkstemp(dir=target.parent, prefix=\".tmp-\", suffix=target.suffix)\n    try:\n        with os.fdopen(fd, \"w\", encoding=encoding) as f:\n            f.write(text)\n            f.flush(); os.fsync(f.fileno())       # force OS to commit\n        os.replace(tmp, target)                   # atomic rename\n    except Exception:\n        Path(tmp).unlink(missing_ok=True)\n        raise\n# 2) ENCODING ERRORS — pick the right error policy\n#    strict      raise UnicodeDecodeError on bad bytes (default; usually right)\n#    ignore       drop bad bytes silently\n#    replace      replace bad bytes with U+FFFD\n#    backslashreplace      represent as \\xNN escape (preserves info)\n#    surrogateescape       smuggle bytes through; round-trips on rewrite\ntext = Path(\"legacy.csv\").read_text(encoding=\"utf-8\", errors=\"replace\")\n# 3) BOMs — Windows tools emit utf-8-sig with a BOM; reading as \"utf-8\"\n#    leaves a stray '\\ufeff' on the first character. Use \"utf-8-sig\" to strip.\ntext = Path(\"excel_export.csv\").read_text(encoding=\"utf-8-sig\")\n# 4) STREAMING reads for huge files — never read_text() a 5 GB log\ndef head(path: Path, n_lines: int = 10):\n    with path.open(\"r\", encoding=\"utf-8\") as f:\n        for i, line in enumerate(f):\n            if i >= n_lines: break\n            yield line.rstrip()\n# 5) Large WRITES — flush in chunks, fsync if durability matters\ndef write_in_chunks(path: Path, data_iter, chunk_size: int = 1 << 20):\n    with path.open(\"wb\") as f:\n        for chunk in data_iter:                    # iterable of bytes\n            f.write(chunk)\n        f.flush(); os.fsync(f.fileno())\n# Decision rule:\n#   small file (< MB)                         -> read_text / write_text with encoding=\n#   large file                                  -> .open() + iterate lines / chunks\n#   write must survive a crash                  -> tempfile + os.replace + fsync\n#   files from Excel / Windows                   -> encoding=\"utf-8-sig\" to skip BOM\n#   logs with mojibake / mixed encodings         -> errors=\"replace\" or \"backslashreplace\"\n#   binary content                                -> read_bytes / write_bytes (NO encoding)\n#   round-trip arbitrary bytes through str        -> errors=\"surrogateescape\"\n#\n# Anti-pattern: open(path) without encoding=\n#   Default encoding depends on the LOCALE (latin-1 on some servers, cp1252 on\n#   Windows). The same code reads different bytes on different machines. Always\n#   pass encoding=\"utf-8\" explicitly."
                  }
        ],
        tips: [
                  "These methods open, read/write, and close in one call; no context manager needed",
                  "Default encoding is UTF-8; specify encoding for other formats",
                  "Large files are loaded entirely into memory; use .open() for streaming"
        ],
        mistake: "Using these methods for large files causes memory issues; use streaming instead",
        shorthand: {
          verbose: "import os\nwith open('message.txt', 'r', encoding='utf-8') as f:\n    content = f.read()\nwith open('message.txt', 'w', encoding='utf-8') as f:\n    f.write('Hello, World!')",
          concise: "from pathlib import Path\nPath('message.txt').write_text('Hello, World!')\ncontent = Path('message.txt').read_text()",
        },
      },
      {
        id: "path-joinpath",
        fn: "/ operator, .joinpath(), .resolve()",
        desc: "Combine paths, resolve to absolute paths",
        category: "Path Combination",
        subtitle: "Build and resolve paths",
        signature: "p / \"subdir\" / \"file.txt\", .joinpath(*parts) → Path, .resolve() → Path (absolute)",
        descLong: "The / operator elegantly joins path segments. .joinpath() does the same. .resolve() converts to absolute path, resolving symlinks and \"..\" references.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of / operator, .joinpath(), .resolve() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom pathlib import Path\nbase = Path(\"/home/user\")\nfull = base / \"projects\" / \"myapp\" / \"data.csv\"\nprint(full)                                       # /home/user/projects/myapp/data.csv\nrel = Path(\"./subdir/../file.txt\")\nprint(rel.resolve())                              # canonical absolute path"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of / operator, .joinpath(), .resolve() — common patterns you'll see in production.\n# APPROACH  - Combine / operator, .joinpath(), .resolve() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom pathlib import Path\n# 1) Two equivalent ways to compose\np1 = Path(\"a\") / \"b\" / \"c.txt\"\np2 = Path(\"a\").joinpath(\"b\", \"c.txt\")\nprint(p1 == p2)                                   # True\n# 2) STR boundary — many libs (open, subprocess) accept Path AND str.\n#    When you must hand off, use str(path) explicitly; don't trust __fspath__ alone.\nimport subprocess\nsubprocess.run([\"wc\", \"-l\", str(p1)], check=False)\n# 3) relative_to — \"is this path inside that base, and what's the suffix?\"\nproj = Path(\"/home/user/projects\")\nsub  = Path(\"/home/user/projects/myapp/data.csv\")\nprint(sub.relative_to(proj))                      # PosixPath('myapp/data.csv')\n# 4) Walk up the parents — useful for finding repo roots, config files\ndef find_upwards(start: Path, name: str) -> Path | None:\n    for d in [start, *start.parents]:\n        candidate = d / name\n        if candidate.exists():\n            return candidate\n    return None\nprint(find_upwards(Path.cwd(), \"pyproject.toml\"))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of / operator, .joinpath(), .resolve() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom pathlib import Path, PurePosixPath, PureWindowsPath\n# 1) absolute() vs resolve()\n#    absolute()  : prepends cwd; LEXICAL only; doesn't validate\n#    resolve()   : follows symlinks, normalizes \"..\"; touches the filesystem\n#    resolve(strict=True)  : ALSO raises if the path doesn't exist (3.6+)\np = Path(\"./data/../config.json\")\nprint(p.absolute())                               # cwd/data/../config.json\nprint(p.resolve())                                # cwd/config.json (canonical)\n# 2) PATH TRAVERSAL SAFETY — confine user-supplied parts to a sandbox\ndef safe_join(sandbox: Path, user_part: str) -> Path:\n    sandbox = sandbox.resolve()\n    candidate = (sandbox / user_part).resolve()\n    try:\n        candidate.relative_to(sandbox)            # raises ValueError if outside\n    except ValueError:\n        raise ValueError(f\"path escapes sandbox: {user_part}\")\n    return candidate\n# safe_join(Path(\"uploads\"), \"../etc/passwd\")  -> ValueError\n# 3) Cross-platform path PARSING — PurePath family (no FS access)\n#    Use when you're handling paths from data of a foreign OS (S3 keys, ZIP entries)\nPurePosixPath(\"/home/user\").parts                 # ('/', 'home', 'user')\nPureWindowsPath(r\"C:\\Users\\Alice\").parts        # ('C:\\\\', 'Users', 'Alice')\n# 4) commonpath — longest shared prefix of multiple paths (POSIX only via os.path)\nimport os.path\ncommon = os.path.commonpath([str(Path(\"/a/b/c\")), str(Path(\"/a/b/d\"))])\nprint(common)                                     # /a/b\n# 5) Walk up to find a repo / project root\ndef find_project_root(start: Path, marker: str = \".git\") -> Path:\n    for d in [start, *start.parents]:\n        if (d / marker).exists():\n            return d\n    raise FileNotFoundError(f\"no {marker} above {start}\")\n# 6) Symlink awareness — resolve() follows them; absolute() doesn't\n#    For \"give me the path the user typed without dereferencing symlinks\":\n#       p.absolute()\n#    For \"give me the inode-level identity\":\n#       p.resolve()\n#    For \"is this the SAME file as that one (across symlinks)\":\n#       p1.samefile(p2)\n# Decision rule:\n#   compose paths cross-platform                -> Path / \"subdir\" / \"file\"\n#   add multiple parts at once                  -> .joinpath(*parts)\n#   make a path absolute (lexical)              -> .absolute()\n#   make a path canonical (resolve symlinks)    -> .resolve()\n#   \"is this path inside this sandbox\"          -> resolve + relative_to in try/except\n#   parsing foreign-OS paths                     -> PurePosixPath / PureWindowsPath\n#   find a repo root from a script               -> walk up parents looking for .git\n#\n# Anti-pattern: f-string path joins\n#   f\"{base}/{name}.txt\" — backslash on Windows, missing slash if base ends in\n#   \"/\", no validation. Always Path(base) / f\"{name}.txt\"."
                  }
        ],
        tips: [
                  "The / operator is cleaner than os.path.join() for multiple segments",
                  ".resolve() handles \"..\" and symlinks; always use for absolute paths",
                  "Relative paths from resolve() depend on current working directory"
        ],
        mistake: "Using str.join() or f-strings for paths; use / operator instead",
        shorthand: {
          verbose: "import os\nbase = '/home/user'\nsubdir = 'projects'\nfilename = 'data.csv'\nfull_path = os.path.join(base, subdir, filename)",
          concise: "from pathlib import Path\nfull_path = Path('/home/user') / 'projects' / 'data.csv'",
        },
      },
    ],
  },

  // ── Section 2: File I/O — Reading & Writing ─────────────────────────────────────────
  {
    id: "file-io",
    title: "File I/O — Reading & Writing",
    entries: [
      {
        id: "open-modes",
        fn: "open()",
        desc: "File modes: r, w, a, rb, wb, context manager, encoding",
        category: "File Handling",
        subtitle: "Open files safely",
        signature: "open(file, mode=\"r\", encoding=None) → context manager",
        descLong: "open() modes: r (read), w (write, truncate), a (append), b suffix (binary). Always use with statement to auto-close files. Specify encoding for text mode.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of open() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nwith open(\"file.txt\", \"r\", encoding=\"utf-8\") as f:\n    content = f.read()\nwith open(\"file.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"Hello\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of open() — common patterns you'll see in production.\n# APPROACH  - Combine open() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\n# 1) Mode cheatsheet\n#    \"r\"   read text (default)\n#    \"w\"   write text — TRUNCATES existing file!\n#    \"x\"   exclusive create — fails if file exists  (safer than \"w\")\n#    \"a\"   append text\n#    \"r+\"  read AND write; positioned at start\n#    add \"b\" for BINARY (rb, wb, ab) — must use bytes, NOT str\n# 2) Append mode — opens at end; safe for log appenders\nwith open(\"audit.log\", \"a\", encoding=\"utf-8\") as f:\n    f.write(\"event\\n\")\n# 3) Exclusive create — refuse to overwrite\ntry:\n    with open(\"important.txt\", \"x\", encoding=\"utf-8\") as f:\n        f.write(\"...\")\nexcept FileExistsError:\n    pass                                          # don't clobber\n# 4) Binary mode — bytes only, NO encoding\nwith open(\"logo.png\", \"rb\") as f:\n    data = f.read()\n# 5) errors= policy — what to do with non-decodable bytes\nwith open(\"legacy.csv\", \"r\", encoding=\"utf-8\", errors=\"replace\") as f:\n    text = f.read()                                # bad bytes -> U+FFFD"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of open() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport os\n# 1) NEWLINE — the most-forgotten arg\n#    text mode: newline=None (default) translates \"\\r\\n\" / \"\\r\" -> \"\\n\" on read\n#                                       and \"\\n\" -> os.linesep on write\n#    For CSV / strict-binary text:  newline=\"\"    (preserves bytes; csv module REQUIRES this)\nimport csv\nwith open(\"data.csv\", \"w\", encoding=\"utf-8\", newline=\"\") as f:\n    csv.writer(f).writerow([\"a\", \"b\"])             # without newline=\"\" you get blank rows on Windows\n# 2) BUFFERING — a knob with three meaningful values\n#    buffering=0   unbuffered (binary mode only) — every write hits the kernel\n#    buffering=1   line-buffered (TEXT mode only) — flush each newline; great for logs\n#    buffering=N   block size in bytes\n#    With \"with\", buffer is flushed on close. Don't reach for buffering=0 unless you must.\n# 3) ENCODING ERRORS — pick the policy by intent\n#    strict (default)         raise UnicodeDecodeError  — use unless you know better\n#    ignore                    drop bad bytes silently   — almost never right\n#    replace                   bad bytes -> U+FFFD       — for log scrapers\n#    backslashreplace          \\xNN escapes              — preserves info, prints OK\n#    surrogateescape           bytes round-trip to str   — for re-writing exactly\n# 4) FSYNC — durability guarantee\n#    flush() pushes to OS buffer; fsync() pushes to disk.\n#    Without fsync, a crash within ~30s can lose data even after the with block.\ndef write_durable(path, text):\n    with open(path, \"w\", encoding=\"utf-8\") as f:\n        f.write(text)\n        f.flush()\n        os.fsync(f.fileno())                       # actually on disk now\n# 5) FILE DESCRIPTOR LEAKS — never skip the context manager\n#    open() returns a file object; if you don't close it, the FD leaks until GC.\n#    On long-running services this exhausts the per-process FD table -> OSError.\n#    Always: with open(...) as f: ...\n# 6) Text vs binary mode — a / w / r have STRING boundaries; rb / wb have BYTES\n#    Mixing: open(\"...\", \"rb\").read() returns bytes; you must .decode() to use as str.\n#    Don't try f.write(str_value) on a binary handle — TypeError.\n# Decision rule:\n#   read / write small text                    -> \"r\" / \"w\" with encoding=\"utf-8\"\n#   safe create (don't overwrite)              -> \"x\"\n#   append-only log                              -> \"a\" + buffering=1 (line-buffered)\n#   CSV / TSV / network protocol text            -> newline=\"\" + encoding=\"utf-8\"\n#   binary                                       -> \"rb\" / \"wb\" (no encoding)\n#   crash safety                                  -> flush() + os.fsync(f.fileno())\n#   foreign / messy encoding                     -> errors=\"replace\" or \"backslashreplace\"\n#\n# Anti-pattern: open(path) without encoding=\n#   Default encoding depends on the LOCALE (cp1252 on Windows, utf-8 on most Linux).\n#   The same code reads different bytes on different machines. Always specify."
                  }
        ],
        tips: [
                  "Always use with statement; it auto-closes even if an exception occurs",
                  "Default encoding varies by OS; always specify encoding for text files",
                  "Mode \"x\" creates new file, fails if exists (safer than \"w\")"
        ],
        mistake: "Forgetting to close files or not using with statement causes resource leaks",
        shorthand: {
          verbose: "f = open('file.txt', 'r')\ncontent = f.read()\nf.close()",
          concise: "with open('file.txt', 'r', encoding='utf-8') as f:\n    content = f.read()",
        },
      },
      {
        id: "file-read-methods",
        fn: ".read(), .readline(), .readlines(), iteration",
        desc: "Methods to read file contents: entire file, single line, all lines, streaming",
        category: "Reading Data",
        subtitle: "Read file contents",
        signature: ".read() → str, .readline() → str, .readlines() → list[str], for line in f: ...",
        descLong: ".read() returns entire file; .readline() one line; .readlines() all lines as list. Iterate directly over file object for memory-efficient streaming.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .read(), .readline(), .readlines(), iteration — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nwith open(\"file.txt\", \"r\", encoding=\"utf-8\") as f:\n    content = f.read()                            # entire file -> one str\nwith open(\"file.txt\", \"r\", encoding=\"utf-8\") as f:\n    first = f.readline()                          # ONE line (includes \"\\n\")\nwith open(\"file.txt\", \"r\", encoding=\"utf-8\") as f:\n    lines = f.readlines()                         # list of all lines\nwith open(\"file.txt\", \"r\", encoding=\"utf-8\") as f:\n    for line in f:                                # streaming — best for big files\n        print(line.rstrip())"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .read(), .readline(), .readlines(), iteration — common patterns you'll see in production.\n# APPROACH  - Combine .read(), .readline(), .readlines(), iteration with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\n# 1) STREAM TEXT line-by-line — constant memory regardless of size\ndef grep(path: str, needle: str):\n    with open(path, \"r\", encoding=\"utf-8\") as f:\n        for i, line in enumerate(f, 1):\n            if needle in line:\n                yield i, line.rstrip()\n# 2) READ in CHUNKS for binary — never read() a 5 GB file\ndef chunks(path: str, size: int = 1 << 20):       # 1 MB blocks\n    with open(path, \"rb\") as f:\n        while data := f.read(size):\n            yield data\n# 3) TELL / SEEK — navigate within a file (binary mode is sane; text has caveats)\nwith open(\"data.bin\", \"rb\") as f:\n    pos = f.tell()                                # current byte offset\n    f.seek(0, 2)                                  # 2 = SEEK_END -> EOF\n    size = f.tell()\n    f.seek(pos)                                   # back to start\n# 4) PEEK without consuming — useful for header sniffing\nwith open(\"file.bin\", \"rb\") as f:\n    head = f.read(4)\n    f.seek(0)                                     # rewind so the body still reads"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .read(), .readline(), .readlines(), iteration — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport io\nimport mmap\nfrom collections import deque\n# 1) mmap — treat a file like a bytes-array; OS pages it in lazily\ndef find_first(path: str, needle: bytes) -> int:\n    with open(path, \"rb\") as f:\n        with mmap.mmap(f.fileno(), 0, access=mmap.ACCESS_READ) as m:\n            return m.find(needle)                  # OS-backed search; no full read\n# 2) HEAD — first N lines without reading the whole file\ndef head(path: str, n: int = 10):\n    with open(path, \"r\", encoding=\"utf-8\") as f:\n        for i, line in enumerate(f):\n            if i >= n: break\n            yield line.rstrip()\n# 3) TAIL — last N lines using a deque(maxlen=N), constant memory\ndef tail(path: str, n: int = 10):\n    with open(path, \"r\", encoding=\"utf-8\") as f:\n        return list(deque(f, maxlen=n))           # deque drops oldest as it fills\n# 4) SEEK on TEXT files — DANGEROUS; only seek to positions returned by tell()\n#    Multi-byte UTF-8 chars mean random offsets can land mid-codepoint and crash.\nwith open(\"text.txt\", \"rb\") as f:                 # binary mode if you need real seek\n    f.seek(-100, 2)                                # last 100 bytes\n    last_chunk = f.read().decode(\"utf-8\", errors=\"replace\")\n# 5) Decode a binary stream incrementally — for files larger than memory with\n#    multi-byte codecs that won't split cleanly on chunk boundaries.\nimport codecs\ndef decode_lines(path: str, encoding: str = \"utf-8\"):\n    decoder = codecs.getincrementaldecoder(encoding)(errors=\"replace\")\n    buf = \"\"\n    with open(path, \"rb\") as f:\n        while data := f.read(1 << 16):\n            buf += decoder.decode(data)\n            *complete, buf = buf.split(\"\\n\")     # keep the trailing partial line\n            yield from complete\n        buf += decoder.decode(b\"\", final=True)\n        if buf: yield buf\n# 6) read(n) vs readline() — read(n) is N BYTES on binary, N CHARS on text;\n#    readline() respects newline= translation. Pick based on what you need.\n# Decision rule:\n#   small text file                            -> read() or readlines()\n#   large file, line-oriented                   -> for line in f (streaming)\n#   large file, binary processing                -> read(chunk_size) loop\n#   random access (search, index)                -> mmap (read-only, lazy paging)\n#   first N lines                                 -> islice / break-after-N\n#   last N lines                                  -> deque(maxlen=N)\n#   seek on text                                  -> open in binary mode and decode chunks\n#\n# Anti-pattern: f.read() on a 5 GB log file\n#   Loads the whole thing into memory; OOMs the process. Stream line-by-line\n#   or chunk-by-chunk; only materialize the result you actually need."
                  }
        ],
        tips: [
                  "Iterate directly over file object for large files; more efficient than .readlines()",
                  ".readline() and iteration include newline characters; use .strip() to remove them",
                  ".readlines() loads entire file into memory; avoid for large files"
        ],
        mistake: "Using .readlines() and storing result for processing large files causes memory issues",
        shorthand: {
          verbose: "with open('file.txt', 'r') as f:\n    lines = f.readlines()\nfor line in lines:\n    process(line.strip())",
          concise: "with open('file.txt', 'r') as f:\n    for line in f:\n        process(line.strip())",
        },
      },
      {
        id: "file-write-methods",
        fn: ".write(), .writelines(), flushing, buffering",
        desc: "Write strings and lists to files; control buffering and flushing",
        category: "Writing Data",
        subtitle: "Write file contents",
        signature: ".write(str) → int, .writelines(list), .flush(), open(buffering=...)",
        descLong: ".write() takes a single string; .writelines() takes an iterable (no newlines added). .flush() forces buffer to disk. buffering parameter controls buffering behavior.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .write(), .writelines(), flushing, buffering — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nwith open(\"output.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.write(\"Line 1\\n\")\n    f.write(\"Line 2\\n\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .write(), .writelines(), flushing, buffering — common patterns you'll see in production.\n# APPROACH  - Combine .write(), .writelines(), flushing, buffering with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\n# 1) writelines — the name LIES: it does NOT add newlines for you\nitems = [\"alpha\", \"beta\", \"gamma\"]\nwith open(\"out.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.writelines(line + \"\\n\" for line in items)   # add newline yourself\n# 2) Streaming a generator — constant memory regardless of size\ndef yield_records():\n    for i in range(1_000_000):\n        yield f\"row {i}\\n\"\nwith open(\"big.txt\", \"w\", encoding=\"utf-8\") as f:\n    f.writelines(yield_records())                 # writes lazily\n# 3) flush vs close\n#    flush()  pushes the BUFFER to the OS — visible to other readers\n#    close()  also flushes; with-statement does this for you\nwith open(\"log.txt\", \"a\", encoding=\"utf-8\") as f:\n    f.write(\"ready\\n\")\n    f.flush()                                     # other process can see it now"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .write(), .writelines(), flushing, buffering — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport os\nimport tempfile\nfrom pathlib import Path\n# 1) ATOMIC WRITE — never let a reader see a half-written file\ndef atomic_write(path: Path, text: str, encoding: str = \"utf-8\"):\n    path = Path(path)\n    path.parent.mkdir(parents=True, exist_ok=True)\n    fd, tmp = tempfile.mkstemp(dir=path.parent, prefix=\".tmp-\", suffix=path.suffix)\n    try:\n        with os.fdopen(fd, \"w\", encoding=encoding) as f:\n            f.write(text)\n            f.flush()\n            os.fsync(f.fileno())                  # actually on disk\n        os.replace(tmp, path)                     # atomic rename\n    except Exception:\n        Path(tmp).unlink(missing_ok=True)\n        raise\n# 2) APPEND-ONLY log — many writers; line buffering = visible at line boundaries\nwith open(\"audit.log\", \"a\", encoding=\"utf-8\", buffering=1) as f:\n    f.write(\"event\\n\")                            # flushed at every newline\n# 3) BULK write — write once, not in a hot loop\n#    Each f.write() is a syscall; batching dramatically improves throughput.\ndef write_bulk(path: Path, lines):\n    body = \"\".join(line + \"\\n\" for line in lines)  # build in memory\n    with open(path, \"w\", encoding=\"utf-8\") as f:\n        f.write(body)                              # one syscall\n# 4) BINARY writes — bytes only; great for io.BytesIO interop\nimport io\ndef to_bytes(parts: list[bytes]) -> bytes:\n    buf = io.BytesIO()\n    for p in parts:\n        buf.write(p)\n    return buf.getvalue()\n# 5) CONCURRENT writers — DON'T expect \"atomic write\" without fsync + replace\n#    POSIX guarantees a single write() of <= PIPE_BUF bytes is atomic, but a\n#    crash mid-write leaves whatever was last flushed. Use atomic_write above.\n# 6) Newline handling — text mode TRANSLATES \"\\n\" -> os.linesep on Windows\n#    Mostly fine, but for byte-exact files (CSV, network protocols) use newline=\"\"\nimport csv\nwith open(\"data.csv\", \"w\", encoding=\"utf-8\", newline=\"\") as f:\n    csv.writer(f).writerow([\"a\", \"b\"])\n# Decision rule:\n#   small one-shot write                       -> write_text(s) or with open(... \"w\")\n#   write that must survive a crash             -> tempfile + os.replace + fsync\n#   append events / logs                         -> mode=\"a\" + buffering=1\n#   millions of small writes                     -> batch in memory, ONE write()\n#   binary streams                                -> write_bytes / open(\"wb\")\n#   strict byte-exact text (CSV, HTTP)            -> newline=\"\" + encoding=\"utf-8\"\n#\n# Anti-pattern: f.writelines(items) expecting newlines added\n#   The name implies \"lines\" but it's just iterable-of-strings concatenation.\n#   Append \"\\n\" to each item yourself, OR use print(item, file=f) which does."
                  }
        ],
        tips: [
                  ".writelines() does NOT add newlines; include them in strings if needed",
                  ".flush() is rarely needed; with statement auto-flushes on exit",
                  "Line buffering (buffering=1) useful for interactive output"
        ],
        mistake: "Expecting .writelines() to add newlines automatically; it doesn't",
        shorthand: {
          verbose: "with open('output.txt', 'w') as f:\n    for item in items:\n        f.write(str(item) + '\\n')",
          concise: "with open('output.txt', 'w') as f:\n    f.writelines(f'{item}\\n' for item in items)",
        },
      },
      {
        id: "csv-module",
        fn: "csv.reader(), csv.writer(), csv.DictReader(), csv.DictWriter()",
        desc: "Parse and write CSV files using dictionaries and lists",
        category: "Structured Data",
        subtitle: "CSV file handling",
        signature: "csv.reader(file), csv.writer(file), csv.DictReader(file), csv.DictWriter(file, fieldnames)",
        descLong: "csv.reader/writer handle lists; DictReader/DictWriter handle dictionaries. DictReader auto-parses headers; DictWriter requires fieldnames parameter.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of csv.reader(), csv.writer(), csv.DictReader(), csv.DictWriter() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport csv\n# Write\nwith open(\"out.csv\", \"w\", encoding=\"utf-8\", newline=\"\") as f:\n    w = csv.DictWriter(f, fieldnames=[\"name\", \"age\"])\n    w.writeheader()\n    w.writerows([{\"name\": \"Alice\", \"age\": 30}, {\"name\": \"Bob\", \"age\": 25}])\n# Read\nwith open(\"out.csv\", \"r\", encoding=\"utf-8\", newline=\"\") as f:\n    for row in csv.DictReader(f):\n        print(row)                                # {'name': 'Alice', 'age': '30'}"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of csv.reader(), csv.writer(), csv.DictReader(), csv.DictWriter() — common patterns you'll see in production.\n# APPROACH  - Combine csv.reader(), csv.writer(), csv.DictReader(), csv.DictWriter() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport csv\n# 1) newline=\"\" is MANDATORY — without it, blank rows on Windows\n#    encoding=\"utf-8\" — without it, Windows / Excel writes funky bytes\n#    encoding=\"utf-8-sig\" reads Excel exports cleanly (strips BOM)\nwith open(\"excel_export.csv\", \"r\", encoding=\"utf-8-sig\", newline=\"\") as f:\n    rows = list(csv.DictReader(f))\n# 2) Type coercion — DictReader gives you STRINGS; convert at the boundary\ndef parse_row(r):\n    return {\"name\": r[\"name\"],\n            \"age\":  int(r[\"age\"]),\n            \"active\": r[\"active\"].lower() in {\"true\", \"1\", \"yes\"}}\n# 3) Quoting — the four policies\n#    QUOTE_MINIMAL    quote only when needed (default)\n#    QUOTE_ALL         quote every field\n#    QUOTE_NONNUMERIC  quote non-numerics; READS as float\n#    QUOTE_NONE       never quote (must escape delimiter manually)\nwith open(\"strict.csv\", \"w\", encoding=\"utf-8\", newline=\"\") as f:\n    w = csv.writer(f, quoting=csv.QUOTE_ALL)\n    w.writerow([\"a\", \"b,c\", 'with \"quote\"'])\n# 4) Custom delimiter (TSV)\nwith open(\"data.tsv\", \"r\", encoding=\"utf-8\", newline=\"\") as f:\n    for row in csv.reader(f, delimiter=\"\\t\"):\n        print(row)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of csv.reader(), csv.writer(), csv.DictReader(), csv.DictWriter() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport csv\nimport io\n# 1) STREAMING — never list() a million-row CSV\ndef find_errors(path: str):\n    with open(path, \"r\", encoding=\"utf-8\", newline=\"\") as f:\n        for row in csv.DictReader(f):              # one row at a time\n            if row.get(\"status\") == \"ERROR\":\n                yield row\n# 2) Sniff the DIALECT when you don't control the source\ndef smart_read(path: str):\n    with open(path, \"r\", encoding=\"utf-8-sig\", newline=\"\") as f:\n        sample = f.read(4096)\n        f.seek(0)\n        try:\n            dialect = csv.Sniffer().sniff(sample)\n        except csv.Error:\n            dialect = csv.excel\n        for row in csv.DictReader(f, dialect=dialect):\n            yield row\n# 3) DEFAULT escapechar — CSV quotes embedded quotes by DOUBLING them (\"\" inside \"\")\n#    quotechar='\"' is the default; escapechar=None means \"use doubling, not backslash\"\nwith open(\"hard.csv\", \"w\", encoding=\"utf-8\", newline=\"\") as f:\n    csv.writer(f).writerow(['contains a \"quote\"'])  # written as: \"contains a \"\"quote\"\"\"\n# 4) When the csv module ISN'T enough\n#    - speed on big files                        -> pandas.read_csv / polars.read_csv (Rust + multi-threaded)\n#    - schema-typed reads                          -> pandas with dtype= or pyarrow.csv\n#    - JSON-shaped fields, embedded newlines       -> use a dedicated parser, not csv\n#    - excel formulas / multiple sheets            -> openpyxl / xlrd / pandas read_excel\n# 5) Error-tolerant reads — don't crash on bad rows; log and continue\ndef lenient(path: str):\n    with open(path, \"r\", encoding=\"utf-8\", newline=\"\") as f:\n        reader = csv.DictReader(f)\n        for i, row in enumerate(reader, 2):       # 2 = first data row (after header)\n            try:\n                yield {\"id\": int(row[\"id\"]), \"name\": row[\"name\"].strip()}\n            except (KeyError, ValueError) as e:\n                print(f\"row {i}: {e}; row={row}\")\n# 6) UTF-8 BOMs — Excel and some Windows tools emit them\n#    Read with encoding=\"utf-8-sig\" — strips the BOM transparently.\n#    Write with encoding=\"utf-8\" (no BOM) for normal cross-platform use.\n# Decision rule:\n#   small CSV, simple                       -> csv.DictReader / DictWriter\n#   Excel-exported CSV                       -> encoding=\"utf-8-sig\", newline=\"\"\n#   millions of rows                          -> stream with a generator, never list()\n#   need types / fast reads                   -> pandas.read_csv or polars.read_csv\n#   unknown delimiter / quoting              -> csv.Sniffer().sniff(sample)\n#   tab-separated                              -> csv.reader(f, delimiter=\"\\t\")\n#\n# Anti-pattern: open(csv_path) without newline=\"\"\n#   On Windows the writer doubles \"\\r\" -> blank rows between every record;\n#   the reader joins newlines wrong inside quoted fields. ALWAYS newline=\"\"."
                  }
        ],
        tips: [
                  "Always use newline=\"\" when opening CSV files to avoid extra blank lines on Windows",
                  "DictReader returns strings; convert types (int, float) manually if needed",
                  "DictWriter requires fieldnames; restkey/extrasaction control behavior"
        ],
        mistake: "Opening CSV files without newline=\"\" causes extra blank rows on Windows",
        shorthand: {
          verbose: "import csv\nwith open('data.csv', 'r') as f:\n    for row in csv.reader(f):\n        name, age = row[0], row[1]",
          concise: "import csv\nwith open('data.csv', 'r') as f:\n    for row in csv.DictReader(f):\n        name, age = row['name'], row['age']",
        },
      },
      {
        id: "json-module-fs",
        fn: "json.load(), json.dump(), json.loads(), json.dumps(), indent=",
        desc: "Parse and serialize JSON; pretty-print with indent parameter",
        category: "Structured Data",
        subtitle: "JSON file handling",
        signature: "json.load(file), json.dump(obj, file), json.loads(str), json.dumps(obj), indent=N",
        descLong: "load/loads parse JSON; dump/dumps serialize to JSON. load/dump work with files; loads/dumps work with strings. indent parameter formats output for readability.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of json.load(), json.dump(), json.loads(), json.dumps(), indent= — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport json\n# File <-> object\nwith open(\"config.json\", \"r\", encoding=\"utf-8\") as f:\n    cfg = json.load(f)\nwith open(\"out.json\", \"w\", encoding=\"utf-8\") as f:\n    json.dump(cfg, f, indent=2)                   # indent= for pretty output\n# String <-> object\ntext = json.dumps({\"a\": 1}, indent=2)\nprint(json.loads(text)[\"a\"])                      # 1"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of json.load(), json.dump(), json.loads(), json.dumps(), indent= — common patterns you'll see in production.\n# APPROACH  - Combine json.load(), json.dump(), json.loads(), json.dumps(), indent= with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport json\nfrom datetime import datetime, date\nfrom decimal import Decimal\n# 1) ensure_ascii=False — keep non-ASCII as actual characters, not \"\\uXXXX\"\ntext = json.dumps({\"name\": \"Café\"}, ensure_ascii=False)\nprint(text)                                       # {\"name\": \"Café\"}\n# 2) sort_keys=True — deterministic output (great for diffs / hashing)\nprint(json.dumps({\"b\": 2, \"a\": 1}, sort_keys=True))   # {\"a\": 1, \"b\": 2}\n# 3) default= — handle types json doesn't know\ndef to_serializable(obj):\n    if isinstance(obj, (datetime, date)):\n        return obj.isoformat()\n    if isinstance(obj, Decimal):\n        return float(obj)\n    if isinstance(obj, set):\n        return sorted(obj)\n    raise TypeError(f\"Not serializable: {type(obj).__name__}\")\ntext = json.dumps(\n    {\"when\": datetime.now(), \"amount\": Decimal(\"9.99\"), \"tags\": {\"a\", \"b\"}},\n    default=to_serializable, ensure_ascii=False, indent=2,\n)\n# 4) Read NDJSON (newline-delimited JSON) — common log format; one obj per line\ndef read_ndjson(path):\n    with open(path, \"r\", encoding=\"utf-8\") as f:\n        for line in f:\n            line = line.strip()\n            if line: yield json.loads(line)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of json.load(), json.dump(), json.loads(), json.dumps(), indent= — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport json\nimport os\nimport tempfile\nfrom pathlib import Path\nfrom datetime import datetime\nfrom decimal import Decimal\n# 1) JSONEncoder subclass — when you want to keep using json.dumps(... cls=...)\nclass AppEncoder(json.JSONEncoder):\n    def default(self, obj):\n        if isinstance(obj, datetime): return obj.isoformat()\n        if isinstance(obj, Decimal):  return f\"{obj}\"   # string preserves precision\n        if hasattr(obj, \"to_dict\"):   return obj.to_dict()\n        return super().default(obj)                  # raises TypeError for unknown\ntext = json.dumps({\"when\": datetime.utcnow()}, cls=AppEncoder)\n# 2) STREAM huge JSON — don't load 5 GB into memory.\n#    json.load is all-or-nothing; ijson parses incrementally.\ndef stream_users(path: str):\n    import ijson                                   # pip install ijson\n    with open(path, \"rb\") as f:\n        for user in ijson.items(f, \"users.item\"):\n            yield user\n# 3) ATOMIC write — same trick as text files, but for config/state JSON\ndef atomic_write_json(path: Path, obj, indent: int = 2):\n    path = Path(path)\n    path.parent.mkdir(parents=True, exist_ok=True)\n    fd, tmp = tempfile.mkstemp(dir=path.parent, prefix=\".tmp-\", suffix=\".json\")\n    try:\n        with os.fdopen(fd, \"w\", encoding=\"utf-8\") as f:\n            json.dump(obj, f, ensure_ascii=False, indent=indent, sort_keys=True)\n            f.flush(); os.fsync(f.fileno())\n        os.replace(tmp, path)\n    except Exception:\n        Path(tmp).unlink(missing_ok=True)\n        raise\n# 4) FLOAT precision — json round-trips float64; Decimal becomes float by default\n#    Use parse_float=Decimal to preserve precision on read\ndata = json.loads('{\"price\": 0.1}', parse_float=Decimal)\n# 5) FASTER alternatives — when stdlib is too slow\n#    orjson      Rust-backed; ~3x faster; returns bytes; supports datetime/Decimal natively\n#    ujson       C-backed; ~2x faster; less strict\n#    msgspec     fastest + schema-aware; struct-based\n#\n# import orjson\n# orjson.dumps({\"when\": datetime.utcnow()}, option=orjson.OPT_INDENT_2)\n# 6) JSON SCHEMA validation — for API payloads, prefer Pydantic over hand-rolled\n#    json.load(f) gives you a dict; Pydantic gives you a typed, validated model.\n# Decision rule:\n#   stdlib types only                          -> json.dump / json.load\n#   stdlib + datetime / Decimal                 -> default= or JSONEncoder subclass\n#   millions of records, streaming               -> NDJSON (one obj per line) or ijson\n#   schema validation needed                     -> Pydantic / msgspec\n#   speed-critical hot path                      -> orjson or ujson\n#   write that must survive a crash              -> atomic write + fsync + os.replace\n#   preserve money / precision                   -> parse_float=Decimal on read\n#\n# Anti-pattern: trying to JSON-dump custom objects with no default= or encoder\n#   TypeError: Object of type X is not JSON serializable. Either add a default=\n#   callback, subclass JSONEncoder, or coerce to dict at the boundary (.to_dict())."
                  }
        ],
        tips: [
                  "indent parameter improves readability but increases file size; use only for configs/debug output",
                  "JSON supports: strings, numbers, bools, null, lists, dicts; custom types need JSONEncoder",
                  "ensure_ascii=False preserves non-ASCII characters in output"
        ],
        mistake: "Trying to JSON-serialize custom objects without JSONEncoder subclass",
        shorthand: {
          verbose: "import json\nwith open('data.json', 'r') as f:\n    json_str = f.read()\ndata = json.loads(json_str)",
          concise: "import json\nwith open('data.json', 'r') as f:\n    data = json.load(f)",
        },
      },
    ],
  },

  // ── Section 3: OS & shutil — System Operations ─────────────────────────────────────────
  {
    id: "os-shutil",
    title: "OS & shutil — System Operations",
    entries: [
      {
        id: "os-path",
        fn: "os.path.join(), os.path.exists(), os.getcwd(), os.listdir(), os.environ",
        desc: "Legacy path operations, directory listing, environment variables",
        category: "OS Utilities",
        subtitle: "Cross-platform operations",
        signature: "os.path.join(*parts), os.path.exists(path) → bool, os.getcwd() → str, os.listdir(path) → list, os.environ → dict",
        descLong: "os module provides cross-platform operations. os.path methods work but pathlib is preferred. listdir() returns immediate children only; use glob for patterns.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of os.path.join(), os.path.exists(), os.getcwd(), os.listdir(), os.environ — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport os\n# Join paths the cross-platform way (don't use '+').\nfull_path = os.path.join('/home/user', 'projects', 'data.txt')\n# Check existence and current dir.\nprint(os.path.exists(full_path))\nprint(os.getcwd())\n# List immediate children of a directory.\nfor name in os.listdir('.'):\n    print(name)\n# Read an environment variable with a default.\ndebug = os.environ.get('DEBUG', 'false')\nprint(debug)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of os.path.join(), os.path.exists(), os.getcwd(), os.listdir(), os.environ — common patterns you'll see in production.\n# APPROACH  - Combine os.path.join(), os.path.exists(), os.getcwd(), os.listdir(), os.environ with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nimport os\n# Expand ~ to home dir, then split extension.\nconfig = os.path.expanduser('~/.config/app.toml')\nstem, ext = os.path.splitext(config)\nprint(stem, ext)  # /home/user/.config/app .toml\n# scandir() yields DirEntry objects with cached stat info -- prefer over listdir().\ntotal = 0\nwith os.scandir('.') as it:\n    for entry in it:\n        if entry.is_file():           # no extra syscall\n            total += entry.stat().st_size\nprint(f'total bytes: {total}')\n# Walk a tree, prune hidden dirs in place.\nfor root, dirs, files in os.walk('.'):\n    dirs[:] = [d for d in dirs if not d.startswith('.')]\n    for f in files:\n        print(os.path.join(root, f))\n# Read env with type coercion.\nport = int(os.environ.get('PORT', '8080'))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of os.path.join(), os.path.exists(), os.getcwd(), os.listdir(), os.environ — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nimport os\nfrom contextlib import contextmanager\nfrom pathlib import Path\n@contextmanager\ndef pushd(target):\n    \"\"\"chdir into target, restore even on exception. os.chdir has no scope.\"\"\"\n    prev = os.getcwd()\n    os.chdir(target)\n    try:\n        yield Path(target).resolve()\n    finally:\n        os.chdir(prev)\ndef fast_du(root):\n    \"\"\"Fast disk usage: scandir + recursion, single stat per entry.\"\"\"\n    total = 0\n    with os.scandir(root) as it:\n        for e in it:\n            try:\n                if e.is_file(follow_symlinks=False):\n                    total += e.stat(follow_symlinks=False).st_size\n                elif e.is_dir(follow_symlinks=False):\n                    total += fast_du(e.path)\n            except (PermissionError, FileNotFoundError):\n                continue   # races and locked dirs are normal\n    return total\n# Required env vars: fail loudly at startup, not deep in a request.\ndef require_env(*names):\n    missing = [n for n in names if n not in os.environ]\n    if missing:\n        raise SystemExit(f'missing required env: {missing}')\n    return {n: os.environ[n] for n in names}\n# Decision rule:\n#   new code, paths as data            -> pathlib.Path\n#   hot loop scanning many entries     -> os.scandir + DirEntry (cached stat)\n#   need fileno / fork / chdir         -> os module\n#   reading config from environment    -> os.environ.get with explicit defaults\n#\n# Anti-pattern: a + '/' + b for paths -- breaks on Windows, double-slashes on Unix,\n# and silently allows '/etc/passwd' if b is user-controlled."
                  }
        ],
        tips: [
                  "Prefer pathlib.Path over os.path for new code",
                  ".listdir() returns immediate children only; use pathlib.glob() for patterns",
                  "os.environ is a dict-like object; use .get() with defaults to handle missing vars"
        ],
        mistake: "Using string concatenation instead of os.path.join() or pathlib /",
        shorthand: {
          verbose: "import os\npath = os.path.join(os.getcwd(), 'data', 'file.txt')\nif os.path.exists(path):\n    entries = os.listdir(os.path.dirname(path))",
          concise: "from pathlib import Path\npath = Path.cwd() / 'data' / 'file.txt'\nif path.exists():\n    entries = list(path.parent.iterdir())",
        },
      },
      {
        id: "shutil-copy",
        fn: "shutil.copy(), shutil.copy2(), shutil.copytree(), shutil.rmtree()",
        desc: "Copy files and directories recursively; remove directory trees",
        category: "File Operations",
        subtitle: "Copy and remove files/dirs",
        signature: "shutil.copy(src, dst), shutil.copy2(src, dst), shutil.copytree(src, dst), shutil.rmtree(path)",
        descLong: "copy() duplicates file; copy2() preserves metadata. copytree() recursively copies directories. rmtree() removes entire directory trees.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of shutil.copy(), shutil.copy2(), shutil.copytree(), shutil.rmtree() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport shutil\n# Copy a single file (overwrites if dst exists).\nshutil.copy('source.txt', 'destination.txt')\n# Copy + preserve mtime/permissions -- use this for backups.\nshutil.copy2('source.txt', 'backup.txt')\n# Recursively copy a directory tree.\nshutil.copytree('src_dir', 'dst_dir')\n# Remove a tree -- there is no recycle bin.\nshutil.rmtree('unwanted_dir')"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of shutil.copy(), shutil.copy2(), shutil.copytree(), shutil.rmtree() — common patterns you'll see in production.\n# APPROACH  - Combine shutil.copy(), shutil.copy2(), shutil.copytree(), shutil.rmtree() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nimport os\nimport shutil\nimport stat\n# Idempotent recursive copy (Python 3.8+).\nshutil.copytree(\n    'src',\n    'dst',\n    dirs_exist_ok=True,\n    ignore=shutil.ignore_patterns('*.tmp', '__pycache__', '.git', 'node_modules'),\n)\n# Custom ignore callable -- skip files larger than 100MB.\ndef skip_huge(dirname, names):\n    return [n for n in names\n            if os.path.isfile(os.path.join(dirname, n))\n            and os.path.getsize(os.path.join(dirname, n)) > 100 * 1024 * 1024]\nshutil.copytree('archive', 'mirror', ignore=skip_huge, dirs_exist_ok=True)\n# rmtree on Windows: read-only files raise PermissionError. onexc clears the bit.\ndef force_writable(func, path, exc):\n    os.chmod(path, stat.S_IWRITE)\n    func(path)\nshutil.rmtree('build', onexc=force_writable)   # Python 3.12+; use onerror< 3.12\n# Disk free check before a big copy.\ntotal, used, free = shutil.disk_usage('.')\nprint(f'free: {free // (1<<30)} GiB')"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of shutil.copy(), shutil.copy2(), shutil.copytree(), shutil.rmtree() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nimport hashlib\nimport os\nimport shutil\nimport tempfile\nfrom pathlib import Path\ndef copy_atomic(src: Path, dst: Path, *, verify: bool = True) -> None:\n    \"\"\"\n    Copy src -> dst so that readers never see a half-written dst.\n    Strategy: write to temp on the SAME filesystem as dst, fsync, rename.\n    \"\"\"\n    dst.parent.mkdir(parents=True, exist_ok=True)\n    fd, tmp = tempfile.mkstemp(dir=dst.parent, prefix='.tmp.', suffix=dst.suffix)\n    try:\n        with os.fdopen(fd, 'wb') as wf, src.open('rb') as rf:\n            # copyfileobj uses os.sendfile on Linux when possible -- zero-copy.\n            shutil.copyfileobj(rf, wf, length=1024 * 1024)\n            wf.flush()\n            os.fsync(wf.fileno())                     # data hits disk\n        shutil.copystat(src, tmp, follow_symlinks=False)\n        os.replace(tmp, dst)                          # atomic on POSIX & NTFS\n    except BaseException:\n        Path(tmp).unlink(missing_ok=True)\n        raise\n    if verify and _sha256(src) != _sha256(dst):\n        dst.unlink(missing_ok=True)\n        raise IOError(f'hash mismatch after copy: {src} -> {dst}')\ndef _sha256(path: Path) -> str:\n    h = hashlib.sha256()\n    with path.open('rb') as f:\n        for chunk in iter(lambda: f.read(1 << 20), b''):\n            h.update(chunk)\n    return h.hexdigest()\ndef safe_rmtree(target: Path, sandbox: Path) -> None:\n    \"\"\"rmtree with a tripwire: target must live INSIDE sandbox.\"\"\"\n    target = target.resolve()\n    sandbox = sandbox.resolve()\n    if not target.is_relative_to(sandbox):           # 3.9+\n        raise ValueError(f'refusing to delete outside sandbox: {target}')\n    shutil.rmtree(target, ignore_errors=False)\n# Decision rule:\n#   single small file                    -> shutil.copy2 (preserves metadata)\n#   directory tree, re-runnable          -> copytree(..., dirs_exist_ok=True)\n#   publishing a build artifact          -> copy_atomic (tmp + fsync + replace)\n#   100k+ files or remote                -> rsync / cloud SDK, NOT shutil\n#   destructive delete on user input     -> safe_rmtree with sandbox check\n#\n# Anti-pattern: shutil.rmtree(user_input) without a sandbox guard.\n# A relative '..' or absolute '/' wipes the wrong tree -- there is no undo."
                  }
        ],
        tips: [
                  "copy2() better for backups; preserves modification time and permissions",
                  "copytree() fails if destination exists; use dirs_exist_ok=True in Python 3.8+",
                  "rmtree() is dangerous; ensure you specify correct path"
        ],
        mistake: "Using os.remove() for directories; use shutil.rmtree() instead",
        shorthand: {
          verbose: "import os\nimport shutil\nsrc = 'old_project'\ndst = 'old_project_backup'\nshutil.copytree(src, dst)\nshutil.rmtree(src)",
          concise: "import shutil\nshutil.copytree('old_project', 'old_project_backup')\nshutil.rmtree('old_project')",
        },
      },
      {
        id: "shutil-move-archive",
        fn: "shutil.move(), shutil.make_archive(), shutil.unpack_archive()",
        desc: "Move/rename paths; create and extract archives (zip, tar, etc.)",
        category: "File Operations",
        subtitle: "Move and archive operations",
        signature: "shutil.move(src, dst), shutil.make_archive(base_name, format, root_dir), shutil.unpack_archive(filename, extract_dir)",
        descLong: "move() renames or moves files/dirs (like mv command). make_archive() creates zip/tar files. unpack_archive() extracts them.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of shutil.move(), shutil.make_archive(), shutil.unpack_archive() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport shutil\n# Rename / move (handles cross-filesystem moves -- os.rename does not).\nshutil.move('old_name.txt', 'new_name.txt')\n# Zip a folder into backup.zip.\nshutil.make_archive('backup', 'zip', 'data')\n# tar.gz it instead.\nshutil.make_archive('backup', 'gztar', 'data')\n# Extract -- format auto-detected from extension.\nshutil.unpack_archive('backup.zip', 'extracted_data')"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of shutil.move(), shutil.make_archive(), shutil.unpack_archive() — common patterns you'll see in production.\n# APPROACH  - Combine shutil.move(), shutil.make_archive(), shutil.unpack_archive() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nimport shutil\nimport tarfile\nimport zipfile\nfrom pathlib import Path\n# Move with explicit conflict handling.\nsrc, dst = Path('report.pdf'), Path('archive/report.pdf')\nif dst.exists():\n    dst.unlink()                  # or rename to a backup\nshutil.move(src, dst)\n# Inspect a zip before extracting (avoid surprises).\nwith zipfile.ZipFile('upload.zip') as z:\n    for info in z.infolist():\n        print(info.filename, info.file_size)\n# Build a zip with explicit compression.\nwith zipfile.ZipFile('out.zip', 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as z:\n    for p in Path('data').rglob('*'):\n        if p.is_file():\n            z.write(p, arcname=p.relative_to('data'))\n# Stream a tar.gz line by line for huge archives.\nwith tarfile.open('logs.tar.gz', 'r:gz') as tf:\n    for member in tf:\n        if member.name.endswith('.log') and member.size < 10_000_000:\n            f = tf.extractfile(member)\n            if f:\n                first_line = f.readline()\n                print(member.name, first_line[:80])"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of shutil.move(), shutil.make_archive(), shutil.unpack_archive() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nimport os\nimport tarfile\nimport zipfile\nfrom pathlib import Path\ndef atomic_rename(src: Path, dst: Path) -> None:\n    \"\"\"\n    os.replace is atomic only on the SAME filesystem.\n    For cross-FS moves, copy + fsync + replace + unlink source.\n    \"\"\"\n    src, dst = Path(src), Path(dst)\n    if src.stat().st_dev == dst.parent.stat().st_dev:\n        os.replace(src, dst)\n    else:\n        # cross-FS -> shutil.move handles copy + delete, but we want fsync.\n        import shutil\n        tmp = dst.with_suffix(dst.suffix + '.part')\n        shutil.copy2(src, tmp)\n        with open(tmp, 'rb') as f:\n            os.fsync(f.fileno())\n        os.replace(tmp, dst)\n        src.unlink()\ndef deterministic_zip(out_path: Path, root: Path) -> None:\n    \"\"\"\n    Build a zip whose bytes are identical for the same input -- useful for\n    cache keys, supply-chain attestations, build reproducibility.\n    \"\"\"\n    files = sorted(p for p in root.rglob('*') if p.is_file())\n    with zipfile.ZipFile(out_path, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:\n        for p in files:\n            info = zipfile.ZipInfo(filename=str(p.relative_to(root)),\n                                   date_time=(1980, 1, 1, 0, 0, 0))\n            info.external_attr = 0o644 << 16\n            with p.open('rb') as f:\n                z.writestr(info, f.read())\ndef safe_extract_tar(archive: Path, dest: Path) -> None:\n    \"\"\"\n    CVE-2007-4559: tar can write outside dest via '../' or absolute paths.\n    Python 3.12 added a 'data' filter; older code must validate manually.\n    \"\"\"\n    dest = dest.resolve()\n    with tarfile.open(archive) as tf:\n        if hasattr(tarfile, 'data_filter'):           # 3.12+\n            tf.extractall(dest, filter='data')\n            return\n        for m in tf.getmembers():\n            target = (dest / m.name).resolve()\n            if not target.is_relative_to(dest):\n                raise ValueError(f'unsafe path in archive: {m.name}')\n        tf.extractall(dest)\n# Decision rule:\n#   quick move on same FS                 -> os.replace (atomic)\n#   move across FS / unknown              -> shutil.move\n#   zip a directory, one shot             -> shutil.make_archive\n#   reproducible / deterministic archive  -> zipfile.ZipInfo with fixed mtime\n#   extracting an UNTRUSTED archive       -> tarfile filter='data' or manual path check\n#\n# Anti-pattern: tarfile.extractall(untrusted) without filter or path validation.\n# A malicious tarball with '../../etc/cron.d/x' will plant a cron job in /etc."
                  }
        ],
        tips: [
                  "move() auto-detects file vs directory; works across filesystems",
                  "Supported formats: zip, tar, gztar, bztar, xztar",
                  "unpack_archive() auto-detects format from filename"
        ],
        mistake: "Using os.rename() across filesystems; use shutil.move() instead",
        shorthand: {
          verbose: "import shutil\nimport os\nsrc = 'project'\nbackup = 'project_backup'\nos.rename(src, backup)\nshutil.make_archive(backup, 'zip', '.', src)",
          concise: "import shutil\nshutil.make_archive('project_backup', 'zip', 'project')",
        },
      },
      {
        id: "tempfile",
        fn: "tempfile.NamedTemporaryFile(), tempfile.TemporaryDirectory(), mkdtemp()",
        desc: "Create temporary files and directories that auto-clean",
        category: "Temporary Files",
        subtitle: "Safe temporary storage",
        signature: "NamedTemporaryFile(mode=\"w+b\", delete=True), TemporaryDirectory(), mkdtemp(suffix=\"\", prefix=\"tmp\")",
        descLong: "NamedTemporaryFile and TemporaryDirectory auto-delete when closed/exited. Use with statement for safety. mkdtemp() returns path (manual cleanup).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of tempfile.NamedTemporaryFile(), tempfile.TemporaryDirectory(), mkdtemp() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport tempfile\nfrom pathlib import Path\n# Auto-deleting file.\nwith tempfile.NamedTemporaryFile(mode='w+', delete=True) as f:\n    f.write('hello')\n    f.seek(0)\n    print(f.read())              # 'hello'\n# File is gone here.\n# Auto-deleting directory.\nwith tempfile.TemporaryDirectory() as tmp:\n    p = Path(tmp) / 'data.txt'\n    p.write_text('payload')\n    print(p.read_text())\n# Whole tree is gone here."
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of tempfile.NamedTemporaryFile(), tempfile.TemporaryDirectory(), mkdtemp() — common patterns you'll see in production.\n# APPROACH  - Combine tempfile.NamedTemporaryFile(), tempfile.TemporaryDirectory(), mkdtemp() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nimport os\nimport subprocess\nimport tempfile\nfrom pathlib import Path\n# Windows: a NamedTemporaryFile cannot be opened a second time while the first\n# handle is alive. delete=False + manual unlink is the workaround.\ntmp = tempfile.NamedTemporaryFile('w', suffix='.json', delete=False)\ntry:\n    tmp.write('{\"k\": 1}')\n    tmp.close()                                    # release the handle\n    subprocess.run(['cat', tmp.name], check=True)  # second opener works now\nfinally:\n    os.unlink(tmp.name)\n# mkstemp returns (fd, path) -- low-level, but no race window.\nfd, path = tempfile.mkstemp(prefix='app_', suffix='.tmp')\ntry:\n    with os.fdopen(fd, 'w') as f:\n        f.write('atomic write target')\nfinally:\n    os.unlink(path)\n# Pin tempdir into a known location (e.g., per-test isolation).\nwith tempfile.TemporaryDirectory(prefix='test_', dir='./.cache') as tmp:\n    workspace = Path(tmp)\n    (workspace / 'sub').mkdir()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of tempfile.NamedTemporaryFile(), tempfile.TemporaryDirectory(), mkdtemp() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nimport os\nimport tempfile\nfrom contextlib import contextmanager\nfrom pathlib import Path\n@contextmanager\ndef atomic_write(target: Path, mode: str = 'w', **kw):\n    \"\"\"\n    Write to a temp file in target's directory, fsync, rename onto target.\n    Readers either see the OLD bytes or the NEW bytes -- never partial.\n    Crucial for config files, sqlite checkpoints, model weights.\n    \"\"\"\n    target = Path(target)\n    target.parent.mkdir(parents=True, exist_ok=True)\n    fd, tmp = tempfile.mkstemp(dir=target.parent,\n                               prefix=f'.{target.name}.',\n                               suffix='.part')\n    try:\n        with os.fdopen(fd, mode, **kw) as f:\n            yield f\n            f.flush()\n            os.fsync(f.fileno())\n        os.replace(tmp, target)                  # atomic on same FS\n    except BaseException:\n        try: os.unlink(tmp)\n        except FileNotFoundError: pass\n        raise\n@contextmanager\ndef working_sandbox(prefix: str = 'job_'):\n    \"\"\"\n    Isolated dir for a unit of work. Honors $TMPDIR (containers, k8s emptyDir).\n    Cleans up on exit even if caller raises.\n    \"\"\"\n    base = os.environ.get('TMPDIR') or tempfile.gettempdir()\n    with tempfile.TemporaryDirectory(prefix=prefix, dir=base) as d:\n        yield Path(d)\n# Usage: write a JSON config so a partial write never corrupts the live file.\nwith atomic_write(Path('/etc/myapp/config.json')) as f:\n    f.write('{\"version\": 7}')\nwith working_sandbox('etl_') as work:\n    (work / 'in.csv').write_text('a,b\\n1,2\\n')\n    # ... process in isolation, copy results out before the 'with' exits ...\n# Decision rule:\n#   need a path you'll pass to a subprocess        -> NamedTemporaryFile(delete=False)\n#   need a sandboxed dir for a job/test            -> TemporaryDirectory()\n#   atomic publish of a config / cache / weight    -> mkstemp in target dir + fsync + replace\n#   want randomness w/o creating the file          -> mktemp() -- AVOID, race-prone\n#\n# Anti-pattern: tempfile.mktemp() (no 'k' missing -- the deprecated one).\n# It only returns a name; another process can win the race and create that path\n# before you do. Always use mkstemp() / NamedTemporaryFile / TemporaryDirectory."
                  }
        ],
        tips: [
                  "Always use with statement for NamedTemporaryFile and TemporaryDirectory",
                  "delete=False in NamedTemporaryFile keeps file after closing (manual cleanup needed)",
                  "mkdtemp() is lower-level; prefer TemporaryDirectory with with statement"
        ],
        mistake: "Forgetting to clean up temporary files created with mkdtemp()",
        shorthand: {
          verbose: "import tempfile\nimport os\nimport shutil\ntmpdir = tempfile.mkdtemp()\n# ... use tmpdir ...\nshutil.rmtree(tmpdir)",
          concise: "import tempfile\nwith tempfile.TemporaryDirectory() as tmpdir:\n    # ... use tmpdir ...\n    pass  # Auto-cleaned",
        },
      },
      {
        id: "glob-fnmatch",
        fn: "glob.glob(), glob.iglob(), fnmatch.fnmatch()",
        desc: "Pattern matching for filenames and paths; glob expansion",
        category: "Pattern Matching",
        subtitle: "Find files by pattern",
        signature: "glob.glob(pathname) → list, glob.iglob(pathname) → generator, fnmatch.fnmatch(name, pattern) → bool",
        descLong: "glob.glob() expands pathname patterns with *, ?, [seq]. iglob() returns generator. fnmatch.fnmatch() tests if string matches pattern.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of glob.glob(), glob.iglob(), fnmatch.fnmatch() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport fnmatch\nimport glob\n# All .txt files in CWD.\nprint(glob.glob('*.txt'))\n# Recursive: must pass recursive=True for ** to mean \"any depth\".\nprint(glob.glob('**/*.py', recursive=True))\n# Does this name match this pattern?\nprint(fnmatch.fnmatch('test.py', '*.py'))     # True\nprint(fnmatch.fnmatch('data.csv', 'test_*'))  # False"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of glob.glob(), glob.iglob(), fnmatch.fnmatch() — common patterns you'll see in production.\n# APPROACH  - Combine glob.glob(), glob.iglob(), fnmatch.fnmatch() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nimport fnmatch\nimport re\nfrom pathlib import Path\n# Pathlib equivalent -- yields Path objects you can chain .stat(), .read_text(), etc.\nfor p in sorted(Path('.').rglob('*.py')):\n    print(p, p.stat().st_size)\n# Case-insensitive (fnmatch is case-sensitive on POSIX).\ndef imatch(name: str, pattern: str) -> bool:\n    return fnmatch.fnmatch(name.lower(), pattern.lower())\n# Hidden files -- glob skips them by default.\nprint(glob.glob('*'))            # excludes .git, .env\nprint(glob.glob('.*'))            # only hidden\nprint(glob.glob('*', include_hidden=True))   # 3.11+: both\n# Compile fnmatch patterns to a regex once, reuse in tight loops.\npatterns = ['*.log', 'core.*', '*.tmp']\nregex = re.compile('|'.join(fnmatch.translate(p) for p in patterns))\njunk = [name for name in os.listdir('.') if regex.match(name)]\nimport os  # (kept here so the snippet stands alone)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of glob.glob(), glob.iglob(), fnmatch.fnmatch() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nimport fnmatch\nimport os\nimport re\nfrom pathlib import Path\nfrom typing import Iterator\ndef compile_patterns(patterns: list[str]) -> re.Pattern:\n    \"\"\"fnmatch.translate -> single anchored regex covering all patterns.\"\"\"\n    if not patterns:\n        return re.compile(r'(?!.*)')          # matches nothing\n    return re.compile('|'.join(fnmatch.translate(p) for p in patterns))\ndef walk_filtered(root: Path,\n                  include: list[str] | None = None,\n                  exclude: list[str] | None = None,\n                  follow_symlinks: bool = False) -> Iterator[Path]:\n    \"\"\"\n    Streaming walker:\n      - scandir-based (cheap), no realpath on every entry\n      - prunes excluded directories (don't descend into node_modules)\n      - returns Path objects in deterministic order\n    \"\"\"\n    inc = compile_patterns(include or ['*'])\n    exc = compile_patterns(exclude or [])\n    def _walk(d: Path) -> Iterator[Path]:\n        try:\n            entries = sorted(os.scandir(d), key=lambda e: e.name)\n        except (PermissionError, FileNotFoundError):\n            return\n        for e in entries:\n            if exc.match(e.name):\n                continue                                   # prune at this level\n            if e.is_dir(follow_symlinks=follow_symlinks):\n                yield from _walk(Path(e.path))\n            elif e.is_file(follow_symlinks=follow_symlinks):\n                if inc.match(e.name):\n                    yield Path(e.path)\n    yield from _walk(root)\n# Usage: gitignore-flavored sweep.\nhits = list(walk_filtered(\n    Path('.'),\n    include=['*.py', '*.pyx'],\n    exclude=['__pycache__', '.git', '.venv', 'build', 'dist', '*.egg-info'],\n))\nprint(f'{len(hits)} source files')\n# Decision rule:\n#   one-shot script, small tree         -> glob.glob / Path.rglob\n#   need lazy iteration                 -> glob.iglob / Path.rglob (it's a generator)\n#   million-file tree, prune dirs early -> os.scandir recursion (the walker above)\n#   match a name against many patterns  -> compile fnmatch.translate joined with '|'\n#   gitignore semantics required        -> use pathspec library (correct negation rules)\n#\n# Anti-pattern: glob.glob('**/*.py') without recursive=True. It returns []\n# silently and you spend an hour wondering why your linter sees no files."
                  }
        ],
        tips: [
                  "glob.glob() returns unsorted list; sort if order matters",
                  "Use recursive=True for ** patterns; can be slow on large trees",
                  "fnmatch.fnmatch() is case-sensitive on Unix; use .lower() for case-insensitive match"
        ],
        mistake: "Using ** without recursive=True; it won't match recursively",
        shorthand: {
          verbose: "import glob\nfiles = glob.glob('**/*.py', recursive=True)\nif len(files) > 0:\n    for f in files:\n        print(f)",
          concise: "from pathlib import Path\nfor f in Path('.').rglob('*.py'):\n    print(f)",
        },
      },
    ],
  },
]

export default { meta, sections }
