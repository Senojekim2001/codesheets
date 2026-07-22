---
type: "entry"
domain: "python"
file: "notebooks"
section: "jupyter-basics"
id: "ipython-display-widgets"
title: "IPython.display & ipywidgets — rich output and interactivity"
category: "Jupyter Basics"
subtitle: "IPython.display.display, Markdown, HTML, Image, Audio, Video, ipywidgets.interact, observe, layout, link / dlink"
signature_short: "from ipywidgets import interact
@interact(x=(0, 100))
def plot(x): return x**2"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "IPython.display & ipywidgets — rich output and interactivity"
  - "ipython-display-widgets"
tags:
  - "python"
  - "python/notebooks"
  - "python/notebooks/jupyter-basics"
  - "category/jupyter-basics"
  - "tier/tiered"
---

# IPython.display & ipywidgets — rich output and interactivity

> IPython.display.display, Markdown, HTML, Image, Audio, Video, ipywidgets.interact, observe, layout, link / dlink

## Overview

`IPython.display` lets a notebook show more than just text — Markdown, formatted HTML, images, audio, video, even iframes. `ipywidgets` adds interactive controls: sliders, dropdowns, buttons, color pickers — bind them to functions so the output updates as the widget changes. The three examples solve the SAME concrete task — interactive parameter exploration of a function — at three depths: `display(Markdown(...))` + image → `@interact` decorator → fully composed widget layout with linked controls and observation callbacks.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Render rich output: Markdown, HTML, image, audio.
- **Junior** — SAME — but interactive: sliders update a plot. pip install ipywidgets
- **Senior** — SAME — production: laid-out widget app with linked controls, observe callbacks, output area.

## Signature

```python
from ipywidgets import interact
@interact(x=(0, 100))
def plot(x): return x**2
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Render rich output: Markdown, HTML, image, audio.
from IPython.display import display, Markdown, HTML, Image, Audio, Video, IFrame

display(Markdown("# Section header\n\n**Bold** + [link](https://example.com)"))

display(HTML("<div style='color:red; font-size:24px;'>Important</div>"))

display(Image("logo.png", width=200))                  # local file
display(Image(url="https://example.com/cat.jpg"))      # remote
display(Image(data=png_bytes, format="png"))           # bytes

display(Audio("clip.wav"))                             # plays inline
display(Video("clip.mp4", width=400, embed=True))

# Embed an external page:
display(IFrame("https://example.com", width=600, height=400))

# Auto-display happens for the LAST expression of a cell:
df.head()                                              # equivalent to display(df.head())

# Display a pandas DataFrame as HTML table with formatting:
df.style.format({"price": "${:,.2f}"}).background_gradient(subset=["price"])
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but interactive: sliders update a plot.
# pip install ipywidgets
from ipywidgets import interact, interactive, fixed, IntSlider, FloatSlider, Dropdown
import matplotlib.pyplot as plt
import numpy as np

# === @interact decorator: widget per arg ===
@interact(
    frequency=FloatSlider(min=0.1, max=5.0, step=0.1, value=1.0),
    amplitude=FloatSlider(min=0.1, max=5.0, step=0.1, value=1.0),
    waveform=Dropdown(options=["sin", "cos", "square"], value="sin"),
)
def plot_wave(frequency: float, amplitude: float, waveform: str):
    x = np.linspace(0, 4 * np.pi, 500)
    if waveform == "sin":   y = amplitude * np.sin(frequency * x)
    elif waveform == "cos": y = amplitude * np.cos(frequency * x)
    else:                    y = amplitude * np.sign(np.sin(frequency * x))
    plt.figure(figsize=(10, 4))
    plt.plot(x, y)
    plt.ylim(-6, 6)
    plt.grid(True)
    plt.show()

# Argument shortcuts (interact infers widget type):
#   int       -> IntSlider with default range
#   float     -> FloatSlider
#   str       -> Text input
#   bool      -> Checkbox
#   list      -> Dropdown
#   tuple of 2 (min, max)         -> IntSlider/FloatSlider
#   tuple of 3 (min, max, step)    -> with step

@interact(n=10, factor=2.5, label="result", show=True)
def compute(n: int, factor: float, label: str, show: bool):
    if show: print(f"{label}: {n * factor}")

# === Manual widget composition ===
# Use 'interactive' (returns the widget) to embed in a layout:
w = interactive(plot_wave,
                frequency=(0.1, 5.0, 0.1),
                amplitude=(0.1, 5.0, 0.1),
                waveform=["sin", "cos", "square"])
display(w)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: laid-out widget app with linked
#             controls, observe callbacks, output area.
import ipywidgets as W
from IPython.display import display, clear_output
import matplotlib.pyplot as plt
import numpy as np

# === Build widgets explicitly so we can layout + link them ===
freq = W.FloatSlider(value=1.0, min=0.1, max=5.0, step=0.1, description="Freq:")
amp = W.FloatSlider(value=1.0, min=0.1, max=5.0, step=0.1, description="Amp:")
wave = W.Dropdown(options=["sin", "cos", "square"], description="Wave:")
points = W.IntSlider(value=500, min=50, max=2000, step=50, description="N pts:")
sync_amp_freq = W.Checkbox(description="Sync amp & freq")

# Output area for the plot.
out = W.Output()

# === observe callback: re-render on any change ===
def render(_change=None):
    with out:
        clear_output(wait=True)
        x = np.linspace(0, 4 * np.pi, points.value)
        f = freq.value
        a = amp.value
        if wave.value == "sin":   y = a * np.sin(f * x)
        elif wave.value == "cos": y = a * np.cos(f * x)
        else:                      y = a * np.sign(np.sin(f * x))
        plt.figure(figsize=(10, 4))
        plt.plot(x, y)
        plt.title(f"{wave.value} @ f={f:.1f}, a={a:.1f}")
        plt.ylim(-6, 6)
        plt.grid(True)
        plt.show()

for w in (freq, amp, wave, points):
    w.observe(render, names="value")

# === Linked widgets ===
amp_freq_link = None
def toggle_sync(change):
    global amp_freq_link
    if change["new"]:
        amp_freq_link = W.link((amp, "value"), (freq, "value"))
    elif amp_freq_link:
        amp_freq_link.unlink()
        amp_freq_link = None
sync_amp_freq.observe(toggle_sync, names="value")

# === Layout ===
controls = W.VBox([
    W.HBox([freq, amp]),
    W.HBox([wave, points]),
    sync_amp_freq,
])
app = W.HBox([controls, out])
display(app)
render()                                               # initial render

# Decision rule:
#   one or two widget args                 -> @interact decorator
#   precise control / layout                -> ipywidgets explicit + observe
#   need the widget value, not just side-effect -> 'interactive' (returns widget object)
#   linked widgets (one updates another)    -> W.link or W.dlink
#   output area separated from widgets     -> W.Output context manager + clear_output
#   want to share notebook AS an app       -> Voila (renders notebook as web app)
#   plot updates                            -> wrap in Output; clear_output(wait=True)
#   complex UI                               -> probably outgrown notebook; build Streamlit/Dash
#
# Anti-pattern: calling print() or rendering plots directly in an
# observe callback without an Output area. Each render appends below
# the cell; the notebook becomes infinite. Use W.Output as a target
# and clear_output(wait=True) to render-in-place.
```

