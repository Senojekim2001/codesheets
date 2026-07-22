---
type: "entry"
domain: "python"
file: "matplotlib"
section: "chart-types"
id: "errorbar"
title: "ax.errorbar()"
category: "Charts"
subtitle: "Show mean ± std, CI, or measurement uncertainty"
signature_short: "ax.errorbar(x, y, yerr=std, fmt=\"o\", capsize=5)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "ax.errorbar()"
  - "errorbar"
tags:
  - "python"
  - "python/matplotlib"
  - "python/matplotlib/chart-types"
  - "category/charts"
  - "tier/tiered"
---

# ax.errorbar()

> Show mean ± std, CI, or measurement uncertainty

## Overview

errorbar() plots data points with vertical and/or horizontal error bars. yerr= and xerr= accept a scalar (symmetric), a 2-row array (asymmetric), or a column of values. Commonly used for scientific data, survey results, and model performance.

## Signature

```python
ax.errorbar(x, y, yerr=std, fmt="o", capsize=5)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - point + error bar. capsize=5 puts caps on
#             the bars (standard scientific style).
# STRENGTHS - smallest possible "show uncertainty".
# WEAKNESSES- doesn't yet show asymmetric errors, both x
#             and y errors, or the line-with-band
#             alternative.
#
import matplotlib.pyplot as plt

x, y, yerr = [1, 2, 3, 4, 5], [2.1, 3.5, 2.8, 4.2, 3.9], [0.3, 0.4, 0.2, 0.5, 0.3]
fig, ax = plt.subplots()
ax.errorbar(x, y, yerr=yerr, fmt="o", capsize=5)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday error-bar surface: asymmetric
#             via 2-row array, both x and y errors, line +
#             markers + band, and color/cap controls.
# STRENGTHS - covers what real scientific plots use; the
#             asymmetric format is the most-asked errorbar
#             question.
# WEAKNESSES- doesn't address fill_between as an
#             alternative for dense errorbars (cleaner for
#             time series) or aggregating before plotting —
#             senior tier.
#
import matplotlib.pyplot as plt

x = [1, 2, 3, 4, 5]
y = [2.1, 3.5, 2.8, 4.2, 3.9]
yerr = [0.3, 0.4, 0.2, 0.5, 0.3]

fig, axes = plt.subplots(1, 2, figsize=(10, 4))

# Symmetric, with cap and color controls
axes[0].errorbar(x, y, yerr=yerr,
                  fmt="o", capsize=5, capthick=1.5,
                  color="steelblue", ecolor="gray",
                  elinewidth=1, markersize=6)

# Asymmetric — pass [[lower], [upper]]
yerr_asym = [[0.1, 0.2, 0.1, 0.3, 0.2],
             [0.4, 0.5, 0.3, 0.6, 0.4]]
axes[1].errorbar(x, y, yerr=yerr_asym, xerr=0.1,
                  fmt="-o", capsize=4)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production error bars: for dense time series
#             prefer line + fill_between (cleaner); for
#             discrete points use errorbar with capsize. Be
#             explicit about what the bars represent (std,
#             SEM, 95% CI) — it changes the interpretation.
# STRENGTHS - fill_between scales gracefully to thousands
#             of points where errorbar collapses into noise;
#             explicit labeling forces honest plotting.
# WEAKNESSES- fill_between obscures the discrete-point
#             feel; some audiences expect capped bars
#             regardless.
#
import numpy as np, matplotlib.pyplot as plt

t = np.linspace(0, 10, 200)
mean = np.sin(t)
sem  = 0.1 + 0.05 * np.abs(np.cos(t))            # standard error of mean

fig, axes = plt.subplots(1, 2, figsize=(12, 4),
                          layout="constrained")

# Many points — errorbar gets noisy
axes[0].errorbar(t, mean, yerr=sem, fmt="o", capsize=2,
                  markersize=2, alpha=0.5)
axes[0].set_title("errorbar (200 points)")

# Cleaner: line + fill_between band
axes[1].plot(t, mean, linewidth=2)
axes[1].fill_between(t, mean - 1.96 * sem, mean + 1.96 * sem,
                      alpha=0.3, label="95% CI")
axes[1].legend()
axes[1].set_title("line + fill_between (95% CI)")

# Decision rule:
#   discrete data points (~<30)        -> errorbar with capsize=3-5
#   dense series (>50)                 -> line + fill_between (95% CI band)
#   bar chart with uncertainty         -> ax.bar(..., yerr=...) + capsize
#   asymmetric errors                  -> yerr=[[lower], [upper]] (2 rows)
#   both x and y uncertainty           -> errorbar(..., xerr=, yerr=)
#   horizontal layout (group means)    -> errorbar(yerr=...) on barh, or sns.pointplot
#   showing distribution, not summary  -> boxplot or violinplot, NOT errorbar
#
# Anti-pattern: plotting yerr=df["std"] without saying what the bars mean. A reader
#   can't tell std (sample variability) from SEM (precision of the mean) from a 95% CI
#   (inferential range) — they're often 4x apart. Always label: "error bars: 1 SD",
#   "error bars: 95% CI". For dense time series, also pick line + fill_between rather
#   than 200 caps that collapse into noise.
```

## Decision Rule

```text
discrete data points (~<30)        -> errorbar with capsize=3-5
dense series (>50)                 -> line + fill_between (95% CI band)
bar chart with uncertainty         -> ax.bar(..., yerr=...) + capsize
asymmetric errors                  -> yerr=[[lower], [upper]] (2 rows)
both x and y uncertainty           -> errorbar(..., xerr=, yerr=)
horizontal layout (group means)    -> errorbar(yerr=...) on barh, or sns.pointplot
showing distribution, not summary  -> boxplot or violinplot, NOT errorbar
```

## Anti-Pattern

> [!warning] Anti-pattern
> plotting yerr=df["std"] without saying what the bars mean. A reader
>   can't tell std (sample variability) from SEM (precision of the mean) from a 95% CI
>   (inferential range) — they're often 4x apart. Always label: "error bars: 1 SD",
>   "error bars: 95% CI". For dense time series, also pick line + fill_between rather
>   than 200 caps that collapse into noise.

## Tips

- `fmt="o"` for points only, `fmt="-o"` for line + points, `fmt="none"` for error bars only
- `capsize=5` adds horizontal caps to the error bars — standard in scientific plots
- For asymmetric errors, pass a 2D array: `yerr=[[lower_errs], [upper_errs]]`
- `ecolor=` sets error bar color independently from the marker/line color

## Common Mistake

> [!warning] Passing `yerr=std_column` from a DataFrame without converting to a numpy array. Pandas Series sometimes cause unexpected shapes. Use `yerr=df["std"].values`.

## Shorthand (Junior → Senior)

**Junior:**
```python
import matplotlib.pyplot as plt
x     = [1, 2, 3, 4, 5]
y     = [2.1, 3.5, 2.8, 4.2, 3.9]
yerr  = [0.3, 0.4, 0.2, 0.5, 0.3]
```

**Senior:**
```python
)
```

## See Also

- [[Sections/matplotlib/chart-types/line|ax.plot() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/bar|ax.bar() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/barh|ax.barh() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/hist|ax.hist() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/_Index|Matplotlib → Chart Types]]
- [[Sections/matplotlib/_Index|Matplotlib index]]
- [[_Index|Vault index]]
