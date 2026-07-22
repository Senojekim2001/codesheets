---
type: "entry"
domain: "python"
file: "cli"
section: "typer"
id: "typer-app"
title: "typer.Typer(), app.command(), app()"
category: "Advanced"
subtitle: "Build apps with multiple sub-commands"
signature_short: "app = typer.Typer(); @app.command(); app()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "typer.Typer(), app.command(), app()"
  - "typer-app"
tags:
  - "python"
  - "python/cli"
  - "python/cli/typer"
  - "category/advanced"
  - "tier/tiered"
---

# typer.Typer(), app.command(), app()

> Build apps with multiple sub-commands

## Overview

Create a Typer instance, register commands with @app.command(), and run with app(). Each command is a separate function. Typer auto-generates a CLI with help text.

## Signature

```python
app = typer.Typer(); @app.command(); app()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One typer.Typer() instance; @app.command() registers each verb; app() runs the CLI.
# STRENGTHS - Each function = one subcommand; --help auto-generated for parent and children.
# WEAKNESSES- Don't name a command 'list' -- shadows builtin; use 'list_' or rename via decorator arg.
import typer
from typing import Annotated

app = typer.Typer()

@app.command()
def create(name: Annotated[str, typer.Argument()]):
    """Create a resource."""
    typer.echo(f"created {name}")

@app.command()
def delete(name: Annotated[str, typer.Argument()],
           force: Annotated[bool, typer.Option("--force/--no-force")] = False):
    """Delete a resource."""
    if not force and not typer.confirm(f"delete {name}?"):
        raise typer.Abort()
    typer.echo(f"deleted {name}")

@app.command(name="list")               # avoid shadowing the builtin
def list_resources():
    """List resources."""
    typer.echo("a, b, c")

if __name__ == "__main__":
    app()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Nested Typer apps for groups (mycli db migrate); shared state via @app.callback; Rich-flavored help; --json output toggle.
# STRENGTHS - Composable: each Typer instance can live in its own module; main app stitches them with add_typer.
# WEAKNESSES- @app.callback runs even on --help when invoked WITH a subcommand; keep it side-effect-free.
import json
import typer
from enum import Enum
from typing import Annotated

class Output(str, Enum):
    text = "text"; json_ = "json"

app = typer.Typer(no_args_is_help=True, rich_markup_mode="rich",
                  context_settings={"help_option_names": ["-h", "--help"]})

# Nested group.
db = typer.Typer(help="Database commands")
app.add_typer(db, name="db")

# Shared state (set by callback, read by commands).
class State: verbose: int = 0; out: Output = Output.text
state = State()

@app.callback()
def root(
    verbose: Annotated[int, typer.Option("-v", "--verbose", count=True)] = 0,
    out: Annotated[Output, typer.Option(case_sensitive=False)] = Output.text,
):
    state.verbose, state.out = verbose, out

def emit(payload: dict, plain: str) -> None:
    typer.echo(json.dumps(payload) if state.out is Output.json_ else plain)

@app.command()
def status():
    """Show app status."""
    emit({"status": "ok"}, "OK")

@db.command("migrate")
def db_migrate(rev: Annotated[str, typer.Option(envvar="DB_REV")] = "head"):
    """Apply migrations up to REV."""
    emit({"migrated_to": rev}, f"migrated to {rev}")

if __name__ == "__main__":
    app()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Multi-app composition with lazy imports for fast --help; entry-point plugins; rich error formatting; consistent sysexits across commands.
# STRENGTHS - Same fast --help even with heavy subcommands; third-party packages add commands without forking; tests via CliRunner.
# WEAKNESSES- Typer + Rich together pull a lot of dependencies; for a tiny CLI, just use argparse.
from __future__ import annotations
import importlib
import sys
import typer
from importlib.metadata import entry_points
from typing import Annotated

EX_OK, EX_USAGE, EX_DATAERR, EX_SOFTWARE = 0, 64, 65, 70

app = typer.Typer(
    no_args_is_help=True,
    pretty_exceptions_enable=True,         # nicer tracebacks via Rich
    pretty_exceptions_show_locals=False,   # never leak locals (secrets!)
    rich_markup_mode="markdown",
    context_settings={"auto_envvar_prefix": "MYAPP",
                      "help_option_names": ["-h", "--help"]},
)

# 1) Lazy-attached subcommands -- import on first invocation, not at startup.
LAZY_SUBCOMMANDS = {
    "lint":   "myapp.cmd_lint:app",
    "format": "myapp.cmd_format:app",
    "build":  "myapp.cmd_build:app",
}
def _attach_lazy() -> None:
    for name, target in LAZY_SUBCOMMANDS.items():
        # Use a thin wrapper that imports on FIRST invocation.
        def _factory(target=target):
            def _runner(ctx: typer.Context):
                mod_name, attr = target.rsplit(":", 1)
                mod = importlib.import_module(mod_name)
                sub: typer.Typer = getattr(mod, attr)
                # Hand off remaining argv to the loaded sub-app.
                sys.argv = [name, *ctx.args]
                sub()
            return _runner
        # Register a placeholder that lazy-loads on first use.
        app.command(name=name, context_settings={"allow_extra_args": True,
                                                 "ignore_unknown_options": True})(
            _factory()
        )
_attach_lazy()

# 2) Plug-in commands via entry_points (third-party packages register here).
def _install_plugins() -> None:
    for ep in entry_points(group="myapp.commands"):
        try:
            sub_app: typer.Typer = ep.load()
            app.add_typer(sub_app, name=ep.name)
        except Exception as e:
            typer.echo(f"warning: plugin {ep.name} failed: {e}", err=True)
_install_plugins()

# 3) Built-in command demonstrating consistent error handling.
@app.command()
def doctor(
    fix: Annotated[bool, typer.Option("--fix/--no-fix")] = False,
):
    """Check the environment; fix if --fix."""
    problems = ["broken_link"] if not fix else []
    if problems:
        typer.secho(f"{len(problems)} problems", fg="red", err=True)
        raise typer.Exit(EX_DATAERR)
    typer.secho("all good", fg="green")

# 4) Tests with Click's runner (Typer commands ARE Click commands underneath).
def test_doctor_fix() -> None:
    from click.testing import CliRunner
    r = CliRunner().invoke(app, ["doctor", "--fix"])
    assert r.exit_code == EX_OK

# 5) Shell completion: 'mycli --install-completion bash' (built into Typer).

if __name__ == "__main__":
    app()

# Decision rule:
#   small typed CLI                          -> single Typer() with @app.command()
#   git-style nested verbs                   -> typer.Typer() per group; app.add_typer(name=...)
#   shared --verbose / --json                -> @app.callback() + module State object
#   plug-in subcommands                      -> entry_points group + add_typer
#   slow imports kill --help                 -> lazy registration; import in the runner
#   want pretty tracebacks (dev only)        -> pretty_exceptions_enable=True; show_locals=False ALWAYS
#   need to share Click extensions           -> Typer wraps Click -- @click.* decorators work too
#   exit codes                               -> raise typer.Exit(code=N) with sysexits values
#
# Anti-pattern: pretty_exceptions_show_locals=True in production. A crash on a
# password-handling line will dump the password into the user's terminal AND
# (worse) the system log. Keep show_locals=False; surface enough context with
# explicit error messages.
```

