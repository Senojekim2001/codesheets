---
type: "entry"
domain: "python"
file: "notebooks"
section: "jupyter-basics"
id: "jupyter-magic-commands"
title: "IPython magic commands — %time, %autoreload, %%writefile"
category: "Jupyter Basics"
subtitle: "%time / %timeit, %run, %load, %%writefile, %autoreload, %matplotlib inline, %env, !shell, %%capture"
signature_short: "%timeit slow_function()   # times multiple runs
%load_ext autoreload
%autoreload 2"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "IPython magic commands — %time, %autoreload, %%writefile"
  - "jupyter-magic-commands"
tags:
  - "python"
  - "python/notebooks"
  - "python/notebooks/jupyter-basics"
  - "category/jupyter-basics"
  - "tier/tiered"
---

# IPython magic commands — %time, %autoreload, %%writefile

> %time / %timeit, %run, %load, %%writefile, %autoreload, %matplotlib inline, %env, !shell, %%capture

## Overview

Magic commands are the IPython kernel's way of adding REPL verbs that aren't valid Python. `%` prefix = line magic; `%%` prefix = cell magic. Most consequential ones: `%timeit` (better than `time.time()` benchmarking), `%autoreload 2` (edit your module, re-run the cell, see changes — no kernel restart), `%%writefile` (save a cell to a file), `!cmd` (run shell commands inline). The three examples solve the SAME concrete task — work efficiently with a module you're editing during development — at three depths: basic `%time` → autoreload + cell magic for inline scripts → production patterns for reproducible notebooks (capture, env, version pinning).

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Time a function in a notebook cell.
- **Junior** — SAME — but auto-reload your module so edits take effect without restarting the kernel; capture cell output.
- **Senior** — SAME — production: a "notebook header" that pins versions, enables autoreload, configures display, captures env. Place this as the FIRST cell in every analysis notebook.

## Signature

```python
%timeit slow_function()   # times multiple runs
%load_ext autoreload
%autoreload 2
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Time a function in a notebook cell.

# %time runs once, %timeit averages many runs (better signal).
%time slow_function(big_input)
# CPU times: user 1.23 s, sys: 23 ms, total: 1.25 s; Wall time: 1.26 s

%timeit fast_function(big_input)
# 12.5 µs ± 234 ns per loop (mean ± std. dev. of 7 runs, 100,000 loops each)

# Cell magics use %%:
%%timeit
total = 0
for i in range(1000):
    total += i**2

# Common line magics:
%pwd                                                   # current dir
%ls                                                    # list files
%cd ..                                                 # change dir (persists)
%env DATABASE_URL=postgresql://...                    # set env var

# Shell commands inline with !:
!ls -la
!pip install pandas
result = !ls *.csv                                     # capture into a Python list

# View source / docs:
?pd.DataFrame                                          # signature + docstring
??pd.DataFrame                                         # full source if available
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but auto-reload your module so edits take effect
#             without restarting the kernel; capture cell output.

# %autoreload: notebook code that imports your module gets the
# latest changes without restarting the kernel.
%load_ext autoreload
%autoreload 2

# Now editing myproj/utils.py and re-running the cell that imports
# from it picks up the changes. Saves dozens of kernel restarts/day.

# %%capture suppresses cell output OR captures it.
%%capture out
import pandas as pd
print("loading data...")
df = pd.read_csv("big.csv")
# Outside the cell:
out.stdout                                             # 'loading data...\n'
out.stderr

# %%writefile saves a cell to disk — useful for prototyping a script
# in a notebook then exporting.
%%writefile worker.py
import sys
def main():
    print(sys.argv)
if __name__ == "__main__":
    main()
# Now: !python worker.py arg1

# %run: execute a script in the notebook's namespace.
%run setup.py                                          # variables defined there are now in scope

# %matplotlib inline: render plots inside the notebook.
%matplotlib inline
import matplotlib.pyplot as plt
plt.plot([1, 2, 3])

# Other backends:
# %matplotlib widget   - interactive zoom/pan (needs ipympl)
# %matplotlib notebook - older interactive backend
# %matplotlib qt       - separate window
# %matplotlib agg      - no display (CI)

# %config InlineBackend.figure_format = "retina"        # high-DPI plots
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: a "notebook header" that pins versions,
#             enables autoreload, configures display, captures env.
# Place this as the FIRST cell in every analysis notebook.

%load_ext autoreload
%autoreload 2

# Display configuration.
%matplotlib inline
%config InlineBackend.figure_format = "retina"
import matplotlib.pyplot as plt
plt.rcParams["figure.figsize"] = (10, 6)
plt.rcParams["figure.dpi"] = 100

import pandas as pd
pd.set_option("display.max_columns", 50)
pd.set_option("display.max_rows", 100)
pd.set_option("display.float_format", "{:,.2f}".format)

import warnings
warnings.filterwarnings("default", category=DeprecationWarning)

# === Reproducibility: pin versions visible to readers ===
import sys, platform, importlib.metadata as ilm
def _versions(*pkgs):
    return {p: ilm.version(p) for p in pkgs}

print(f"Python {sys.version.split()[0]} on {platform.platform()}")
for k, v in _versions("pandas", "numpy", "matplotlib", "scikit-learn").items():
    print(f"  {k}: {v}")

# === Reproducibility: pin random seed ===
import random, numpy as np
SEED = 42
random.seed(SEED)
np.random.seed(SEED)
# torch.manual_seed(SEED) if using PyTorch

# === Path setup so imports work from any nested directory ===
from pathlib import Path
PROJECT_ROOT = Path.cwd()
while not (PROJECT_ROOT / "pyproject.toml").exists() and PROJECT_ROOT != PROJECT_ROOT.parent:
    PROJECT_ROOT = PROJECT_ROOT.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Decision rule:
#   benchmark a function                 -> %timeit (multiple runs)
#   one-off timing                         -> %time
#   profile (line-by-line)                -> %lprun (line_profiler ext)
#   memory profile                         -> %memit (memory_profiler ext)
#   editing-and-rerunning a module        -> %autoreload 2
#   suppress / capture output              -> %%capture
#   shell command                           -> !cmd
#   capture shell output to Python         -> result = !cmd
#   set env var                             -> %env KEY=value
#   render plots inline                     -> %matplotlib inline
#   interactive plots                       -> %matplotlib widget (needs ipympl)
#   debug a cell                             -> %debug after a traceback
#   run external script                      -> %run script.py
#   save cell to file                        -> %%writefile path.py
#   reproducibility on share                 -> version-print header above
#
# Anti-pattern: starting %autoreload 2 in production notebooks. Reload
# is slow and can cause weird state (objects with stale class
# definitions). Fine for development; remove from notebooks intended
# to be run end-to-end (papermill, scheduled).
```

