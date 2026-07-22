---
type: "entry"
domain: "python"
file: "gui-tkinter"
section: "layout"
id: "tk-grid-vs-pack"
title: "grid vs pack vs place — pick a geometry manager"
category: "layout"
subtitle: "pack (side, expand, fill), grid (row, column, sticky, padx/pady), place (x, y, relx, rely), no mixing within a single parent, columnconfigure(weight=) for resizing"
signature_short: "w.pack(side=, expand=, fill=); w.grid(row=, column=, sticky=); w.place(x=, y=)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "grid vs pack vs place — pick a geometry manager"
  - "tk-grid-vs-pack"
tags:
  - "python"
  - "python/gui-tkinter"
  - "python/gui-tkinter/layout"
  - "category/layout"
  - "tier/tiered"
---

# grid vs pack vs place — pick a geometry manager

> pack (side, expand, fill), grid (row, column, sticky, padx/pady), place (x, y, relx, rely), no mixing within a single parent, columnconfigure(weight=) for resizing

## Overview

pack lays out children in a single direction (top/bottom/left/right) — perfect for stacked forms or toolbars. grid is the table layout — use for any multi-column form. place uses pixel coordinates and almost never scales properly. Critical rule: a single parent can use `pack` OR `grid`, never both — they enter an infinite loop. Three depths solve the SAME task — a labeled form with two inputs and a button — at depths: pack-only (slow to lay out cleanly) → grid with `sticky` and `padx/pady` → grid with `columnconfigure(weight=)` so the entry stretches with the window.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Form with "Name", "Email", and a Submit button.
- **Junior** — SAME — Name + Email + Submit form — using grid with sticky.
- **Senior** — SAME — Name + Email + Submit form — production: stretches with the window, has minimum widths, header label spans both columns.

## Signature

