---
type: "entry"
domain: "python"
file: "gui-pyqt"
section: "widgets"
id: "qt-listview-tableview"
title: "QListView / QTableView — model/view for data"
category: "widgets"
subtitle: "QListWidget / QTableWidget (convenience, data baked in) vs QListView / QTableView + QStandardItemModel (cleaner separation), QSortFilterProxyModel (free sort + filter), Qt.ItemDataRole (DisplayRole, EditRole, UserRole), QHeaderView resize modes (ResizeToContents, Stretch)"
signature_short: "tw = QTableWidget(rows, cols); tw.setHorizontalHeaderLabels([...]); tw.setItem(r, c, QTableWidgetItem(text))"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "QListView / QTableView — model/view for data"
  - "qt-listview-tableview"
tags:
  - "python"
  - "python/gui-pyqt"
  - "python/gui-pyqt/widgets"
  - "category/widgets"
  - "tier/tiered"
---

# QListView / QTableView — model/view for data

> QListWidget / QTableWidget (convenience, data baked in) vs QListView / QTableView + QStandardItemModel (cleaner separation), QSortFilterProxyModel (free sort + filter), Qt.ItemDataRole (DisplayRole, EditRole, UserRole), QHeaderView resize modes (ResizeToContents, Stretch)

## Overview

QTableWidget is the friendly path: rows × columns of `QTableWidgetItem`, header labels, sortable when you ask. For large/dynamic data use a model — `QStandardItemModel` for ad-hoc, or subclass `QAbstractTableModel` for full control. A `QSortFilterProxyModel` between model and view gives you sort-on-header-click and filter-by-substring with no extra code. Three depths solve the SAME task — show a list of people sortable + filterable — at depths: QTableWidget pre-populated → QStandardItemModel + QTableView (separation) → custom QAbstractTableModel + proxy + filter QLineEdit.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Show a 3-column table of people; sortable by header click.
- **Junior** — SAME — sortable + filterable people table — model/view split.
- **Senior** — SAME — sortable + filterable people table — production: custom QAbstractTableModel over a list of dataclass records, typed sorting (numeric for age), refresh on data change.

## Signature

```python
tw = QTableWidget(rows, cols); tw.setHorizontalHeaderLabels([...]); tw.setItem(r, c, QTableWidgetItem(text))
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Show a 3-column table of people; sortable by header click.
# APPROACH  - QTableWidget with QTableWidgetItems pre-filled.
# STRENGTHS - Quickest path to "see your data on screen".
# WEAKNESSES- Data lives inside the widget; bad for large or live datasets.
import sys
from PySide6.QtWidgets import (
    QApplication, QTableWidget, QTableWidgetItem,
)

DATA = [
    ("alice", 30, "dev"),
    ("bob",   28, "design"),
    ("carol", 35, "pm"),
]

app = QApplication(sys.argv)
tw = QTableWidget(len(DATA), 3)
tw.setHorizontalHeaderLabels(["Name", "Age", "Role"])

for r, row in enumerate(DATA):
    for c, val in enumerate(row):
        tw.setItem(r, c, QTableWidgetItem(str(val)))

tw.setSortingEnabled(True)                            # click headers to sort
tw.resize(420, 240); tw.show()
sys.exit(app.exec())
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — sortable + filterable people table — model/view split.
# APPROACH  - QStandardItemModel + QTableView + QSortFilterProxyModel + QLineEdit.
# STRENGTHS - Free filter, free sort, separation of data and display.
# WEAKNESSES- Still loads everything into memory (QStandardItemModel).
import sys
from PySide6.QtCore import Qt, QSortFilterProxyModel
from PySide6.QtGui import QStandardItemModel, QStandardItem
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout,
    QTableView, QLineEdit,
)

DATA = [
    ("alice", 30, "dev"),
    ("bob",   28, "design"),
    ("carol", 35, "pm"),
]

app = QApplication(sys.argv)

# Model: holds the data.
model = QStandardItemModel(0, 3)
model.setHorizontalHeaderLabels(["Name", "Age", "Role"])
for row in DATA:
    items = [QStandardItem(str(v)) for v in row]
    model.appendRow(items)

# Proxy: gives us free sort + filter.
proxy = QSortFilterProxyModel()
proxy.setSourceModel(model)
proxy.setFilterCaseSensitivity(Qt.CaseInsensitive)
proxy.setFilterKeyColumn(-1)                          # filter across all cols

# View: shows the proxy.
view = QTableView()
view.setModel(proxy)
view.setSortingEnabled(True)
view.horizontalHeader().setStretchLastSection(True)

# Filter input.
win = QMainWindow()
central = QWidget(); win.setCentralWidget(central)
layout = QVBoxLayout(central)

filt = QLineEdit(); filt.setPlaceholderText("filter...")
filt.textChanged.connect(proxy.setFilterFixedString)
layout.addWidget(filt)
layout.addWidget(view)

win.resize(480, 320); win.show()
sys.exit(app.exec())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — sortable + filterable people table — production:
#             custom QAbstractTableModel over a list of dataclass records,
#             typed sorting (numeric for age), refresh on data change.
# APPROACH  - Subclass QAbstractTableModel; use UserRole for typed values.
# STRENGTHS - Scales to large datasets; correct numeric sort; testable.
# WEAKNESSES- More code; need to remember rowCount/columnCount/data semantics.
from __future__ import annotations
import sys
from dataclasses import dataclass, asdict
from PySide6.QtCore import (
    Qt, QAbstractTableModel, QModelIndex, QSortFilterProxyModel,
)
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout,
    QTableView, QLineEdit,
)


@dataclass
class Person:
    name: str
    age: int
    role: str


class PeopleModel(QAbstractTableModel):
    HEADERS = ["Name", "Age", "Role"]

    def __init__(self, rows: list[Person]) -> None:
        super().__init__()
        self._rows = rows

    # ---- required overrides ----
    def rowCount(self, parent=QModelIndex()) -> int:
        return 0 if parent.isValid() else len(self._rows)

    def columnCount(self, parent=QModelIndex()) -> int:
        return 0 if parent.isValid() else len(self.HEADERS)

    def data(self, index: QModelIndex, role: int = Qt.DisplayRole):
        if not index.isValid():
            return None
        row = self._rows[index.row()]
        col = index.column()
        if role == Qt.DisplayRole:
            return (row.name, row.age, row.role)[col]
        # UserRole: return typed value so the proxy sorts numerically.
        if role == Qt.UserRole:
            return (row.name, row.age, row.role)[col]
        return None

    def headerData(self, section, orientation, role=Qt.DisplayRole):
        if role == Qt.DisplayRole and orientation == Qt.Horizontal:
            return self.HEADERS[section]
        return None

    # ---- mutation helpers ----
    def setRows(self, rows: list[Person]) -> None:
        self.beginResetModel()
        self._rows = rows
        self.endResetModel()


class MainWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("People")

        rows = [
            Person("alice", 30, "dev"),
            Person("bob",   28, "design"),
            Person("carol", 35, "pm"),
        ]
        self.model = PeopleModel(rows)

        self.proxy = QSortFilterProxyModel()
        self.proxy.setSourceModel(self.model)
        self.proxy.setSortRole(Qt.UserRole)            # sort by typed value
        self.proxy.setFilterCaseSensitivity(Qt.CaseInsensitive)
        self.proxy.setFilterKeyColumn(-1)

        view = QTableView()
        view.setModel(self.proxy)
        view.setSortingEnabled(True)
        view.horizontalHeader().setStretchLastSection(True)

        central = QWidget(); self.setCentralWidget(central)
        layout = QVBoxLayout(central)

        filt = QLineEdit(); filt.setPlaceholderText("filter...")
        filt.textChanged.connect(self.proxy.setFilterFixedString)
        layout.addWidget(filt)
        layout.addWidget(view)

        self.resize(540, 360)


if __name__ == "__main__":
    app = QApplication(sys.argv)
    w = MainWindow(); w.show()
    sys.exit(app.exec())

# Decision rule:
#   Small static table, prototyping              -> QTableWidget (data baked in).
#   Real dataset, want sort + filter for free    -> QStandardItemModel + Proxy.
#   Custom data shape (your own list/df)         -> subclass QAbstractTableModel.
#   Tree-shaped data                             -> subclass QAbstractItemModel + QTreeView.
#   Numeric sort on a string-displayed column    -> set Qt.UserRole on data();
#                                                    proxy.setSortRole(Qt.UserRole).
#   Pandas DataFrame                             -> subclass QAbstractTableModel
#                                                    backed by the df (well-known pattern).
#   Live updates                                 -> beginResetModel / endResetModel
#                                                    (or beginInsertRows for fine-grained).

# Anti-pattern:
#   model.setItem(r, c, QStandardItem(str(age)))   # everything stored as string
#   view.setSortingEnabled(True)                    # sort: '10' < '2'
# Strings sort lexicographically. Either store typed values (Qt.UserRole)
# or override .data() to return the int and let the proxy sort it.
```

