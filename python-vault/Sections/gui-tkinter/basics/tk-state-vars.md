---
type: "entry"
domain: "python"
file: "gui-tkinter"
section: "basics"
id: "tk-state-vars"
title: "tk.StringVar / IntVar / BooleanVar — reactive state"
category: "tk basics"
subtitle: "tk.StringVar / IntVar / DoubleVar / BooleanVar, .get() / .set(), trace_add('write', cb), variable bindings with Checkbutton / Radiobutton / Combobox, computed values via trace"
signature_short: "v = tk.StringVar(value=); v.set(x); v.get(); v.trace_add('write', lambda *_: ...)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "tk.StringVar / IntVar / BooleanVar — reactive state"
  - "tk-state-vars"
tags:
  - "python"
  - "python/gui-tkinter"
  - "python/gui-tkinter/basics"
  - "category/tk-basics"
  - "tier/tiered"
---

# tk.StringVar / IntVar / BooleanVar — reactive state

> tk.StringVar / IntVar / DoubleVar / BooleanVar, .get() / .set(), trace_add('write', cb), variable bindings with Checkbutton / Radiobutton / Combobox, computed values via trace

## Overview

Tk variables wrap a value the toolkit knows how to push to widgets and pull back. Bind via `textvariable=` (Entry/Label/Combobox) or `variable=` (Checkbutton/Radiobutton/Scale). `.trace_add('write', cb)` calls back whenever the value changes — useful for live filters and computed labels. Three depths solve the SAME task — live-updating "hello, NAME" greeting as the user types — at depths: manual `<KeyRelease>` event handler → `StringVar` + trace → bound greeting plus disable-button-when-empty plus character-count label.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — "Hello, <name>" updates live as the user types.
- **Junior** — SAME — live "Hello, <name>" — using StringVar + trace.
- **Senior** — SAME — live "Hello, <name>" — production: button enables only when there's input, character-count label, length cap.

## Signature

