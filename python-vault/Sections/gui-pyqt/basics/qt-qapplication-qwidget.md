---
type: "entry"
domain: "python"
file: "gui-pyqt"
section: "basics"
id: "qt-qapplication-qwidget"
title: "QApplication / QWidget / app.exec — minimal Qt app"
category: "qt basics"
subtitle: "QApplication(sys.argv), QWidget vs QMainWindow vs QDialog, app.exec() blocking, sys.exit(app.exec()) idiom, QApplication.instance() singleton, organizationName for QSettings, high-DPI auto-handling in Qt6"
signature_short: "app = QApplication(sys.argv); w = QMainWindow(); w.show(); sys.exit(app.exec())"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "QApplication / QWidget / app.exec — minimal Qt app"
  - "qt-qapplication-qwidget"
tags:
  - "python"
  - "python/gui-pyqt"
  - "python/gui-pyqt/basics"
  - "category/qt-basics"
  - "tier/tiered"
---

# QApplication / QWidget / app.exec — minimal Qt app

> QApplication(sys.argv), QWidget vs QMainWindow vs QDialog, app.exec() blocking, sys.exit(app.exec()) idiom, QApplication.instance() singleton, organizationName for QSettings, high-DPI auto-handling in Qt6

## Overview

Every Qt program needs exactly one `QApplication`, created before any widget. `QMainWindow` gives you a window with menu/status/toolbar slots; `QWidget` is the bare canvas. `app.exec()` blocks until the last window closes. Three depths solve the SAME task — show a window with a button that updates a label — at depths: bare QWidget + QPushButton (procedural) → QMainWindow with central widget and proper close handling → class-based App with constructor wiring, signals declared, and Ctrl-C handling that actually exits.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Show a window with a button that updates a label.
- **Junior** — SAME — window with button updating a label — proper QMainWindow.
- **Senior** — SAME — window with button updating a label — production: class based, signals encapsulated, Ctrl-C exits, proper teardown.

## Signature

