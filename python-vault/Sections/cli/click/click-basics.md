---
type: "entry"
domain: "python"
file: "cli"
section: "click"
id: "click-basics"
title: "@click.command(), @click.option(), @click.argument(), click.echo()"
category: "Fundamentals"
subtitle: "Define commands with decorators"
signature_short: "@click.command(); @click.option(\"--name\"); @click.argument(\"file\"); click.echo(msg)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "@click.command(), @click.option(), @click.argument(), click.echo()"
  - "click-basics"
tags:
  - "python"
  - "python/cli"
  - "python/cli/click"
  - "category/fundamentals"
  - "tier/tiered"
---

# @click.command(), @click.option(), @click.argument(), click.echo()

> Define commands with decorators

## Overview

@click.command() marks a function as a CLI command. @click.option() adds optional flags. @click.argument() adds positional arguments. click.echo() prints with color and formatting support.

## Signature

```python
@click.command(); @click.option("--name"); @click.argument("file"); click.echo(msg)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - @click.command + @click.option / @click.argument; the function args mirror the decorators.
# STRENGTHS - Short, readable; auto --help; click.echo handles Unicode + colors.
# WEAKNESSES- Decorator order matters subtly; argument decorators stack outside-in.
import click

@click.command()
@click.argument("name")
@click.option("--greeting", default="Hello", help="greeting word")
@click.option("--count", type=int, default=1, help="repeat count")
def greet(name: str, greeting: str, count: int) -> None:
    """Greet someone."""
    for _ in range(count):
        click.echo(f"{greeting}, {name}!")

if __name__ == "__main__":
    greet()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - envvar fallback, multiple/required/show_default/show_envvar, version_option, exit codes via click.exceptions.
# STRENGTHS - Production-grade defaults with one-line decorators; --help reflects env vars and defaults.
# WEAKNESSES- Click sets sys.exit(0); explicit non-zero exits need raise click.exceptions.ClickException(...) or sys.exit(N).
import click

@click.command(context_settings={"help_option_names": ["-h", "--help"],
                                 "max_content_width": 100,
                                 "auto_envvar_prefix": "GREET"})
@click.version_option(package_name="my-package")
@click.argument("name")
@click.option("--greeting", "-g", default="Hello", show_default=True,
              envvar="GREETING", show_envvar=True,
              help="greeting word")
@click.option("--tag", "-t", multiple=True,                # repeatable
              help="tag the greeting; pass multiple --tag")
@click.option("--count", "-n", type=click.IntRange(1, 10), default=1,
              show_default=True)
@click.option("--strict/--no-strict", default=True,        # tri-flag
              help="strict mode requires a non-empty tag")
def greet(name: str, greeting: str, tag: tuple[str, ...],
          count: int, strict: bool) -> None:
    """Greet NAME, optionally tagged."""
    if strict and not tag:
        raise click.UsageError("--strict requires at least one --tag")
    suffix = "[" + ",".join(tag) + "]" if tag else ""
    for _ in range(count):
        click.echo(f"{greeting}, {name}!{suffix}")

if __name__ == "__main__":
    greet()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Click as the production entry point: testable via CliRunner, structured errors, machine-readable output flag, completion hooks.
# STRENGTHS - First-class testing harness, sensible default exit codes, plug-in friendly via entry-points, completions for bash/zsh/fish.
# WEAKNESSES- Heavier than argparse; pulls in click + colorama deps; new contributors need to learn Click's mental model.
from __future__ import annotations
import json
import sys
import click

# 1) Custom exit codes via subclassing ClickException.
class DataError(click.ClickException):
    exit_code = 65               # EX_DATAERR

# 2) Top-level CLI with structured I/O.
@click.command(context_settings={
    "help_option_names": ["-h", "--help"],
    "auto_envvar_prefix": "MYCLI",                # MYCLI_VERBOSE -> --verbose, etc.
})
@click.version_option(package_name="my-package")
@click.argument("path", type=click.Path(exists=True, dir_okay=False, readable=True))
@click.option("--output", "-o", type=click.Choice(["text", "json"]),
              default="text", show_default=True,
              help="machine-readable output for pipelines")
@click.option("--strict/--lax", default=True, show_default=True)
@click.option("-v", "--verbose", count=True)
@click.pass_context
def cli(ctx: click.Context, path: str, output: str, strict: bool, verbose: int) -> None:
    """Lint PATH and report issues."""
    issues = _lint(path, strict=strict)
    if output == "json":
        click.echo(json.dumps({"path": path, "issues": issues}))
    else:
        for kind, msg in issues:
            click.secho(f"{kind}: ", fg="yellow", nl=False); click.echo(msg)
    if issues and strict:
        raise DataError(f"{len(issues)} issues")     # exit 65, machine-friendly

def _lint(path: str, *, strict: bool) -> list[tuple[str, str]]:
    text = open(path, encoding="utf-8").read()
    return [("tab", f"line {i+1}") for i, ln in enumerate(text.splitlines())
            if ln.startswith("\t")]

# 3) Tests: CliRunner exercises argv, env, stdin, and capturing.
def test_cli_text_output() -> None:
    from click.testing import CliRunner
    runner = CliRunner()
    with runner.isolated_filesystem():
        with open("a.txt", "w") as f: f.write("ok")
        result = runner.invoke(cli, ["a.txt"])
        assert result.exit_code == 0

def test_cli_json_strict() -> None:
    from click.testing import CliRunner
    runner = CliRunner()
    with runner.isolated_filesystem():
        with open("bad.txt", "w") as f: f.write("\tindented")
        result = runner.invoke(cli, ["bad.txt", "-o", "json"])
        assert result.exit_code == 65
        assert "issues" in result.output

# 4) Shell completion install (one-time, per shell):
#    eval "$(_MYCLI_COMPLETE=bash_source mycli)"   # bash
#    eval "$(_MYCLI_COMPLETE=zsh_source  mycli)"   # zsh
#    _MYCLI_COMPLETE=fish_source mycli | source    # fish

if __name__ == "__main__":
    cli(prog_name="mycli")

# Decision rule:
#   small CLI, stdlib-only             -> argparse
#   typed CLI you control              -> Typer
#   plug-in registry / entry points    -> Click (group + entry_points)
#   shell completions                  -> Click / Typer; argparse needs argcomplete
#   first-class CliRunner tests        -> Click; argparse must drive subprocess or sys.argv
#   --json output for piping           -> a single 'output' option + JSON in machine mode
#   non-zero exit on data error        -> ClickException subclass with exit_code = sysexit code
#   env-var fallback for ALL options   -> auto_envvar_prefix in context_settings
#
# Anti-pattern: print()-then-sys.exit(1). Pipelines lose the diagnostic (it
# went to stdout) and 1 is too coarse. Use click.echo(..., err=True) and a
# typed ClickException with the correct sysexits code.
```

