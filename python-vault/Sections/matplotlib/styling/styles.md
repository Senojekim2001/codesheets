---
type: "entry"
domain: "python"
file: "matplotlib"
section: "styling"
id: "styles"
title: "Styles & Themes"
category: "Styling"
subtitle: "Change the visual theme of all plots"
signature_short: "plt.style.use(\"style_name\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Styles & Themes"
  - "styles"
tags:
  - "python"
  - "python/matplotlib"
  - "python/matplotlib/styling"
  - "category/styling"
  - "tier/tiered"
---

# Styles & Themes

> Change the visual theme of all plots

## Overview

Matplotlib comes with built-in styles that transform the default appearance. Apply a style once at the start of your script to affect all subsequent plots.

## Signature

```python
plt.style.use("style_name")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - apply a built-in style at the top of the
#             notebook. All subsequent plots use it.
# STRENGTHS - one line transforms the whole figure look.
# WEAKNESSES- doesn't yet show context-managed styles
#             (scoped) or rcParams overrides.
#
import matplotlib.pyplot as plt

plt.style.use("seaborn-v0_8-whitegrid")
fig, ax = plt.subplots()
ax.plot(x, y)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday style surface: list available
#             styles, apply one globally, scope a different
#             style with plt.style.context, override
#             specific rcParams.
# STRENGTHS - covers the patterns notebooks actually use:
#             pick a base, tweak a few rcParams.
# WEAKNESSES- doesn't address custom style files or per-
#             figure rc_context — senior tier.
#
import matplotlib.pyplot as plt

# See what's available
print(plt.style.available)

# Pick a base style globally
plt.style.use("ggplot")                # R-like
# plt.style.use("dark_background")    # dark theme
# plt.style.use("bmh")                 # Bayesian-methods style

# Scope a one-off different style
with plt.style.context("dark_background"):
    fig, ax = plt.subplots()
    ax.plot(x, y)

# Tweak specific defaults
plt.rcParams.update({
    "figure.figsize":   (10, 6),
    "font.size":        12,
    "axes.spines.top":   False,
    "axes.spines.right": False,
})
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production styling: pin a custom .mplstyle
#             file in your repo; use plt.rc_context for
#             per-figure overrides (no global mutation);
#             separate "house style" (for everyone) from
#             "this chart" tweaks (one figure).
# STRENGTHS - .mplstyle files are version-controlled, shared,
#             and applied identically across machines;
#             rc_context avoids bleeding state between cells.
# WEAKNESSES- maintaining a .mplstyle file requires
#             ownership; rc_context is verbose for a single
#             tweak.
#
import matplotlib.pyplot as plt

# 1. Custom .mplstyle file in your repo
# my_house.mplstyle:
#   axes.spines.top:    False
#   axes.spines.right:  False
#   axes.titlesize:     14
#   axes.titleweight:   bold
#   font.family:        serif
plt.style.use("./my_house.mplstyle")

# 2. Per-figure overrides — no global side effects
with plt.rc_context({"axes.grid": True, "grid.alpha": 0.3}):
    fig, ax = plt.subplots()
    ax.plot(x, y)

# 3. Combine: base style + scoped tweaks
with plt.style.context(["./my_house.mplstyle",
                         {"figure.figsize": (12, 7)}]):
    fig, ax = plt.subplots()
    ax.plot(x, y)
    fig.savefig("plot.png", dpi=300, bbox_inches="tight")

# Anti-pattern: plt.style.use() inside a function
#   def make_plot(...): plt.style.use("dark_background")
#   This MUTATES global state for every subsequent caller.
# Right: use plt.style.context(...) (with-statement) instead.
#
# Decision rule:
#   project-wide house style          -> plt.style.use("./my_house.mplstyle")
#   one notebook session              -> plt.style.use("seaborn-v0_8-whitegrid")
#   single chart different style      -> with plt.style.context("dark_background"):
#   tweak a few rcParams              -> with plt.rc_context({"axes.grid": True}):
#   stack base + overrides            -> plt.style.context([base, {overrides}])
#   publication-ready clean look      -> remove top/right spines + grid alpha=0.3
#   dark theme for slides             -> plt.style.use("dark_background")
#   ggplot-like colors                -> plt.style.use("ggplot")
```

## Decision Rule

```text
project-wide house style          -> plt.style.use("./my_house.mplstyle")
one notebook session              -> plt.style.use("seaborn-v0_8-whitegrid")
single chart different style      -> with plt.style.context("dark_background"):
tweak a few rcParams              -> with plt.rc_context({"axes.grid": True}):
stack base + overrides            -> plt.style.context([base, {overrides}])
publication-ready clean look      -> remove top/right spines + grid alpha=0.3
dark theme for slides             -> plt.style.use("dark_background")
ggplot-like colors                -> plt.style.use("ggplot")
```

## Anti-Pattern

> [!warning] Anti-pattern
> plt.style.use() inside a function
>   def make_plot(...): plt.style.use("dark_background")
>   This MUTATES global state for every subsequent caller.
> Right: use plt.style.context(...) (with-statement) instead.

## Tips

- Set plt.rcParams at the top of your notebook/script for consistent styling
- "seaborn-v0_8-whitegrid" is a clean, publication-ready style
- For publication: remove top and right spines with rcParams or ax.spines
- Seaborn sets a nice default style on import: import seaborn as sns

## Common Mistake

> [!warning] Calling plt.style.use() inside a function — it changes global state permanently. Call it once at the top of the script or use plt.style.context() for scoped changes.

## Shorthand (Junior → Senior)

**Junior:**
```python
import matplotlib.pyplot as plt
plt.style.use("seaborn-v0_8-whitegrid")
fig, ax = plt.subplots()
```

**Senior:**
```python
plt.rcParams.update({"figure.figsize": (10, 6)})
```

## See Also

- [[Sections/matplotlib/styling/labels|Labels & titles (Matplotlib)]]
- [[Sections/matplotlib/styling/annotate|ax.annotate() (Matplotlib)]]
- [[Sections/matplotlib/styling/legend|ax.legend() (Matplotlib)]]
- [[Sections/matplotlib/styling/tick-formatting|Tick formatting (Matplotlib)]]
- [[Sections/matplotlib/styling/_Index|Matplotlib → Styling & Customization]]
- [[Sections/matplotlib/_Index|Matplotlib index]]
- [[_Index|Vault index]]
