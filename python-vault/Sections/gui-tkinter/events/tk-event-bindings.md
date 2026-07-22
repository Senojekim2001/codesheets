---
type: "entry"
domain: "python"
file: "gui-tkinter"
section: "events"
id: "tk-event-bindings"
title: "widget.bind / event modifiers — keyboard, mouse, focus"
category: "events"
subtitle: "widget.bind(<event>, cb) vs bind_all (global), event tokens (<Return>, <Control-s>, <Button-1>, <Motion>), event object attributes (event.x/y/keysym/state), unbind, return 'break' to stop propagation"
signature_short: "widget.bind('<event>', cb); root.bind_all('<Control-s>', cb); cb(event) where event has .x, .y, .keysym"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "widget.bind / event modifiers — keyboard, mouse, focus"
  - "tk-event-bindings"
tags:
  - "python"
  - "python/gui-tkinter"
  - "python/gui-tkinter/events"
  - "category/events"
  - "tier/tiered"
---

# widget.bind / event modifiers — keyboard, mouse, focus

> widget.bind(<event>, cb) vs bind_all (global), event tokens (<Return>, <Control-s>, <Button-1>, <Motion>), event object attributes (event.x/y/keysym/state), unbind, return 'break' to stop propagation

## Overview

Tk events use a `<modifier-detail>` token grammar: `<Return>`, `<Escape>`, `<Button-1>` (left click), `<Double-1>`, `<Control-s>`, `<KeyRelease>`. The callback receives an `event` object with `.x`, `.y`, `.keysym`, `.state`, `.widget`. Use `widget.bind` to bind to one widget, `bind_all` for app-wide shortcuts. Three depths solve the SAME task — wire a Save shortcut and a click counter — at depths: `<Return>` on Entry only → Ctrl-S app-wide + click counter on a button → keyboard shortcuts that work even when focus is in a text widget, plus `return 'break'` to stop default behavior.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Press Enter in the Entry to "submit"; click the button to count clicks.
- **Junior** — SAME — Enter to submit, button click counter — plus Ctrl-S app-wide.
- **Senior** — SAME — Enter submit, click counter, Ctrl-S — production: shortcuts work in any focus context; default behavior cancelled with return 'break'; cleanup on close.

## Signature

