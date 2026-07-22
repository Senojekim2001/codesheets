---
type: "entry"
domain: "python"
file: "matplotlib"
section: "figures-layouts"
id: "figsize"
title: "Figure size and DPI"
category: "Basics"
subtitle: "figsize in inches, dpi for resolution — set at creation time"
signature_short: "plt.subplots(figsize=(width, height)) | fig.set_size_inches(w, h)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Figure size and DPI"
  - "figsize"
tags:
  - "python"
  - "python/matplotlib"
  - "python/matplotlib/figures-layouts"
  - "category/basics"
  - "tier/tiered"
---

# Figure size and DPI

> figsize in inches, dpi for resolution — set at creation time

## Overview

figsize= sets the figure size in inches. dpi= (dots per inch) controls resolution — default is 100. For screen display 100 dpi is fine; for print/publication use 300. The pixel size is figsize × dpi.

## Signature

```python
plt.subplots(figsize=(width, height)) | fig.set_size_inches(w, h)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - figsize is (width, height) in INCHES. Set at
#             creation.
# STRENGTHS - one number controls a chart's footprint.
# WEAKNESSES- doesn't yet show DPI or how figsize × dpi
#             yields pixels.
#
import matplotlib.pyplot as plt
fig, ax = plt.subplots(figsize=(10, 6))    # 10x6 inches
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday sizes and DPI tiers: screen vs
#             presentation vs print. pixel = figsize x dpi.
# STRENGTHS - codifies the "which size for which audience"
#             rules.
# WEAKNESSES- doesn't address rcParams scope or per-figure
#             override patterns — senior tier.
#
import matplotlib.pyplot as plt

# Common sizes
plt.subplots(figsize=(8, 6))     # default, general
plt.subplots(figsize=(10, 6))    # presentations
plt.subplots(figsize=(12, 4))    # time series / wide data
plt.subplots(figsize=(6, 6))     # square (scatter, corr matrix)

# DPI tiers
plt.subplots(figsize=(8, 6), dpi=100)   # screen
plt.subplots(figsize=(8, 6), dpi=150)   # slides / Jupyter
plt.subplots(figsize=(8, 6), dpi=300)   # print

# Pixel = figsize x dpi
# (8, 6) at dpi=300 -> 2400 x 1800 px

# Change after creation
fig, ax = plt.subplots()
fig.set_size_inches(12, 8); fig.set_dpi(200)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production figure sizing: separate display
#             DPI from save DPI, scope rcParams via
#             plt.rc_context to avoid global state, and
#             pick figsize for the medium (16:9 for slides,
#             4:3 for handouts).
# STRENGTHS - rc_context isolates rcParams to a block;
#             separate save dpi keeps notebooks readable
#             but exports crisp; sizing for medium prevents
#             scaling issues.
# WEAKNESSES- rc_context syntax (with-statement) is one
#             more thing to learn; matching dpi between
#             notebook and slide deck takes one or two
#             tries.
#
import matplotlib.pyplot as plt

# 1. Local rcParams override — no global side effects
with plt.rc_context({"figure.figsize": (12, 7),
                      "figure.dpi": 120,
                      "savefig.dpi": 300}):
    fig, ax = plt.subplots()
    ax.plot(x, y)
    fig.savefig("out.png", bbox_inches="tight")     # 300 dpi save

# 2. Aspect-ratio targets
#    Slides (16:9)        -> figsize=(12, 6.75)
#    Letter handout (4:3) -> figsize=(8, 6)
#    Square correlation   -> figsize=(6, 6)
#    Time series strip    -> figsize=(14, 3.5)

# 3. Many-row barh — height should scale with N
n_categories = 25
fig, ax = plt.subplots(figsize=(8, max(4, n_categories * 0.3)))

# Anti-pattern: setting rcParams globally in a notebook
#   plt.rcParams["figure.figsize"] = (12, 7)        # leaks to next cells
# Use rc_context for one-off changes.
#
# Decision rule:
#   default general chart                -> figsize=(8, 6) (4:3)
#   slide / 16:9 display                 -> figsize=(12, 6.75)
#   square (correlation, scatter)        -> figsize=(6, 6)
#   wide time series strip               -> figsize=(14, 3.5)
#   N-row barh / dotplot                 -> figsize=(8, max(4, 0.3 * N))
#   notebook screen display              -> dpi=100-120
#   slide / Jupyter Retina               -> dpi=150
#   print / journal                      -> dpi=300, save in PDF or PNG
```

## Decision Rule

```text
default general chart                -> figsize=(8, 6) (4:3)
slide / 16:9 display                 -> figsize=(12, 6.75)
square (correlation, scatter)        -> figsize=(6, 6)
wide time series strip               -> figsize=(14, 3.5)
N-row barh / dotplot                 -> figsize=(8, max(4, 0.3 * N))
notebook screen display              -> dpi=100-120
slide / Jupyter Retina               -> dpi=150
print / journal                      -> dpi=300, save in PDF or PNG
```

## Anti-Pattern

> [!warning] Anti-pattern
> setting rcParams globally in a notebook
>   plt.rcParams["figure.figsize"] = (12, 7)        # leaks to next cells
> Use rc_context for one-off changes.

## Tips

- Pixel size = figsize × dpi: `(10, 6)` at `dpi=150` gives a 1500×900 pixel figure
- For Jupyter notebooks, `%matplotlib inline` uses the default dpi — set `plt.rcParams["figure.dpi"] = 120` for larger inline figures
- For presentations: `figsize=(12, 7)` matches 16:9 aspect ratio
- For bar charts with many categories, increase height: `figsize=(8, max(4, n_categories * 0.3))`

## Common Mistake

> [!warning] Trying to change figure size after plotting with `plt.rcParams["figure.figsize"]`. This only affects future figures. Pass `figsize=` to `plt.subplots()` at creation time.

## Shorthand (Junior → Senior)

**Junior:**
```python
import matplotlib.pyplot as plt
fig, ax = plt.subplots(figsize=(10, 6))    # 10×6 inches
fig, ax = plt.subplots(figsize=(6, 6))     # square
fig, ax = plt.subplots(figsize=(16, 4))    # wide/short
```

**Senior:**
```python
plt.rcParams['figure.dpi'] = 150
```

## See Also

- [[Sections/matplotlib/figures-layouts/subplot-mosaic|plt.subplot_mosaic() (Matplotlib)]]
- [[Sections/matplotlib/figures-layouts/anatomy|Figure & Axes (Matplotlib)]]
- [[Sections/matplotlib/figures-layouts/subplots|plt.subplots() (Matplotlib)]]
- [[Sections/typing/core-typing/basic-annotations|Type Annotations — Variables, Functions & Collections (Type Hints & mypy)]]
- [[Sections/matplotlib/figures-layouts/_Index|Matplotlib → Figures & Layouts]]
- [[Sections/matplotlib/_Index|Matplotlib index]]
- [[_Index|Vault index]]