## Decision Rule

```text
Small static table, prototyping              -> QTableWidget (data baked in).
Real dataset, want sort + filter for free    -> QStandardItemModel + Proxy.
Custom data shape (your own list/df)         -> subclass QAbstractTableModel.
Tree-shaped data                             -> subclass QAbstractItemModel + QTreeView.
Numeric sort on a string-displayed column    -> set Qt.UserRole on data();
                                                 proxy.setSortRole(Qt.UserRole).
Pandas DataFrame                             -> subclass QAbstractTableModel
                                                 backed by the df (well-known pattern).
Live updates                                 -> beginResetModel / endResetModel
                                                 (or beginInsertRows for fine-grained).
```

## Anti-Pattern

> [!warning] Anti-pattern
>   model.setItem(r, c, QStandardItem(str(age)))   # everything stored as string
>   view.setSortingEnabled(True)                    # sort: '10' < '2'
> Strings sort lexicographically. Either store typed values (Qt.UserRole)
> or override .data() to return the int and let the proxy sort it.

## Tips

- QTableWidget = data baked in (fast prototype). QTableView + model = separation (real apps).
- `QSortFilterProxyModel` between model and view gives sort + filter for free.
- For numeric sort on display-string columns, expose typed values via `Qt.UserRole` and set `proxy.setSortRole(Qt.UserRole)`.
- Custom models: implement `rowCount`, `columnCount`, `data`, `headerData` (and optionally `flags`/`setData` for editable cells).
- Use `beginResetModel`/`endResetModel` for full reloads; `beginInsertRows`/`endInsertRows` for incremental updates.

## Common Mistake

> [!warning] Storing all values as strings in `QStandardItemModel` — sorting becomes lexicographic ("10" < "2"). Store typed values in `Qt.UserRole` and set `proxy.setSortRole`.

## See Also

- [[Sections/gui-pyqt/widgets/qt-input-widgets|QLineEdit / QComboBox / QSpinBox / QCheckBox — input widgets (PyQt / PySide)]]
- [[Sections/gui-pyqt/widgets/_Index|PyQt / PySide → Widgets, models, views]]
- [[Sections/gui-pyqt/_Index|PyQt / PySide index]]
- [[_Index|Vault index]]