```python
widget.bind('<event>', cb); root.bind_all('<Control-s>', cb); cb(event) where event has .x, .y, .keysym
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Press Enter in the Entry to "submit"; click the button to count clicks.
# APPROACH  - widget.bind('<Return>', cb) and ttk.Button(command=).
# STRENGTHS - Demonstrates per-widget binding.
# WEAKNESSES- No global shortcut; no event object inspection.
import tkinter as tk
from tkinter import ttk

root = tk.Tk()
entry = ttk.Entry(root); entry.pack()

def submit(_event):
    print(f"submitted: {entry.get()!r}")

entry.bind("<Return>", submit)

clicks = 0
btn = ttk.Button(root, text="Click me")
def on_click():
    global clicks; clicks += 1
    btn.config(text=f"Clicks: {clicks}")
btn.config(command=on_click); btn.pack()

root.mainloop()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — Enter to submit, button click counter — plus Ctrl-S app-wide.
# APPROACH  - bind_all for app-wide shortcuts; inspect the event object.
# STRENGTHS - Global keyboard shortcut; mouse-event coordinates.
# WEAKNESSES- bind_all fires regardless of focus; can clash with text widgets.
import tkinter as tk
from tkinter import ttk

root = tk.Tk()
root.title("events")

entry = ttk.Entry(root); entry.pack(fill="x", padx=8, pady=8)
status = ttk.Label(root, text="(idle)"); status.pack()

def submit(_event):
    status.config(text=f"submitted: {entry.get()!r}")

entry.bind("<Return>", submit)

# Global save shortcut.
root.bind_all("<Control-s>", lambda e: status.config(text="saved!"))

# Click counter that also tracks position.
clicks = 0
btn = ttk.Button(root, text="Click me"); btn.pack(pady=8)
def on_click(event):
    global clicks; clicks += 1
    btn.config(text=f"Clicks: {clicks}  ({event.x}, {event.y})")
btn.bind("<Button-1>", on_click)                      # left mouse button

root.mainloop()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — Enter submit, click counter, Ctrl-S — production:
#             shortcuts work in any focus context; default behavior cancelled
#             with return 'break'; cleanup on close.
# APPROACH  - Bind on root vs widgets carefully; document event flow.
# STRENGTHS - Predictable focus behavior; doesn't fight stdlib widgets.
# WEAKNESSES- Multiple binding scopes can be hard to debug.
from __future__ import annotations
import tkinter as tk
from tkinter import ttk


class App:
    def __init__(self) -> None:
        self.root = tk.Tk()
        self.root.title("events (senior)")
        self.root.geometry("360x220")

        self.entry = ttk.Entry(self.root)
        self.entry.pack(fill="x", padx=8, pady=(8, 4))
        self.entry.focus_set()

        self.status = ttk.Label(self.root, text="(idle)", foreground="gray")
        self.status.pack(pady=4)

        self.btn = ttk.Button(self.root, text="Click me", command=self._click)
        self.btn.pack(pady=8)
        self.clicks = 0

        # Per-widget binding for Enter (only when entry is focused).
        self.entry.bind("<Return>", self._submit)
        self.entry.bind("<Escape>", lambda _: self.entry.delete(0, "end"))

        # App-wide shortcuts: bind on root (NOT bind_all) so they don't
        # fire inside arbitrary text-input children.
        self.root.bind("<Control-s>", self._save)
        self.root.bind("<Control-q>", lambda _: self.root.destroy())

        # Show some metadata for any unhandled key.
        self.root.bind("<KeyPress>", self._on_keypress)

    def _submit(self, _event) -> str:
        self.status.config(text=f"submitted: {self.entry.get()!r}")
        return "break"                                # stop default Enter handling

    def _save(self, _event) -> str:
        self.status.config(text="saved!")
        return "break"                                # stop browser-style propagation

    def _click(self) -> None:
        self.clicks += 1
        self.btn.config(text=f"Clicks: {self.clicks}")

    def _on_keypress(self, event) -> None:
        # event has: keysym (e.g. 'Return'), keycode, state (modifier mask),
        # x/y (mouse), char (printable), widget (focused widget).
        # We log only non-modifier presses for debugging.
        if event.keysym not in {"Control_L", "Control_R", "Shift_L", "Shift_R"}:
            print(f"key: {event.keysym!r} char={event.char!r} widget={event.widget}")

    def run(self) -> None:
        self.root.mainloop()


if __name__ == "__main__":
    App().run()

# Decision rule:
#   Per-widget event (button click, entry Enter)   -> widget.bind.
#   Window-wide shortcut (Ctrl-S, Esc)              -> root.bind.
#   App-wide regardless of toplevel                 -> root.bind_all (use sparingly).
#   Cancel default behavior after handling          -> return 'break' from the callback.
#   Need to listen to many widgets uniformly        -> bind on a common parent + event.widget.
#   Keyboard shortcuts in a Text widget             -> bind on the widget; default bindings
#                                                       are 'class' bindings - your binding
#                                                       fires before them but won't replace
#                                                       them unless you return 'break'.

# Anti-pattern:
#   widget.bind('<Tab>', cb)               # without 'break'
# Default Tab handling (focus next widget) still runs after your callback.
# If you wanted to take over Tab, return 'break'. Same for arrow keys in
# Listbox/Treeview, where the default handling moves the selection.
```

## Decision Rule

```text
Per-widget event (button click, entry Enter)   -> widget.bind.
Window-wide shortcut (Ctrl-S, Esc)              -> root.bind.
App-wide regardless of toplevel                 -> root.bind_all (use sparingly).
Cancel default behavior after handling          -> return 'break' from the callback.
Need to listen to many widgets uniformly        -> bind on a common parent + event.widget.
Keyboard shortcuts in a Text widget             -> bind on the widget; default bindings
                                                    are 'class' bindings - your binding
                                                    fires before them but won't replace
                                                    them unless you return 'break'.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   widget.bind('<Tab>', cb)               # without 'break'
> Default Tab handling (focus next widget) still runs after your callback.
> If you wanted to take over Tab, return 'break'. Same for arrow keys in
> Listbox/Treeview, where the default handling moves the selection.

## Tips

- Event tokens: `<Return>`, `<Escape>`, `<Button-1>` (left click), `<Double-1>`, `<Control-s>`, `<KeyRelease>`, `<FocusIn/Out>`.
- The callback receives an `event` object with `.x`, `.y`, `.keysym`, `.char`, `.state`, `.widget`.
- `widget.bind` is per-widget; `root.bind` is window-wide; `bind_all` is application-wide (use carefully — fires in text widgets too).
- Return `'break'` from a callback to suppress default behavior (e.g., Tab focus, Enter form submit).
- For multi-widget shortcuts in a class app, bind on root and inspect `event.widget` to dispatch.

## Common Mistake

> [!warning] Forgetting `return 'break'` — your handler fires AND the default still runs. Tab focus moves, arrow keys move selection, Enter still submits the form.

## See Also

- [[Sections/gui-tkinter/events/tk-dialogs-menus|tkinter.messagebox / filedialog / Menu — standard dialogs and menus (Tkinter)]]
- [[Sections/gui-tkinter/events/_Index|Tkinter → Events, bindings, dialogs]]
- [[Sections/gui-tkinter/_Index|Tkinter index]]
- [[_Index|Vault index]]
