---
type: "entry"
domain: "python"
file: "cli"
section: "click"
id: "click-groups"
title: "@click.group(), @click.pass_context, click.Context"
category: "Advanced"
subtitle: "Sub-commands and shared context"
signature_short: "@click.group(); @group.command(); @click.pass_context"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "@click.group(), @click.pass_context, click.Context"
  - "click-groups"
tags:
  - "python"
  - "python/cli"
  - "python/cli/click"
  - "category/advanced"
  - "tier/tiered"
---

# @click.group(), @click.pass_context, click.Context

> Sub-commands and shared context

## Overview

@click.group() creates a command group. @group.command() registers sub-commands. @click.pass_context injects the Context object, allowing parent options to be accessed by sub-commands.

## Signature

```python
@click.group(); @group.command(); @click.pass_context
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - @click.group() creates a parent; @group.command() attaches verbs; pass_context to share state.
# STRENGTHS - git-style sub-commands with one decorator each; --help auto-generated for parent and children.
# WEAKNESSES- Without ensure_object the ctx.obj is None; access via dict expects you to bootstrap it.
import click

@click.group()
@click.option("--verbose", is_flag=True)
@click.pass_context
def cli(ctx, verbose):
    """My CLI."""
    ctx.ensure_object(dict)
    ctx.obj["verbose"] = verbose

@cli.command()
@click.argument("name")
@click.pass_context
def greet(ctx, name):
    if ctx.obj["verbose"]:
        click.echo(f"[v] greeting {name}")
    click.echo(f"hello, {name}!")

@cli.command()
def status():
    click.echo("OK")

if __name__ == "__main__":
    cli()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Typed ctx.obj via dataclass; nested groups (mycli db migrate); invoke_without_command for parent-only behavior.
# STRENGTHS - Subcommand handlers see real types, not 'dict'; nested verbs compose without losing context.
# WEAKNESSES- Subcommands can call ctx.invoke(other) but that path bypasses Click's error wrapping; raise from inside command body.
import click
from dataclasses import dataclass

@dataclass
class AppCtx:
    verbose: int
    db_url: str | None

# Group invoked WITHOUT a sub-command -> show help.
@click.group(invoke_without_command=True)
@click.option("-v", "--verbose", count=True)
@click.option("--db", "db_url", envvar="APP_DB_URL")
@click.pass_context
def cli(ctx: click.Context, verbose: int, db_url: str | None) -> None:
    ctx.obj = AppCtx(verbose=verbose, db_url=db_url)
    if ctx.invoked_subcommand is None:
        click.echo(ctx.get_help()); ctx.exit(0)

# Nested group: 'mycli db migrate'.
@cli.group()
def db() -> None:
    """Database operations."""

@db.command("migrate")
@click.option("--rev", default="head")
@click.pass_obj                                     # ctx.obj only -- skips Context wrapper
def db_migrate(app: AppCtx, rev: str) -> None:
    if not app.db_url:
        raise click.UsageError("set --db or APP_DB_URL")
    click.echo(f"migrate -> {rev} on {app.db_url}")

@db.command("seed")
@click.pass_obj
def db_seed(app: AppCtx) -> None:
    click.echo(f"seeding {app.db_url}")

if __name__ == "__main__":
    cli()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Click groups + entry_points for plug-in commands; lazy import for fast --help; result_callback for cross-cutting cleanup; CommandCollection for federated CLIs.
# STRENGTHS - Third-party packages register subcommands; CLI startup stays fast; cleanup runs once even on errors.
# WEAKNESSES- Entry points are discovered at import time; many plug-ins slow startup; cache discovery if the plug-in surface is huge.
from __future__ import annotations
import click
from dataclasses import dataclass
from importlib.metadata import entry_points

# 1) Lazy-loading group: subcommands are imported only when invoked.
class LazyGroup(click.Group):
    """Group whose commands are loaded by name on demand."""
    def __init__(self, *args, lazy_subcommands: dict[str, str] | None = None, **kw):
        super().__init__(*args, **kw)
        self._lazy = lazy_subcommands or {}

    def list_commands(self, ctx: click.Context) -> list[str]:
        return sorted({*super().list_commands(ctx), *self._lazy})

    def get_command(self, ctx: click.Context, name: str):
        if name in self._lazy:
            mod_path, attr = self._lazy[name].rsplit(":", 1)
            import importlib
            mod = importlib.import_module(mod_path)
            return getattr(mod, attr)
        return super().get_command(ctx, name)

@dataclass
class AppCtx:
    verbose: int
    config_path: str | None

# 2) Top-level group with cross-cutting result callback.
@click.group(cls=LazyGroup,
             lazy_subcommands={
                 "lint":   "myapp.cmd_lint:lint",       # lazy; imported on use
                 "format": "myapp.cmd_format:format_",
             },
             context_settings={"auto_envvar_prefix": "MYAPP",
                               "help_option_names": ["-h", "--help"]})
@click.option("-v", "--verbose", count=True)
@click.option("--config", type=click.Path(exists=True))
@click.pass_context
def cli(ctx: click.Context, verbose: int, config: str | None) -> None:
    ctx.obj = AppCtx(verbose=verbose, config_path=config)

@cli.result_callback()
@click.pass_obj
def _after(app: AppCtx, result, **kwargs) -> None:
    """Runs after EVERY command, success or failure."""
    if app.verbose:
        click.echo(f"[v] command finished: {result!r}", err=True)

# 3) Plug-in discovery via entry_points (third-party packages add commands).
def install_plugins(group: click.Group) -> None:
    for ep in entry_points(group="myapp.commands"):
        try:
            cmd = ep.load()
        except Exception as e:
            click.echo(f"warning: plugin {ep.name} failed to load: {e}", err=True)
            continue
        group.add_command(cmd, name=ep.name)
install_plugins(cli)

# 4) Built-in command stays inline.
@cli.command()
@click.pass_obj
def status(app: AppCtx) -> None:
    """Print status."""
    click.echo(f"verbose={app.verbose} config={app.config_path}")

# 5) CommandCollection: federate two unrelated groups under one binary.
import click
@click.group()
def admin_cli(): ...
@admin_cli.command()
def deploy(): click.echo("deploy")

federated = click.CommandCollection(sources=[cli, admin_cli])

if __name__ == "__main__":
    cli()

# Decision rule:
#   2-5 verbs, no plug-ins                  -> @click.group() + @cli.command()
#   shared parent state                      -> ctx.obj as dataclass; @click.pass_obj on children
#   nested verbs (mycli db migrate)          -> @cli.group() then @db.command()
#   parent should print help if no sub        -> @click.group(invoke_without_command=True)
#   slow imports affect --help               -> LazyGroup with module:attr strings
#   third-party command registry             -> entry_points group + group.add_command(loader)
#   cross-cutting cleanup                    -> @cli.result_callback()
#   merge two CLIs into one binary            -> click.CommandCollection
#
# Anti-pattern: importing every subcommand at top of the entry-point module.
# 'mycli --help' takes 2s because it loaded TensorFlow. LazyGroup or
# entry_points loaded on demand keep --help instant; users notice.
```

