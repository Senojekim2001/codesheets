---
type: "entry"
domain: "python"
file: "gui-tkinter"
section: "patterns"
id: "tk-vs-pyqt-vs-web"
title: "tkinter vs PyQt/PySide vs Streamlit/web — pick the toolkit"
category: "patterns"
subtitle: "tkinter (stdlib, basic widgets, small footprint) vs PyQt/PySide (rich widgets, QtCharts, native feel, licensing) vs Streamlit/Gradio (browser-based, no install, data-science) vs web framework (Flask/FastAPI + JS frontend), packaging via PyInstaller, distribution friction"
signature_short: "# pip install nothing for tk; pip install pyside6 / streamlit / gradio for the others"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "tkinter vs PyQt/PySide vs Streamlit/web — pick the toolkit"
  - "tk-vs-pyqt-vs-web"
tags:
  - "python"
  - "python/gui-tkinter"
  - "python/gui-tkinter/patterns"
  - "category/patterns"
  - "tier/tiered"
---

# tkinter vs PyQt/PySide vs Streamlit/web — pick the toolkit

> tkinter (stdlib, basic widgets, small footprint) vs PyQt/PySide (rich widgets, QtCharts, native feel, licensing) vs Streamlit/Gradio (browser-based, no install, data-science) vs web framework (Flask/FastAPI + JS frontend), packaging via PyInstaller, distribution friction

## Overview

tkinter wins when: the user already has Python; the app is a small internal tool or script-with-UI; the widgets you need are basic (forms, lists, tables). PyQt/PySide wins when: you need native styling, data grids, rich-text editing, charts, or you're shipping a polished commercial app. Streamlit/Gradio win when: the user has a browser, no install allowed, the app is data-science (charts, tables, model demos). Three depths solve the SAME task — show a dataframe with a filter — at depths: tkinter Treeview + Entry filter → PySide6 QTableView with model/view + QSortFilterProxyModel → Streamlit `st.dataframe` + `st.text_input`.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Show a small dataframe with a name-filter Entry; rows update live.
- **Junior** — SAME — filtered dataframe — using PySide6's model/view.
- **Senior** — SAME — filtered dataframe — Streamlit (one file, browser).

## Signature

```python
# pip install nothing for tk; pip install pyside6 / streamlit / gradio for the others
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Show a small dataframe with a name-filter Entry; rows update live.
# APPROACH  - tkinter ttk.Treeview + StringVar trace.
# STRENGTHS - Stdlib only; one file.
# WEAKNESSES- Treeview cell-editing is hand-rolled; no native sorting; no chart.
import tkinter as tk
from tkinter import ttk

DATA = [
    {"name": "alice", "age": 30, "role": "dev"},
    {"name": "bob",   "age": 28, "role": "design"},
    {"name": "carol", "age": 35, "role": "pm"},
]

root = tk.Tk(); root.title("tkinter")
filt = tk.StringVar()
ttk.Entry(root, textvariable=filt).pack(fill="x", padx=8, pady=8)
tree = ttk.Treeview(root, columns=("name","age","role"), show="headings")
for c in ("name","age","role"):
    tree.heading(c, text=c.title())
tree.pack(fill="both", expand=True, padx=8, pady=8)

def refresh(*_):
    q = filt.get().lower()
    tree.delete(*tree.get_children())
    for row in DATA:
        if q in row["name"].lower():
            tree.insert("", "end", values=(row["name"], row["age"], row["role"]))

filt.trace_add("write", refresh); refresh()
root.mainloop()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — filtered dataframe — using PySide6's model/view.
# APPROACH  - QTableView + QStandardItemModel + QSortFilterProxyModel.
# STRENGTHS - Native sorting (click headers!), filtering, look-and-feel;
#             scales to large datasets.
# WEAKNESSES- pip install pyside6 (~150 MB); steeper learning curve;
#             distribution heavier (PyInstaller bundle ~80 MB).
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QVBoxLayout, QWidget,
    QLineEdit, QTableView,
)
from PySide6.QtGui import QStandardItemModel, QStandardItem
from PySide6.QtCore import QSortFilterProxyModel, Qt
import sys

DATA = [
    {"name": "alice", "age": 30, "role": "dev"},
    {"name": "bob",   "age": 28, "role": "design"},
    {"name": "carol", "age": 35, "role": "pm"},
]

app = QApplication(sys.argv)
win = QMainWindow(); win.setWindowTitle("PySide6")
central = QWidget(); win.setCentralWidget(central)
layout = QVBoxLayout(central)

filt = QLineEdit(); filt.setPlaceholderText("filter by name...")
layout.addWidget(filt)

model = QStandardItemModel(0, 3)
model.setHorizontalHeaderLabels(["Name", "Age", "Role"])
for r in DATA:
    model.appendRow([QStandardItem(str(r[k])) for k in ("name", "age", "role")])

proxy = QSortFilterProxyModel()
proxy.setSourceModel(model)
proxy.setFilterKeyColumn(0)
proxy.setFilterCaseSensitivity(Qt.CaseInsensitive)

table = QTableView(); table.setModel(proxy); table.setSortingEnabled(True)
layout.addWidget(table)

filt.textChanged.connect(proxy.setFilterFixedString)

win.resize(420, 300); win.show()
sys.exit(app.exec())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — filtered dataframe — Streamlit (one file, browser).
# APPROACH  - st.dataframe + st.text_input; rerun-on-input model.
# STRENGTHS - 8 lines; deployable as a URL; users need only a browser;
#             charts/widgets free; data-science discoverable.
# WEAKNESSES- Server required; not great for offline desktop or for users
#             who don't have a browser open; not a "real" app aesthetic.
import streamlit as st
import pandas as pd

DATA = pd.DataFrame([
    {"name": "alice", "age": 30, "role": "dev"},
    {"name": "bob",   "age": 28, "role": "design"},
    {"name": "carol", "age": 35, "role": "pm"},
])

st.title("People")
q = st.text_input("filter by name").lower()
view = DATA[DATA["name"].str.lower().str.contains(q)] if q else DATA
st.dataframe(view, use_container_width=True)
st.bar_chart(view.set_index("name")["age"])           # free chart!

# Run with: streamlit run app.py
# Decision rule:
#   Internal Python script + tiny UI                  -> tkinter (stdlib).
#   Polished commercial desktop app                   -> PyQt6 / PySide6.
#   Need data grid, charts, graph view out of box     -> PySide6 (QtCharts) or web.
#   Data science, ML demo, internal dashboard         -> Streamlit / Gradio.
#   Public web app with auth and routing              -> Flask/FastAPI + frontend.
#   Cross-platform mobile + desktop with one codebase -> not Python; pick Flutter/RN.
#   Need to ship a single .exe / .app                 -> tkinter or Qt + PyInstaller;
#                                                          NOT Streamlit (server-bound).
#   Licensing matters and you can't pay GPL            -> PySide6 (LGPL) or tkinter (PSF).

# Anti-pattern:
#   "I need a UI for this Python script" -> spending 4 weeks in PyQt
# If the user is a coworker / data scientist / yourself, Streamlit gets
# you to "shipped" in an hour. Reach for desktop frameworks only when
# you've established that browser delivery isn't acceptable.
```

