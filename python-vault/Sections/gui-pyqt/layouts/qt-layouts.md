---
type: "entry"
domain: "python"
file: "gui-pyqt"
section: "layouts"
id: "qt-layouts"
title: "QVBoxLayout / QHBoxLayout / QGridLayout / QFormLayout"
category: "layouts"
subtitle: "QVBoxLayout / QHBoxLayout (sequential), QGridLayout (row,col,rowspan,colspan), QFormLayout (label-input pairs), QStackedLayout / QStackedWidget (page switcher), QSplitter (drag-resizable panels), addStretch / setStretchFactor, setContentsMargins / setSpacing"
signature_short: "layout = QVBoxLayout(widget); layout.addWidget(w); QGridLayout.addWidget(w, row, col, rowspan, colspan)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "QVBoxLayout / QHBoxLayout / QGridLayout / QFormLayout"
  - "qt-layouts"
tags:
  - "python"
  - "python/gui-pyqt"
  - "python/gui-pyqt/layouts"
  - "category/layouts"
  - "tier/tiered"
---

# QVBoxLayout / QHBoxLayout / QGridLayout / QFormLayout

> QVBoxLayout / QHBoxLayout (sequential), QGridLayout (row,col,rowspan,colspan), QFormLayout (label-input pairs), QStackedLayout / QStackedWidget (page switcher), QSplitter (drag-resizable panels), addStretch / setStretchFactor, setContentsMargins / setSpacing

## Overview

Layouts are the geometry managers. Pass the parent widget to the constructor (`QVBoxLayout(widget)`) and the layout becomes responsible for arranging its children. Use `addStretch()` to push subsequent items to the end, `setStretchFactor()` to control proportional sizing, `setContentsMargins`/`setSpacing` for fine-grained spacing. Three depths solve the SAME task — a window with a sidebar, a header strip, and a main content area — at depths: nested HBox + VBox (works) → QGridLayout positioning → QSplitter for drag-to-resize panes plus QStackedWidget for content pages.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Window: left sidebar, top header, main content area.
- **Junior** — SAME — sidebar + header + content — using QGridLayout.
- **Senior** — SAME — sidebar + header + content — production: QSplitter so the user can resize panes; QStackedWidget so the sidebar switches the content page.

## Signature

