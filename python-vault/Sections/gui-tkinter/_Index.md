---
type: "file-index"
domain: "python"
file: "gui-tkinter"
title: "Tkinter"
tags:
  - "python"
  - "python/gui-tkinter"
  - "index"
---

# Tkinter

> 10 entries across 5 sections.

## Tk basics — root, mainloop, ttk widgets · 3

- [[Sections/gui-tkinter/basics/tk-root-mainloop|tk.Tk / mainloop / ttk widgets — minimal app]] — A Tk app is a single `Tk()` root, some widgets packed/gridded into it, and `root.mainloop()` to run the event loop. Use `from tkinter import ttk` for themed (modern-looking) widgets — never the bare `tk.Button` etc. for anything user-facing.
- [[Sections/gui-tkinter/basics/tk-widgets-overview|ttk widget catalog — Entry, Combobox, Treeview, Notebook]] — The ttk widgets you actually use: Entry (text input), Combobox (dropdown), Spinbox (numeric), Checkbutton, Radiobutton, Treeview (table/list with columns), Notebook (tabs), Progressbar, Scale (slider). Each has the same `parent, **options` constructor.
- [[Sections/gui-tkinter/basics/tk-state-vars|tk.StringVar / IntVar / BooleanVar — reactive state]] — Tk variables are observable cells: pass to `textvariable=`/`variable=`, change with `.set()`, observe with `.trace_add('write', cb)`. They are the only sane way to keep widgets in sync without writing manual update code.

## Geometry — grid, pack, place · 1

- [[Sections/gui-tkinter/layout/tk-grid-vs-pack|grid vs pack vs place — pick a geometry manager]] — Three managers: `pack` (stack one direction), `grid` (rows/columns), `place` (absolute pixels). **Use grid for forms, pack for toolbars/sidebars, never place.** Don't mix grid and pack inside the same parent — they fight.

## Events, bindings, dialogs · 2

- [[Sections/gui-tkinter/events/tk-event-bindings|widget.bind / event modifiers — keyboard, mouse, focus]] — `widget.bind('<event>', cb)` wires up keyboard and mouse events. Common: `<Return>`, `<Escape>`, `<Control-s>`, `<Button-1>`, `<Double-1>`, `<FocusIn/Out>`. Use `bind_all` for app-wide shortcuts; bindings on `root` cover the whole window.
- [[Sections/gui-tkinter/events/tk-dialogs-menus|tkinter.messagebox / filedialog / Menu — standard dialogs and menus]] — `messagebox.showinfo/askyesno/showerror`, `filedialog.askopenfilename/asksaveasfilename`, `tk.Menu` for menu bars and right-click context menus. These are the parts that make a Tk app feel like a real application.

## Threading, Canvas, async patterns · 3

- [[Sections/gui-tkinter/advanced/tk-threading-after|after / threads / queue — Tk is single-threaded]] — Tk is **not** thread-safe. From a worker thread, never call `.config()`/`.set()` directly — push results to a `queue.Queue` and let the GUI thread drain it via `root.after(50, drain)`. Use `root.after(ms, fn)` to schedule one-shot delays without blocking the loop.
- [[Sections/gui-tkinter/advanced/tk-canvas|tk.Canvas — drawing, dragging, custom widgets]] — Canvas is Tk's drawing surface — create lines/rectangles/ovals/text/images, get back item ids, move/delete/recolor by id. Bind mouse events to items by tag. The right tool for plots, custom widgets, simple games, and anything ttk doesn't cover.
- [[Sections/gui-tkinter/advanced/tk-async-loop|asyncio + Tk — running an async loop alongside mainloop]] — Tkinter has no native async support. The cleanest pattern: run asyncio in a worker thread, use a `queue.Queue` for thread→GUI handoff, and `asyncio.run_coroutine_threadsafe` for GUI→async. Reach for this when you have an async library (httpx, websockets, asyncpg) and a Tk UI.

## When to reach for tkinter · 1

- [[Sections/gui-tkinter/patterns/tk-vs-pyqt-vs-web|tkinter vs PyQt/PySide vs Streamlit/web — pick the toolkit]] — tkinter for stdlib + simple internal tools. PyQt/PySide for native-feeling commercial desktop apps. Streamlit/Gradio for data-science UIs that live in a browser. Pick by deployment target, not by language familiarity.
