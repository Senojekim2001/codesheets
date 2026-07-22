---
type: "entry"
domain: "python"
file: "matplotlib"
section: "figures-layouts"
id: "anatomy"
title: "Figure & Axes"
category: "Basics"
subtitle: "Figure contains Axes; Axes contains the plot"
signature_short: "fig, ax = plt.subplots(nrows, ncols)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Figure & Axes"
  - "anatomy"
tags:
  - "python"
  - "python/matplotlib"
  - "python/matplotlib/figures-layouts"
  - "category/basics"
  - "tier/tiered"
---

# Figure & Axes

> Figure contains Axes; Axes contains the plot

## Overview

Matplotlib has two layers: Figure (the whole canvas) and Axes (individual plot area). Always use the object-oriented interface (fig, ax = plt.subplots()) rather than plt.plot() for anything beyond a quick test — it gives explicit control.

## Signature

```python
fig, ax = plt.subplots(nrows, ncols)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - one figure, one axes. Always start with
#             plt.subplots() — never plt.plot in real code.
# STRENGTHS - introduces the two-layer model in three lines.
# WEAKNESSES- doesn't yet show multi-axes layouts or save.
#
import matplotlib.pyplot as plt
fig, ax = plt.subplots()
ax.plot([1, 2, 3], [4, 5, 6])
ax.set_title("My Plot")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday two-layer pattern: Figure (canvas)
#             contains Axes (plot). subplots(rows, cols)
#             returns a Figure plus an array of Axes.
# STRENGTHS - covers the OO API in working form; explicit
#             contrast with the plt.* "current axes" model.
# WEAKNESSES- doesn't show savefig options or DPI tradeoffs
#             — senior tier.
#
import matplotlib.pyplot as plt, numpy as np

# Single
fig, ax = plt.subplots(figsize=(8, 5))
ax.plot([1, 2, 3], [4, 5, 6])
ax.set_xlabel("x"); ax.set_ylabel("y"); ax.set_title("OO API")

# Grid — axes is a 2D array
fig, axes = plt.subplots(2, 3, figsize=(12, 6))
axes[0, 0].plot(x, y)
axes[1, 2].scatter(x, y)

# Quick interactive style — only for exploration
plt.plot([1, 2, 3], [4, 5, 6])
plt.title("quick")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production rule: ALWAYS the OO API. The
#             plt.* state machine breaks when subplots,
#             callbacks, or asynchronous code touch the
#             "current figure" — every issue you'll Google
#             traces back to this. Use layout="constrained"
#             over tight_layout for new code.
# STRENGTHS - OO API is testable, composable, and survives
#             multi-figure code; constrained_layout handles
#             label collisions automatically.
# WEAKNESSES- some tutorials still use plt.* — readers may
#             import bad habits; constrained_layout adds
#             slight render time.
#
import matplotlib.pyplot as plt, numpy as np

# 1. The shape every production matplotlib function takes
def make_plot(data: np.ndarray, ax: plt.Axes | None = None) -> plt.Axes:
    """Plot into the given axes; create if not provided."""
    if ax is None:
        _, ax = plt.subplots()
    ax.plot(data)
    return ax

# 2. Compose into a multi-panel figure cleanly
fig, axes = plt.subplots(2, 2, figsize=(10, 8),
                          layout="constrained")
make_plot(np.random.randn(100), ax=axes[0, 0])
make_plot(np.random.randn(100), ax=axes[0, 1])
# ...

# 3. Anti-patterns to avoid
#    plt.plot(...)       # implicit current-axes; surprises in subplots
#    plt.title("X")      # sets title on whichever axes was created LAST
#    plt.gca()           # "get current axes" — reaching for hidden state
#
# Decision rule:
#   any production code                      -> OO API: fig, ax = plt.subplots()
#   one-off REPL exploration                 -> plt.plot(...) is fine
#   a function that draws into ANY axes      -> def f(..., ax=None): if ax is None: ...
#   multi-figure script                      -> fig.savefig per fig + plt.close(fig)
#   subplots                                 -> fig, axes = plt.subplots(r, c)
#   need to mutate after creation            -> hold onto fig and ax variables
#   asymmetric layout                        -> plt.subplot_mosaic
#
# Anti-pattern: using plt.title / plt.xlabel / plt.savefig in a function that creates
#   subplots. The plt.* state machine targets the most-recently-created axes, so
#   plt.title("A") after fig, axes = plt.subplots(1,2) sets the title on axes[1] (or
#   nothing predictable). Always call methods on the explicit ax/fig objects you got
#   back from plt.subplots — never reach for plt.gca() / plt.gcf() in production code.
```

## Decision Rule

```text
any production code                      -> OO API: fig, ax = plt.subplots()
one-off REPL exploration                 -> plt.plot(...) is fine
a function that draws into ANY axes      -> def f(..., ax=None): if ax is None: ...
multi-figure script                      -> fig.savefig per fig + plt.close(fig)
subplots                                 -> fig, axes = plt.subplots(r, c)
need to mutate after creation            -> hold onto fig and ax variables
asymmetric layout                        -> plt.subplot_mosaic
```

## Anti-Pattern

> [!warning] Anti-pattern
> using plt.title / plt.xlabel / plt.savefig in a function that creates
>   subplots. The plt.* state machine targets the most-recently-created axes, so
>   plt.title("A") after fig, axes = plt.subplots(1,2) sets the title on axes[1] (or
>   nothing predictable). Always call methods on the explicit ax/fig objects you got
>   back from plt.subplots — never reach for plt.gca() / plt.gcf() in production code.

## Tips

- Always use fig, ax = plt.subplots() — the OOP interface avoids subtle state bugs
- figsize=(width, height) in inches — (10, 6) is a good default
- bbox_inches="tight" prevents labels from being clipped in saved files
- Use plt.show() in scripts; in Jupyter, figures display inline automatically

## Common Mistake

> [!warning] Mixing the functional (plt.plot) and OOP (ax.plot) interfaces in the same figure. Pick one style and stick with it — mixing causes confusing bugs.

## Shorthand (Junior → Senior)

**Junior:**
```python
import matplotlib.pyplot as plt
import numpy as np
fig, ax = plt.subplots()
ax.plot([1, 2, 3], [4, 5, 6])
```

**Senior:**
```python
fig.savefig("plot.svg")           # vector format
```

## See Also

- [[Sections/matplotlib/figures-layouts/subplot-mosaic|plt.subplot_mosaic() (Matplotlib)]]
- [[Sections/matplotlib/figures-layouts/subplots|plt.subplots() (Matplotlib)]]
- [[Sections/matplotlib/figures-layouts/figsize|Figure size and DPI (Matplotlib)]]
- [[Sections/typing/core-typing/basic-annotations|Type Annotations — Variables, Functions & Collections (Type Hints & mypy)]]
- [[Sections/matplotlib/figures-layouts/_Index|Matplotlib → Figures & Layouts]]
- [[Sections/matplotlib/_Index|Matplotlib index]]
- [[_Index|Vault index]]
