---
type: "entry"
domain: "python"
file: "cli"
section: "cli-utilities"
id: "rich-output"
title: "rich.print(), Console, Table, Progress"
category: "Formatting"
subtitle: "Beautiful output with colors, tables, and progress"
signature_short: "rich.print(...); Console().print(...); Table(); Progress()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "rich.print(), Console, Table, Progress"
  - "rich-output"
tags:
  - "python"
  - "python/cli"
  - "python/cli/cli-utilities"
  - "category/formatting"
  - "tier/tiered"
---

# rich.print(), Console, Table, Progress

> Beautiful output with colors, tables, and progress

## Overview

rich.print() prints formatted text with colors and styles. Console object provides more control. Table renders structured data. Progress shows progress bars for long operations.

## Signature

```python
rich.print(...); Console().print(...); Table(); Progress()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Console.print with markup; Table for tabular data; track() to wrap an iterable with a progress bar.
# STRENGTHS - One library covers colors, tables, progress, syntax highlighting, tracebacks.
# WEAKNESSES- Markup + colors only render in TTYs; in non-TTY contexts Rich downgrades automatically (good).
from rich.console import Console
from rich.table import Table
from rich.progress import track
import time

console = Console()
console.print("[bold cyan]Welcome[/bold cyan]")

t = Table(title="Users")
t.add_column("name", style="cyan")
t.add_column("age",  style="magenta", justify="right")
t.add_row("Alice", "30")
t.add_row("Bob", "25")
console.print(t)

for _ in track(range(20), description="loading"):
    time.sleep(0.05)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Single Console with stderr=True; force_terminal in tests; Live for refreshing displays; Progress with multiple tasks.
# STRENGTHS - Diagnostics on stderr keep stdout clean for pipelines; multi-task Progress beats serial bars.
# WEAKNESSES- Live blocks the cursor area -- don't print() inside the block; use the live's own console.
from rich.console import Console
from rich.live import Live
from rich.panel import Panel
from rich.progress import (
    Progress, SpinnerColumn, BarColumn, TaskProgressColumn, TimeRemainingColumn
)
from rich.table import Table
from rich.traceback import install
import time

# 1) Pretty tracebacks for dev runs (NOT in libraries; the consumer decides).
install(show_locals=False)

# 2) Two consoles: one for data on stdout, one for diagnostics on stderr.
out = Console()
err = Console(stderr=True)

# 3) Build a table from rows.
def render_users(rows: list[dict]) -> Table:
    t = Table(title="Users", expand=True, header_style="bold cyan")
    t.add_column("name");   t.add_column("age", justify="right")
    t.add_column("status", style="green")
    for r in rows:
        t.add_row(r["name"], str(r["age"]), r["status"])
    return t

out.print(render_users([{"name":"Alice","age":30,"status":"active"},
                        {"name":"Bob","age":25,"status":"idle"}]))

# 4) Progress with multiple tasks and time-remaining.
with Progress(
    SpinnerColumn(),
    "[progress.description]{task.description}",
    BarColumn(),
    TaskProgressColumn(),
    TimeRemainingColumn(),
    transient=True,                     # bar disappears when done
    console=err,                        # progress goes to stderr
) as prog:
    download = prog.add_task("download", total=100)
    process  = prog.add_task("process",  total=100)
    while not prog.finished:
        prog.advance(download, 5); prog.advance(process, 3)
        time.sleep(0.05)

err.log("[green]done[/green]")          # log() includes time + caller info
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - One Console per stream; respect NO_COLOR and FORCE_COLOR; theme constants; degrade to plain text under --no-color or non-TTY; never print secrets.
# STRENGTHS - Output works the same in tmux/CI/JSON pipelines; users with NO_COLOR or accessibility tooling are honored automatically.
# WEAKNESSES- Rich is heavy; for daemons that only log, structlog + a JSON renderer is leaner.
from __future__ import annotations
import os
import sys
from rich.console import Console
from rich.theme import Theme
from rich.markdown import Markdown
from rich.panel import Panel

# 1) Honor NO_COLOR (https://no-color.org) and FORCE_COLOR (CI overrides).
def _color_force() -> bool | None:
    if "NO_COLOR" in os.environ:        return False
    if os.environ.get("FORCE_COLOR"):    return True
    return None                         # let Rich auto-detect

THEME = Theme({
    "info":     "cyan",
    "warn":     "yellow",
    "error":    "bold red",
    "ok":       "bold green",
    "muted":    "dim",
    "kv.key":   "bold",
    "kv.value": "white",
})

def make_consoles() -> tuple[Console, Console]:
    common = dict(theme=THEME, force_terminal=_color_force(),
                  highlight=False, soft_wrap=False)
    return Console(**common), Console(stderr=True, **common)

out, err = make_consoles()

# 2) Render structured data either as JSON (stdout) or a Rich panel (stderr-friendly).
def render_result(payload: dict, *, json_mode: bool) -> None:
    if json_mode:
        import json
        out.print_json(json.dumps(payload))   # rich's pretty JSON (still parseable)
    else:
        body = "\n".join(f"[kv.key]{k}[/kv.key]: [kv.value]{v}[/kv.value]"
                          for k, v in payload.items())
        out.print(Panel(body, title="result", style="info"))

# 3) Markdown rendering for help output.
def render_help(text: str) -> None:
    err.print(Markdown(text))

# 4) Capturing for tests -- Console.capture() makes assertions easy.
def to_text(renderable) -> str:
    test_console = Console(width=80, record=True, file=open(os.devnull, "w"),
                            theme=THEME, force_terminal=False)
    test_console.print(renderable)
    return test_console.export_text()

# 5) Logging integration -- handle ONCE at startup, not per-call.
def install_rich_logging(level: int = 20) -> None:
    import logging
    from rich.logging import RichHandler
    logging.basicConfig(
        level=level,
        format="%(message)s",
        datefmt="[%X]",
        handlers=[RichHandler(console=err, rich_tracebacks=True,
                              show_path=False, markup=True)],
    )

# Decision rule:
#   colored output                       -> Rich Console with theme; honor NO_COLOR
#   data on stdout                       -> Console() (default stdout); plain text or JSON
#   diagnostics                          -> Console(stderr=True); never mix with data stream
#   tabular output                       -> rich.table.Table with expand=True
#   multi-step progress                  -> rich.progress.Progress with multiple tasks
#   blocking refresh display             -> rich.live.Live (no print() inside!)
#   pretty tracebacks                    -> rich.traceback.install(show_locals=False)
#   logs                                 -> RichHandler ONCE at startup; logging API everywhere else
#   testing styled output                -> Console(record=True) + .export_text()
#
# Anti-pattern: print() with ANSI escapes hard-coded in your strings. They
# render as literal '\x1b[31m...' in non-TTY contexts AND can't be disabled
# via NO_COLOR. Use a Console; let Rich decide what to emit.
```