```python
app = QApplication(sys.argv); w = QMainWindow(); w.show(); sys.exit(app.exec())
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Show a window with a button that updates a label.
# APPROACH  - Bare QWidget + manual layout + connect.
# STRENGTHS - Smallest possible Qt app.
# WEAKNESSES- No menu bar; no proper window class; sys.argv unused.
import sys
from PySide6.QtWidgets import QApplication, QWidget, QPushButton, QLabel, QVBoxLayout

app = QApplication(sys.argv)

w = QWidget()
w.setWindowTitle("hello")
layout = QVBoxLayout(w)

label = QLabel("Click me")
layout.addWidget(label)

btn = QPushButton("Go")
btn.clicked.connect(lambda: label.setText("Clicked!"))   # signal -> slot
layout.addWidget(btn)

w.resize(280, 120)
w.show()
sys.exit(app.exec())                                     # blocks until close
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — window with button updating a label — proper QMainWindow.
# APPROACH  - QMainWindow + central widget; status bar; resize sensibly.
# STRENGTHS - Real-app skeleton; menu/status slots ready to use.
# WEAKNESSES- Still procedural; signals connected at module level.
import sys
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget,
    QPushButton, QLabel, QVBoxLayout,
)

app = QApplication(sys.argv)
app.setApplicationName("Demo")
app.setOrganizationName("MyCo")                         # used by QSettings

win = QMainWindow()
win.setWindowTitle("Demo")
win.resize(360, 160)

central = QWidget(); win.setCentralWidget(central)
layout = QVBoxLayout(central)

label = QLabel("Click me"); layout.addWidget(label)
btn = QPushButton("Go"); layout.addWidget(btn)

btn.clicked.connect(lambda: label.setText("Clicked!"))
btn.clicked.connect(lambda: win.statusBar().showMessage("clicked", 2000))

win.show()
sys.exit(app.exec())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — window with button updating a label — production: class
#             based, signals encapsulated, Ctrl-C exits, proper teardown.
# APPROACH  - MainWindow class + signal/slot wiring in __init__; SIGINT
#             handler reset to default so Ctrl-C works in dev.
# STRENGTHS - Encapsulated state; testable; clean shutdown.
# WEAKNESSES- More boilerplate; Qt's class hierarchy is heavyweight.
from __future__ import annotations
import sys
import signal
from PySide6.QtCore import QTimer
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget,
    QPushButton, QLabel, QVBoxLayout,
)


class MainWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("Demo")
        self.resize(380, 180)

        central = QWidget(); self.setCentralWidget(central)
        layout = QVBoxLayout(central)

        self.label = QLabel("Click me")
        layout.addWidget(self.label)

        self.btn = QPushButton("Go")
        self.btn.clicked.connect(self._on_click)        # signal -> slot
        layout.addWidget(self.btn)

    def _on_click(self) -> None:
        self.label.setText("Clicked!")
        self.statusBar().showMessage("ok", 2000)


def main() -> int:
    app = QApplication(sys.argv)
    app.setApplicationName("Demo")
    app.setOrganizationName("MyCo")

    win = MainWindow()
    win.show()

    # Qt installs its own signal handler that swallows SIGINT. Restore the
    # default so Ctrl-C exits during dev. Pump a no-op QTimer so the
    # interpreter actually services signals.
    signal.signal(signal.SIGINT, signal.SIG_DFL)
    pump = QTimer()
    pump.start(100)
    pump.timeout.connect(lambda: None)

    return app.exec()


if __name__ == "__main__":
    sys.exit(main())

# Decision rule:
#   Top-level window with menu/toolbar/status     -> QMainWindow.
#   Modal popup ("Are you sure?")                 -> QDialog (use exec() to make modal).
#   Nested panel inside a window                  -> QWidget (bare).
#   Need to share state across widgets            -> hold it on the parent QMainWindow.
#   PyQt6 vs PySide6                              -> PySide6 (LGPL, official Qt for Python).
#   PyQt5 / PySide2 still around?                 -> Qt5 EOL'd; migrate to Qt6.
#   exec_ vs exec                                 -> Qt6 dropped exec_; use exec().

# Anti-pattern:
#   QApplication() created twice in one process
# QApplication is a singleton; constructing two segfaults or behaves
# unpredictably. If you need it elsewhere, use QApplication.instance().
```

## Decision Rule

```text
Top-level window with menu/toolbar/status     -> QMainWindow.
Modal popup ("Are you sure?")                 -> QDialog (use exec() to make modal).
Nested panel inside a window                  -> QWidget (bare).
Need to share state across widgets            -> hold it on the parent QMainWindow.
PyQt6 vs PySide6                              -> PySide6 (LGPL, official Qt for Python).
PyQt5 / PySide2 still around?                 -> Qt5 EOL'd; migrate to Qt6.
exec_ vs exec                                 -> Qt6 dropped exec_; use exec().
```

## Anti-Pattern

> [!warning] Anti-pattern
>   QApplication() created twice in one process
> QApplication is a singleton; constructing two segfaults or behaves
> unpredictably. If you need it elsewhere, use QApplication.instance().

## Tips

- Construct `QApplication` BEFORE any widget — widgets need an existing app instance.
- `QMainWindow` for top-level windows; `QDialog` for modal popups (`dialog.exec()`); `QWidget` for nested panels.
- Use `app.setApplicationName()` and `app.setOrganizationName()` early — `QSettings` keys off them.
- Qt6 dropped the trailing-underscore form: use `app.exec()` and `dialog.exec()`, not `app.exec_()`.
- For Ctrl-C in dev, restore SIGINT default and pump a no-op QTimer — Qt swallows signals otherwise.

## Common Mistake

> [!warning] Creating two `QApplication` instances. Crashes or behaves bizarrely. Use `QApplication.instance()` to get the existing one.

## See Also

- [[Sections/gui-pyqt/basics/qt-pyqt-vs-pyside|PyQt6 vs PySide6 — pick one (and how to switch later) (PyQt / PySide)]]
- [[Sections/gui-pyqt/basics/_Index|PyQt / PySide → QApplication, QWidget, the event loop]]
- [[Sections/gui-pyqt/_Index|PyQt / PySide index]]
- [[_Index|Vault index]]
