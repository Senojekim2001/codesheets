---
type: "entry"
domain: "python"
file: "cli"
section: "cli-utilities"
id: "sys-argv"
title: "sys.argv, sys.stdin, sys.stdout, sys.stderr"
category: "Fundamentals"
subtitle: "Direct access to command-line arguments and I/O streams"
signature_short: "sys.argv[0], sys.argv[1:]; sys.stdin.read(); sys.stdout.write(); sys.stderr.write()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sys.argv, sys.stdin, sys.stdout, sys.stderr"
  - "sys-argv"
tags:
  - "python"
  - "python/cli"
  - "python/cli/cli-utilities"
  - "category/fundamentals"
  - "tier/tiered"
---

# sys.argv, sys.stdin, sys.stdout, sys.stderr

> Direct access to command-line arguments and I/O streams

## Overview

sys.argv is a list of command-line arguments (argv[0] is script name). sys.stdin reads input. sys.stdout writes output. sys.stderr writes errors. Useful for low-level control or piping.

## Signature

```python
sys.argv[0], sys.argv[1:]; sys.stdin.read(); sys.stdout.write(); sys.stderr.write()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - sys.argv is the raw arg list; sys.stdin/stdout/stderr are the streams; sys.exit sets the code.
# STRENGTHS - Stdlib only; useful for tiny scripts and pipeline filters.
# WEAKNESSES- No types, no validation, no --help; reach for argparse the moment you have more than two flags.
import sys

if len(sys.argv) < 2:
    sys.stderr.write("usage: greet.py <name>\n")
    sys.exit(2)

name = sys.argv[1]
sys.stdout.write(f"hello, {name}\n")

# Read from stdin if piped:
if not sys.stdin.isatty():
    data = sys.stdin.read()
    sys.stderr.write(f"got {len(data)} bytes from stdin\n")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Stream stdin line-by-line; flush on signals; honor encoding; broken pipe -> EX_OK; sys.argv[0] for tool name in messages.
# STRENGTHS - Plays well with pipes, redirections, and tools like 'head'; handles UTF-8 cleanly.
# WEAKNESSES- sys.stdin.read() blocks if attached to a terminal; isatty() guards prevent the freeze.
import os
import signal
import sys

PROG = os.path.basename(sys.argv[0])

# Don't crash on 'mycli ... | head'.
signal.signal(signal.SIGPIPE, signal.SIG_DFL)

def err(msg: str) -> None:
    sys.stderr.write(f"{PROG}: {msg}\n"); sys.stderr.flush()

def main() -> int:
    if sys.stdin.isatty():
        err("expected piped input"); return 64           # EX_USAGE

    seen = 0
    try:
        for line in sys.stdin:                            # line-by-line: O(1) memory
            line = line.rstrip("\n")
            if not line.strip(): continue                 # skip blanks
            print(line.upper())                            # print -> sys.stdout
            seen += 1
    except BrokenPipeError:
        return 0                                          # downstream closed; not an error
    err(f"processed {seen} lines")
    return 0

if __name__ == "__main__":
    sys.exit(main())

# Run:  cat data.txt | python upper.py | head -5
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - sys.* as the OS interface, not the parser; binary I/O via sys.stdin.buffer; signal handling; line-buffered stdout for pipelines.
# STRENGTHS - Clean Unix citizen: streaming, low-memory, signal-aware, encoding-aware; works under all the standard shell idioms.
# WEAKNESSES- Manual sys.* manipulation is the wrong layer for typed CLIs; combine with argparse/click/typer for parsing.
from __future__ import annotations
import io
import os
import signal
import sys
from contextlib import contextmanager

# 1) Force UTF-8 on stdout/stderr regardless of locale (set PYTHONIOENCODING in
#    your wrapper script for child processes; in this process, reconfigure).
def force_utf8() -> None:
    for stream_name in ("stdout", "stderr"):
        s = getattr(sys, stream_name)
        if hasattr(s, "reconfigure"):
            s.reconfigure(encoding="utf-8", errors="replace")     # 3.7+

# 2) Line-buffered stdout for live pipelines (logs / progress).
def line_buffer_stdout() -> None:
    sys.stdout.reconfigure(line_buffering=True)

# 3) Binary stdin/stdout for pipes that carry non-text (gzip, msgpack, etc.).
def stream_bytes() -> None:
    raw_in:  io.BufferedReader = sys.stdin.buffer
    raw_out: io.BufferedWriter = sys.stdout.buffer
    while chunk := raw_in.read(64 * 1024):
        raw_out.write(chunk)

# 4) Signal handling: SIGINT -> clean exit; SIGPIPE -> default; SIGTERM -> flush.
@contextmanager
def install_signal_handlers():
    flag = {"interrupted": False}
    def on_int(signum, frame):
        flag["interrupted"] = True
        raise KeyboardInterrupt
    def on_term(signum, frame):
        sys.stdout.flush(); sys.stderr.flush(); raise SystemExit(143)
    prev_int  = signal.signal(signal.SIGINT,  on_int)
    prev_pipe = signal.signal(signal.SIGPIPE, signal.SIG_DFL)
    prev_term = signal.signal(signal.SIGTERM, on_term)
    try: yield flag
    finally:
        signal.signal(signal.SIGINT,  prev_int)
        signal.signal(signal.SIGPIPE, prev_pipe)
        signal.signal(signal.SIGTERM, prev_term)

# 5) Robust stdin draining for tools that may receive a partial input.
def drain_stdin(max_bytes: int = 100 * 1024 * 1024) -> bytes:
    buf = bytearray()
    while True:
        chunk = sys.stdin.buffer.read(64 * 1024)
        if not chunk: break
        buf.extend(chunk)
        if len(buf) > max_bytes:
            sys.stderr.write("input too large\n"); sys.exit(65)
    return bytes(buf)

# 6) Exit code conventions (sysexits.h):
#    0 ok | 1 generic | 2 argparse usage | 64 EX_USAGE | 65 EX_DATAERR
#    66 EX_NOINPUT  | 70 EX_SOFTWARE     | 130 SIGINT  | 143 SIGTERM

def main() -> int:
    force_utf8(); line_buffer_stdout()
    with install_signal_handlers() as flag:
        try:
            for line in sys.stdin:
                sys.stdout.write(line)
                if flag["interrupted"]:
                    return 130
        except BrokenPipeError:
            return 0
    return 0

if __name__ == "__main__":
    sys.exit(main())

# Decision rule:
#   raw argv access                   -> sys.argv (only for trivial scripts)
#   parsed args with help & types     -> argparse / click / typer; NEVER hand-roll
#   data stream                       -> sys.stdin / sys.stdout (text); .buffer for bytes
#   diagnostics                       -> sys.stderr; one tag per message; flush on exit
#   pipe-friendly                     -> SIGPIPE default + BrokenPipeError -> exit 0
#   live output                       -> sys.stdout.reconfigure(line_buffering=True)
#   non-ASCII                         -> reconfigure(encoding="utf-8") at process start
#   exit codes                        -> sysexits.h values; 130 for SIGINT, 143 for SIGTERM
#   tool name in messages             -> os.path.basename(sys.argv[0])
#
# Anti-pattern: 'print(json.dumps(huge_dict))' on a tool meant for pipes. The
# stdout buffer fills, downstream's read() blocks, you're convinced the tool
# is hung. Stream the records (one JSON object per line, or sys.stdout.flush()
# regularly) and the pipeline never stalls.
```

