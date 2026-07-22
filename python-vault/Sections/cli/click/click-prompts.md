---
type: "entry"
domain: "python"
file: "cli"
section: "click"
id: "click-prompts"
title: "click.prompt(), click.confirm(), click.password_option(), click.progressbar()"
category: "Interaction"
subtitle: "User input and progress indication"
signature_short: "click.prompt(\"Enter name\"); click.confirm(\"Continue?\"); click.password_option(); click.progressbar(items)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "click.prompt(), click.confirm(), click.password_option(), click.progressbar()"
  - "click-prompts"
tags:
  - "python"
  - "python/cli"
  - "python/cli/click"
  - "category/interaction"
  - "tier/tiered"
---

# click.prompt(), click.confirm(), click.password_option(), click.progressbar()

> User input and progress indication

## Overview

click.prompt() asks for user input with validation. click.confirm() yes/no question. click.password_option() hides input. click.progressbar() shows iteration progress with visual bar.

## Signature

```python
click.prompt("Enter name"); click.confirm("Continue?"); click.password_option(); click.progressbar(items)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - click.prompt for input, click.confirm for yes/no, hide_input=True for passwords, click.progressbar for loops.
# STRENGTHS - One call replaces input(), getpass, and a tqdm import.
# WEAKNESSES- Interactive prompts hang in non-TTY contexts (CI, daemons); always provide a non-interactive path.
import click, time

@click.command()
def main():
    name = click.prompt("name")
    if click.confirm("continue?"):
        pwd = click.prompt("password", hide_input=True)
        with click.progressbar(range(10), label="working") as bar:
            for _ in bar:
                time.sleep(0.05)
        click.echo("done")

if __name__ == "__main__":
    main()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - prompt with type/default/value_proc; confirmation_prompt for sensitive entry; pause; pager for long output.
# STRENGTHS - Validates types at the prompt; double-entry passwords; pager keeps long help readable.
# WEAKNESSES- prompt(default=...) shows the default; users press Enter and accept it -- explicitly print the chosen value to confirm.
import click

@click.command()
def setup():
    """Configure the app interactively."""
    host = click.prompt("host", default="localhost")
    port = click.prompt("port", type=click.IntRange(1, 65535), default=8080)

    # Double-entry for new password.
    pwd = click.prompt("new password",
                       hide_input=True,
                       confirmation_prompt=True)

    # Custom validator via value_proc:
    def parse_csv(s: str) -> list[str]:
        items = [x.strip() for x in s.split(",") if x.strip()]
        if not items:
            raise click.UsageError("provide at least one tag")
        return items

    tags = click.prompt("tags (comma-separated)", value_proc=parse_csv)

    if click.confirm(f"save config for {host}:{port}?", default=True, abort=True):
        # abort=True -> raises Abort if user picks 'no'; non-zero exit
        click.echo(f"saved {len(tags)} tags")

    # Long output -- pipe through the user's pager (less / more).
    click.echo_via_pager("\n".join(f"line {i}" for i in range(1000)))

if __name__ == "__main__":
    setup()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Detect TTY; degrade gracefully in non-interactive; pair every prompt with a flag for scriptable mode; wrap progress with a context manager that respects --quiet.
# STRENGTHS - Same CLI works in a terminal AND a CI pipeline; never hangs waiting for input; respects "machine output" flag.
# WEAKNESSES- Adding --yes / --no-prompt for every interactive call doubles the surface; aim for ONE master "non-interactive" flag.
from __future__ import annotations
import sys
import click

@click.command(context_settings={"auto_envvar_prefix": "MYAPP"})
@click.option("--yes", "-y", is_flag=True, help="assume yes; never prompt (for scripts/CI)")
@click.option("--quiet", "-q", is_flag=True, help="suppress progress bars and prompts")
@click.option("--host", help="non-interactive value (else prompted)")
@click.option("--port", type=click.IntRange(1, 65535), help="non-interactive value")
@click.password_option(required=False, default=None, prompt=False,
                       help="password; if omitted, prompted in TTY only")
def setup(yes: bool, quiet: bool, host: str | None, port: int | None,
          password: str | None) -> None:
    """Configure the app -- safe in both terminal and CI."""

    # 1) Decide whether to prompt at all.
    is_tty = sys.stdin.isatty() and sys.stdout.isatty()
    interactive = is_tty and not yes and not quiet

    def ask(name: str, *, default=None, hide=False, type_=None) -> str:
        if not interactive:
            raise click.UsageError(f"non-interactive: pass --{name}")
        return click.prompt(name, default=default, hide_input=hide, type=type_)

    host     = host     or ask("host", default="localhost")
    port     = port     or int(ask("port", default="8080", type_=click.IntRange(1, 65535)))
    password = password or ask("password", hide=True)

    # 2) Confirmation: --yes shortcut, otherwise click.confirm with abort=True.
    if not yes:
        click.confirm(f"save config for {host}:{port}?", abort=True, default=True)

    # 3) Progress that disables itself for --quiet OR non-TTY.
    items = range(50)
    show_bar = is_tty and not quiet
    if show_bar:
        with click.progressbar(items, label="connecting") as bar:
            for _ in bar: ...
    else:
        for _ in items: ...                       # silent path; logs go to stderr

    click.secho("done", fg="green")

# Decision rule:
#   small interactive tool, devs only           -> click.prompt + click.confirm
#   tool that runs in CI too                    -> --yes / --quiet flags + isatty() guard
#   sensitive entry (password, API key)         -> hide_input=True; confirmation_prompt=True; ENV first
#   long output                                  -> click.echo_via_pager
#   loop progress, may run non-interactively     -> guard with isatty(); skip the bar in CI
#   confirmation that should HARD-fail on 'no'  -> click.confirm(abort=True)  (raises Abort -> exit 1)
#   value with reasonable default                -> default= AND show_default=True
#   "type ENTER to continue"                     -> click.pause()
#
# Anti-pattern: an interactive prompt that has NO non-interactive alternative.
# CI workflows hang forever waiting for stdin; users discover it 6 hours into a
# release. EVERY prompt needs a flag (or env var) that bypasses it.
```

