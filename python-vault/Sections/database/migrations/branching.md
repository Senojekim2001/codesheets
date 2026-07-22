---
type: "entry"
domain: "python"
file: "database"
section: "migrations"
id: "branching"
title: "Alembic branching — multiple heads & merge revisions"
category: "Migrations"
subtitle: "alembic heads, alembic merge, branch_labels, depends_on, version_locations, --sql for offline review"
signature_short: "alembic merge -m \"merge feat/x and feat/y\" head1 head2"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Alembic branching — multiple heads & merge revisions"
  - "branching"
tags:
  - "python"
  - "python/database"
  - "python/database/migrations"
  - "category/migrations"
  - "tier/tiered"
---

# Alembic branching — multiple heads & merge revisions

> alembic heads, alembic merge, branch_labels, depends_on, version_locations, --sql for offline review

## Overview

Branching in Alembic happens two ways: accidentally (two PRs create revisions off the same parent) and intentionally (per-tenant migrations, optional features, multi-DB). The accidental case is recoverable with `alembic merge`, but you don't want it twice — fix the workflow with a CI gate. The intentional case uses `branch_labels` and `depends_on` to express dependencies cleanly. The three examples solve the SAME task — your CI just failed with "multiple heads", you have to resolve it and prevent recurrence — at three depths: ad-hoc merge → merge + CI gate → merge + branch labels for legitimate parallel work.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Resolve "multiple heads detected" — two PRs both branched from the same parent and were merged independently.
- **Junior** — SAME merge — and prevent it from happening again via CI.
- **Senior** — SAME merge — but for an app that ALSO has intentional branches: per-tenant feature migrations and a separate analytics-DB migration tree, all coexisting in one alembic/ directory.

## Signature

