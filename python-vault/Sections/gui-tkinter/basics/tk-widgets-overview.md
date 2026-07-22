---
type: "entry"
domain: "python"
file: "gui-tkinter"
section: "basics"
id: "tk-widgets-overview"
title: "ttk widget catalog — Entry, Combobox, Treeview, Notebook"
category: "tk basics"
subtitle: "ttk.Entry / Combobox / Spinbox / Checkbutton / Radiobutton / Treeview (columns + headings) / Notebook (tabs) / Progressbar / Scale, widget option pattern, get/set via state vars"
signature_short: "ttk.Entry(parent, textvariable=); ttk.Combobox(parent, values=); ttk.Treeview(parent, columns=, show=)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "ttk widget catalog — Entry, Combobox, Treeview, Notebook"
  - "tk-widgets-overview"
tags:
  - "python"
  - "python/gui-tkinter"
  - "python/gui-tkinter/basics"
  - "category/tk-basics"
  - "tier/tiered"
---

# ttk widget catalog — Entry, Combobox, Treeview, Notebook

> ttk.Entry / Combobox / Spinbox / Checkbutton / Radiobutton / Treeview (columns + headings) / Notebook (tabs) / Progressbar / Scale, widget option pattern, get/set via state vars

## Overview

ttk widgets all follow `Widget(parent, **options).pack/grid()`. Read/write via state variables (`tk.StringVar`, `tk.IntVar`) bound through `textvariable=`/`variable=`, or via `widget.get()`/`widget.set()`. Treeview is the workhorse for tabular data — `columns=` defines column ids, `heading()` sets header text, `insert()` adds rows. Three depths solve the SAME task — a form with name+age+role inputs and a table of submitted entries — at depths: Entry+Button only → Entry+Combobox+Treeview with headings → bound state vars + form validation + edit-on-row-click.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — A form (name + age) with a "submit" button that prints the values.
- **Junior** — SAME — name+age form with submitted entries shown in a table.
- **Senior** — SAME — form + table — production: bound state vars, validation, double-click row to edit, sort by column header click.

## Signature

```python
ttk.Entry(parent, textvariable=); ttk.Combobox(parent, values=); ttk.Treeview(parent, columns=, show=)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - A form (name + age) with a "submit" button that prints the values.
# APPROACH  - Two ttk.Entry widgets, one ttk.Button.
# STRENGTHS - Minimal; demonstrates Entry + .get().
# WEAKNESSES- Plain print; no display of past entries; no validation.
import tkinter as tk
from tkinter import ttk

root = tk.Tk()
root.title("Form")

ttk.Label(root, text="Name").pack()
name = ttk.Entry(root)
name.pack()

ttk.Label(root, text="Age").pack()
age = ttk.Entry(root)
age.pack()

def submit():
    print(f"{name.get()=} {age.get()=}")

ttk.Button(root, text="Submit", command=submit).pack(pady=8)
root.mainloop()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — name+age form with submitted entries shown in a table.
# APPROACH  - Add a Combobox for role, Treeview for the rows.
# STRENGTHS - Combobox restricts choices; Treeview shows tabular history.
# WEAKNESSES- Still no validation; ages aren't checked numeric.
import tkinter as tk
from tkinter import ttk

root = tk.Tk()
root.title("Form + Table")
root.geometry("520x340")

# Inputs
form = ttk.Frame(root, padding=8)
form.pack(fill="x")

ttk.Label(form, text="Name:").grid(row=0, column=0, sticky="w")
name = ttk.Entry(form, width=20)
name.grid(row=0, column=1, padx=4)

ttk.Label(form, text="Age:").grid(row=0, column=2, sticky="w")
age = ttk.Entry(form, width=6)
age.grid(row=0, column=3, padx=4)

ttk.Label(form, text="Role:").grid(row=0, column=4, sticky="w")
role = ttk.Combobox(form, values=["dev", "design", "pm"], width=10, state="readonly")
role.set("dev")
role.grid(row=0, column=5, padx=4)

# Treeview (rows table)
cols = ("name", "age", "role")
tree = ttk.Treeview(root, columns=cols, show="headings", height=10)
for c in cols:
    tree.heading(c, text=c.title())
    tree.column(c, width=120, anchor="center")
tree.pack(fill="both", expand=True, padx=8, pady=8)

def submit():
    tree.insert("", "end", values=(name.get(), age.get(), role.get()))
    name.delete(0, "end")
    age.delete(0, "end")

ttk.Button(root, text="Add", command=submit).pack(pady=4)
root.mainloop()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — form + table — production: bound state vars, validation,
#             double-click row to edit, sort by column header click.
# APPROACH  - tk.StringVar/IntVar for binding; validatecommand on Entry;
#             tree.bind('<Double-1>', ...) for editing; column-click sort.
# STRENGTHS - Real form discipline; sortable + editable table.
# WEAKNESSES- Treeview cell editing is hand-rolled (Tk has no native cell editor).
from __future__ import annotations
import tkinter as tk
from tkinter import ttk, messagebox


class FormApp:
    def __init__(self) -> None:
        self.root = tk.Tk()
        self.root.title("People")
        self.root.geometry("560x380")

        # Bound state variables
        self.name = tk.StringVar()
        self.age  = tk.StringVar()                    # validated to int on submit
        self.role = tk.StringVar(value="dev")

        self._build_form()
        self._build_table()

    def _build_form(self) -> None:
        form = ttk.Frame(self.root, padding=8); form.pack(fill="x")
        ttk.Label(form, text="Name:").grid(row=0, column=0, sticky="w")
        ttk.Entry(form, textvariable=self.name, width=20).grid(row=0, column=1, padx=4)

        # validate=key + validatecommand: only allow digits in the age field.
        vcmd = (self.root.register(lambda s: s == "" or s.isdigit()), "%P")
        ttk.Label(form, text="Age:").grid(row=0, column=2, sticky="w")
        ttk.Entry(form, textvariable=self.age, width=6,
                  validate="key", validatecommand=vcmd).grid(row=0, column=3, padx=4)

        ttk.Label(form, text="Role:").grid(row=0, column=4, sticky="w")
        ttk.Combobox(form, textvariable=self.role,
                     values=["dev", "design", "pm"], width=10, state="readonly"
                     ).grid(row=0, column=5, padx=4)

        ttk.Button(form, text="Add", command=self._submit).grid(row=0, column=6, padx=8)

    def _build_table(self) -> None:
        cols = ("name", "age", "role")
        self.tree = ttk.Treeview(self.root, columns=cols, show="headings", height=12)
        for c in cols:
            # Sort by clicking column header.
            self.tree.heading(c, text=c.title(),
                              command=lambda _c=c: self._sort_by(_c))
            self.tree.column(c, width=140, anchor="center")
        self.tree.pack(fill="both", expand=True, padx=8, pady=8)

        # Double-click to delete (keep it simple - real edit is a dialog).
        self.tree.bind("<Double-1>", self._on_double_click)

    def _submit(self) -> None:
        if not self.name.get().strip():
            messagebox.showerror("error", "name is required")
            return
        if not self.age.get():
            messagebox.showerror("error", "age is required")
            return
        self.tree.insert("", "end",
                         values=(self.name.get(), int(self.age.get()), self.role.get()))
        self.name.set("")
        self.age.set("")

    def _on_double_click(self, _event) -> None:
        item = self.tree.focus()
        if item:
            self.tree.delete(item)

    def _sort_by(self, col: str) -> None:
        rows = [(self.tree.set(k, col), k) for k in self.tree.get_children("")]
        # int sort if possible, else string.
        def keyfn(t):
            try:    return (0, int(t[0]))
            except: return (1, t[0])
        rows.sort(key=keyfn)
        for i, (_, k) in enumerate(rows):
            self.tree.move(k, "", i)

    def run(self) -> None:
        self.root.mainloop()


if __name__ == "__main__":
    FormApp().run()

# Decision rule:
#   Free text                           -> ttk.Entry (with textvariable + validatecommand).
#   Pick from a fixed list              -> ttk.Combobox (state='readonly').
#   Bounded integer                     -> ttk.Spinbox.
#   Multi-line text                     -> tk.Text (NOT in ttk; the only big stdlib widget left in tk.).
#   Tabular data                        -> ttk.Treeview with columns=...; show='headings' for no tree icon.
#   Tree-shaped data                    -> ttk.Treeview default (show='tree headings').
#   Tabbed UI                           -> ttk.Notebook + .add(frame, text=).
#   Long-running task indicator         -> ttk.Progressbar (mode='indeterminate' for spinner).

# Anti-pattern:
#   ttk.Combobox(parent)                # state defaults to 'normal' (free typing)
# Users can type values not in the list. Set state='readonly' if you want a
# proper dropdown. (Or use 'disabled' to fully lock it.)
```

