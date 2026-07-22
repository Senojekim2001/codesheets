---
type: "entry"
domain: "python"
file: "gui-pyqt"
section: "basics"
id: "qt-pyqt-vs-pyside"
title: "PyQt6 vs PySide6 — pick one (and how to switch later)"
category: "qt basics"
subtitle: "PySide6 (LGPL, official, \"qtforpython\") vs PyQt6 (GPL or commercial, Riverbank), Signal/Slot vs pyqtSignal/pyqtSlot naming, qtpy or local shim for portable code, licensing implications, ecosystem (Qt Designer .ui files work with both)"
signature_short: "from PySide6.QtCore import Signal  # PySide6\\nfrom PyQt6.QtCore import pyqtSignal as Signal  # PyQt6"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "PyQt6 vs PySide6 — pick one (and how to switch later)"
  - "qt-pyqt-vs-pyside"
tags:
  - "python"
  - "python/gui-pyqt"
  - "python/gui-pyqt/basics"
  - "category/qt-basics"
  - "tier/tiered"
---

# PyQt6 vs PySide6 — pick one (and how to switch later)

> PySide6 (LGPL, official, "qtforpython") vs PyQt6 (GPL or commercial, Riverbank), Signal/Slot vs pyqtSignal/pyqtSlot naming, qtpy or local shim for portable code, licensing implications, ecosystem (Qt Designer .ui files work with both)

## Overview

PySide6 is what to reach for in 2026 — Qt Group ships it, LGPL means you can ship closed-source apps that link to it. PyQt6 has a longer history (use it if you have legacy code) but its license forces either GPL or paid commercial. APIs match almost line-for-line; `Signal`/`Slot` vs `pyqtSignal`/`pyqtSlot` is the most visible difference. Three depths solve the SAME task — a counter widget — at depths: PySide6-only code → PyQt6-only code (showing the diffs) → portable code via a local compat shim that picks the binding at import time.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — A counter widget written for PySide6.
- **Junior** — SAME — counter widget — but for PyQt6 (showing the diffs).
- **Senior** — SAME — counter widget — portable across PySide6 and PyQt6.

## Signature

