---
type: "file-index"
domain: "python"
file: "cli"
title: "CLI Tools"
tags:
  - "python"
  - "python/cli"
  - "index"
---

# CLI Tools

> 12 entries across 4 sections.

## argparse · 4

- [[Sections/cli/argparse/argparse-basics|ArgumentParser, add_argument(), parse_args()]] — Core argparse setup for positional and optional arguments
- [[Sections/cli/argparse/argparse-types|type=, choices=, nargs=, action=, default=, required=]] — Control argument types, validation, multiplicity, and defaults
- [[Sections/cli/argparse/argparse-subcommands|add_subparsers(), set_defaults()]] — Create multi-command CLIs like git commit, git push
- [[Sections/cli/argparse/argparse-groups|add_argument_group(), add_mutually_exclusive_group()]] — Organize arguments into groups and enforce mutual exclusivity

## Click · 4

- [[Sections/cli/click/click-basics|@click.command(), @click.option(), @click.argument(), click.echo()]] — Decorator-based CLI with Click
- [[Sections/cli/click/click-types|type=click.Path(), click.Choice(), click.IntRange(), click.File()]] — Built-in Click types for validation and conversion
- [[Sections/cli/click/click-groups|@click.group(), @click.pass_context, click.Context]] — Multi-command CLIs with groups and context passing
- [[Sections/cli/click/click-prompts|click.prompt(), click.confirm(), click.password_option(), click.progressbar()]] — Interactive prompts and progress feedback

## Typer · 2

- [[Sections/cli/typer/typer-basics|typer.Typer(), Annotated, typer.Option(), typer.Argument()]] — Type-hint-driven CLI with Typer
- [[Sections/cli/typer/typer-app|typer.Typer(), app.command(), app()]] — Multi-command Typer apps

## Output & Utilities · 2

- [[Sections/cli/cli-utilities/rich-output|rich.print(), Console, Table, Progress]] — Rich terminal formatting and tables
- [[Sections/cli/cli-utilities/sys-argv|sys.argv, sys.stdin, sys.stdout, sys.stderr]] — Raw argument and stream handling
