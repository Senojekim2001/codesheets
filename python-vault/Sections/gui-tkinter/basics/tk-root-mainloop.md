---
type: "entry"
domain: "python"
file: "gui-tkinter"
section: "basics"
id: "tk-root-mainloop"
title: "tk.Tk / mainloop / ttk widgets — minimal app"
category: "tk basics"
subtitle: "tk.Tk vs tk.Toplevel, mainloop blocking, ttk vs tk widgets, root.title / root.geometry, root.protocol('WM_DELETE_WINDOW', ...), keyboard interrupt + Ctrl-C handling"
signature_short: "root = tk.Tk(); ttk.Button(root, text=, command=).pack(); root.mainloop()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "tk.Tk / mainloop / ttk widgets — minimal app"
  - "tk-root-mainloop"
tags:
  - "python"
  - "python/gui-tkinter"
  - "python/gui-tkinter/basics"
  - "category/tk-basics"
  - "tier/tiered"
---

# tk.Tk / mainloop / ttk widgets — minimal app

> tk.Tk vs tk.Toplevel, mainloop blocking, ttk vs tk widgets, root.title / root.geometry, root.protocol('WM_DELETE_WINDOW', ...), keyboard interrupt + Ctrl-C handling

## Overview

Tk apps follow a fixed lifecycle: create the `Tk()` root, populate widgets (themed via `ttk`), call `root.mainloop()`. mainloop blocks until the window closes. The bare `tk.Button` looks like Windows 95 — use `ttk.Button` for anything user-facing. Three depths solve the SAME task — show a window with a button that updates a label — at increasing depths: minimal `tk.Button` → `ttk` themed widgets + `geometry` + close protocol → class-based App with `__init__/run`, theme selection, and Ctrl-C handling that actually closes the window.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Show a window with a button that updates a label.
- **Junior** — SAME — window with button updating a label — themed widgets, window title, geometry, clean close.
- **Senior** — SAME — window with button updating a label — production: class- based App, theme selection per-OS, Ctrl-C actually exits.

## Signature

