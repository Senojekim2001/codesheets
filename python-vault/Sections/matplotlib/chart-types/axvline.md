---
type: "entry"
domain: "python"
file: "matplotlib"
section: "chart-types"
id: "axvline"
title: "ax.axvline()"
category: "Charts"
subtitle: "Event markers, cutoffs, period boundaries"
signature_short: "ax.axvline(x=0, color=, linestyle=, linewidth=)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "ax.axvline()"
  - "axvline"
tags:
  - "python"
  - "python/matplotlib"
  - "python/matplotlib/chart-types"
  - "category/charts"
  - "tier/tiered"
---

# ax.axvline()

> Event markers, cutoffs, period boundaries

## Overview

axvline() draws a vertical line at a given x value spanning the full height of the axes. axvspan() shades a vertical band between two x values — useful for highlighting time periods.

## Signature

```python
ax.axvline(x=0, color=, linestyle=, linewidth=)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - vertical reference line at a given x. Spans
#             full height of the axes.
# STRENGTHS - one call for "mark this event on a time
#             series".
# WEAKNESSES- doesn't yet show axvspan (shaded period) or
#             multi-event loops.
#
import matplotlib.pyplot as plt
fig, ax = plt.subplots()
ax.plot(x, y)
ax.axvline(x=5, color="red", linestyle="--")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday axvline patterns: event markers
#             on a datetime axis, axvspan for highlighted
#             periods (COVID, recessions), and multi-event
#             loops.
# STRENGTHS - matches what news/economics charts do:
#             annotate events on a time series.
# WEAKNESSES- doesn't address text-on-line annotation
#             (combining axvline with ax.text) — senior.
#
import pandas as pd, matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.plot(dates, values)

ax.axvline(x=pd.Timestamp("2020-03-01"),
            color="red", linestyle="--", linewidth=1.5,
            label="policy change")

ax.axvspan(xmin=pd.Timestamp("2020-01-01"),
            xmax=pd.Timestamp("2021-01-01"),
            alpha=0.15, color="orange",
            label="COVID period")

for ev in [pd.Timestamp("2019-01-01"), pd.Timestamp("2021-06-01")]:
    ax.axvline(x=ev, color="gray", linestyle=":", alpha=0.7)

ax.legend()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production event annotation: pair axvline
#             with ax.text at the top of the axes for
#             readable labels; pull events from a DataFrame
#             so the chart stays in sync with the data;
#             use ymin/ymax (axes-fraction) for partial-
#             height lines.
# STRENGTHS - paired text labels are far more readable than
#             a legend with many event lines; data-driven
#             event lists keep the chart deterministic.
# WEAKNESSES- text labels can collide on busy charts —
#             rotate or stagger; ymin/ymax use AXES FRACTION
#             (0..1), not data coords.
#
import pandas as pd, matplotlib.pyplot as plt

events = pd.DataFrame({
    "date":  pd.to_datetime(["2019-01", "2020-03", "2021-06"]),
    "label": ["product launch", "policy change", "v2 release"],
    "color": ["gray", "red", "blue"],
})

fig, ax = plt.subplots(figsize=(10, 4), layout="constrained")
ax.plot(dates, values)

for _, ev in events.iterrows():
    ax.axvline(x=ev.date, color=ev.color, linestyle="--",
                linewidth=1, alpha=0.7)
    # Label at top of axes (y in axes-fraction)
    ax.text(ev.date, 0.98, ev.label, transform=ax.get_xaxis_transform(),
             rotation=90, va="top", ha="right",
             fontsize=8, color=ev.color)

# Partial-height vertical line — ymin/ymax in AXES FRACTION
# ax.axvline(x=event_x, ymin=0.0, ymax=0.3)
#
# Decision rule:
#   single event marker                   -> ax.axvline(x=date, color=, ls="--")
#   highlighted period (recession, COVID) -> ax.axvspan(xmin, xmax, alpha=0.15)
#   many events (> 3)                     -> loop + axvline + ax.text labels
#   datetime axis                         -> pass pd.Timestamp / datetime objects
#   short marker, not full height         -> ax.axvline(..., ymin=0, ymax=0.3) (axes frac)
#   labels: tag the line directly         -> ax.text with transform=ax.get_xaxis_transform()
#   per-event color                       -> drive from a DataFrame (date, label, color)
#
# Anti-pattern: passing an integer to axvline on a datetime x-axis. Matplotlib will
#   silently interpret 5 as 1970-01-06 (5 days from epoch), placing the line off-screen
#   or in the wrong year. Always match the data's units: pd.Timestamp("2020-03-01") for
#   datetime, plain numbers for numeric axes. Same trap with axvspan(xmin, xmax).
```

## Decision Rule

```text
single event marker                   -> ax.axvline(x=date, color=, ls="--")
highlighted period (recession, COVID) -> ax.axvspan(xmin, xmax, alpha=0.15)
many events (> 3)                     -> loop + axvline + ax.text labels
datetime axis                         -> pass pd.Timestamp / datetime objects
short marker, not full height         -> ax.axvline(..., ymin=0, ymax=0.3) (axes frac)
labels: tag the line directly         -> ax.text with transform=ax.get_xaxis_transform()
per-event color                       -> drive from a DataFrame (date, label, color)
```

## Anti-Pattern

> [!warning] Anti-pattern
> passing an integer to axvline on a datetime x-axis. Matplotlib will
>   silently interpret 5 as 1970-01-06 (5 days from epoch), placing the line off-screen
>   or in the wrong year. Always match the data's units: pd.Timestamp("2020-03-01") for
>   datetime, plain numbers for numeric axes. Same trap with axvspan(xmin, xmax).

## Tips

- axvspan(xmin, xmax, alpha=0.1) shades a time period — standard for recession/event highlighting
- For datetime x-axis, pass pd.Timestamp or ISO string to x=
- Use label= on reference lines and include in ax.legend() for an annotated chart
- zorder=0 puts the line behind data; zorder=3 puts it in front

## Common Mistake

> [!warning] Forgetting that axvspan uses the same x-axis units as the data. If your x-axis is datetime, pass datetime values — not integers.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
import matplotlib.pyplot as plt
fig, ax = plt.subplots()
ax.plot(dates, values)
```

**Senior:**
```python
plt.tight_layout()
```

## See Also

- [[Sections/matplotlib/chart-types/line|ax.plot() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/bar|ax.bar() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/barh|ax.barh() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/hist|ax.hist() (Matplotlib)]]
- [[Sections/matplotlib/chart-types/_Index|Matplotlib → Chart Types]]
- [[Sections/matplotlib/_Index|Matplotlib index]]
- [[_Index|Vault index]]
