---
type: "entry"
domain: "python"
file: "packaging"
section: "cli-tools"
id: "typer-click"
title: "Typer & Click — Building CLI Applications"
category: "CLI"
subtitle: "Typer, Click, argparse, rich, subcommands, options, arguments"
signature_short: "@app.command()  |  typer.Option()  |  @click.command()  |  argparse.ArgumentParser()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Typer & Click — Building CLI Applications"
  - "typer-click"
tags:
  - "python"
  - "python/packaging"
  - "python/packaging/cli-tools"
  - "category/cli"
  - "tier/tiered"
---

# Typer & Click — Building CLI Applications

> Typer, Click, argparse, rich, subcommands, options, arguments

## Overview

Typer builds CLIs from type hints — the fastest way to create production-quality command-line tools. Click (which Typer wraps) provides explicit decorators for more complex CLIs. argparse is the stdlib option (no dependencies). Typer auto-generates help, validates types, supports subcommands, and integrates with Rich for beautiful output. Use Typer for new projects, Click for complex plugin systems, and argparse only when zero dependencies is required.

## Signature

```python
@app.command()  |  typer.Option()  |  @click.command()  |  argparse.ArgumentParser()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - argparse (stdlib): one parser, add_argument calls, parse_args.
# STRENGTHS - Zero dependencies; bundled with every Python; stable API.
# WEAKNESSES- Verbose; subcommand support is awkward; help text is plain.
import argparse
from pathlib import Path

p = argparse.ArgumentParser(prog="proc", description="Process a data file")
p.add_argument("input", type=Path, help="input file")
p.add_argument("-o", "--output", type=Path, default=Path("out.json"))
p.add_argument("-f", "--format", choices=["json", "csv"], default="json")
p.add_argument("-v", "--verbose", action="store_true")

args = p.parse_args()
if args.verbose:
    print(f"reading {args.input} as {args.format} -> {args.output}")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Typer for CLIs from type hints; subcommand groups via add_typer; Annotated[T, Option/Argument] for help text.
# STRENGTHS - Auto-validates types, auto-generates --help, zero boilerplate, integrates with Rich for color.
# WEAKNESSES- Pulls click + typer as deps; the magic obscures stack traces in framework code.
import typer
from enum import Enum
from pathlib import Path
from typing import Annotated

app = typer.Typer(help="Project tool", rich_markup_mode="rich")

class Format(str, Enum):
    json = "json"; csv = "csv"

@app.command()
def process(
    input_file: Annotated[Path, typer.Argument(exists=True, dir_okay=False)],
    output:     Annotated[Path, typer.Option("--output", "-o")] = Path("out.json"),
    fmt:        Annotated[Format, typer.Option("--format", "-f")] = Format.json,
    verbose:    Annotated[bool, typer.Option("--verbose", "-v")] = False,
):
    """Process [bold]input_file[/bold] and emit JSON/CSV."""
    if verbose:
        typer.echo(f"in: {input_file}")
    output.write_text(input_file.read_text())     # toy

# Subcommand group: 'mycli db migrate'
db = typer.Typer(help="Database admin")
app.add_typer(db, name="db")

@db.command("migrate")
def db_migrate(rev: str = "head") -> None:
    typer.echo(f"-> {rev}")

if __name__ == "__main__":
    app()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Click for plug-in CLIs (entry-points); Typer for type-driven; both wired with structured error exits and exit codes.
# STRENGTHS - Click's Group + entry_points enables third-party subcommands; typed exit codes survive shell pipelines.
# WEAKNESSES- Click's class hierarchy bites when you need Rich help formatting -- pick rich-click or accept the plain renderer.
from __future__ import annotations
import sys
import click
from pathlib import Path

# 1) Sentinel exit codes -- treat the CLI as a UNIX citizen.
EX_OK, EX_USAGE, EX_DATAERR, EX_NOINPUT, EX_SOFTWARE = 0, 64, 65, 66, 70

# 2) Top-level group with version, env-var prefix for ALL options.
@click.group(
    context_settings={
        "auto_envvar_prefix": "MYCLI",      # MYCLI_VERBOSE -> --verbose
        "help_option_names": ["-h", "--help"],
        "max_content_width": 100,
    },
)
@click.version_option(package_name="my-package")
@click.option("-v", "--verbose", count=True, help="-v info, -vv debug.")
@click.pass_context
def cli(ctx: click.Context, verbose: int) -> None:
    """My production CLI."""
    ctx.ensure_object(dict)
    ctx.obj["verbose"] = verbose

# 3) Plug-in subcommands: third-party packages register entries under
#    [project.entry-points."mycli.commands"] and they appear automatically.
def _load_plugins() -> None:
    from importlib.metadata import entry_points
    for ep in entry_points(group="mycli.commands"):
        try:
            cli.add_command(ep.load())
        except Exception as e:                       # never crash the whole CLI
            click.echo(f"warning: failed to load plugin {ep.name}: {e}", err=True)

# 4) Typed business command with explicit exit codes -- shells can branch on them.
@cli.command()
@click.argument("path", type=click.Path(exists=True, dir_okay=False, path_type=Path))
@click.option("--strict/--lax", default=True)
def lint(path: Path, strict: bool) -> None:
    """Lint PATH; exit 0 clean, 65 data error, 70 internal."""
    try:
        text = path.read_text()
    except OSError as e:
        click.echo(f"cannot read {path}: {e}", err=True); sys.exit(EX_NOINPUT)
    issues = ["bad" for line in text.splitlines() if line.startswith("\t")]
    if strict and issues:
        click.echo(f"{len(issues)} issues", err=True); sys.exit(EX_DATAERR)
    click.echo("ok")

# 5) Standard entry: handle KeyboardInterrupt cleanly.
def main() -> int:
    _load_plugins()
    try:
        cli(standalone_mode=True)
    except KeyboardInterrupt:
        click.echo("\ninterrupted", err=True)
        return 130
    return 0

if __name__ == "__main__":
    raise SystemExit(main())

# Decision rule:
#   small script, no third-party deps allowed     -> argparse
#   typed CLI, you control all subcommands         -> Typer
#   plug-in registry / entry points                -> Click + entry_points group
#   need REPL-style nested commands                -> click-repl on top of Click
#   want shell completions                         -> Typer / Click (both ship completions)
#   --json output for machine consumers            -> add a global --output=text|json flag
#   never crash on Ctrl-C                          -> wrap main() in try/except KeyboardInterrupt
#
# Anti-pattern: print()-then-exit(1) error handling. Pipelines lose the message
# (it went to stdout), and exit(1) is too coarse for callers to react. Use
# click.echo(..., err=True) for diagnostics and EX_* codes for outcomes.
```

