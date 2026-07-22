---
type: "entry"
domain: "python"
file: "matplotlib"
section: "styling"
id: "savefig"
title: "plt.savefig()"
category: "Styling"
subtitle: "Always bbox_inches=\"tight\" — prevents clipped labels"
signature_short: "plt.savefig(\"file.png\", dpi=150, bbox_inches=\"tight\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "plt.savefig()"
  - "savefig"
tags:
  - "python"
  - "python/matplotlib"
  - "python/matplotlib/styling"
  - "category/styling"
  - "tier/tiered"
---

# plt.savefig()

> Always bbox_inches="tight" — prevents clipped labels

## Overview

savefig() writes the figure to disk. bbox_inches="tight" is critical — without it, axis labels and titles are often cut off at the figure boundary. Call before plt.show() or plt.close().

## Signature

```python
plt.savefig("file.png", dpi=150, bbox_inches="tight")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - fig.savefig with bbox_inches="tight" so
#             labels aren't clipped. Save BEFORE plt.show().
# STRENGTHS - the bbox_inches rule fixes the #1 savefig
#             complaint.
# WEAKNESSES- doesn't yet show DPI choices or vector vs
#             raster.
#
import matplotlib.pyplot as plt
fig, ax = plt.subplots()
ax.plot(x, y); ax.set_title("My plot")
fig.savefig("plot.png", dpi=150, bbox_inches="tight")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday savefig recipes: dpi tiers,
#             vector formats (PDF/SVG) for publication,
#             transparent background, the "save in a loop"
#             gotcha (always plt.close).
# STRENGTHS - covers what real export pipelines do;
#             plt.close in loops is THE memory leak fix.
# WEAKNESSES- doesn't address per-format optimization or
#             notebook-vs-savefig DPI mismatches — senior.
#
import matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.plot(x, y); ax.set_title("My plot")

# Raster — pixel-based
fig.savefig("plot.png", dpi=150, bbox_inches="tight")     # web / slide
fig.savefig("plot_print.png", dpi=300, bbox_inches="tight")  # print

# Vector — scalable, publication
fig.savefig("plot.pdf", bbox_inches="tight")
fig.savefig("plot.svg", bbox_inches="tight")

# Transparent background (blends into any slide)
fig.savefig("plot.png", transparent=True, bbox_inches="tight")

# In a loop — close after saving or memory leaks
for name, group in df.groupby("category"):
    fig, ax = plt.subplots()
    ax.hist(group["value"])
    fig.savefig(f"{name}.png", dpi=150, bbox_inches="tight")
    plt.close(fig)                                         # free memory
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production export: separate display DPI
#             from save DPI; pad_inches for explicit margin
#             control; fig.savefig over plt.savefig in
#             scripts; deterministic font embedding for
#             reproducible PDFs.
# STRENGTHS - separating DPIs keeps notebook output
#             readable but exports crisp; explicit pad_inches
#             beats bbox_inches=tight when the layout must
#             be exact; font embedding makes PDFs portable.
# WEAKNESSES- font embedding adds export time; pad_inches
#             requires knowing your printer/slide dims.
#
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(10, 6))
ax.plot(x, y); ax.set_title("My plot")

# 1. Save at higher DPI than display, with explicit margins
fig.savefig(
    "plot.png",
    dpi=300,                    # save crisp
    bbox_inches="tight",
    pad_inches=0.1,             # explicit small margin
    facecolor="white",          # in case rcParams set it transparent
)

# 2. PDF with embedded fonts (deterministic across machines)
plt.rcParams["pdf.fonttype"] = 42      # TrueType, NOT Type 3
plt.rcParams["ps.fonttype"]  = 42
fig.savefig("plot.pdf", bbox_inches="tight")

# 3. In production scripts ALWAYS use fig.savefig (not plt.*)
def export_panel(fig, name: str, *, dpi: int = 300) -> None:
    fig.savefig(f"out/{name}.png", dpi=dpi, bbox_inches="tight")
    fig.savefig(f"out/{name}.pdf", bbox_inches="tight")
    plt.close(fig)              # free even after success

# Anti-pattern: plt.show() before plt.savefig()
#   plt.show() clears the figure on some backends -> save is BLANK
# Right: save first, show last.
#
# Decision rule:
#   web / blog / Slack screenshot    -> PNG, dpi=150, bbox_inches="tight"
#   slide deck                       -> PNG, dpi=200 or PDF (vector)
#   print / journal                  -> PDF or SVG, bbox_inches="tight", fonttype=42
#   need transparent background      -> savefig(..., transparent=True)
#   batch export in a loop           -> fig.savefig(...) + plt.close(fig)
#   exact margin control             -> bbox_inches="tight" + pad_inches=0.1
#   reproducible PDF text            -> rcParams["pdf.fonttype"] = 42 (TrueType)
#   greyscale-safe                   -> use viridis / cividis + check the print proof
```

## Decision Rule

```text
web / blog / Slack screenshot    -> PNG, dpi=150, bbox_inches="tight"
slide deck                       -> PNG, dpi=200 or PDF (vector)
print / journal                  -> PDF or SVG, bbox_inches="tight", fonttype=42
need transparent background      -> savefig(..., transparent=True)
batch export in a loop           -> fig.savefig(...) + plt.close(fig)
exact margin control             -> bbox_inches="tight" + pad_inches=0.1
reproducible PDF text            -> rcParams["pdf.fonttype"] = 42 (TrueType)
greyscale-safe                   -> use viridis / cividis + check the print proof
```

## Anti-Pattern

> [!warning] Anti-pattern
> plt.show() before plt.savefig()
>   plt.show() clears the figure on some backends -> save is BLANK
> Right: save first, show last.

## Tips

- `bbox_inches="tight"` is almost always needed — prevents axis labels being cut off
- `plt.close(fig)` after saving in a loop is critical — unclosed figures accumulate in memory
- PDF and SVG are vector formats — they scale to any size without pixelation
- `dpi=150` for web/presentations; `dpi=300` for print/journals

## Common Mistake

> [!warning] Calling `plt.show()` before `plt.savefig()`. After `show()`, the figure is cleared and `savefig()` saves a blank figure. Always save before showing.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = []
for x in items:
    result.append(x * 2)
```

**Senior:**
```python
result = [x * 2 for x in items]
```

## See Also

- [[Sections/matplotlib/styling/labels|Labels & titles (Matplotlib)]]
- [[Sections/matplotlib/styling/annotate|ax.annotate() (Matplotlib)]]
- [[Sections/matplotlib/styling/legend|ax.legend() (Matplotlib)]]
- [[Sections/matplotlib/styling/tick-formatting|Tick formatting (Matplotlib)]]
- [[Sections/matplotlib/styling/_Index|Matplotlib → Styling & Customization]]
- [[Sections/matplotlib/_Index|Matplotlib index]]
- [[_Index|Vault index]]
