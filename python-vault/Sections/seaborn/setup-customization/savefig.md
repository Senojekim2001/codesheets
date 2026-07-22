---
type: "entry"
domain: "python"
file: "seaborn"
section: "setup-customization"
id: "savefig"
title: "plt.savefig()"
category: "Customization"
subtitle: "Always bbox_inches=\"tight\" — prevents clipped labels"
signature_short: "plt.savefig(\"file.png\", dpi=150, bbox_inches=\"tight\")"
has_decision_rule: true
has_anti_pattern: false
tier_count: 3
aliases:
  - "plt.savefig()"
  - "savefig"
tags:
  - "python"
  - "python/seaborn"
  - "python/seaborn/setup-customization"
  - "category/customization"
  - "tier/tiered"
---

# plt.savefig()

> Always bbox_inches="tight" — prevents clipped labels

## Overview

Save plots with plt.savefig() for axes-level plots, or g.savefig() for FacetGrid. bbox_inches="tight" is critical — without it, axis labels are often clipped. Call plt.close() after saving in loops.

## Signature

```python
plt.savefig("file.png", dpi=150, bbox_inches="tight")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - axes-level: fig.savefig. Figure-level
#             (FacetGrid): g.savefig. Always
#             bbox_inches="tight".
# STRENGTHS - one-line save with no clipped labels.
# WEAKNESSES- doesn't yet show DPI, formats, or
#             plt.close in loops.
#
import seaborn as sns
g = sns.displot(data=df, x="total_bill")
g.savefig("plot.png", dpi=150, bbox_inches="tight")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - axes-level vs figure-level save, format
#             choice (PNG/PDF/SVG), DPI tiers, the
#             plt.close in loops rule.
# STRENGTHS - covers what real export pipelines do;
#             plt.close prevents memory leaks.
# WEAKNESSES- doesn't address font embedding or
#             savefig.dpi rcparam — senior.
#
import matplotlib.pyplot as plt, seaborn as sns

# Axes-level
fig, ax = plt.subplots()
sns.histplot(data=df, x="total_bill", ax=ax)
fig.savefig("hist.png", dpi=150, bbox_inches="tight")
plt.close(fig)

# Figure-level (FacetGrid)
g = sns.displot(data=df, x="total_bill", col="sex")
g.savefig("displot.pdf", bbox_inches="tight")           # vector
plt.close(g.figure)

# Loop — close after every save
for name, group in df.groupby("category"):
    fig, ax = plt.subplots()
    sns.histplot(data=group, x="total_bill", ax=ax)
    fig.savefig(f"{name}.png", dpi=150, bbox_inches="tight")
    plt.close(fig)                                       # free memory
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production save: separate display DPI
#             from save DPI (notebook readable, export
#             crisp); embed fonts in PDFs (truetype 42)
#             for cross-machine reproducibility; pin
#             facecolor to "white" in case rcParams
#             defaulted to transparent.
# STRENGTHS - separating display vs save DPI is the
#             single most useful "publication-quality"
#             rule; truetype embedding fixes
#             portability.
# WEAKNESSES- font embedding adds a small export cost;
#             setting savefig.dpi globally affects
#             everything downstream — use rc_context.
#
import matplotlib.pyplot as plt, seaborn as sns

with plt.rc_context({
    "savefig.dpi":      300,
    "savefig.format":   "png",
    "pdf.fonttype":     42,
    "ps.fonttype":      42,
    "savefig.facecolor": "white",
}):
    g = sns.displot(data=df, x="total_bill", col="sex")
    g.savefig("displot.png", bbox_inches="tight",
               pad_inches=0.1)

# Decision rule:
#   web / presentation                 -> dpi=150 PNG
#   publication / journal               -> dpi=300 PNG OR vector PDF
#   editable in design tool             -> SVG
#   in a long loop                      -> ALWAYS plt.close(fig)
```

## Decision Rule

```text
web / presentation                 -> dpi=150 PNG
publication / journal               -> dpi=300 PNG OR vector PDF
editable in design tool             -> SVG
in a long loop                      -> ALWAYS plt.close(fig)
```

## Tips

- `bbox_inches="tight"` prevents axis labels being cut off — always include it
- Use `dpi=150` for presentations and web; `dpi=300` for print/publication
- PDF and SVG are vector formats — scalable to any size without pixelation
- `plt.close()` after saving in loops is critical — otherwise figures accumulate in memory

## Common Mistake

> [!warning] Saving before calling `tight_layout()` or without `bbox_inches="tight"`. Axis labels get cut off at the figure edge. The fix: `fig.savefig("f.png", bbox_inches="tight")`.

## Shorthand (Junior → Senior)

**Junior:**
```python
import matplotlib.pyplot as plt
import seaborn as sns
fig, ax = plt.subplots()
sns.histplot(data=df, x='total_bill', ax=ax)
```

**Senior:**
```python
plt.savefig('plot.png', dpi=300, bbox_inches='tight')
```

## See Also

- [[Sections/seaborn/setup-customization/labels-axes|Axes-level labels (Seaborn)]]
- [[Sections/seaborn/setup-customization/_Index|Seaborn → Setup, Customization & Output]]
- [[Sections/seaborn/_Index|Seaborn index]]
- [[_Index|Vault index]]