```python
from PySide6.QtCore import Signal  # PySide6\nfrom PyQt6.QtCore import pyqtSignal as Signal  # PyQt6
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - A counter widget written for PySide6.
# APPROACH  - PySide6 imports; Signal / Slot from QtCore.
# STRENGTHS - Idiomatic PySide6; LGPL-friendly.
# WEAKNESSES- Won't run on PyQt6 without changes.
from PySide6.QtCore import Signal, Slot, QObject
from PySide6.QtWidgets import QApplication, QWidget, QPushButton, QLabel, QVBoxLayout
import sys


class Counter(QWidget):
    changed = Signal(int)                              # PySide6: Signal

    def __init__(self) -> None:
        super().__init__()
        self.n = 0
        self.label = QLabel("0")
        btn = QPushButton("+1")
        btn.clicked.connect(self._inc)
        layout = QVBoxLayout(self)
        layout.addWidget(self.label); layout.addWidget(btn)

    @Slot()                                            # PySide6: @Slot()
    def _inc(self) -> None:
        self.n += 1
        self.label.setText(str(self.n))
        self.changed.emit(self.n)


app = QApplication(sys.argv)
c = Counter(); c.show()
c.changed.connect(lambda n: print(f"counter={n}"))
sys.exit(app.exec())
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — counter widget — but for PyQt6 (showing the diffs).
# APPROACH  - PyQt6 imports; pyqtSignal / pyqtSlot.
# STRENGTHS - Drop-in for codebases on PyQt.
# WEAKNESSES- Locked to PyQt6 license model (GPL or commercial).
from PyQt6.QtCore import pyqtSignal, pyqtSlot, QObject
from PyQt6.QtWidgets import QApplication, QWidget, QPushButton, QLabel, QVBoxLayout
import sys


class Counter(QWidget):
    changed = pyqtSignal(int)                          # PyQt6: pyqtSignal

    def __init__(self) -> None:
        super().__init__()
        self.n = 0
        self.label = QLabel("0")
        btn = QPushButton("+1")
        btn.clicked.connect(self._inc)
        layout = QVBoxLayout(self)
        layout.addWidget(self.label); layout.addWidget(btn)

    @pyqtSlot()                                        # PyQt6: @pyqtSlot()
    def _inc(self) -> None:
        self.n += 1
        self.label.setText(str(self.n))
        self.changed.emit(self.n)


# The other ~99% of the API matches PySide6:
#   QtCore.QObject, QtCore.QTimer, QtCore.QThread - same.
#   QtWidgets.* same; QtGui.QIcon/QPainter same.
#   .exec() works on both in Qt6 (was .exec_() in PyQt5).

app = QApplication(sys.argv)
c = Counter(); c.show()
c.changed.connect(lambda n: print(f"counter={n}"))
sys.exit(app.exec())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — counter widget — portable across PySide6 and PyQt6.
# APPROACH  - Local compat shim picks the binding once at import.
# STRENGTHS - One source tree; switch bindings without code changes;
#             unblocks teams forced onto one binding for license reasons.
# WEAKNESSES- Slight indirection; very rare API divergences (model/view
#             types, signature edge cases) still need a guard.
# qt_compat.py
"""
Single-import surface that picks PySide6 first, then PyQt6.
The rest of the app imports Signal, Slot, QApplication, etc. from here.
"""
from __future__ import annotations
import os

_QT_BINDING = os.environ.get("QT_BINDING", "PySide6")

if _QT_BINDING == "PySide6":
    from PySide6.QtCore     import Signal, Slot, QObject, QTimer, QThread
    from PySide6.QtWidgets  import (
        QApplication, QWidget, QMainWindow, QPushButton,
        QLabel, QVBoxLayout, QHBoxLayout,
    )
    from PySide6.QtGui      import QIcon, QPixmap
    BINDING = "PySide6"
else:
    from PyQt6.QtCore       import pyqtSignal as Signal, pyqtSlot as Slot
    from PyQt6.QtCore       import QObject, QTimer, QThread
    from PyQt6.QtWidgets    import (
        QApplication, QWidget, QMainWindow, QPushButton,
        QLabel, QVBoxLayout, QHBoxLayout,
    )
    from PyQt6.QtGui        import QIcon, QPixmap
    BINDING = "PyQt6"

__all__ = [
    "Signal", "Slot", "QObject", "QTimer", "QThread",
    "QApplication", "QWidget", "QMainWindow", "QPushButton",
    "QLabel", "QVBoxLayout", "QHBoxLayout",
    "QIcon", "QPixmap", "BINDING",
]

# app.py
import sys
from qt_compat import (
    QApplication, QWidget, QPushButton, QLabel, QVBoxLayout, Signal, Slot, BINDING,
)


class Counter(QWidget):
    changed = Signal(int)

    def __init__(self) -> None:
        super().__init__()
        self.n = 0
        self.label = QLabel("0")
        btn = QPushButton(f"+1  ({BINDING})")
        btn.clicked.connect(self._inc)
        layout = QVBoxLayout(self)
        layout.addWidget(self.label); layout.addWidget(btn)

    @Slot()
    def _inc(self) -> None:
        self.n += 1
        self.label.setText(str(self.n))
        self.changed.emit(self.n)


if __name__ == "__main__":
    app = QApplication(sys.argv)
    c = Counter(); c.show()
    sys.exit(app.exec())

# Decision rule:
#   New project, want clean licensing                    -> PySide6 (LGPL).
#   Existing PyQt5 codebase porting to Qt6               -> PyQt6 (smallest diff).
#   Need to ship under closed-source commercial          -> PySide6 OR pay Riverbank.
#   Library code that other people consume               -> shim above (don't force a binding).
#   Need full type hints                                 -> both ship .pyi stubs in Qt6;
#                                                            PySide6's are slightly more complete.
#   Care about Qt Designer (.ui) compilation             -> both work; PySide6 ships pyside6-uic,
#                                                            PyQt6 ships pyuic6.

# Anti-pattern:
#   from PyQt5.QtCore import pyqtSignal     # in 2026
# Qt5 is end-of-life. Migrate to Qt6 (PyQt6 or PySide6) before adding new
# code. Most Qt6 imports are identical except for the version number.
```

## Decision Rule

```text
New project, want clean licensing                    -> PySide6 (LGPL).
Existing PyQt5 codebase porting to Qt6               -> PyQt6 (smallest diff).
Need to ship under closed-source commercial          -> PySide6 OR pay Riverbank.
Library code that other people consume               -> shim above (don't force a binding).
Need full type hints                                 -> both ship .pyi stubs in Qt6;
                                                         PySide6's are slightly more complete.
Care about Qt Designer (.ui) compilation             -> both work; PySide6 ships pyside6-uic,
                                                         PyQt6 ships pyuic6.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   from PyQt5.QtCore import pyqtSignal     # in 2026
> Qt5 is end-of-life. Migrate to Qt6 (PyQt6 or PySide6) before adding new
> code. Most Qt6 imports are identical except for the version number.

## Tips

- PySide6 is LGPL — you can ship closed-source commercial apps that link to it.
- PyQt6 is GPL OR commercial-paid — best for legacy codebases; check your license obligations.
- In Qt6 both bindings drop the `exec_()` underscore; just call `.exec()`.
- Qt Designer `.ui` files compile to Python with `pyside6-uic` (PySide) or `pyuic6` (PyQt).
- For library code, write a tiny shim and let the app pick the binding — don't hardcode either.

## Common Mistake

> [!warning] Hardcoding `from PyQt6 import ...` in library code that others install. Forces the license choice on consumers. Use a `qt_compat` shim.

## See Also

- [[Sections/gui-pyqt/basics/qt-qapplication-qwidget|QApplication / QWidget / app.exec — minimal Qt app (PyQt / PySide)]]
- [[Sections/gui-pyqt/basics/_Index|PyQt / PySide → QApplication, QWidget, the event loop]]
- [[Sections/gui-pyqt/_Index|PyQt / PySide index]]
- [[_Index|Vault index]]
