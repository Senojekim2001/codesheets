---
type: "entry"
domain: "python"
file: "seaborn"
section: "setup-customization"
id: "labels-figure"
title: "Figure-level labels"
category: "Customization"
subtitle: "Figure-level functions return a FacetGrid — use g.set_axis_labels() not ax.set()"
signature_short: "g.set_axis_labels() | g.set_titles() | g.figure.suptitle()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Figure-level labels"
  - "labels-figure"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/setup-customization"
  - "category/customization"
  - "tier/tiered"
---

# Figure-level labels

> Figure-level functions return a FacetGrid — use g.set_axis_labels() not ax.set()

## Overview

Figure-level seaborn functions (displot, catplot, relplot, lmplot) return a FacetGrid — not an Axes. Use FacetGrid methods for customization. plt.title() and ax.set() target a single Axes and will not work correctly on a FacetGrid.

## Signature

```python
g.set_axis_labels() | g.set_titles() | g.figure.suptitle()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - figure-level seaborn fns return a
#             FacetGrid. Use g methods, not ax.set().
# STRENGTHS - shortest possible "label all panels"
#             pattern.
# WEAKNESSES- doesn't yet show suptitle, panel titles,
#             or per-panel access.
#
import seaborn as sns
g = sns.catplot(data=df, x="day", y="total_bill",
                 col="time", kind="box")
g.set_axis_labels("Day", "Total Bill ($)")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday FacetGrid surface: panel
#             titles via set_titles, overall suptitle,
#             g.set() to apply to all panels, axes.flat
#             for per-panel customization.
# STRENGTHS - covers what FacetGrid customization looks
#             like in real reports; suptitle y=1.02 is
#             the magic number.
# WEAKNESSES- doesn't address mixing with
#             constrained_layout or savefig — senior.
#
import seaborn as sns

g = sns.catplot(data=df, x="day", y="total_bill",
                 col="time", kind="box", height=5)

g.set_axis_labels("Day of Week", "Total Bill ($)")
g.set_titles(col_template="{col_name}")
g.figure.suptitle("Bills by Day", y=1.02, fontsize=14)
g.set(ylim=(0, 60))
g.add_legend(title="Sex")

# Tick rotation on every panel
for ax in g.axes.flat:
    ax.tick_params(axis="x", rotation=45)

# Customize a single panel
g.axes[0, 0].set_title("Custom for panel 0")

g.tight_layout()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production FacetGrid: never plt.title()
#             on a figure-level plot (targets only the
#             last axes); use g.figure.suptitle for an
#             overall title; save via g.savefig() not
#             plt.savefig() to capture the whole figure.
# STRENGTHS - the plt.title trap is the #1 figure-level
#             customization bug; g.savefig() always
#             saves the right figure.
# WEAKNESSES- some plt.* commands still target the
#             "current figure" — use g.figure for
#             explicit access.
#
import seaborn as sns

g = sns.catplot(data=df, x="day", y="total_bill",
                 col="time", row="sex",
                 kind="box", height=4,
                 margin_titles=True)

# Multi-element layout — all via g
g.set_axis_labels("Day", "Total Bill ($)")
g.set_titles(col_template="{col_name}",
              row_template="{row_name}")
g.figure.suptitle("Bills by Day, Time, Sex", y=1.02)
g.set(ylim=(0, 60))

# Save deterministically — use g.savefig
g.savefig("bills_facets.png", dpi=200, bbox_inches="tight")

# Decision rule:
#   axes-level (boxplot, scatterplot)    -> ax.set(), ax.legend(), fig.savefig
#   figure-level (catplot, displot)      -> g.set_*, g.figure.suptitle, g.savefig
#   set y limits on every panel          -> g.set(ylim=(0, 60))
#   per-panel customization              -> for ax in g.axes.flat: ...
#   panel templates                      -> g.set_titles(col_template="{col_name}")
#   suptitle pushed above panels         -> g.figure.suptitle(..., y=1.02)
#
# Anti-pattern: plt.title("Bills by Day") after a sns.catplot call.
#   plt.title targets the "current axes" — on a FacetGrid that's the LAST drawn panel
#   only, so your title lands above one cell instead of the whole figure. The fix:
#   g.figure.suptitle(...). Same trap with plt.savefig (saves only the last figure if
#   another figure was created since); use g.savefig() to save the FacetGrid you built.
```

## Decision Rule

```text
axes-level (boxplot, scatterplot)    -> ax.set(), ax.legend(), fig.savefig
figure-level (catplot, displot)      -> g.set_*, g.figure.suptitle, g.savefig
set y limits on every panel          -> g.set(ylim=(0, 60))
per-panel customization              -> for ax in g.axes.flat: ...
panel templates                      -> g.set_titles(col_template="{col_name}")
suptitle pushed above panels         -> g.figure.suptitle(..., y=1.02)
```

## Anti-Pattern

> [!warning] Anti-pattern
> plt.title("Bills by Day") after a sns.catplot call.
>   plt.title targets the "current axes" — on a FacetGrid that's the LAST drawn panel
>   only, so your title lands above one cell instead of the whole figure. The fix:
>   g.figure.suptitle(...). Same trap with plt.savefig (saves only the last figure if
>   another figure was created since); use g.savefig() to save the FacetGrid you built.

## Tips

- `g.figure.suptitle("Title", y=1.02)` — `y=1.02` pushes it above the panel titles
- `for ax in g.axes.flat:` iterates over all panel axes for individual customization
- `g.set()` passes kwargs to `ax.set()` on every panel simultaneously
- `g.tight_layout()` is the FacetGrid equivalent of `plt.tight_layout()`

## Common Mistake

> [!warning] Using `plt.title()` on a figure-level plot. It targets only the last active Axes, not the whole FacetGrid. Use `g.figure.suptitle()` for an overall title.

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

- [[Sections/seaborn/setup-customization/labels-axes|Axes-level labels (Seaborn)]]
- [[Sections/seaborn/setup-customization/savefig-seaborn|plt.savefig() (Seaborn)]]
- [[Sections/seaborn/setup-customization/despine|sns.despine() (Seaborn)]]
- [[Sections/seaborn/setup-customization/color-palette|sns.color_palette() (Seaborn)]]
- [[Sections/seaborn/setup-customization/_Index|Seaborn → Setup, Customization & Output]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