## Decision Rule

```text
Free text                           -> ttk.Entry (with textvariable + validatecommand).
Pick from a fixed list              -> ttk.Combobox (state='readonly').
Bounded integer                     -> ttk.Spinbox.
Multi-line text                     -> tk.Text (NOT in ttk; the only big stdlib widget left in tk.).
Tabular data                        -> ttk.Treeview with columns=...; show='headings' for no tree icon.
Tree-shaped data                    -> ttk.Treeview default (show='tree headings').
Tabbed UI                           -> ttk.Notebook + .add(frame, text=).
Long-running task indicator         -> ttk.Progressbar (mode='indeterminate' for spinner).
```

## Anti-Pattern

> [!warning] Anti-pattern
>   ttk.Combobox(parent)                # state defaults to 'normal' (free typing)
> Users can type values not in the list. Set state='readonly' if you want a
> proper dropdown. (Or use 'disabled' to fully lock it.)

## Tips

- Bind state via `textvariable=tk.StringVar()` / `variable=tk.IntVar()` — read with `.get()`, write with `.set()`.
- `Combobox(state='readonly')` makes it a true dropdown — default `'normal'` allows free typing.
- Treeview with `show='headings'` is a flat table; default `show='tree headings'` shows the tree triangle.
- For multi-line text use `tk.Text` (it stayed in `tk`, not `ttk`). It supports rich inline tags.
- Validate inputs via `validate='key'` + `validatecommand=(root.register(fn), '%P')` — runs on every keystroke.

## Common Mistake

> [!warning] Forgetting `state='readonly'` on Combobox — users can type anything and bypass the dropdown.

## See Also

- [[Sections/gui-tkinter/basics/tk-root-mainloop|tk.Tk / mainloop / ttk widgets — minimal app (Tkinter)]]
- [[Sections/gui-tkinter/basics/tk-state-vars|tk.StringVar / IntVar / BooleanVar — reactive state (Tkinter)]]
- [[Sections/gui-tkinter/basics/_Index|Tkinter → Tk basics — root, mainloop, ttk widgets]]
- [[Sections/gui-tkinter/_Index|Tkinter index]]
- [[_Index|Vault index]]