```python
root = tk.Tk(); ttk.Button(root, text=, command=).pack(); root.mainloop()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Show a window with a button that updates a label.
# APPROACH  - Bare tk widgets, .pack(), one-shot mainloop.
# STRENGTHS - Five lines; works without ttk knowledge.
# WEAKNESSES- Looks dated (Tk 8.5 default style); no window title or sizing.
import tkinter as tk

root = tk.Tk()
label = tk.Label(root, text="Click me")
label.pack()

def on_click():
    label.config(text="Clicked!")

tk.Button(root, text="Go", command=on_click).pack()
root.mainloop()
# mainloop() blocks here until the window is closed.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — window with button updating a label — themed widgets,
#             window title, geometry, clean close.
# APPROACH  - ttk widgets, root.title/geometry, WM_DELETE_WINDOW protocol.
# STRENGTHS - Modern-looking; explicit window setup; clean exit.
# WEAKNESSES- Still procedural; state lives in module scope.
import tkinter as tk
from tkinter import ttk

root = tk.Tk()
root.title("Demo")
root.geometry("320x120")                              # WIDTHxHEIGHT[+X+Y]
root.minsize(240, 80)

label = ttk.Label(root, text="Click me", padding=10)
label.pack()

def on_click():
    label.config(text="Clicked!")

ttk.Button(root, text="Go", command=on_click).pack(pady=8)

# Run a callback when the user closes the window (X button or Cmd-Q).
def on_close():
    print("closing...")
    root.destroy()

root.protocol("WM_DELETE_WINDOW", on_close)
root.mainloop()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — window with button updating a label — production: class-
#             based App, theme selection per-OS, Ctrl-C actually exits.
# APPROACH  - App class with __init__ + run; ttk.Style theme; SIGINT poll
#             via after() so KeyboardInterrupt is delivered to mainloop.
# STRENGTHS - State encapsulated; portable theming; Ctrl-C works (it doesn't
#             by default in tkinter).
# WEAKNESSES- More code; theme name strings are platform-specific.
from __future__ import annotations
import sys
import signal
import tkinter as tk
from tkinter import ttk


class App:
    """A tiny but well-behaved Tk app."""

    def __init__(self) -> None:
        self.root = tk.Tk()
        self.root.title("Demo")
        self.root.geometry("360x140")
        self._apply_theme()
        self._build_ui()
        self._wire_signals()

    # ---- setup ----
    def _apply_theme(self) -> None:
        style = ttk.Style(self.root)
        # Best-looking native theme per OS.
        themes = {
            'darwin':  'aqua',
            'win32':   'vista',
            'linux':   'clam',
        }
        target = themes.get(sys.platform, 'clam')
        if target in style.theme_names():
            style.theme_use(target)

    def _build_ui(self) -> None:
        self.label = ttk.Label(self.root, text="Click me", padding=12)
        self.label.pack(expand=True)
        ttk.Button(self.root, text="Go", command=self._on_click).pack(pady=8)

    def _wire_signals(self) -> None:
        # Tk swallows Ctrl-C by default. Poll signals every 100ms so the
        # SIGINT handler runs and we can exit cleanly.
        signal.signal(signal.SIGINT, lambda *_: self.root.destroy())
        self._poll_signals()
        self.root.protocol("WM_DELETE_WINDOW", self.root.destroy)

    def _poll_signals(self) -> None:
        # Just yielding to the interpreter every 100ms lets SIGINT through.
        self.root.after(100, self._poll_signals)

    # ---- events ----
    def _on_click(self) -> None:
        self.label.config(text="Clicked!")

    # ---- run ----
    def run(self) -> None:
        self.root.mainloop()


if __name__ == '__main__':
    App().run()

# Decision rule:
#   One-off script with a UI                 -> module-level tk + mainloop.
#   Anything reusable or > 50 LOC            -> class-based App with __init__/run.
#   Need modern look                         -> ttk widgets + ttk.Style theme.
#   Need true cross-platform native styling  -> PyQt/PySide; tkinter is "native-ish".
#   Multiple independent windows             -> create tk.Toplevel for extras
#                                               (NOT another tk.Tk - causes mainloop bugs).
#   Need Ctrl-C to exit during dev           -> after() polling trick (above).

# Anti-pattern:
#   tk.Tk() called twice in one process
# A second Tk() creates a SECOND root with its own event loop. Use
# tk.Toplevel(root) for additional windows.
```

## Decision Rule

```text
One-off script with a UI                 -> module-level tk + mainloop.
Anything reusable or > 50 LOC            -> class-based App with __init__/run.
Need modern look                         -> ttk widgets + ttk.Style theme.
Need true cross-platform native styling  -> PyQt/PySide; tkinter is "native-ish".
Multiple independent windows             -> create tk.Toplevel for extras
                                            (NOT another tk.Tk - causes mainloop bugs).
Need Ctrl-C to exit during dev           -> after() polling trick (above).
```

## Anti-Pattern

> [!warning] Anti-pattern
>   tk.Tk() called twice in one process
> A second Tk() creates a SECOND root with its own event loop. Use
> tk.Toplevel(root) for additional windows.

## Tips

- Always use `from tkinter import ttk` and `ttk.Button/Label/...` — bare `tk.*` widgets look dated.
- A program has exactly one `tk.Tk()` — additional windows are `tk.Toplevel(root)`.
- `root.mainloop()` blocks; everything happens via callbacks scheduled on the loop.
- Bind `WM_DELETE_WINDOW` to control what happens when the user closes the window.
- Tk swallows SIGINT by default — poll with `after(100, ...)` to let Ctrl-C exit during dev.

## Common Mistake

> [!warning] Calling `tk.Tk()` twice. The second call creates a second event loop and visually-broken windows. Use `tk.Toplevel(root)` for extra windows.

## See Also

- [[Sections/gui-tkinter/basics/tk-widgets-overview|ttk widget catalog — Entry, Combobox, Treeview, Notebook (Tkinter)]]
- [[Sections/gui-tkinter/basics/tk-state-vars|tk.StringVar / IntVar / BooleanVar — reactive state (Tkinter)]]
- [[Sections/gui-tkinter/basics/_Index|Tkinter → Tk basics — root, mainloop, ttk widgets]]
- [[Sections/gui-tkinter/_Index|Tkinter index]]
- [[_Index|Vault index]]