```python
w.pack(side=, expand=, fill=); w.grid(row=, column=, sticky=); w.place(x=, y=)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Form with "Name", "Email", and a Submit button.
# APPROACH  - Pure pack(); each widget gets its own row by stacking.
# STRENGTHS - One geometry manager; works for vertical lists.
# WEAKNESSES- Hard to align labels with their entries; no column structure.
import tkinter as tk
from tkinter import ttk

root = tk.Tk()
root.title("pack-only form")

ttk.Label(root, text="Name").pack(anchor="w")
ttk.Entry(root).pack(fill="x")

ttk.Label(root, text="Email").pack(anchor="w")
ttk.Entry(root).pack(fill="x")

ttk.Button(root, text="Submit").pack(pady=8)
root.mainloop()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — Name + Email + Submit form — using grid with sticky.
# APPROACH  - Two columns: labels right-aligned, entries stretch.
# STRENGTHS - Aligned labels; explicit row/column.
# WEAKNESSES- Window resize doesn't stretch the entries (no weight set).
import tkinter as tk
from tkinter import ttk

root = tk.Tk()
root.title("grid form")

# sticky: 'n','s','e','w' or any concat ('ew' = stretch horizontally).
ttk.Label(root, text="Name").grid(row=0, column=0, sticky="e", padx=4, pady=4)
ttk.Entry(root).grid(row=0, column=1, sticky="ew", padx=4, pady=4)

ttk.Label(root, text="Email").grid(row=1, column=0, sticky="e", padx=4, pady=4)
ttk.Entry(root).grid(row=1, column=1, sticky="ew", padx=4, pady=4)

ttk.Button(root, text="Submit").grid(row=2, column=1, sticky="e", padx=4, pady=8)

root.mainloop()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — Name + Email + Submit form — production: stretches with
#             the window, has minimum widths, header label spans both columns.
# APPROACH  - columnconfigure(weight=) so column 1 absorbs extra width;
#             columnspan for the header; uniform=' ' to lock label widths.
# STRENGTHS - Resizes cleanly; consistent label width; obvious structure.
# WEAKNESSES- More setup; weights need re-tuning if you add columns.
from __future__ import annotations
import tkinter as tk
from tkinter import ttk


class FormApp:
    def __init__(self) -> None:
        self.root = tk.Tk()
        self.root.title("Form")
        self.root.geometry("420x180")
        self.root.minsize(320, 140)

        # Use a Frame as the form container so we can set weights cleanly.
        form = ttk.Frame(self.root, padding=12)
        form.pack(fill="both", expand=True)

        # Column weights: column 0 stays as small as the label; column 1 stretches.
        form.columnconfigure(0, weight=0, minsize=80)
        form.columnconfigure(1, weight=1)

        self.name = tk.StringVar()
        self.email = tk.StringVar()

        ttk.Label(form, text="Profile", font=("", 12, "bold")
                  ).grid(row=0, column=0, columnspan=2, sticky="w", pady=(0, 8))

        ttk.Label(form, text="Name").grid(row=1, column=0, sticky="e", padx=4, pady=4)
        ttk.Entry(form, textvariable=self.name
                  ).grid(row=1, column=1, sticky="ew", padx=4, pady=4)

        ttk.Label(form, text="Email").grid(row=2, column=0, sticky="e", padx=4, pady=4)
        ttk.Entry(form, textvariable=self.email
                  ).grid(row=2, column=1, sticky="ew", padx=4, pady=4)

        # Buttons in a sub-frame, packed to the right - mixing managers across
        # different parents (root vs sub-frame) is fine.
        buttons = ttk.Frame(form)
        buttons.grid(row=3, column=0, columnspan=2, sticky="e", pady=(12, 0))
        ttk.Button(buttons, text="Cancel", command=self.root.destroy).pack(side="left", padx=4)
        ttk.Button(buttons, text="Submit", command=self._submit).pack(side="left", padx=4)

    def _submit(self) -> None:
        print(self.name.get(), self.email.get())

    def run(self) -> None:
        self.root.mainloop()


if __name__ == "__main__":
    FormApp().run()

# Decision rule:
#   Stacked one-direction (toolbar, sidebar, status bar)   -> pack.
#   Form with aligned labels + inputs                      -> grid.
#   Pixel-positioned dashboard widget                      -> place
#                                                              (only if you must;
#                                                              breaks under DPI scaling).
#   Need a column to absorb extra space when resized       -> columnconfigure(col, weight=1).
#   Need a header that spans columns                       -> columnspan.
#   Two different geometry needs in one window             -> Frames; one manager per Frame.

# Anti-pattern:
#   ttk.Label(root).pack()
#   ttk.Entry(root).grid(row=0, column=0)   # same parent uses both!
# Tk enters an "I'm laying out, no I'm laying out" loop and the window
# either freezes or never finishes geometry calculation. One manager per
# parent. Use Frames to isolate.
```

## Decision Rule

```text
Stacked one-direction (toolbar, sidebar, status bar)   -> pack.
Form with aligned labels + inputs                      -> grid.
Pixel-positioned dashboard widget                      -> place
                                                           (only if you must;
                                                           breaks under DPI scaling).
Need a column to absorb extra space when resized       -> columnconfigure(col, weight=1).
Need a header that spans columns                       -> columnspan.
Two different geometry needs in one window             -> Frames; one manager per Frame.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   ttk.Label(root).pack()
>   ttk.Entry(root).grid(row=0, column=0)   # same parent uses both!
> Tk enters an "I'm laying out, no I'm laying out" loop and the window
> either freezes or never finishes geometry calculation. One manager per
> parent. Use Frames to isolate.

## Tips

- Never mix `pack` and `grid` on children of the same parent — Tk hangs trying to reconcile them.
- Use `Frame` to isolate layouts: one manager per Frame, then any manager for the Frames themselves.
- `sticky='ew'` makes a widget stretch horizontally; `'nsew'` stretches both directions.
- `columnconfigure(c, weight=1)` is the only way to make a column absorb extra width on resize.
- Never use `place` for normal UI — it breaks under HiDPI/font scaling. Reserve for overlays or absolute-positioned art.

## Common Mistake

> [!warning] Mixing `pack()` and `grid()` calls on children of the same widget. The geometry manager enters a fight loop and the window stops responding.

## See Also

- [[Sections/gui-tkinter/layout/_Index|Tkinter → Geometry — grid, pack, place]]
- [[Sections/gui-tkinter/_Index|Tkinter index]]
- [[_Index|Vault index]]