## Decision Rule

```text
Internal Python script + tiny UI                  -> tkinter (stdlib).
Polished commercial desktop app                   -> PyQt6 / PySide6.
Need data grid, charts, graph view out of box     -> PySide6 (QtCharts) or web.
Data science, ML demo, internal dashboard         -> Streamlit / Gradio.
Public web app with auth and routing              -> Flask/FastAPI + frontend.
Cross-platform mobile + desktop with one codebase -> not Python; pick Flutter/RN.
Need to ship a single .exe / .app                 -> tkinter or Qt + PyInstaller;
                                                       NOT Streamlit (server-bound).
Licensing matters and you can't pay GPL            -> PySide6 (LGPL) or tkinter (PSF).
```

## Anti-Pattern

> [!warning] Anti-pattern
>   "I need a UI for this Python script" -> spending 4 weeks in PyQt
> If the user is a coworker / data scientist / yourself, Streamlit gets
> you to "shipped" in an hour. Reach for desktop frameworks only when
> you've established that browser delivery isn't acceptable.

## Tips

- tkinter ships with Python — zero install, zero deploy. Best for "give my Python script a face" jobs.
- PyQt6/PySide6 are the same Qt bindings; PySide6 is LGPL (corporate-friendly), PyQt6 is GPL/commercial.
- Streamlit/Gradio shine when the audience has a browser and you don't want install pain.
- Distribution matters: PyInstaller works for tk and Qt; Streamlit needs a server (or Streamlit Community Cloud).
- PySide6 has QtCharts, QtPDF, QtWebEngine, QtMultimedia — entire app stacks tk would need to assemble.

## Common Mistake

> [!warning] Building a "real desktop app" in tkinter when the audience would happily use a browser-based Streamlit app — months of effort to reproduce widgets that come free elsewhere.

## See Also

- [[Sections/cv-opencv/practical/cv2-vs-pil-vs-torchvision|cv2 vs PIL vs torchvision — pick the right tool (OpenCV (cv2))]]
- [[Sections/audio-dsp/patterns/audio-librosa-vs-torchaudio|librosa vs torchaudio vs essentia — pick the audio stack (Audio & DSP)]]
- [[Sections/geospatial/patterns/geo-stack-decision|GeoPandas vs PostGIS vs DuckDB-spatial vs xarray — pick the stack (Geospatial)]]
- [[Sections/quantum/patterns/qiskit-vs-cirq-vs-pennylane|Qiskit vs Cirq vs PennyLane vs Stim — pick the framework (Quantum)]]
- [[Sections/gui-tkinter/patterns/_Index|Tkinter → When to reach for tkinter]]
- [[Sections/gui-tkinter/_Index|Tkinter index]]
- [[_Index|Vault index]]
