---
type: "entry"
domain: "python"
file: "gui-tkinter"
section: "events"
id: "tk-dialogs-menus"
title: "tkinter.messagebox / filedialog / Menu — standard dialogs and menus"
category: "events"
subtitle: "tkinter.messagebox (showinfo, showerror, askyesno, askokcancel), tkinter.filedialog (askopenfilename, asksaveasfilename, askdirectory), tk.Menu (add_command, add_cascade, add_separator), context menus via <Button-3>"
signature_short: "messagebox.askyesno(title, message); filedialog.askopenfilename(filetypes=); tk.Menu(parent, tearoff=0)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "tkinter.messagebox / filedialog / Menu — standard dialogs and menus"
  - "tk-dialogs-menus"
tags:
  - "python"
  - "python/gui-tkinter"
  - "python/gui-tkinter/events"
  - "category/events"
  - "tier/tiered"
---

# tkinter.messagebox / filedialog / Menu — standard dialogs and menus

> tkinter.messagebox (showinfo, showerror, askyesno, askokcancel), tkinter.filedialog (askopenfilename, asksaveasfilename, askdirectory), tk.Menu (add_command, add_cascade, add_separator), context menus via <Button-3>

## Overview

messagebox/filedialog return Python values directly (`True/False`, the path string, or empty string on cancel). Menus are built with `tk.Menu(parent, tearoff=0)` then `.add_command/add_cascade/add_separator`. Right-click menus use the same Menu but `tk_popup(x, y)` from a `<Button-3>` binding. Three depths solve the SAME task — file open + save dialogs with confirmation — at depths: bare askopenfilename → with filetypes filter and confirm-on-overwrite → full menu bar (File: Open/Save/Quit) + right-click context menu.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Pick a file with Open dialog; confirm before saving.
- **Junior** — SAME — Open + Save with confirm — filtered by extension and default name suggested.
- **Senior** — SAME — Open + Save — full menu bar + right-click context menu.

## Signature

```python
messagebox.askyesno(title, message); filedialog.askopenfilename(filetypes=); tk.Menu(parent, tearoff=0)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Pick a file with Open dialog; confirm before saving.
# APPROACH  - askopenfilename + askyesno; print results.
# STRENGTHS - Two dialog calls; instantly useful.
# WEAKNESSES- No filetypes filter; no real menu bar.
from tkinter import filedialog, messagebox
import tkinter as tk

root = tk.Tk(); root.withdraw()                       # hide root window

path = filedialog.askopenfilename()
print(f"opened: {path!r}")

if path and messagebox.askyesno("save", "Save changes?"):
    out = filedialog.asksaveasfilename()
    print(f"would save to: {out!r}")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — Open + Save with confirm — filtered by extension and
#             default name suggested.
# APPROACH  - filetypes=, defaultextension=, initialfile=.
# STRENGTHS - Real file picker UX.
# WEAKNESSES- No menu yet; still procedural.
from tkinter import filedialog, messagebox
import tkinter as tk

root = tk.Tk(); root.title("file demo"); root.geometry("320x120")

def open_file():
    path = filedialog.askopenfilename(
        title="Open document",
        filetypes=[("Markdown", "*.md"), ("Text", "*.txt"), ("All files", "*.*")],
    )
    if not path: return                               # user cancelled (empty string)
    messagebox.showinfo("opened", f"opened {path}")

def save_file():
    path = filedialog.asksaveasfilename(
        title="Save as...",
        defaultextension=".md",
        initialfile="untitled.md",
        filetypes=[("Markdown", "*.md"), ("Text", "*.txt")],
    )
    if not path: return
    if messagebox.askyesno("confirm", f"save to {path}?"):
        # write file...
        messagebox.showinfo("saved", "saved!")

import tkinter.ttk as ttk
ttk.Button(root, text="Open...", command=open_file).pack(pady=8)
ttk.Button(root, text="Save...", command=save_file).pack(pady=8)
root.mainloop()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — Open + Save — full menu bar + right-click context menu.
# APPROACH  - tk.Menu attached to root + tk_popup on right-click.
# STRENGTHS - Looks like a real app; keyboard-accelerator support.
# WEAKNESSES- Menus on macOS have OS quirks (App menu, special items).
from __future__ import annotations
import tkinter as tk
from tkinter import ttk, filedialog, messagebox


class EditorApp:
    def __init__(self) -> None:
        self.root = tk.Tk()
        self.root.title("Editor")
        self.root.geometry("520x320")

        self.text = tk.Text(self.root)
        self.text.pack(fill="both", expand=True)

        self._build_menu()
        self._build_context_menu()

    # ---- menu bar ----
    def _build_menu(self) -> None:
        menubar = tk.Menu(self.root)

        file_menu = tk.Menu(menubar, tearoff=0)
        file_menu.add_command(label="Open...",  accelerator="Ctrl+O", command=self._open)
        file_menu.add_command(label="Save...",  accelerator="Ctrl+S", command=self._save)
        file_menu.add_separator()
        file_menu.add_command(label="Quit",     accelerator="Ctrl+Q", command=self.root.destroy)
        menubar.add_cascade(label="File", menu=file_menu)

        help_menu = tk.Menu(menubar, tearoff=0)
        help_menu.add_command(label="About", command=self._about)
        menubar.add_cascade(label="Help", menu=help_menu)

        self.root.config(menu=menubar)

        # Wire accelerators (the menu only shows them; doesn't enable them).
        self.root.bind("<Control-o>", lambda _: self._open())
        self.root.bind("<Control-s>", lambda _: self._save())
        self.root.bind("<Control-q>", lambda _: self.root.destroy())

    # ---- right-click context menu ----
    def _build_context_menu(self) -> None:
        ctx = tk.Menu(self.root, tearoff=0)
        ctx.add_command(label="Cut",   command=lambda: self.text.event_generate("<<Cut>>"))
        ctx.add_command(label="Copy",  command=lambda: self.text.event_generate("<<Copy>>"))
        ctx.add_command(label="Paste", command=lambda: self.text.event_generate("<<Paste>>"))
        # Right-click is <Button-3> on Linux/Windows, <Button-2> on classic macOS.
        for token in ("<Button-3>", "<Button-2>", "<Control-Button-1>"):
            self.text.bind(token, lambda e: ctx.tk_popup(e.x_root, e.y_root))

    # ---- file ops ----
    def _open(self) -> None:
        path = filedialog.askopenfilename(filetypes=[("Text", "*.txt"), ("All", "*.*")])
        if not path: return
        with open(path) as f:
            self.text.delete("1.0", "end")
            self.text.insert("1.0", f.read())

    def _save(self) -> None:
        path = filedialog.asksaveasfilename(defaultextension=".txt",
                                            filetypes=[("Text", "*.txt")])
        if not path: return
        with open(path, "w") as f:
            f.write(self.text.get("1.0", "end-1c"))
        messagebox.showinfo("saved", path)

    def _about(self) -> None:
        messagebox.showinfo("About", "Editor v0.1\nbuilt with tkinter")

    def run(self) -> None:
        self.root.mainloop()


if __name__ == "__main__":
    EditorApp().run()

# Decision rule:
#   Yes/No prompt           -> messagebox.askyesno (returns bool).
#   OK / Cancel             -> messagebox.askokcancel (returns bool).
#   Error display           -> messagebox.showerror.
#   Open one file           -> filedialog.askopenfilename (returns str, '' on cancel).
#   Open many files         -> filedialog.askopenfilenames (returns tuple).
#   Save with target name   -> filedialog.asksaveasfilename (handles overwrite confirm via the OS).
#   Pick a folder           -> filedialog.askdirectory.
#   Top app menu            -> tk.Menu(root) + root.config(menu=).
#   Right-click on a widget -> tk.Menu(root, tearoff=0) + tk_popup(x_root, y_root).

# Anti-pattern:
#   if filedialog.askopenfilename():     # but assigning later?
# askopenfilename returns '' (empty string) on cancel, not None. The
# truthiness check works, but only because empty string is falsy. Be
# explicit: path = ...; if not path: return.
```