## Decision Rule

```text
small interactive tool, devs only           -> click.prompt + click.confirm
tool that runs in CI too                    -> --yes / --quiet flags + isatty() guard
sensitive entry (password, API key)         -> hide_input=True; confirmation_prompt=True; ENV first
long output                                  -> click.echo_via_pager
loop progress, may run non-interactively     -> guard with isatty(); skip the bar in CI
confirmation that should HARD-fail on 'no'  -> click.confirm(abort=True)  (raises Abort -> exit 1)
value with reasonable default                -> default= AND show_default=True
"type ENTER to continue"                     -> click.pause()
```

## Anti-Pattern

> [!warning] Anti-pattern
> an interactive prompt that has NO non-interactive alternative.
> CI workflows hang forever waiting for stdin; users discover it 6 hours into a
> release. EVERY prompt needs a flag (or env var) that bypasses it.

## Tips

- click.prompt() with type= validates input (click.INT, click.FLOAT, click.UUID, click.DateTime, click.IntRange, click.Choice). Click has no built-in Email type — write a callback or a ParamType subclass.
- click.password_option() is a decorator that prompts for a password; combine with `confirmation_prompt=True` for double-entry on new-password flows
- click.progressbar() works with any iterable and shows a progress bar. EVERY interactive call needs a non-interactive bypass (`--yes`, `--quiet`, or an env var) and an `sys.stdin.isatty()` guard, or CI workflows hang forever waiting for stdin.

## Common Mistake

> [!warning] An interactive prompt that has NO non-interactive alternative — CI workflows hang forever waiting for stdin and users discover it 6 hours into a release. Pair every prompt with a `--yes` / explicit-flag bypass plus an `isatty()` guard, and use `click.confirm(..., abort=True)` for confirmations that should hard-fail on "no".

## Shorthand (Junior → Senior)

**Junior:**
```python
import getpass
name = input("Enter your name: ")
email = input("Enter email: ")
if input("Continue? (y/n): ").lower() == 'y':
    password = getpass.getpass("Enter password: ")
    for i in range(10):
        print(f"Processing {i+1}/10")
```

**Senior:**
```python
import click, time
@click.command()
def interactive():
    name = click.prompt('Enter your name')
    if click.confirm('Continue?'):
        pwd = click.prompt('Password', hide_input=True)
        with click.progressbar(range(10)) as bar:
            for _ in bar:
                time.sleep(0.1)

if __name__ == '__main__':
    interactive()
```

## See Also

- [[Sections/cli/click/_Index|CLI Tools → Click]]
- [[Sections/cli/_Index|CLI Tools index]]
- [[_Index|Vault index]]
