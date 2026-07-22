---
type: "entry"
domain: "python"
file: "cli"
section: "typer"
id: "typer-basics"
title: "typer.Typer(), Annotated, typer.Option(), typer.Argument()"
category: "Fundamentals"
subtitle: "Use Python type hints to define CLI"
signature_short: "typer.Typer(); Annotated[str, typer.Option()]; Annotated[str, typer.Argument()]"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "typer.Typer(), Annotated, typer.Option(), typer.Argument()"
  - "typer-basics"
tags:
  - "python"
  - "python/cli"
  - "python/cli/typer"
  - "category/fundamentals"
  - "tier/tiered"
---

# typer.Typer(), Annotated, typer.Option(), typer.Argument()

> Use Python type hints to define CLI

## Overview

Typer uses Python type hints to auto-generate CLIs. Annotated[type, typer.Option()] marks optional params. Annotated[type, typer.Argument()] marks positional params. Types are inferred from hints.

## Signature

```python
typer.Typer(); Annotated[str, typer.Option()]; Annotated[str, typer.Argument()]
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Annotated[type, typer.Argument()/Option()]; defaults make it optional; type hints drive the parser.
# STRENGTHS - Reads like a regular function; --help auto-generated; no decorator stacking.
# WEAKNESSES- Pulls in click + typer + rich as deps; not stdlib.
import typer
from typing import Annotated

app = typer.Typer()

@app.command()
def greet(
    name:     Annotated[str, typer.Argument(help="who to greet")],
    greeting: Annotated[str, typer.Option(help="greeting word")] = "Hello",
    count:    Annotated[int, typer.Option(help="repeat count")] = 1,
):
    """Greet someone."""
    for _ in range(count):
        typer.echo(f"{greeting}, {name}!")

if __name__ == "__main__":
    app()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Path validation, Enum choices, env var fallback, version_option via callback, exit codes via typer.Exit.
# STRENGTHS - Type hints carry validation (Path exists, Enum membership, IntRange via Annotated); -h/--help out of the box.
# WEAKNESSES- Don't shadow Python builtins (list, format, type) in command names -- pick safe identifiers.
import typer
from enum import Enum
from pathlib import Path
from typing import Annotated

app = typer.Typer(help="Project tool", rich_markup_mode="rich",
                  context_settings={"help_option_names": ["-h", "--help"]})

class Format(str, Enum):
    json = "json"; csv = "csv"

def _version(value: bool):
    if value:
        typer.echo("hello 1.2.0"); raise typer.Exit()

@app.command()
def process(
    input_file: Annotated[Path, typer.Argument(exists=True, dir_okay=False,
                                               readable=True, resolve_path=True)],
    output:     Annotated[Path, typer.Option("--output", "-o")] = Path("out.json"),
    fmt:        Annotated[Format, typer.Option("--format", "-f", case_sensitive=False)] = Format.json,
    workers:    Annotated[int, typer.Option(min=1, max=16, envvar="WORKERS")] = 4,
    verbose:    Annotated[int, typer.Option("--verbose", "-v", count=True)] = 0,
    version:    Annotated[bool, typer.Option("--version", callback=_version,
                                             is_eager=True, hidden=True)] = False,
):
    """Process [b]INPUT_FILE[/b] and write to OUTPUT."""
    if verbose:
        typer.echo(f"reading {input_file}")
    if not input_file.suffix in {".csv", ".json", ".tsv"}:
        typer.secho("unsupported extension", fg="red", err=True)
        raise typer.Exit(code=2)
    output.write_text(input_file.read_text())
    typer.echo(f"wrote {output}")

if __name__ == "__main__":
    app()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Typer for typed surface; Click runner for tests; Rich-aware output toggle (--json); explicit exit codes; pluggable subcommands via typer.Typer instances.
# STRENGTHS - Type-driven CLI that compiles to Click under the hood; CliRunner from Click works on it; --json fits into pipelines.
# WEAKNESSES- Typer's bool-flag inference picked --no-X automatically; explicit naming via typer.Option("--flag/--no-flag") avoids surprises.
from __future__ import annotations
import json
import sys
from enum import Enum
from pathlib import Path
from typing import Annotated

import typer
from click.testing import CliRunner          # Typer apps work with Click's runner

# Sysexits-aligned exit codes.
EX_OK, EX_USAGE, EX_DATAERR, EX_NOINPUT, EX_SOFTWARE = 0, 64, 65, 66, 70

app = typer.Typer(no_args_is_help=True,
                  context_settings={"auto_envvar_prefix": "MYCLI",
                                    "help_option_names": ["-h", "--help"]})

class OutputFmt(str, Enum):
    text = "text"; json = "json"

# 1) State carried across the app -- typer's typical pattern: a module-level
#    object the @app.callback writes to, then commands read.
class _State:
    verbose: int = 0
    output:  OutputFmt = OutputFmt.text
state = _State()

@app.callback()
def main(
    verbose: Annotated[int, typer.Option("-v", "--verbose", count=True)] = 0,
    output:  Annotated[OutputFmt, typer.Option(case_sensitive=False)] = OutputFmt.text,
):
    """Top-level options apply to all subcommands."""
    state.verbose = verbose
    state.output  = output

@app.command()
def lint(
    path: Annotated[Path, typer.Argument(exists=True, dir_okay=False, readable=True)],
    strict: Annotated[bool, typer.Option("--strict/--lax")] = True,
):
    """Lint PATH; exit 65 on data error, 66 on missing input, 70 on internal."""
    try:
        text = path.read_text(encoding="utf-8")
    except OSError as e:
        typer.secho(f"cannot read {path}: {e}", fg="red", err=True)
        raise typer.Exit(EX_NOINPUT)

    issues = [(i + 1, "tab indent") for i, line in enumerate(text.splitlines())
              if line.startswith("\t")]

    if state.output is OutputFmt.json:
        typer.echo(json.dumps({"path": str(path), "issues": issues}))
    else:
        for ln, msg in issues:
            typer.secho(f"L{ln}: ", fg="yellow", nl=False); typer.echo(msg)

    if issues and strict:
        raise typer.Exit(EX_DATAERR)

# 2) Subcommand groups -- nest a Typer instance.
db = typer.Typer(help="Database operations")
app.add_typer(db, name="db")

@db.command("migrate")
def db_migrate(
    rev: Annotated[str, typer.Option(envvar="MYCLI_DB_REV")] = "head",
):
    typer.echo(f"migrate -> {rev}")

# 3) Tests -- driven by Click's CliRunner.
def test_lint_clean(tmp_path: Path) -> None:
    p = tmp_path / "ok.txt"; p.write_text("hello")
    r = CliRunner().invoke(app, ["lint", str(p)])
    assert r.exit_code == EX_OK

def test_lint_json_strict(tmp_path: Path) -> None:
    p = tmp_path / "bad.txt"; p.write_text("\tindent")
    r = CliRunner().invoke(app, ["--output", "json", "lint", str(p)])
    assert r.exit_code == EX_DATAERR
    payload = json.loads(r.stdout.strip().splitlines()[-1])
    assert payload["issues"]

if __name__ == "__main__":
    app()

# Decision rule:
#   typed CLI you control                   -> Typer; type hints are the API
#   plug-in registry via entry_points        -> Click (Typer apps can BE the entry point)
#   simple tool, stdlib only                 -> argparse
#   global state across subcommands          -> @app.callback() + a module State object
#   --json output for pipelines              -> top-level --output Choice; commands branch on it
#   shell completion                         -> typer --install-completion (Typer ships it)
#   tests                                    -> Click's CliRunner.invoke(app, [...]) works directly
#   exit codes                               -> raise typer.Exit(code=N) with sysexits.h codes
#
# Anti-pattern: Typer commands that print errors AND return cleanly. Pipelines
# can't distinguish success from failure. Use raise typer.Exit(code=N) (not
# sys.exit) so Typer prints the right diagnostic and the shell sees a non-zero
# exit code consistent with sysexits.
```