## Decision Rule

```text
raw argv access                   -> sys.argv (only for trivial scripts)
parsed args with help & types     -> argparse / click / typer; NEVER hand-roll
data stream                       -> sys.stdin / sys.stdout (text); .buffer for bytes
diagnostics                       -> sys.stderr; one tag per message; flush on exit
pipe-friendly                     -> SIGPIPE default + BrokenPipeError -> exit 0
live output                       -> sys.stdout.reconfigure(line_buffering=True)
non-ASCII                         -> reconfigure(encoding="utf-8") at process start
exit codes                        -> sysexits.h values; 130 for SIGINT, 143 for SIGTERM
tool name in messages             -> os.path.basename(sys.argv[0])
```

## Anti-Pattern

> [!warning] Anti-pattern
> 'print(json.dumps(huge_dict))' on a tool meant for pipes. The
> stdout buffer fills, downstream's read() blocks, you're convinced the tool
> is hung. Stream the records (one JSON object per line, or sys.stdout.flush()
> regularly) and the pipeline never stalls.

## Tips

- sys.argv[0] is the script name; actual args start at argv[1] (use `os.path.basename(sys.argv[0])` for the program name in messages)
- sys.stderr is for errors and debug output; iterate `for line in sys.stdin:` for O(1)-memory streaming. For binary data (gzip, msgpack), use `sys.stdin.buffer` / `sys.stdout.buffer`.
- For pipe-friendly tools: reset SIGPIPE (`signal.signal(SIGPIPE, SIG_DFL)`) and convert BrokenPipeError → exit 0 so `mycli ... | head` exits cleanly. Use `sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)` at startup so non-ASCII works regardless of locale and live output isn't held in a buffer until the process exits.

## Common Mistake

> [!warning] `print(json.dumps(huge_dict))` on a tool meant for pipes — the stdout buffer fills, downstream's read() blocks, and you're convinced the tool is hung. Stream records (one JSON object per line, or `sys.stdout.flush()` regularly). Also: forgetting to strip newlines when reading from stdin (`for line in stdin: line.rstrip("\n")`).

## Shorthand (Junior → Senior)

**Junior:**
```python
import sys
if len(sys.argv) < 2:
    print("Need argument")
    sys.exit(1)
name = sys.argv[1]
print(f"Hello, {name}")
```

**Senior:**
```python
import sys
if len(sys.argv) < 2:
    sys.stderr.write("Need argument\n")
    sys.exit(1)
name = sys.argv[1]
sys.stdout.write(f"Hello, {name}!\n")
```

## See Also

- [[Sections/cli/argparse/argparse-basics|ArgumentParser, add_argument(), parse_args() (CLI Tools)]]
- [[Sections/cli/click/click-basics|@click.command(), @click.option(), @click.argument(), click.echo() (CLI Tools)]]
- [[Sections/cli/typer/typer-basics|typer.Typer(), Annotated, typer.Option(), typer.Argument() (CLI Tools)]]
- [[Sections/cli/cli-utilities/_Index|CLI Tools → Output & Utilities]]
- [[Sections/cli/_Index|CLI Tools index]]
- [[_Index|Vault index]]