```python
alembic merge -m "merge feat/x and feat/y" head1 head2
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Resolve "multiple heads detected" — two PRs both branched from
#             the same parent and were merged independently.
# APPROACH  - alembic heads -> alembic merge -> commit the merge revision.
# STRENGTHS- Two commands; recovers a stuck deploy in minutes.
# WEAKNESSES- Doesn't prevent the same situation tomorrow.

# 1) See what's wrong.
#    $ alembic heads
#    0042_add_tenant_id (head)
#    0043_add_event_index (head)
#    -> Two heads. The migration graph forked.

# 2) Look at the parents to confirm both branched off the same revision.
#    $ alembic history --verbose | head -40
#    Rev: 0042_add_tenant_id   parent: 0041_init
#    Rev: 0043_add_event_index parent: 0041_init

# 3) Merge them. Alembic creates an empty merge revision whose down_revision
#    is BOTH heads — graph reconverges to one head.
#    $ alembic merge -m "merge tenant_id and event_index" 0042 0043
#    Generating alembic/versions/2026_05_01_0044_merge_tenant_id_and_event_index.py

# 4) Inspect — most merge revisions are empty.
# alembic/versions/2026_05_01_0044_merge_tenant_id_and_event_index.py
"""merge tenant_id and event_index

Revision ID: 0044_merge
Revises: 0042_add_tenant_id, 0043_add_event_index
Create Date: 2026-05-01
"""
revision = "0044_merge"
down_revision = ("0042_add_tenant_id", "0043_add_event_index")
branch_labels = None
depends_on = None

def upgrade(): pass
def downgrade(): pass

# 5) Commit the merge revision and re-run upgrade head.
#    $ alembic upgrade head
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME merge — and prevent it from happening again via CI.
# APPROACH  - Add a CI step that runs 'alembic heads' and fails if >1 head.
#             Add a script that creates a merge revision in a single command
#             when needed. Document the workflow.
# STRENGTHS- The accidental fork stops recurring; PRs that conflict at the
#             migration graph fail in PR, not on deploy day.
# WEAKNESSES- Doesn't help with INTENTIONAL branches (see senior tier).

# scripts/check_alembic_heads.py — run in CI on every PR.
import sys, subprocess

result = subprocess.run(
    ["alembic", "heads"], capture_output=True, text=True, check=True
)
heads = [line for line in result.stdout.splitlines() if line.strip().endswith("(head)")]
if len(heads) != 1:
    sys.stderr.write(
        f"FAIL: alembic has {len(heads)} heads; expected 1.
"
        "Resolve with: alembic merge -m 'merge ...' <head1> <head2>
"
        f"Heads:
  " + "
  ".join(heads) + "
"
    )
    sys.exit(1)
print(f"OK: 1 head ({heads[0]})")

# .github/workflows/ci.yml (excerpt)
# - name: Alembic single-head invariant
#   run: |
#     pip install alembic
#     export DATABASE_URL=sqlite:///ci.db
#     python scripts/check_alembic_heads.py

# Helper: scripts/alembic_merge_heads.sh — merge whatever heads exist.
# #!/usr/bin/env bash
# set -euo pipefail
# heads=$(alembic heads | awk '{print $1}' | tr '
' ' ')
# if [[ $(echo $heads | wc -w) -lt 2 ]]; then
#     echo "Nothing to merge."; exit 0
# fi
# alembic merge -m "merge $(date +%Y-%m-%d)" $heads

# Add to README:
#   "If CI fails with multiple heads: run scripts/alembic_merge_heads.sh,
#    commit the new merge revision, push."
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME merge — but for an app that ALSO has intentional branches:
#             per-tenant feature migrations and a separate analytics-DB
#             migration tree, all coexisting in one alembic/ directory.
# APPROACH  - branch_labels + version_locations to keep the trees separate;
#             depends_on to express cross-branch dependencies; explicit
#             upgrade target like 'alembic upgrade tenants@head' so each
#             branch is deployed independently.
# STRENGTHS- One Alembic config drives multiple migration trees; per-feature
#             rollouts; per-tenant schema overlays; CI still enforces one
#             head PER BRANCH.
# WEAKNESSES- Reading 'alembic history' is busier; reviewers need the map.

# alembic.ini — multiple version locations, one per logical branch.
# [alembic]
# script_location = alembic
# version_locations = alembic/versions alembic/tenants alembic/analytics

# alembic/versions/2026_01_01_0001_init.py — main branch.
revision = "0001_init"
down_revision = None
branch_labels = ("main",)                              # label this revision as the start of 'main'

# alembic/tenants/2026_02_01_t001_tenant_init.py — tenant-overlay branch.
revision = "t001_tenant_init"
down_revision = None
branch_labels = ("tenants",)                           # separate root for tenant migrations
depends_on = "0001_init"                                # but only after main is at least at init

# alembic/analytics/2026_02_05_a001_warehouse_views.py — analytics branch.
revision = "a001_warehouse_views"
down_revision = None
branch_labels = ("analytics",)

# Operator runs each branch independently:
#    $ alembic upgrade main@head
#    $ alembic upgrade tenants@head
#    $ alembic upgrade analytics@head
#
# Or in CI, all of them:
#    $ alembic upgrade heads

# CI gate — single head PER BRANCH (not single head total).
# scripts/check_alembic_branches.py
import re, subprocess, sys

result = subprocess.run(["alembic", "heads", "--verbose"],
                        capture_output=True, text=True, check=True)
# Each head line shows its branch labels.
# Group heads by branch label; complain if any label has >1 head.
heads_by_branch: dict[str, list[str]] = {}
current = None
for line in result.stdout.splitlines():
    if (m := re.match(r"Rev:s+(S+)", line)):
        current = m.group(1)
    elif (m := re.search(r"Branches into:s+(.*)|Branch names:s+(.*)", line)):
        labels = (m.group(1) or m.group(2) or "").strip()
        for label in [l.strip() for l in labels.split(",") if l.strip()]:
            heads_by_branch.setdefault(label, []).append(current)

failures = {b: hs for b, hs in heads_by_branch.items() if len(hs) > 1}
if failures:
    for b, hs in failures.items():
        print(f"FAIL branch {b!r} has {len(hs)} heads: {hs}", file=sys.stderr)
    sys.exit(1)
print("OK: each branch has exactly one head.")

# Decision rule:
#   accidental fork (one branch)         -> alembic merge -m "..." head1 head2
#   prevent accidental forks             -> CI step: alembic heads | wc -l == 1
#   per-tenant or per-feature trees      -> branch_labels + version_locations
#   cross-branch dependency              -> depends_on = "<other-branch-rev>"
#   downgrade an intentional branch      -> alembic downgrade <branch>@-1
#   merge two intentional branches       -> alembic merge --branch-label combined head1 head2
#   never want a branch in this DB       -> set transaction_per_migration=False; skip alembic upgrade
#   monorepo with multiple service DBs   -> one alembic/ tree per service, NOT branches in one tree
#
# Anti-pattern: using alembic branches to model "this migration only runs in
# environment X". Branches are a graph structure, not a feature flag —
# environment-specific schema belongs in env.py via include_object or
# include_schemas filters, not in branch labels. If the migration shouldn't
# run, omit it from include_object; don't put it on a branch and "forget" to
# upgrade that branch.
```