```python
layout = QVBoxLayout(widget); layout.addWidget(w); QGridLayout.addWidget(w, row, col, rowspan, colspan)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Window: left sidebar, top header, main content area.
# APPROACH  - HBox containing a VBox (sidebar) and a VBox (header + content).
# STRENGTHS - One layout type, easy to reason about.
# WEAKNESSES- No resize handle; sidebar width is fixed.
import sys
from PySide6.QtWidgets import (
    QApplication, QWidget, QHBoxLayout, QVBoxLayout, QLabel,
)

app = QApplication(sys.argv)
w = QWidget(); w.setWindowTitle("nested layouts")
root = QHBoxLayout(w)

# Left sidebar
side = QVBoxLayout()
for name in ("Inbox", "Sent", "Drafts"):
    side.addWidget(QLabel(name))
side.addStretch()                                     # push to top
root.addLayout(side)

# Right column: header on top, content below
right = QVBoxLayout()
header = QLabel("Header"); header.setStyleSheet("background:#eee; padding:8px;")
right.addWidget(header)
content = QLabel("Main content goes here."); content.setStyleSheet("padding:24px;")
right.addWidget(content, stretch=1)                   # absorbs remaining height
root.addLayout(right, stretch=1)                      # absorbs remaining width

w.resize(640, 360); w.show()
sys.exit(app.exec())
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — sidebar + header + content — using QGridLayout.
# APPROACH  - One grid: sidebar spans 2 rows on column 0; header and content
#             on column 1 in rows 0 and 1.
# STRENGTHS - Single layout owns everything; explicit row/column structure.
# WEAKNESSES- Still no drag-to-resize.
import sys
from PySide6.QtWidgets import (
    QApplication, QWidget, QGridLayout, QLabel,
)

app = QApplication(sys.argv)
w = QWidget(); w.setWindowTitle("grid layout")
g = QGridLayout(w)

# (row, col, rowspan, colspan)
sidebar = QLabel("Sidebar"); sidebar.setStyleSheet("background:#f5f5f5; padding:8px;")
g.addWidget(sidebar, 0, 0, 2, 1)

header = QLabel("Header"); header.setStyleSheet("background:#eee; padding:8px;")
g.addWidget(header, 0, 1)

content = QLabel("Main content"); content.setStyleSheet("padding:24px;")
g.addWidget(content, 1, 1)

# Make column 1 absorb extra width; row 1 absorb extra height.
g.setColumnStretch(0, 0)
g.setColumnStretch(1, 1)
g.setRowStretch(0, 0)
g.setRowStretch(1, 1)

w.resize(640, 360); w.show()
sys.exit(app.exec())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — sidebar + header + content — production: QSplitter so
#             the user can resize panes; QStackedWidget so the sidebar
#             switches the content page.
# APPROACH  - Outer QSplitter horizontally; right side is VBox with header
#             on top and a QStackedWidget showing the active page.
# STRENGTHS - Real desktop UX; navigable; drag-to-resize.
# WEAKNESSES- More plumbing.
from __future__ import annotations
import sys
from PySide6.QtCore import Qt
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout,
    QSplitter, QListWidget, QStackedWidget, QLabel,
)


PAGES = {
    "Inbox":  "📥  Inbox content goes here.",
    "Sent":   "📤  Sent items go here.",
    "Drafts": "📝  Drafts go here.",
}


class MainWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("splitter + stack")
        self.resize(800, 480)

        splitter = QSplitter(Qt.Horizontal)
        self.setCentralWidget(splitter)

        # Sidebar
        self.list = QListWidget()
        self.list.addItems(PAGES.keys())
        self.list.setMinimumWidth(140)
        splitter.addWidget(self.list)

        # Right side: header + stacked content
        right = QWidget(); right_layout = QVBoxLayout(right)
        header = QLabel("Header"); header.setStyleSheet(
            "background:#eee; padding:10px; font-size:14px;"
        )
        right_layout.addWidget(header)

        self.stack = QStackedWidget()
        for name, body in PAGES.items():
            page = QLabel(body); page.setStyleSheet("padding:32px;")
            page.setAlignment(Qt.AlignCenter)
            self.stack.addWidget(page)
        right_layout.addWidget(self.stack, stretch=1)
        splitter.addWidget(right)

        # Sidebar selection drives the stacked widget.
        self.list.currentRowChanged.connect(self.stack.setCurrentIndex)
        self.list.setCurrentRow(0)

        # Stretch factors: right side gets 1, sidebar gets 0 (fixed width-ish).
        splitter.setStretchFactor(0, 0)
        splitter.setStretchFactor(1, 1)
        splitter.setSizes([180, 620])


if __name__ == "__main__":
    app = QApplication(sys.argv)
    w = MainWindow(); w.show()
    sys.exit(app.exec())

# Decision rule:
#   Sequential stack of widgets                  -> QVBoxLayout / QHBoxLayout.
#   Aligned forms                                -> QFormLayout.
#   Multi-row, multi-column structure            -> QGridLayout.
#   User-resizable panes                         -> QSplitter (horizontal or vertical).
#   Page switcher (wizard, tabbed app)           -> QStackedWidget (or QTabWidget for tabs).
#   Need a fixed-size widget that won't stretch  -> setSizePolicy(Fixed, Fixed) on it.
#   Need extra space at the end of a stack       -> layout.addStretch().
#   Need precise margins                          -> setContentsMargins / setSpacing.

# Anti-pattern:
#   layout1.addLayout(layout2)
#   layout2.addLayout(layout1)               # circular nesting
# Qt doesn't catch this until paint time, which presents as a hang.
# Each layout has exactly one parent; a layout cannot contain itself.
```

## Decision Rule

```text
Sequential stack of widgets                  -> QVBoxLayout / QHBoxLayout.
Aligned forms                                -> QFormLayout.
Multi-row, multi-column structure            -> QGridLayout.
User-resizable panes                         -> QSplitter (horizontal or vertical).
Page switcher (wizard, tabbed app)           -> QStackedWidget (or QTabWidget for tabs).
Need a fixed-size widget that won't stretch  -> setSizePolicy(Fixed, Fixed) on it.
Need extra space at the end of a stack       -> layout.addStretch().
Need precise margins                          -> setContentsMargins / setSpacing.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   layout1.addLayout(layout2)
>   layout2.addLayout(layout1)               # circular nesting
> Qt doesn't catch this until paint time, which presents as a hang.
> Each layout has exactly one parent; a layout cannot contain itself.

## Tips

- Pass the parent widget to the layout constructor: `QVBoxLayout(widget)` — sets ownership in one call.
- `addStretch()` pushes following items to the end of a sequential layout.
- `setStretchFactor()` (or the `stretch=` kwarg on `addWidget`/`addLayout`) controls proportional sizing.
- Use `QSplitter` whenever the user might want to resize sections — it's a drop-in replacement for an HBox/VBox.
- `QStackedWidget` (page switcher) and `QTabWidget` (tabbed) cover navigation patterns without extra plumbing.

## Common Mistake

> [!warning] Adding the same widget to two layouts. Qt reparents it to whichever was last — you end up with one parent and a confused layout. Each widget belongs to exactly one layout.

## See Also

- [[Sections/gui-pyqt/layouts/_Index|PyQt / PySide → Layouts and stacked containers]]
- [[Sections/gui-pyqt/_Index|PyQt / PySide index]]
- [[_Index|Vault index]]