## Decision Rule

```text
2-5 verbs, no plug-ins                  -> @click.group() + @cli.command()
shared parent state                      -> ctx.obj as dataclass; @click.pass_obj on children
nested verbs (mycli db migrate)          -> @cli.group() then @db.command()
parent should print help if no sub        -> @click.group(invoke_without_command=True)
slow imports affect --help               -> LazyGroup with module:attr strings
third-party command registry             -> entry_points group + group.add_command(loader)
cross-cutting cleanup                    -> @cli.result_callback()
merge two CLIs into one binary            -> click.CommandCollection
```

## Anti-Pattern

> [!warning] Anti-pattern
> importing every subcommand at top of the entry-point module.
> 'mycli --help' takes 2s because it loaded TensorFlow. LazyGroup or
> entry_points loaded on demand keep --help instant; users notice.

## Tips

- ctx.ensure_object(dict) initializes ctx.obj safely; for typed shared state, set `ctx.obj = AppCtx(...)` and use `@click.pass_obj` on children to receive the dataclass directly (skips the Context wrapper)
- Sub-command functions receive parent context if decorated with @click.pass_context. Use `@click.group(invoke_without_command=True)` and check `ctx.invoked_subcommand is None` to print help when the parent is run alone
- For third-party plug-in subcommands, register them via `[project.entry-points."myapp.commands"]` and add them with `group.add_command(ep.load(), name=ep.name)`. To keep `--help` instant on heavy CLIs, use a `LazyGroup` that imports subcommands on first invocation; `@cli.result_callback()` runs cross-cutting cleanup after every command.

## Common Mistake

> [!warning] Forgetting @click.pass_context when accessing parent options in sub-commands

## Shorthand (Junior → Senior)

**Junior:**
```python
import sys
if '--verbose' in sys.argv:
    verbose = True
    sys.argv.remove('--verbose')
if len(sys.argv) > 1:
    if sys.argv[1] == 'greet':
        name = sys.argv[2] if len(sys.argv) > 2 else 'World'
        if verbose: print(f"[VERBOSE] Greeting {name}")
        print(f"Hello, {name}!")
```

**Senior:**
```python
import click
@click.group()
@click.option('--verbose', is_flag=True)
@click.pass_context
def cli(ctx, verbose):
    ctx.ensure_object(dict)
    ctx.obj['verbose'] = verbose

@cli.command()
@click.argument('name')
@click.pass_context
def greet(ctx, name):
    if ctx.obj['verbose']:
        click.echo(f"[VERBOSE] Greeting {name}")
    click.echo(f"Hello, {name}!")

if __name__ == '__main__':
    cli()
```

## See Also

- [[Sections/testing/advanced/coverage|pytest coverage (Testing with pytest)]]
- [[Sections/testing/advanced/cov-config|pytest-cov configuration (Testing with pytest)]]
- [[Sections/testing/advanced/freezegun|freezegun (Testing with pytest)]]
- [[Sections/testing/advanced/marks-config|Marks & configuration (Testing with pytest)]]
- [[Sections/cli/click/_Index|CLI Tools → Click]]
- [[Sections/cli/_Index|CLI Tools index]]
- [[_Index|Vault index]]