## Decision Rule

```text
small typed CLI                          -> single Typer() with @app.command()
git-style nested verbs                   -> typer.Typer() per group; app.add_typer(name=...)
shared --verbose / --json                -> @app.callback() + module State object
plug-in subcommands                      -> entry_points group + add_typer
slow imports kill --help                 -> lazy registration; import in the runner
want pretty tracebacks (dev only)        -> pretty_exceptions_enable=True; show_locals=False ALWAYS
need to share Click extensions           -> Typer wraps Click -- @click.* decorators work too
exit codes                               -> raise typer.Exit(code=N) with sysexits values
```

## Anti-Pattern

> [!warning] Anti-pattern
> pretty_exceptions_show_locals=True in production. A crash on a
> password-handling line will dump the password into the user's terminal AND
> (worse) the system log. Keep show_locals=False; surface enough context with
> explicit error messages.

## Tips

- Each function becomes a sub-command automatically; nest Typer instances with `app.add_typer(sub, name="db")` for git-style verbs (`mycli db migrate`). Avoid command names that shadow builtins (`list`, `format`); use a different identifier and rename via `@app.command(name="list")`.
- typer.confirm() prompts for yes/no; for shared --verbose / --json across all subcommands use `@app.callback()` plus a module-level State object commands read.
- `typer.Exit(code=N)` exits with N (sysexits values keep pipelines happy). Keep `pretty_exceptions_show_locals=False` ALWAYS — a crash on a password-handling line otherwise dumps the password into the user's terminal and the system log. For fast `--help` on heavy CLIs, lazy-import subcommands (import only when invoked) or auto-register via `entry_points`.

## Common Mistake

> [!warning] `pretty_exceptions_show_locals=True` in production — a crash on a password-handling line will dump the password into the user's terminal and the system log. Keep show_locals=False; surface enough context with explicit error messages.

## Shorthand (Junior → Senior)

**Junior:**
```python
import sys, argparse
parser = argparse.ArgumentParser()
subs = parser.add_subparsers(dest='cmd')
create_sub = subs.add_parser('create')
create_sub.add_argument('name')
delete_sub = subs.add_parser('delete')
delete_sub.add_argument('name')
args = parser.parse_args()
if args.cmd == 'create':
    print(f"Creating: {args.name}")
```

**Senior:**
```python
import typer
from typing import Annotated

app = typer.Typer()

@app.command()
def create(name: Annotated[str, typer.Argument()]):
    typer.echo(f"Creating: {name}")

@app.command()
def delete(name: Annotated[str, typer.Argument()]):
    if typer.confirm(f"Delete {name}?"):
        typer.echo(f"Deleted: {name}")

if __name__ == "__main__":
    app()
```

## See Also

- [[Sections/testing/advanced/coverage|pytest coverage (Testing with pytest)]]
- [[Sections/testing/advanced/cov-config|pytest-cov configuration (Testing with pytest)]]
- [[Sections/testing/advanced/freezegun|freezegun (Testing with pytest)]]
- [[Sections/testing/advanced/marks-config|Marks & configuration (Testing with pytest)]]
- [[Sections/cli/typer/_Index|CLI Tools → Typer]]
- [[Sections/cli/_Index|CLI Tools index]]
- [[_Index|Vault index]]