```python
v = tk.StringVar(value=); v.set(x); v.get(); v.trace_add('write', lambda *_: ...)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - "Hello, <name>" updates live as the user types.
# APPROACH  - Bind <KeyRelease> on the Entry, manually update the Label.
# STRENGTHS - Works without StringVar.
# WEAKNESSES- Two-way wiring is your job; easy to forget on widget changes.
import tkinter as tk
from tkinter import ttk

root = tk.Tk()

entry = ttk.Entry(root)
entry.pack()

label = ttk.Label(root, text="Hello, ")
label.pack()

def on_key(_event):
    label.config(text=f"Hello, {entry.get()}")

entry.bind("<KeyRelease>", on_key)
root.mainloop()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — live "Hello, <name>" — using StringVar + trace.
# APPROACH  - One StringVar bound to Entry; trace_add updates Label.
# STRENGTHS - Reactive; no event-binding boilerplate.
# WEAKNESSES- Trace fires on every change including programmatic .set().
import tkinter as tk
from tkinter import ttk

root = tk.Tk()
name = tk.StringVar(value="")

ttk.Entry(root, textvariable=name).pack()
greeting = ttk.Label(root, text="Hello, ")
greeting.pack()

def update_greeting(*_):
    greeting.config(text=f"Hello, {name.get()}")

# trace_add('write', cb) -> cb(*args) called after every .set() / user edit.
name.trace_add("write", update_greeting)
root.mainloop()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — live "Hello, <name>" — production: button enables only
#             when there's input, character-count label, length cap.
# APPROACH  - Multiple traces from one StringVar; computed widgets driven by it.
# STRENGTHS - One source of truth; UI computes itself from the variable.
# WEAKNESSES- Many traces on one var run in registration order - order matters.
from __future__ import annotations
import tkinter as tk
from tkinter import ttk

MAX_LEN = 30


class GreetApp:
    def __init__(self) -> None:
        self.root = tk.Tk()
        self.root.title("State vars")
        self.root.geometry("360x180")

        self.name = tk.StringVar(value="")            # source of truth

        ttk.Label(self.root, text="Your name:").pack(anchor="w", padx=8, pady=(8, 0))
        ttk.Entry(self.root, textvariable=self.name).pack(fill="x", padx=8)

        self.greeting = ttk.Label(self.root, text="Hello,")
        self.greeting.pack(pady=8)

        self.count = ttk.Label(self.root, text=f"0/{MAX_LEN}")
        self.count.pack()

        self.go = ttk.Button(self.root, text="Submit", command=self._submit, state="disabled")
        self.go.pack(pady=8)

        # Three computed views from one variable.
        self.name.trace_add("write", self._update_greeting)
        self.name.trace_add("write", self._update_count)
        self.name.trace_add("write", self._update_button)
        self.name.trace_add("write", self._enforce_max_len)

    # ---- computed views ----
    def _update_greeting(self, *_):
        self.greeting.config(text=f"Hello, {self.name.get()}")

    def _update_count(self, *_):
        self.count.config(text=f"{len(self.name.get())}/{MAX_LEN}")

    def _update_button(self, *_):
        state = "normal" if self.name.get().strip() else "disabled"
        self.go.config(state=state)

    def _enforce_max_len(self, *_):
        v = self.name.get()
        if len(v) > MAX_LEN:
            # WARNING: this triggers another 'write' - keep the guard so we
            # don't infinitely recurse.
            self.name.set(v[:MAX_LEN])

    def _submit(self) -> None:
        print(f"submitted: {self.name.get()!r}")

    def run(self) -> None:
        self.root.mainloop()


if __name__ == "__main__":
    GreetApp().run()

# Decision rule:
#   Single value mirrored to one widget        -> bind via textvariable/variable, no trace.
#   Multiple widgets reflect one value         -> StringVar + trace_add('write').
#   Need to validate / cap input               -> validatecommand on Entry (preempts trace).
#   Two-way binding to non-Tk state            -> trace 'write' -> store; on store change -> .set().
#   Need 'changed by user' vs 'set in code'    -> use a flag; trace fires for both.

# Anti-pattern:
#   name.trace_add('write', lambda *_: name.set(name.get().upper()))
# Trace fires after .set(), so this loops forever. If you must mutate
# inside a trace, guard with a 'self._mutating' flag.
```

## Decision Rule

```text
Single value mirrored to one widget        -> bind via textvariable/variable, no trace.
Multiple widgets reflect one value         -> StringVar + trace_add('write').
Need to validate / cap input               -> validatecommand on Entry (preempts trace).
Two-way binding to non-Tk state            -> trace 'write' -> store; on store change -> .set().
Need 'changed by user' vs 'set in code'    -> use a flag; trace fires for both.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   name.trace_add('write', lambda *_: name.set(name.get().upper()))
> Trace fires after .set(), so this loops forever. If you must mutate
> inside a trace, guard with a 'self._mutating' flag.

## Tips

- `StringVar`/`IntVar`/`DoubleVar`/`BooleanVar` are the four flavors — pick by widget binding type.
- `trace_add('write', cb)` fires after every change; `cb(*args)` ignores the three positional args Tk passes.
- Use `textvariable=` for Entry/Label/Combobox, `variable=` for Checkbutton/Radiobutton/Scale.
- A self-mutating trace (calls `.set()` on the same var) recurses forever — guard with a flag.
- For form validation, prefer `validatecommand` over `trace` — it runs before the value is written.

## Common Mistake

> [!warning] Mutating the variable from inside its own write trace without a re-entry guard — infinite recursion until the stack blows.

## See Also

- [[Sections/gui-tkinter/basics/tk-root-mainloop|tk.Tk / mainloop / ttk widgets — minimal app (Tkinter)]]
- [[Sections/gui-tkinter/basics/tk-widgets-overview|ttk widget catalog — Entry, Combobox, Treeview, Notebook (Tkinter)]]
- [[Sections/gui-tkinter/basics/_Index|Tkinter → Tk basics — root, mainloop, ttk widgets]]
- [[Sections/gui-tkinter/_Index|Tkinter index]]
- [[_Index|Vault index]]