## Decision Rule

```text
Yes/No prompt           -> messagebox.askyesno (returns bool).
OK / Cancel             -> messagebox.askokcancel (returns bool).
Error display           -> messagebox.showerror.
Open one file           -> filedialog.askopenfilename (returns str, '' on cancel).
Open many files         -> filedialog.askopenfilenames (returns tuple).
Save with target name   -> filedialog.asksaveasfilename (handles overwrite confirm via the OS).
Pick a folder           -> filedialog.askdirectory.
Top app menu            -> tk.Menu(root) + root.config(menu=).
Right-click on a widget -> tk.Menu(root, tearoff=0) + tk_popup(x_root, y_root).
```

## Anti-Pattern

> [!warning] Anti-pattern
>   if filedialog.askopenfilename():     # but assigning later?
> askopenfilename returns '' (empty string) on cancel, not None. The
> truthiness check works, but only because empty string is falsy. Be
> explicit: path = ...; if not path: return.

## Tips

- `filedialog.askopenfilename` returns `''` (empty string) on cancel — `if not path: return` is the idiom.
- `messagebox` calls return Python booleans for yes/no, OK/Cancel.
- Menus need `tearoff=0` to suppress the dotted-line "tear off this menu" item that nobody wants.
- Set keyboard accelerators with `accelerator='Ctrl+S'` AND a separate `root.bind('<Control-s>', ...)` — the label is just decoration.
- Right-click is `<Button-3>` on Linux/Windows and `<Button-2>` (or `<Control-Button-1>`) on macOS — bind both for portability.

## Common Mistake

> [!warning] Setting an `accelerator=` on a menu item and expecting the shortcut to work — the accelerator label is cosmetic. You also need `root.bind('<Control-s>', ...)`.

## See Also

- [[Sections/gui-tkinter/events/tk-event-bindings|widget.bind / event modifiers — keyboard, mouse, focus (Tkinter)]]
- [[Sections/gui-tkinter/events/_Index|Tkinter → Events, bindings, dialogs]]
- [[Sections/gui-tkinter/_Index|Tkinter index]]
- [[_Index|Vault index]]
