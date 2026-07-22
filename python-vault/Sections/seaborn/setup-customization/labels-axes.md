---
type: "entry"
domain: "python"
file: "seaborn"
section: "setup-customization"
id: "labels-axes"
title: "Axes-level labels"
category: "Customization"
subtitle: "Axes-level functions return an Axes — use ax.set() for everything"
signature_short: "ax.set(title=, xlabel=, ylabel=, xlim=, ylim=)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Axes-level labels"
  - "labels-axes"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/setup-customization"
  - "category/customization"
  - "tier/tiered"
---

# Axes-level labels

> Axes-level functions return an Axes — use ax.set() for everything

## Overview

Axes-level seaborn functions (histplot, boxplot, scatterplot, etc.) return a Matplotlib Axes object. Use standard ax.set() to set multiple properties at once, ax.tick_params() for tick control, and ax.legend() for legend placement.

## Signature

```python
ax.set(title=, xlabel=, ylabel=, xlim=, ylim=)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - axes-level seaborn fns return an Axes —
#             pass it as ax= and then customize with
#             ax.set() / ax.legend().
# STRENGTHS - works the same way as plain matplotlib;
#             nothing seaborn-specific to learn.
# WEAKNESSES- doesn't yet show ax.set() bulk form or
#             tick rotation.
#
import matplotlib.pyplot as plt, seaborn as sns
fig, ax = plt.subplots()
sns.boxplot(data=df, x="day", y="total_bill", ax=ax)
ax.set_title("Bills by Day")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday axes-level customization:
#             ax.set() bulk form, tick rotation,
#             legend placement, grid styling, reference
#             lines.
# STRENGTHS - ax.set() bulk form is the cleanest;
#             tick_params(rotation=45) is the standard
#             fix for label collision.
# WEAKNESSES- doesn't address spine removal or theme
#             scoping — separate entries.
#
import matplotlib.pyplot as plt, seaborn as sns

fig, ax = plt.subplots(figsize=(10, 6))
sns.boxplot(data=df, x="day", y="total_bill", hue="sex", ax=ax)

ax.set(
    title="Restaurant Bills by Day and Sex",
    xlabel="Day", ylabel="Total Bill ($)",
    ylim=(0, 60),
)

ax.tick_params(axis="x", rotation=45, labelsize=10)
ax.legend(title="Sex", loc="upper left", framealpha=0.8)
ax.grid(True, axis="y", linestyle="--", alpha=0.5)
ax.axhline(y=0, color="black", linewidth=0.5, linestyle="--")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production rule: order matters. Always
#             plot FIRST, then set labels — some
#             seaborn functions reset axis properties
#             on call. Use rc_context for scoped
#             styling. Override seaborn defaults for
#             publication.
# STRENGTHS - the "labels after plot" rule fixes
#             silent customization losses; rc_context
#             prevents global state bleed.
# WEAKNESSES- rcParams syntax is one more thing to
#             learn; some seaborn functions still
#             override settings inside their body.
#
import matplotlib.pyplot as plt, seaborn as sns

with plt.rc_context({
    "axes.spines.top":   False,
    "axes.spines.right": False,
    "axes.titlesize":   13,
    "axes.titleweight": "bold",
    "axes.labelsize":   11,
}):
    fig, ax = plt.subplots(figsize=(10, 6),
                            layout="constrained")

    # PLOT FIRST
    sns.boxplot(data=df, x="day", y="total_bill",
                 hue="sex", ax=ax)

    # THEN CUSTOMIZE
    ax.set(title="Restaurant Bills",
            xlabel="Day", ylabel="Total Bill ($)",
            ylim=(0, 60))
    ax.legend(title="Sex", loc="upper left", frameon=False)

# Decision rule:
#   set 3+ axis properties at once     -> ax.set(title=, xlabel=, ylabel=, xlim=, ylim=)
#   rotate / resize tick labels        -> ax.tick_params(axis="x", rotation=45)
#   move legend off the axes           -> ax.legend(bbox_to_anchor=(1.02, 1), loc="upper left")
#   remove the legend entirely         -> ax.get_legend().remove()
#   per-figure scoped style override   -> with plt.rc_context({...}):
#   axes-level seaborn fn returns Axes -> use ax methods (NOT g.* methods)
#
# Anti-pattern: setting axis labels BEFORE the seaborn plot call.
#   Some seaborn functions reset xlabel/ylabel internally — anything you set first gets
#   silently overwritten when the plot draws. The rule is plot first, customize second:
#   sns.boxplot(...ax=ax) first, then ax.set(xlabel=..., ylabel=...). Same trap with
#   ax.set_xticks() before a categorical seaborn call that re-numbers the axis.
```

## Decision Rule

```text
set 3+ axis properties at once     -> ax.set(title=, xlabel=, ylabel=, xlim=, ylim=)
rotate / resize tick labels        -> ax.tick_params(axis="x", rotation=45)
move legend off the axes           -> ax.legend(bbox_to_anchor=(1.02, 1), loc="upper left")
remove the legend entirely         -> ax.get_legend().remove()
per-figure scoped style override   -> with plt.rc_context({...}):
axes-level seaborn fn returns Axes -> use ax methods (NOT g.* methods)
```

## Anti-Pattern

> [!warning] Anti-pattern
> setting axis labels BEFORE the seaborn plot call.
>   Some seaborn functions reset xlabel/ylabel internally — anything you set first gets
>   silently overwritten when the plot draws. The rule is plot first, customize second:
>   sns.boxplot(...ax=ax) first, then ax.set(xlabel=..., ylabel=...). Same trap with
>   ax.set_xticks() before a categorical seaborn call that re-numbers the axis.

## Tips

- `ax.set(title=, xlabel=, ylabel=, xlim=, ylim=)` sets everything in one call — use it
- `ax.tick_params(axis="x", rotation=45)` fixes overlapping x-axis labels
- `ax.get_legend().remove()` cleanly removes the legend when hue is shown elsewhere
- `ax.spines["top"].set_visible(False)` removes individual spines — or use `sns.despine()`

## Common Mistake

> [!warning] Setting labels before plotting. Always set labels AFTER calling the seaborn function — the plot call can reset axis properties.

## Shorthand (Junior → Senior)

**Junior:**
```python
import matplotlib.pyplot as plt
import seaborn as sns
fig, ax = plt.subplots(figsize=(10, 6))
sns.boxplot(data=df, x='day', y='total_bill', hue='sex', ax=ax)
```

**Senior:**
```python
ax.axhline(y=0, color='black', linewidth=0.5, linestyle='--')
```

## See Also

- [[Sections/seaborn/setup-customization/labels-figure|Figure-level labels (Seaborn)]]
- [[Sections/seaborn/setup-customization/savefig-seaborn|plt.savefig() (Seaborn)]]
- [[Sections/seaborn/setup-customization/despine|sns.despine() (Seaborn)]]
- [[Sections/seaborn/setup-customization/color-palette|sns.color_palette() (Seaborn)]]
- [[Sections/seaborn/setup-customization/_Index|Seaborn → Setup, Customization & Output]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
