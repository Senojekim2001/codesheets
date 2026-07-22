---
type: "entry"
domain: "python"
file: "gui-tkinter"
section: "advanced"
id: "tk-canvas"
title: "tk.Canvas — drawing, dragging, custom widgets"
category: "advanced"
subtitle: "tk.Canvas, create_line / create_rectangle / create_oval / create_text / create_image, item ids, tag_bind for per-item events, coords / move / itemconfig, scrollregion + xview/yview"
signature_short: "c = tk.Canvas(parent); item = c.create_rectangle(x1,y1,x2,y2, fill=); c.move(item, dx, dy)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "tk.Canvas — drawing, dragging, custom widgets"
  - "tk-canvas"
tags:
  - "python"
  - "python/gui-tkinter"
  - "python/gui-tkinter/advanced"
  - "category/advanced"
  - "tier/tiered"
---

# tk.Canvas — drawing, dragging, custom widgets

> tk.Canvas, create_line / create_rectangle / create_oval / create_text / create_image, item ids, tag_bind for per-item events, coords / move / itemconfig, scrollregion + xview/yview

## Overview

Canvas paints by creating items that return integer ids. Mutate via `coords`, `move`, `itemconfig`, `delete`. Tag items (`tags=("draggable",)`) and bind mouse events per-tag with `tag_bind`. For complex graphics consider a different toolkit, but Canvas is sufficient for sketches, simple plots, and drag-and-drop UIs. Three depths solve the SAME task — drag a colored rectangle around — at depths: hardcoded rectangle with manual `<B1-Motion>` math → tagged items + mouse-offset tracking → multiple draggable items with z-order, snap-to-grid, and double-click to delete.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Drag a single rectangle around the canvas.
- **Junior** — SAME — drag rectangle — preserves the click offset.
- **Senior** — SAME — drag rectangles — production: many items, drag with snap-to-grid, double-click to delete, raise on click (z-order).

## Signature

```python
c = tk.Canvas(parent); item = c.create_rectangle(x1,y1,x2,y2, fill=); c.move(item, dx, dy)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Drag a single rectangle around the canvas.
# APPROACH  - One rectangle, manual <B1-Motion> binding.
# STRENGTHS - Shows Canvas + event basics.
# WEAKNESSES- Jumps because we set top-left to (event.x, event.y) instead
#             of preserving the click offset.
import tkinter as tk

root = tk.Tk()
c = tk.Canvas(root, width=400, height=300, bg="white")
c.pack()

rect = c.create_rectangle(100, 100, 200, 150, fill="steelblue")

def on_drag(event):
    c.coords(rect, event.x, event.y, event.x + 100, event.y + 50)

c.tag_bind(rect, "<B1-Motion>", on_drag)
root.mainloop()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — drag rectangle — preserves the click offset.
# APPROACH  - Capture (offset_x, offset_y) on press; move() by delta on motion.
# STRENGTHS - Drag feels right; works for any item shape.
# WEAKNESSES- Single item; doesn't generalize to many.
import tkinter as tk

root = tk.Tk()
c = tk.Canvas(root, width=400, height=300, bg="white")
c.pack()

rect = c.create_rectangle(100, 100, 200, 150, fill="steelblue")

state = {"x": 0, "y": 0}

def on_press(event):
    state["x"], state["y"] = event.x, event.y

def on_drag(event):
    dx = event.x - state["x"]
    dy = event.y - state["y"]
    c.move(rect, dx, dy)
    state["x"], state["y"] = event.x, event.y

c.tag_bind(rect, "<ButtonPress-1>", on_press)
c.tag_bind(rect, "<B1-Motion>",     on_drag)
root.mainloop()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — drag rectangles — production: many items, drag with
#             snap-to-grid, double-click to delete, raise on click (z-order).
# APPROACH  - Tag every draggable; track per-item drag state by item id.
# STRENGTHS - Scales to many items; clear separation of concerns.
# WEAKNESSES- More state; snapping logic per kind of object.
from __future__ import annotations
import tkinter as tk
import random


GRID = 20


class CanvasApp:
    def __init__(self) -> None:
        self.root = tk.Tk()
        self.root.title("Canvas")
        self.canvas = tk.Canvas(self.root, width=600, height=400, bg="white")
        self.canvas.pack(fill="both", expand=True)

        self._drag = {"item": None, "x": 0, "y": 0}

        # Bind events on a TAG so all "draggable" items share handlers.
        self.canvas.tag_bind("draggable", "<ButtonPress-1>",   self._on_press)
        self.canvas.tag_bind("draggable", "<B1-Motion>",       self._on_drag)
        self.canvas.tag_bind("draggable", "<ButtonRelease-1>", self._on_release)
        self.canvas.tag_bind("draggable", "<Double-1>",        self._on_double)

        # Click empty space to spawn a new rectangle.
        self.canvas.bind("<Button-3>", self._spawn)            # right-click
        for _ in range(5):
            self._spawn_at(random.randint(40, 540), random.randint(40, 340))

    def _spawn(self, event):
        self._spawn_at(event.x, event.y)

    def _spawn_at(self, x: int, y: int) -> int:
        color = random.choice(["#5fa", "#fa5", "#a5f", "#5af"])
        return self.canvas.create_rectangle(
            x - 30, y - 20, x + 30, y + 20,
            fill=color, outline="black", width=2,
            tags=("draggable",),
        )

    def _snap(self, v: int) -> int:
        return round(v / GRID) * GRID

    def _on_press(self, event):
        item = self.canvas.find_withtag("current")[0]
        self._drag.update(item=item, x=event.x, y=event.y)
        self.canvas.tag_raise(item)                   # bring to front

    def _on_drag(self, event):
        if self._drag["item"] is None:
            return
        dx = event.x - self._drag["x"]
        dy = event.y - self._drag["y"]
        self.canvas.move(self._drag["item"], dx, dy)
        self._drag["x"], self._drag["y"] = event.x, event.y

    def _on_release(self, event):
        item = self._drag["item"]
        if item is None: return
        # Snap to grid: get current bbox, compute snapped delta, apply.
        x1, y1, x2, y2 = self.canvas.coords(item)
        sx, sy = self._snap(x1), self._snap(y1)
        self.canvas.move(item, sx - x1, sy - y1)
        self._drag["item"] = None

    def _on_double(self, _event):
        item = self.canvas.find_withtag("current")[0]
        self.canvas.delete(item)

    def run(self) -> None:
        self.root.mainloop()


if __name__ == "__main__":
    CanvasApp().run()

# Decision rule:
#   Static drawing                         -> create_* once; never touch again.
#   Update one item's geometry             -> canvas.coords(id, ...).
#   Translate by a delta                   -> canvas.move(id, dx, dy).
#   Update color/width/dash                -> canvas.itemconfig(id, fill=, width=).
#   Many items share behavior              -> give them a shared tag + tag_bind.
#   Need scroll region bigger than canvas  -> set scrollregion=(x1,y1,x2,y2) + Scrollbar.
#   Animation                              -> use after(16, step) and move() per frame.
#   Anything 3D, GPU, or > 1000 dynamic items -> not Canvas; reach for pyglet/Qt/web.

# Anti-pattern:
#   item = canvas.create_rectangle(...)
#   canvas.bind('<Button-1>', cb)          # binds to the WHOLE canvas
# Per-item events should use canvas.tag_bind(item_or_tag, '<...>', cb).
# A canvas-level bind fires for clicks on empty space too.
```