## Decision Rule

```text
colored output                       -> Rich Console with theme; honor NO_COLOR
data on stdout                       -> Console() (default stdout); plain text or JSON
diagnostics                          -> Console(stderr=True); never mix with data stream
tabular output                       -> rich.table.Table with expand=True
multi-step progress                  -> rich.progress.Progress with multiple tasks
blocking refresh display             -> rich.live.Live (no print() inside!)
pretty tracebacks                    -> rich.traceback.install(show_locals=False)
logs                                 -> RichHandler ONCE at startup; logging API everywhere else
testing styled output                -> Console(record=True) + .export_text()
```

## Anti-Pattern

> [!warning] Anti-pattern
> print() with ANSI escapes hard-coded in your strings. They
> render as literal '\x1b[31m...' in non-TTY contexts AND can't be disabled
> via NO_COLOR. Use a Console; let Rich decide what to emit.

## Tips

- Markup uses [color]text[/color] syntax
- Table.add_column() and Table.add_row() build tables
- track() wraps iterables to show progress bars automatically. Use TWO Consoles — `Console()` for data on stdout, `Console(stderr=True)` for diagnostics — so JSON pipelines never get bar/spinner noise mixed into the data stream. Honor `NO_COLOR` and `FORCE_COLOR` env vars (Rich auto-detects, but pass `force_terminal=True/False` if you need to override). Install `RichHandler` ONCE at startup for logging integration.

## Common Mistake

> [!warning] print() with hard-coded ANSI escape codes — they render as literal `\x1b[31m...` in non-TTY contexts AND can't be disabled via NO_COLOR. Use a Console with a Theme; let Rich decide what to emit.

## Shorthand (Junior → Senior)

**Junior:**
```python
import sys, time
print("Welcome!")
print("Error: Something went wrong")
print("Name | Age | Status")
print("-" * 30)
print("Alice | 30 | Active")
print("Bob | 25 | Inactive")
for i in range(10):
    print(f"Processing... {i+1}/10")
    time.sleep(0.1)
print("Complete!")
```

**Senior:**
```python
from rich.console import Console
from rich.table import Table
from rich.progress import track
import time

console = Console()
console.print("[bold cyan]Welcome![/bold cyan]")

table = Table(title="User Data")
table.add_column("Name", style="cyan")
table.add_row("Alice", "30")
console.print(table)

for _ in track(range(10)):
    time.sleep(0.1)
console.print("[green]✓ Complete![/green]")
```

## See Also

- [[Sections/cli/cli-utilities/_Index|CLI Tools → Output & Utilities]]
- [[Sections/cli/_Index|CLI Tools index]]
- [[_Index|Vault index]]
