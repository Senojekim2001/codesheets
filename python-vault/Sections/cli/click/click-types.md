---
type: "entry"
domain: "python"
file: "cli"
section: "click"
id: "click-types"
title: "type=click.Path(), click.Choice(), click.IntRange(), click.File()"
category: "Configuration"
subtitle: "Type validation and file handling"
signature_short: "type=click.Path(exists=True); type=click.Choice([...]); type=click.IntRange(0, 100); type=click.File(\"r\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "type=click.Path(), click.Choice(), click.IntRange(), click.File()"
  - "click-types"
tags:
  - "python"
  - "python/cli"
  - "python/cli/click"
  - "category/configuration"
  - "tier/tiered"
---

# type=click.Path(), click.Choice(), click.IntRange(), click.File()

> Type validation and file handling

## Overview

Click provides type objects for validation. click.Path() checks file/directory existence. click.Choice() restricts to allowed values. click.IntRange() enforces numeric bounds. click.File() opens and passes file objects.

## Signature

```python
type=click.Path(exists=True); type=click.Choice([...]); type=click.IntRange(0, 100); type=click.File("r")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - click.Path/Choice/IntRange/File for validation; the type object lives in the decorator.
# STRENGTHS - One-line validation; click.File auto-opens AND closes the file at exit.
# WEAKNESSES- click.File reads the WHOLE file lazily; for big inputs you may want a Path + manual open.
import click

@click.command()
@click.option("--input",  type=click.File("r"))
@click.option("--output", type=click.File("w"))
@click.option("--level",  type=click.IntRange(1, 10), default=5)
@click.option("--format", type=click.Choice(["json", "csv", "yaml"]), default="json")
@click.option("--dir",    type=click.Path(exists=True, file_okay=False))
def process(input, output, level, format, dir):
    """Process files with validation."""
    data = input.read() if input else ""
    click.echo(f"read {len(data)} chars; level={level} format={format}")

if __name__ == "__main__":
    process()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - path_type=Path returns pathlib objects; UUID and DateTime types; resolve_path normalizes; readable/writable for permission checks.
# STRENGTHS - Catches "doesn't exist", "is a dir", "wrong extension" at parse time; downstream code gets typed values.
# WEAKNESSES- click.DateTime accepts a list of formats but no timezone -- parse + tz-attach yourself if you need UTC.
import click
from pathlib import Path

@click.command()
@click.option("--config",
              type=click.Path(exists=True, dir_okay=False, readable=True,
                              path_type=Path, resolve_path=True))
@click.option("--out-dir",
              type=click.Path(file_okay=False, writable=True,
                              path_type=Path, resolve_path=True),
              default=Path.cwd())
@click.option("--id",   type=click.UUID)                            # validates as UUID
@click.option("--when", type=click.DateTime(formats=["%Y-%m-%d", "%Y-%m-%dT%H:%M:%S"]))
@click.option("--port", type=click.IntRange(1, 65535))
@click.option("--level", type=click.Choice(["debug", "info", "warning", "error"],
                                           case_sensitive=False))
@click.option("--mode",  type=click.Choice(["read", "write", "append"]),
              default="read", show_default=True)
def cli(config: Path, out_dir: Path, id, when, port, level, mode):
    if config: click.echo(config.read_text()[:80])
    click.echo(f"out-dir={out_dir} id={id} when={when} mode={mode}")

if __name__ == "__main__":
    cli()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Custom click.ParamType for domain types; lazy-open large files via Path; tuple types for fixed-shape options; convert='strict' for strict casts.
# STRENGTHS - One subclass replaces a Convert + Validate + Help triplet; help text and error messages flow through Click naturally.
# WEAKNESSES- Custom ParamType is class-based; for one-off conversions a simple callback (--option's callback=) is lighter.
from __future__ import annotations
import re
import click
from datetime import datetime, timezone
from pathlib import Path

# 1) Custom ParamType: a 'duration' like '5s', '2m', '1h30m'.
_DURATION = re.compile(r"\A(?:(?P<h>\d+)h)?(?:(?P<m>\d+)m)?(?:(?P<s>\d+)s)?\Z")

class DurationType(click.ParamType):
    name = "duration"
    def convert(self, value, param, ctx) -> int:
        if isinstance(value, int): return value
        m = _DURATION.match(str(value))
        if not m or value == "":
            self.fail(f"{value!r} is not a duration like '90s', '5m', '1h30m'", param, ctx)
        h = int(m["h"] or 0); mn = int(m["m"] or 0); s = int(m["s"] or 0)
        return h * 3600 + mn * 60 + s
DURATION = DurationType()

# 2) Custom: parse ISO 8601 with timezone -> aware datetime.
class IsoDT(click.ParamType):
    name = "iso8601"
    def convert(self, value, param, ctx) -> datetime:
        try:
            dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        except ValueError:
            self.fail(f"{value!r} is not ISO 8601", param, ctx)
        return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
ISO_DT = IsoDT()

# 3) Tuple type for fixed-arity options: '--bbox X1 Y1 X2 Y2'.
@click.command()
@click.option("--timeout",  type=DURATION, default="30s", show_default=True)
@click.option("--since",    type=ISO_DT,   help="filter to events on/after SINCE (UTC if no tz)")
@click.option("--bbox",     type=(float, float, float, float),
              help="bounding box X1 Y1 X2 Y2")
@click.option("--config",   type=click.Path(exists=True, dir_okay=False,
                                            path_type=Path, resolve_path=True))
@click.option("--port",     type=click.IntRange(1, 65535, clamp=False))
@click.option("--level",    type=click.Choice(["debug", "info", "warning", "error"]),
              default="info", show_default=True)
def cli(timeout: int, since: datetime | None, bbox: tuple[float, ...] | None,
        config: Path | None, port: int | None, level: str) -> None:
    """Production-grade CLI."""
    click.echo(f"timeout={timeout}s since={since} bbox={bbox}")

# 4) Click also accepts a callback= for one-off conversions:
def _csv_floats(ctx, param, value: str | None) -> list[float] | None:
    if value is None: return None
    try: return [float(x) for x in value.split(",")]
    except ValueError as e: raise click.BadParameter(str(e))

@click.option("--weights", callback=_csv_floats, default=None,
              help="comma-separated floats: 0.1,0.5,0.4")
def maybe(weights):
    pass

# Decision rule:
#   files (small)                       -> click.File(mode); click manages open/close
#   files (large) / want a Path obj     -> click.Path(path_type=Path, resolve_path=True)
#   numeric range                       -> click.IntRange / click.FloatRange (with clamp= when desired)
#   one of N strings                    -> click.Choice (case_sensitive=False if user-facing)
#   ISO date or single format          -> click.DateTime(formats=[...])
#   domain types (duration, money,
#     CIDR, semver)                     -> subclass click.ParamType; failure via self.fail()
#   one-off parsing                     -> callback= function; raise click.BadParameter
#   fixed-arity tuple                   -> type=(int, int) etc.; nargs is implicit from arity
#
# Anti-pattern: doing validation INSIDE the command body. The error wording is
# inconsistent with Click's diagnostics, --help can't show the constraint, and
# tests can't drive the validator without invoking the whole command.
```

