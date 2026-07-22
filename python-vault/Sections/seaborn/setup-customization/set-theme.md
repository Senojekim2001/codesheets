---
type: "entry"
domain: "python"
file: "seaborn"
section: "setup-customization"
id: "set-theme"
title: "sns.set_theme()"
category: "Setup"
subtitle: "Call once at the top of your script or notebook"
signature_short: "sns.set_theme(style=\"darkgrid\", palette=\"deep\", font_scale=1.2)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "sns.set_theme()"
  - "set-theme"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/setup-customization"
  - "category/setup"
  - "tier/tiered"
---

# sns.set_theme()

> Call once at the top of your script or notebook

## Overview

set_theme() applies a visual style globally to all subsequent plots. Call it once at the top of your script. style= controls grid and background; palette= controls default colors; font_scale= scales all text simultaneously.

## Signature

```python
sns.set_theme(style="darkgrid", palette="deep", font_scale=1.2)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - one call at the top of your notebook
#             configures style + palette + font scale
#             for all subsequent plots.
# STRENGTHS - one line of setup gives you a consistent
#             house style.
# WEAKNESSES- doesn't yet show context= for slides or
#             axes_style for scoped overrides.
#
import seaborn as sns
sns.set_theme(style="whitegrid", palette="colorblind")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday set_theme arguments: style
#             family, palette choice, font_scale for
#             slides, context for paper / notebook /
#             talk / poster size scaling.
# STRENGTHS - covers the four switches that drive
#             ~95% of seaborn's appearance.
# WEAKNESSES- doesn't address scoped (rc_context /
#             axes_style) overrides — senior.
#
import seaborn as sns

sns.set_theme(
    style="whitegrid",         # darkgrid | whitegrid | dark | white | ticks
    palette="colorblind",      # accessible default
    font_scale=1.2,            # scales ALL text uniformly
    context="notebook",        # paper | notebook | talk | poster
    rc={"figure.figsize": (10, 6)},
)

# Reset to matplotlib defaults
# sns.reset_defaults()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production theming: scope theme changes
#             with axes_style / plotting_context as
#             context managers (no global state bleed);
#             pin a project-wide theme in a setup
#             module; set context="talk" for slides
#             temporarily without breaking notebooks.
# STRENGTHS - context managers prevent the "I changed
#             the theme in cell 3 and now everything
#             looks different" surprise; per-project
#             setup module keeps house style versioned.
# WEAKNESSES- with-block syntax is one more thing to
#             learn; nesting context managers requires
#             discipline.
#
import seaborn as sns

# 1. Scoped style — applies to one block only
with sns.axes_style("white"):
    sns.lineplot(data=df, x="x", y="y")

# 2. Scoped context — bigger fonts for one slide
with sns.plotting_context("talk"):
    sns.boxplot(data=df, x="day", y="total_bill")

# 3. Project-wide setup — put in a setup module
def setup_plot_style():
    sns.set_theme(
        style="ticks", palette="colorblind",
        font_scale=1.0, context="notebook",
        rc={
            "figure.dpi": 120,
            "savefig.dpi": 300,
            "savefig.facecolor": "white",
            "axes.spines.top": False,
            "axes.spines.right": False,
        },
    )

# Decision rule:
#   one notebook-wide style        -> sns.set_theme(...) at top
#   scoped style for a block       -> with sns.axes_style(...)
#   bigger fonts for slides        -> with sns.plotting_context("talk")
#   project house style            -> setup function imported everywhere
#   undo all overrides             -> sns.reset_defaults()
#   per-figure rcParams override   -> with plt.rc_context({...}):
#
# Anti-pattern: calling sns.set_theme() inside helper functions or in the middle of a notebook.
#   set_theme mutates global matplotlib state — every plot AFTER the call inherits it,
#   including plots in unrelated downstream cells. The two safe patterns are: (1) call
#   set_theme exactly once at the top of the notebook / setup module; (2) for transient
#   styling use a "with sns.axes_style(...)" or "with plt.rc_context({...})" block so
#   changes don't leak.
```

## Decision Rule

```text
one notebook-wide style        -> sns.set_theme(...) at top
scoped style for a block       -> with sns.axes_style(...)
bigger fonts for slides        -> with sns.plotting_context("talk")
project house style            -> setup function imported everywhere
undo all overrides             -> sns.reset_defaults()
per-figure rcParams override   -> with plt.rc_context({...}):
```

## Anti-Pattern

> [!warning] Anti-pattern
> calling sns.set_theme() inside helper functions or in the middle of a notebook.
>   set_theme mutates global matplotlib state — every plot AFTER the call inherits it,
>   including plots in unrelated downstream cells. The two safe patterns are: (1) call
>   set_theme exactly once at the top of the notebook / setup module; (2) for transient
>   styling use a "with sns.axes_style(...)" or "with plt.rc_context({...})" block so
>   changes don't leak.

## Tips

- `style="whitegrid"` is cleanest for publications; `"darkgrid"` is good for exploratory work
- `palette="colorblind"` is safe for all forms of color vision deficiency — use it by default
- `font_scale=1.5` in `set_theme()` scales all text — useful for slides/presentations
- `sns.axes_style()` as a context manager applies a style temporarily to one block

## Common Mistake

> [!warning] Setting palette inside every plot call instead of once with `set_theme()`. Set the theme once globally; override per-plot only when a specific plot needs a different look.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = {}
for k, v in pairs:
    result[k] = v
```

**Senior:**
```python
result = {k: v for k, v in pairs}
```

## See Also

- [[Sections/seaborn/setup-customization/fig-vs-axes|Figure-level vs axes-level (Seaborn)]]
- [[Sections/seaborn/setup-customization/_Index|Seaborn → Setup, Customization & Output]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