## Decision Rule

```text
benchmark a function                 -> %timeit (multiple runs)
one-off timing                         -> %time
profile (line-by-line)                -> %lprun (line_profiler ext)
memory profile                         -> %memit (memory_profiler ext)
editing-and-rerunning a module        -> %autoreload 2
suppress / capture output              -> %%capture
shell command                           -> !cmd
capture shell output to Python         -> result = !cmd
set env var                             -> %env KEY=value
render plots inline                     -> %matplotlib inline
interactive plots                       -> %matplotlib widget (needs ipympl)
debug a cell                             -> %debug after a traceback
run external script                      -> %run script.py
save cell to file                        -> %%writefile path.py
reproducibility on share                 -> version-print header above
```

## Anti-Pattern

> [!warning] Anti-pattern
> starting %autoreload 2 in production notebooks. Reload
> is slow and can cause weird state (objects with stale class
> definitions). Fine for development; remove from notebooks intended
> to be run end-to-end (papermill, scheduled).

## Tips

- `%autoreload 2` saves dozens of kernel restarts a day during module development. Add to a `~/.ipython/profile_default/ipython_config.py` to enable by default.
- `%timeit` runs a cell multiple times and reports mean ± stddev — far better signal than `time.time()` deltas.
- `!cmd` runs a shell command; `result = !cmd` captures its output as a Python list — useful for piping shell into Python loops.
- For high-DPI displays, `%config InlineBackend.figure_format = "retina"` produces sharp matplotlib output. Default is "png" which looks blurry on Retina/4K screens.
- Pin a `SEED` and call `random.seed(SEED) + np.random.seed(SEED)` early; reproducibility for free.
- `%%writefile worker.py` is the fastest way to prototype a script — write the code in a cell, run it inline, then export when stable.

## Common Mistake

> [!warning] `%autoreload 2` in a notebook intended for unattended execution (papermill, scheduled). Reload adds startup cost and can produce stale-class-definition bugs that look mysterious. Use it during development; remove for end-to-end runs.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Production notebook with autoreload — slow + flaky
%load_ext autoreload
%autoreload 2
# ... papermill executes this; reload triggers per cell ...
```

**Senior:**
```python
# Dev: enable autoreload. Production: don't.
import os
if os.environ.get("NOTEBOOK_MODE") != "production":
    %load_ext autoreload
    %autoreload 2
```

## See Also

- [[Sections/notebooks/jupyter-basics/ipython-display-widgets|IPython.display & ipywidgets — rich output and interactivity (Notebooks)]]
- [[Sections/notebooks/jupyter-basics/jupyter-kernel-management|Kernels & environments — per-project Python, JupyterLab vs notebook (Notebooks)]]
- [[Sections/notebooks/jupyter-basics/_Index|Notebooks → Jupyter basics — magics, display, kernels]]
- [[Sections/notebooks/_Index|Notebooks index]]
- [[_Index|Vault index]]