## Decision Rule

```text
accidental fork (one branch)         -> alembic merge -m "..." head1 head2
prevent accidental forks             -> CI step: alembic heads | wc -l == 1
per-tenant or per-feature trees      -> branch_labels + version_locations
cross-branch dependency              -> depends_on = "<other-branch-rev>"
downgrade an intentional branch      -> alembic downgrade <branch>@-1
merge two intentional branches       -> alembic merge --branch-label combined head1 head2
never want a branch in this DB       -> set transaction_per_migration=False; skip alembic upgrade
monorepo with multiple service DBs   -> one alembic/ tree per service, NOT branches in one tree
```

## Anti-Pattern

> [!warning] Anti-pattern
> using alembic branches to model "this migration only runs in
> environment X". Branches are a graph structure, not a feature flag —
> environment-specific schema belongs in env.py via include_object or
> include_schemas filters, not in branch labels. If the migration shouldn't
> run, omit it from include_object; don't put it on a branch and "forget" to
> upgrade that branch.

## Tips

- Run `alembic heads` in CI on every PR. The single-head invariant catches accidental forks at the moment two PRs land — long before deploy.
- A merge revision's `down_revision` is a TUPLE of the heads it merges. The graph reconverges; one head once again.
- For intentional branches (per-tenant, per-feature, per-DB), use `branch_labels = ("name",)` and `version_locations = alembic/versions alembic/tenants ...` in alembic.ini.
- Use `depends_on = "<rev>"` to express "this migration needs another branch to be at or past revision X" without merging the branches.
- `alembic upgrade head` ambiguates with multiple heads; always specify: `alembic upgrade main@head`, `alembic upgrade tenants@head`.
- For environment-specific schema (test-only tables, analytics columns), DO NOT use branches — use `include_object` filters in env.py.

## Common Mistake

> [!warning] Using Alembic branches to model "this migration only runs in environment X". Branches are graph structure, not feature flags — they don't conditionally apply, they're only ignored if you remember not to upgrade them. The drift compounds: prod and staging diverge silently, and `alembic current` lies. Use `include_object` / `include_schemas` in env.py for conditional schema; reserve branches for genuine parallel migration trees.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Two heads after a PR merge — deploy is blocked
$ alembic heads
0042_add_tenant_id (head)
0043_add_event_index (head)
```

**Senior:**
```python
# Merge resolves; commit the new revision; one head again
$ alembic merge -m "merge tenant_id, event_index" 0042 0043
$ alembic upgrade head
```

## See Also

- [[Sections/database/migrations/alembic-init|Alembic init — bootstrap migrations on an existing project (Databases & SQLAlchemy)]]
- [[Sections/database/migrations/alembic-revision|Alembic revision — write a safe online migration (Databases & SQLAlchemy)]]
- [[Sections/database/migrations/data-migrations|Data migrations — chunked, idempotent backfill (Databases & SQLAlchemy)]]
- [[Sections/database/migrations/_Index|Databases & SQLAlchemy → Schema Migrations — Alembic]]
- [[Sections/database/_Index|Databases & SQLAlchemy index]]
- [[_Index|Vault index]]