## Decision Rule

```text
Static drawing                         -> create_* once; never touch again.
Update one item's geometry             -> canvas.coords(id, ...).
Translate by a delta                   -> canvas.move(id, dx, dy).
Update color/width/dash                -> canvas.itemconfig(id, fill=, width=).
Many items share behavior              -> give them a shared tag + tag_bind.
Need scroll region bigger than canvas  -> set scrollregion=(x1,y1,x2,y2) + Scrollbar.
Animation                              -> use after(16, step) and move() per frame.
Anything 3D, GPU, or > 1000 dynamic items -> not Canvas; reach for pyglet/Qt/web.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   item = canvas.create_rectangle(...)
>   canvas.bind('<Button-1>', cb)          # binds to the WHOLE canvas
> Per-item events should use canvas.tag_bind(item_or_tag, '<...>', cb).
> A canvas-level bind fires for clicks on empty space too.

## Tips

- `create_*` returns an integer item id — keep it to mutate later.
- `tag_bind('mytag', '<event>', cb)` binds an event to all items sharing that tag.
- `canvas.coords(id, ...)` re-sets coordinates; `move(id, dx, dy)` translates by a delta.
- For drag-and-drop, use `find_withtag("current")` inside the press handler to get the clicked item.
- Set `scrollregion=(x1, y1, x2, y2)` and pair with a Scrollbar for canvases bigger than the visible area.

## Common Mistake

> [!warning] Binding events on the canvas itself when you wanted per-item — `canvas.bind` fires for empty-space clicks too. Use `tag_bind`.

## See Also

- [[Sections/gui-tkinter/advanced/tk-threading-after|after / threads / queue — Tk is single-threaded (Tkinter)]]
- [[Sections/gui-tkinter/advanced/tk-async-loop|asyncio + Tk — running an async loop alongside mainloop (Tkinter)]]
- [[Sections/gui-tkinter/advanced/_Index|Tkinter → Threading, Canvas, async patterns]]
- [[Sections/gui-tkinter/_Index|Tkinter index]]
- [[_Index|Vault index]]