## Decision Rule

```text
one or two widget args                 -> @interact decorator
precise control / layout                -> ipywidgets explicit + observe
need the widget value, not just side-effect -> 'interactive' (returns widget object)
linked widgets (one updates another)    -> W.link or W.dlink
output area separated from widgets     -> W.Output context manager + clear_output
want to share notebook AS an app       -> Voila (renders notebook as web app)
plot updates                            -> wrap in Output; clear_output(wait=True)
complex UI                               -> probably outgrown notebook; build Streamlit/Dash
```

## Anti-Pattern

> [!warning] Anti-pattern
> calling print() or rendering plots directly in an
> observe callback without an Output area. Each render appends below
> the cell; the notebook becomes infinite. Use W.Output as a target
> and clear_output(wait=True) to render-in-place.

## Tips

- `@interact` is fastest for one or two args. Reach for explicit `ipywidgets` when you need layout, linked widgets, or non-trivial callbacks.
- `W.Output()` + `with out: clear_output(wait=True); plot()` is the right pattern for re-rendering plots in place — without it the cell scrolls forever.
- `W.link((source, "value"), (target, "value"))` makes two widgets stay in sync. `W.dlink` for one-way (source → target).
- For simple choices, pass arg shortcuts to `@interact`: `(0, 100)` → IntSlider, `(0.0, 1.0, 0.01)` → FloatSlider with step, `["a", "b"]` → Dropdown.
- `Voila` (`pip install voila; voila notebook.ipynb`) renders a notebook as a web app — strips code cells, shows widgets and outputs only.
- For complex UIs (multiple tabs, auth, deployment), graduate to Streamlit or Dash — `ipywidgets` is for in-notebook interactivity.

## Common Mistake

> [!warning] Calling `plt.show()` directly in an observe callback. Each call appends a new figure below the cell; the notebook scrolls forever and the original plot stays. Wrap rendering in `W.Output()` and call `clear_output(wait=True)` first to render-in-place.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Each slider tick appends a new plot
slider.observe(lambda c: plt.plot(...))
```

**Senior:**
```python
# Output area + clear_output → plot replaces, doesn't append
out = W.Output()
def render(c):
    with out: clear_output(wait=True); plt.plot(...)
slider.observe(render, names="value")
```

## See Also

- [[Sections/notebooks/jupyter-basics/jupyter-magic-commands|IPython magic commands — %time, %autoreload, %%writefile (Notebooks)]]
- [[Sections/notebooks/jupyter-basics/jupyter-kernel-management|Kernels & environments — per-project Python, JupyterLab vs notebook (Notebooks)]]
- [[Sections/notebooks/jupyter-basics/_Index|Notebooks → Jupyter basics — magics, display, kernels]]
- [[Sections/notebooks/_Index|Notebooks index]]
- [[_Index|Vault index]]