## Decision Rule

```text
small CLI, stdlib-only             -> argparse
typed CLI you control              -> Typer
plug-in registry / entry points    -> Click (group + entry_points)
shell completions                  -> Click / Typer; argparse needs argcomplete
first-class CliRunner tests        -> Click; argparse must drive subprocess or sys.argv
--json output for piping           -> a single 'output' option + JSON in machine mode
non-zero exit on data error        -> ClickException subclass with exit_code = sysexit code
env-var fallback for ALL options   -> auto_envvar_prefix in context_settings
```

## Anti-Pattern

> [!warning] Anti-pattern
> print()-then-sys.exit(1). Pipelines lose the diagnostic (it
> went to stdout) and 1 is too coarse. Use click.echo(..., err=True) and a
> typed ClickException with the correct sysexits code.

## Tips

- Decorators apply top-to-bottom; arguments must come before options
- click.echo() handles Unicode and terminal colors — send diagnostics with `click.echo(..., err=True)` so pipelines never lose the message to stdout
- Function parameters match option/argument names automatically. Test commands with `click.testing.CliRunner().invoke(cli, ["..."])` — no subprocess needed. Subclass `ClickException` with `exit_code = 65` (or other sysexits codes) to give pipelines a typed signal of what failed.

## Common Mistake

> [!warning] `print()` then `sys.exit(1)` — pipelines lose the diagnostic (it went to stdout) and 1 is too coarse for callers to react. Use `click.echo(..., err=True)` for diagnostics and a typed `ClickException` subclass with the correct sysexits code.

## Shorthand (Junior → Senior)

**Junior:**
```python
import argparse, sys
parser = argparse.ArgumentParser()
parser.add_argument('name')
parser.add_argument('--greeting', default='Hello')
parser.add_argument('--count', type=int, default=1)
args = parser.parse_args()
for _ in range(args.count):
    print(f"{args.greeting}, {args.name}!")
```

**Senior:**
```python
import click
@click.command()
@click.argument('name')
@click.option('--greeting', default='Hello')
@click.option('--count', type=int, default=1)
def greet(name, greeting, count):
    for _ in range(count):
        click.echo(f"{greeting}, {name}!")

if __name__ == '__main__':
    greet()
```

## See Also

- [[Sections/cli/argparse/argparse-basics|ArgumentParser, add_argument(), parse_args() (CLI Tools)]]
- [[Sections/cli/typer/typer-basics|typer.Typer(), Annotated, typer.Option(), typer.Argument() (CLI Tools)]]
- [[Sections/cli/cli-utilities/sys-argv|sys.argv, sys.stdin, sys.stdout, sys.stderr (CLI Tools)]]
- [[Sections/cli/click/_Index|CLI Tools → Click]]
- [[Sections/cli/_Index|CLI Tools index]]
- [[_Index|Vault index]]