## Decision Rule

```text
files (small)                       -> click.File(mode); click manages open/close
files (large) / want a Path obj     -> click.Path(path_type=Path, resolve_path=True)
numeric range                       -> click.IntRange / click.FloatRange (with clamp= when desired)
one of N strings                    -> click.Choice (case_sensitive=False if user-facing)
ISO date or single format          -> click.DateTime(formats=[...])
domain types (duration, money,
  CIDR, semver)                     -> subclass click.ParamType; failure via self.fail()
one-off parsing                     -> callback= function; raise click.BadParameter
fixed-arity tuple                   -> type=(int, int) etc.; nargs is implicit from arity
```

## Anti-Pattern

> [!warning] Anti-pattern
> doing validation INSIDE the command body. The error wording is
> inconsistent with Click's diagnostics, --help can't show the constraint, and
> tests can't drive the validator without invoking the whole command.

## Tips

- click.File() handles closing automatically; for large files prefer `click.Path(path_type=Path, resolve_path=True)` and open in the body so memory is bounded
- click.Path() validates existence only if exists=True — set readable/writable for permission checks, file_okay/dir_okay to constrain the kind
- click.IntRange() auto-validates without extra checks. For DOMAIN types (duration "5m30s", money, CIDR, semver), subclass `click.ParamType` and call `self.fail(...)` on bad input — one-off conversions can use `callback=` and raise `click.BadParameter`.

## Common Mistake

> [!warning] Doing validation INSIDE the command body — the error wording is inconsistent with Click's diagnostics, --help can't show the constraint, and tests can't drive the validator without invoking the whole command. Push validation into a `ParamType` or `callback=`.

## Shorthand (Junior → Senior)

**Junior:**
```python
import sys, os
try:
    input_file = open(sys.argv[2], 'r') if len(sys.argv) > 2 else None
    level = int(sys.argv[4]) if len(sys.argv) > 4 else 5
    if level < 1 or level > 10:
        print("Level must be 1-10")
        sys.exit(1)
except Exception as e:
    print(f"Error: {e}")
```

**Senior:**
```python
import click
@click.command()
@click.option('--input', type=click.File('r'))
@click.option('--level', type=click.IntRange(1, 10), default=5)
@click.option('--format', type=click.Choice(['json', 'csv']))
def process(input, level, format):
    pass

if __name__ == '__main__':
    process()
```

## See Also

- [[Sections/cli/argparse/argparse-types|type=, choices=, nargs=, action=, default=, required= (CLI Tools)]]
- [[Sections/cli/click/_Index|CLI Tools → Click]]
- [[Sections/cli/_Index|CLI Tools index]]
- [[_Index|Vault index]]