## Decision Rule

```text
typed CLI you control                   -> Typer; type hints are the API
plug-in registry via entry_points        -> Click (Typer apps can BE the entry point)
simple tool, stdlib only                 -> argparse
global state across subcommands          -> @app.callback() + a module State object
--json output for pipelines              -> top-level --output Choice; commands branch on it
shell completion                         -> typer --install-completion (Typer ships it)
tests                                    -> Click's CliRunner.invoke(app, [...]) works directly
exit codes                               -> raise typer.Exit(code=N) with sysexits.h codes
```

## Anti-Pattern

> [!warning] Anti-pattern
> Typer commands that print errors AND return cleanly. Pipelines
> can't distinguish success from failure. Use raise typer.Exit(code=N) (not
> sys.exit) so Typer prints the right diagnostic and the shell sees a non-zero
> exit code consistent with sysexits.

## Tips

- Type hints define argument types (int, str, bool)
- Default values for Annotated params make them optional
- Typer auto-generates help from docstrings and type hints. Use `raise typer.Exit(code=N)` (not `sys.exit(N)`) so Typer prints diagnostics and shells see sysexits-aligned codes (EX_USAGE=64, EX_DATAERR=65, EX_NOINPUT=66, EX_SOFTWARE=70). Test Typer apps with Click's `CliRunner().invoke(app, [...])` — Typer commands ARE Click commands underneath.

## Common Mistake

> [!warning] Forgetting Annotated wrapper — Typer misses Option/Argument metadata. Also: Typer commands that print errors AND return cleanly leave pipelines unable to distinguish success from failure; always `raise typer.Exit(code=N)` with the right sysexits code.

## Shorthand (Junior → Senior)

**Junior:**
```python
import argparse
parser = argparse.ArgumentParser()
parser.add_argument('name', help='Person to greet')
parser.add_argument('--greeting', default='Hello', help='Greeting word')
parser.add_argument('--count', type=int, default=1, help='Repeat count')
args = parser.parse_args()
for _ in range(args.count):
    print(f"{args.greeting}, {args.name}!")
```

**Senior:**
```python
import typer
from typing import Annotated

app = typer.Typer()

@app.command()
def greet(
    name: Annotated[str, typer.Argument()],
    greeting: Annotated[str, typer.Option()] = "Hello",
    count: Annotated[int, typer.Option()] = 1,
):
    for _ in range(count):
        typer.echo(f"{greeting}, {name}!")

if __name__ == "__main__":
    app()
```

## See Also

- [[Sections/cli/argparse/argparse-basics|ArgumentParser, add_argument(), parse_args() (CLI Tools)]]
- [[Sections/cli/click/click-basics|@click.command(), @click.option(), @click.argument(), click.echo() (CLI Tools)]]
- [[Sections/cli/cli-utilities/sys-argv|sys.argv, sys.stdin, sys.stdout, sys.stderr (CLI Tools)]]
- [[Sections/cli/typer/_Index|CLI Tools → Typer]]
- [[Sections/cli/_Index|CLI Tools index]]
- [[_Index|Vault index]]
