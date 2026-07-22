---
type: "entry"
domain: "python"
file: "matplotlib"
section: "figures-layouts"
id: "subplot-mosaic"
title: "plt.subplot_mosaic()"
category: "Basics"
subtitle: "Named panels in a string — far cleaner than GridSpec"
signature_short: "fig, axes = plt.subplot_mosaic(\"AB
CC\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "plt.subplot_mosaic()"
  - "subplot-mosaic"
tags:
  - "python"
  - "python/matplotlib"
  - "python/matplotlib/figures-layouts"
  - "category/basics"
  - "tier/tiered"
---

# plt.subplot_mosaic()

> Named panels in a string — far cleaner than GridSpec

## Overview

plt.subplot_mosaic() (matplotlib 3.3+) creates complex layouts using an ASCII art string. Repeated letters span multiple cells. Returns a dict of named Axes — much more readable than GridSpec index arithmetic.

## Signature

```python
fig, axes = plt.subplot_mosaic("AB
CC")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - layout-as-ASCII. Each character names a
#             panel; repeat to span; "." for empty.
# STRENGTHS - one string IS the layout; no GridSpec
#             arithmetic.
# WEAKNESSES- doesn't yet show ratios or empty cells.
#
import matplotlib.pyplot as plt
fig, axd = plt.subplot_mosaic("AB\nCC", figsize=(8, 6))
axd["A"].plot([1, 2, 3], [1, 4, 9])
axd["B"].bar(["x", "y"], [3, 5])
axd["C"].hist([1, 1, 2, 3, 3, 3])
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday mosaic surface: complex layouts
#             via multi-line strings, height/width ratios,
#             empty cells with ".", named axes access.
# STRENGTHS - covers what dashboards actually look like;
#             named axes are self-documenting in real code.
# WEAKNESSES- doesn't address the per_subplot_kw= argument
#             or shared axes — senior tier.
#
import matplotlib.pyplot as plt

fig, axd = plt.subplot_mosaic(
    """
    AAB
    CDB
    """,
    figsize=(12, 7),
    height_ratios=[2, 1],
    width_ratios=[1, 1, 2],
)

axd["A"].plot(x, y, label="series A")
axd["B"].scatter(x2, y2)
axd["C"].bar(cats, vals)
axd["D"].hist(data)

# Empty cells use "."
fig2, axd2 = plt.subplot_mosaic(
    """
    A.
    BC
    """,
    figsize=(8, 6),
)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production mosaic: per_subplot_kw= to
#             configure individual panels (shared axes,
#             projections), iterate axes by name in a
#             config-driven loop, and combine with
#             constrained_layout for hands-off spacing.
# STRENGTHS - per_subplot_kw eliminates per-panel setup
#             code; config-driven loops keep dashboards
#             maintainable; constrained_layout removes the
#             manual hspace/wspace fiddling.
# WEAKNESSES- per_subplot_kw is a recent addition (3.6+);
#             named-axes loops require disciplined keys.
#
import matplotlib.pyplot as plt

# Per-panel kwargs — set up shared x or projection cleanly
fig, axd = plt.subplot_mosaic(
    """
    AB
    CB
    """,
    figsize=(10, 6),
    layout="constrained",
    per_subplot_kw={
        "B": {"projection": "polar"},        # B is polar
    },
)

# Config-driven population
plots = {
    "A": ("plot",    [x, y]),
    "B": ("plot",    [theta, r]),
    "C": ("scatter", [x, y]),
}
for name, (kind, args) in plots.items():
    getattr(axd[name], kind)(*args)
    axd[name].set_title(name)

# Decision rule:
#   simple uniform grid              -> plt.subplots(rows, cols)
#   asymmetric, named panels         -> subplot_mosaic (preferred default)
#   need pixel-perfect placement     -> GridSpec(width_ratios=, height_ratios=)
#   one panel needs polar/3d         -> per_subplot_kw={"P": {"projection": "polar"}}
#   shared x or y axes               -> sharex=True/sharey=True keywords
#   want empty cells in layout       -> "." in the mosaic string
#   per-panel size control           -> width_ratios=, height_ratios=
#
# Anti-pattern: indexing the mosaic axes by position (axd[0], axd[1, 0]) like a NumPy
#   grid. subplot_mosaic returns a dict keyed by your panel letters — axd["A"], axd["B"].
#   Treating it like an array silently raises KeyError or returns the wrong panel after
#   a layout edit. The named-axes pattern is the entire point: rename a panel and your
#   code still tracks it.
```

## Decision Rule

```text
simple uniform grid              -> plt.subplots(rows, cols)
asymmetric, named panels         -> subplot_mosaic (preferred default)
need pixel-perfect placement     -> GridSpec(width_ratios=, height_ratios=)
one panel needs polar/3d         -> per_subplot_kw={"P": {"projection": "polar"}}
shared x or y axes               -> sharex=True/sharey=True keywords
want empty cells in layout       -> "." in the mosaic string
per-panel size control           -> width_ratios=, height_ratios=
```

## Anti-Pattern

> [!warning] Anti-pattern
> indexing the mosaic axes by position (axd[0], axd[1, 0]) like a NumPy
>   grid. subplot_mosaic returns a dict keyed by your panel letters — axd["A"], axd["B"].
>   Treating it like an array silently raises KeyError or returns the wrong panel after
>   a layout edit. The named-axes pattern is the entire point: rename a panel and your
>   code still tracks it.

## Tips

- Axes are a dict: axes["A"], axes["B"] — not axes[0,0]. Named access is self-documenting
- Repeated letters create spanning panels: "AA
BC" makes A span both columns of row 1
- "." in the layout string leaves an empty cell — useful for unequal numbers of panels
- height_ratios= and width_ratios= control relative panel sizes

## Common Mistake

> [!warning] Still using plt.subplot(2,2,1) for asymmetric layouts. You have to track index arithmetic manually. Use subplot_mosaic() for any non-uniform grid.

## Shorthand (Junior → Senior)

**Junior:**
```python
import matplotlib.pyplot as plt
fig, axes = plt.subplot_mosaic(
"AB
CC",
figsize=(10, 8),
```

**Senior:**
```python
plt.tight_layout()
```

## See Also

- [[Sections/matplotlib/figures-layouts/anatomy|Figure & Axes (Matplotlib)]]
- [[Sections/matplotlib/figures-layouts/subplots|plt.subplots() (Matplotlib)]]
- [[Sections/matplotlib/figures-layouts/figsize|Figure size and DPI (Matplotlib)]]
- [[Sections/typing/core-typing/basic-annotations|Type Annotations — Variables, Functions & Collections (Type Hints & mypy)]]
- [[Sections/matplotlib/figures-layouts/_Index|Matplotlib → Figures & Layouts]]
- [[Sections/matplotlib/_Index|Matplotlib index]]
- [[_Index|Vault index]]