## Decision Rule

```text
small script, no third-party deps allowed     -> argparse
typed CLI, you control all subcommands         -> Typer
plug-in registry / entry points                -> Click + entry_points group
need REPL-style nested commands                -> click-repl on top of Click
want shell completions                         -> Typer / Click (both ship completions)
--json output for machine consumers            -> add a global --output=text|json flag
never crash on Ctrl-C                          -> wrap main() in try/except KeyboardInterrupt
```

## Anti-Pattern

> [!warning] Anti-pattern
> print()-then-exit(1) error handling. Pipelines lose the message
> (it went to stdout), and exit(1) is too coarse for callers to react. Use
> click.echo(..., err=True) for diagnostics and EX_* codes for outcomes.

## Tips

- Typer generates CLI from type hints: Path validates files exist, Enum restricts choices, Optional makes flags optional — zero boilerplate.
- Use Annotated[type, typer.Option()] for explicit help text and aliases: --verbose / -v.
- Add Rich integration: import rich; app = typer.Typer(rich_markup_mode="rich") for colored help and progress bars.
- app.add_typer() creates subcommand groups (git-style): "mycli db migrate", "mycli auth login".
- Treat the CLI as a UNIX citizen: use sentinel exit codes (EX_USAGE=64, EX_DATAERR=65, EX_NOINPUT=66, EX_SOFTWARE=70) so shells can branch, send diagnostics to stderr (click.echo(..., err=True)), and wrap main() to return 130 on KeyboardInterrupt.

## Common Mistake

> [!warning] print()-then-exit(1) error handling — pipelines lose the message (it went to stdout), and exit(1) is too coarse for callers to react. Use err=True for diagnostics, EX_* codes for outcomes, and prefer Click + entry_points groups over hand-rolled subcommands when third parties need to plug in.

## Shorthand (Junior → Senior)

**Junior:**
```python
parser = argparse.ArgumentParser()
parser.add_argument("input", type=Path)
parser.add_argument("-o", "--output", type=Path)
parser.add_argument("-f", "--format", choices=["json", "csv"])
args = parser.parse_args()
```

**Senior:**
```python
@app.command()
def process(
    input_file: Path,
    output: Path = typer.Option(Path("out.json")),
    format: Format = typer.Option(Format.json),
):
    pass
```

## See Also

- [[Sections/packaging/cli-tools/_Index|Packaging, CLI & Tooling → CLI Development & Logging]]
- [[Sections/packaging/_Index|Packaging, CLI & Tooling index]]
- [[_Index|Vault index]]
