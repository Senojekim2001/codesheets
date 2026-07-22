---
type: "entry"
domain: "python"
file: "gui-pyqt"
section: "signals-slots"
id: "qt-signals-slots"
title: "Signal / Slot — Qt's callback system"
category: "signals-slots"
subtitle: "Signal(int, str) (typed args), @Slot decorator (perf hint, optional), signal.connect / disconnect, multiple slots per signal, signal.emit, Qt.ConnectionType (Direct / Queued / Auto), custom signals on subclasses, lambda slot pitfalls (closure vs late binding)"
signature_short: "class W(QObject):\\n    changed = Signal(int)\\n    @Slot(int)\\n    def on_changed(self, n): ...\\nw.changed.connect(w.on_changed); w.changed.emit(7)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Signal / Slot — Qt's callback system"
  - "qt-signals-slots"
tags:
  - "python"
  - "python/gui-pyqt"
  - "python/gui-pyqt/signals-slots"
  - "category/signals-slots"
  - "tier/tiered"
---

# Signal / Slot — Qt's callback system

> Signal(int, str) (typed args), @Slot decorator (perf hint, optional), signal.connect / disconnect, multiple slots per signal, signal.emit, Qt.ConnectionType (Direct / Queued / Auto), custom signals on subclasses, lambda slot pitfalls (closure vs late binding)

## Overview

Signals decouple emitter from receiver. The same signal can drive any number of slots; cross-thread connections are queued through Qt's event loop (this is what makes worker → GUI safe — signals from a `QThread` are auto-marshaled to the main thread). Three depths solve the SAME task — a counter widget that emits on change and updates two listeners — at depths: built-in `clicked` signal only → custom `Signal(int)` declared on a class with two listeners → typed slots with `@Slot(int)`, explicit connection types, and disconnect on teardown.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Button click increments a counter; a label shows the value.
- **Junior** — SAME — clicking +1 updates a label — plus emit a custom signal with the new value; print to stdout from a second listener.
- **Senior** — SAME — counter with custom signal — production: typed slots, explicit connection types, disconnect on teardown, late-bind lambda fix in loops.

## Signature

```python
class W(QObject):\n    changed = Signal(int)\n    @Slot(int)\n    def on_changed(self, n): ...\nw.changed.connect(w.on_changed); w.changed.emit(7)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Button click increments a counter; a label shows the value.
# APPROACH  - Use the built-in clicked signal; lambda slot.
# STRENGTHS - One connect; demonstrates signal/slot.
# WEAKNESSES- All state in module scope; no custom signal.
import sys
from PySide6.QtWidgets import QApplication, QWidget, QPushButton, QLabel, QVBoxLayout

app = QApplication(sys.argv)

w = QWidget(); layout = QVBoxLayout(w)
label = QLabel("0"); layout.addWidget(label)
btn = QPushButton("+1"); layout.addWidget(btn)

state = {"n": 0}
def on_click():
    state["n"] += 1
    label.setText(str(state["n"]))

btn.clicked.connect(on_click)                         # signal -> callable
w.show(); sys.exit(app.exec())
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — clicking +1 updates a label — plus emit a custom signal
#             with the new value; print to stdout from a second listener.
# APPROACH  - Subclass QObject; declare Signal(int); emit + multi-connect.
# STRENGTHS - Custom signal carries typed payload; multiple slots fire.
# WEAKNESSES- No @Slot decorator (still works, just slightly slower).
import sys
from PySide6.QtCore import QObject, Signal
from PySide6.QtWidgets import QApplication, QWidget, QPushButton, QLabel, QVBoxLayout


class Counter(QObject):
    changed = Signal(int)                             # typed signal

    def __init__(self) -> None:
        super().__init__()
        self.n = 0

    def inc(self) -> None:
        self.n += 1
        self.changed.emit(self.n)                     # fires every connected slot


app = QApplication(sys.argv)
counter = Counter()

w = QWidget(); layout = QVBoxLayout(w)
label = QLabel("0"); layout.addWidget(label)
btn = QPushButton("+1"); layout.addWidget(btn)

# Two listeners on the same signal:
counter.changed.connect(lambda n: label.setText(str(n)))
counter.changed.connect(lambda n: print(f"counter -> {n}"))

btn.clicked.connect(counter.inc)                      # button -> counter
w.show(); sys.exit(app.exec())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — counter with custom signal — production: typed slots,
#             explicit connection types, disconnect on teardown, late-bind
#             lambda fix in loops.
# APPROACH  - @Slot(int), Qt.QueuedConnection where appropriate, default-arg
#             trick for loop captures, deleteLater on close.
# STRENGTHS - Robust across threads; testable; no closure bugs.
# WEAKNESSES- More ceremony; threading-mode choices are nuanced.
from __future__ import annotations
import sys
from PySide6.QtCore import QObject, Signal, Slot, Qt
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget,
    QPushButton, QLabel, QVBoxLayout,
)


class Counter(QObject):
    changed = Signal(int)
    reset_done = Signal()

    def __init__(self) -> None:
        super().__init__()
        self._n = 0

    @property
    def value(self) -> int:
        return self._n

    @Slot()
    def inc(self) -> None:
        self._n += 1
        self.changed.emit(self._n)

    @Slot()
    def reset(self) -> None:
        self._n = 0
        self.changed.emit(self._n)
        self.reset_done.emit()


class MainWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("signals/slots")

        self.counter = Counter()

        central = QWidget(); self.setCentralWidget(central)
        layout = QVBoxLayout(central)
        self.label = QLabel("0"); layout.addWidget(self.label)

        # Loop-captured connections need default-arg trick or
        # functools.partial - lambdas with free vars use late binding.
        for amount in (1, 5, 10):
            b = QPushButton(f"+{amount}")
            b.clicked.connect(lambda _checked=False, a=amount: self._add(a))
            layout.addWidget(b)

        reset_btn = QPushButton("reset")
        reset_btn.clicked.connect(self.counter.reset)
        layout.addWidget(reset_btn)

        # @Slot(int) decorated slots are slightly faster + better introspectable.
        self.counter.changed.connect(self._on_changed, Qt.AutoConnection)
        self.counter.reset_done.connect(self._on_reset)

    def _add(self, amount: int) -> None:
        for _ in range(amount):
            self.counter.inc()

    @Slot(int)
    def _on_changed(self, n: int) -> None:
        self.label.setText(str(n))

    @Slot()
    def _on_reset(self) -> None:
        self.statusBar().showMessage("reset", 1500)

    def closeEvent(self, event) -> None:
        # Disconnect when window goes away to break ref cycles.
        try:    self.counter.changed.disconnect()
        except RuntimeError: pass
        event.accept()


def main() -> int:
    app = QApplication(sys.argv)
    win = MainWindow(); win.show()
    return app.exec()


if __name__ == "__main__":
    sys.exit(main())

# Decision rule:
#   Same-thread, immediate dispatch        -> default Qt.AutoConnection.
#   Cross-thread (worker -> GUI)           -> Qt.QueuedConnection (Auto picks this).
#   Slot must run before emit returns      -> Qt.DirectConnection (DANGEROUS across threads).
#   Many emits, one final UI update        -> use a QTimer/singleShot to coalesce.
#   Loop-captured connection (for x in ...) -> lambda _checked=False, x=x: ...
#   Want compile-time signature check      -> @Slot(types...) decorator.

# Anti-pattern:
#   for x in items:
#       btn.clicked.connect(lambda: handle(x))   # x captured BY REFERENCE
# All connections see the LAST x. Use default args:
#       btn.clicked.connect(lambda _checked=False, x=x: handle(x))
# (Note: clicked emits a bool; absorb it with _checked= default.)
```

## Decision Rule

```text
Same-thread, immediate dispatch        -> default Qt.AutoConnection.
Cross-thread (worker -> GUI)           -> Qt.QueuedConnection (Auto picks this).
Slot must run before emit returns      -> Qt.DirectConnection (DANGEROUS across threads).
Many emits, one final UI update        -> use a QTimer/singleShot to coalesce.
Loop-captured connection (for x in ...) -> lambda _checked=False, x=x: ...
Want compile-time signature check      -> @Slot(types...) decorator.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   for x in items:
>       btn.clicked.connect(lambda: handle(x))   # x captured BY REFERENCE
> All connections see the LAST x. Use default args:
>       btn.clicked.connect(lambda _checked=False, x=x: handle(x))
> (Note: clicked emits a bool; absorb it with _checked= default.)

## Tips

- Declare custom signals as class attributes: `changed = Signal(int)`. They become bound on instances.
- A signal can have multiple slots; they fire in connect-order each emit.
- `Qt.AutoConnection` (default) picks Direct same-thread or Queued cross-thread automatically — it's the right choice 95% of the time.
- `@Slot(types)` decorator gives perf and introspection benefits; not strictly required but idiomatic.
- Late-binding closures bite Qt connect calls in loops — use `lambda _checked=False, x=x: ...` to freeze the value.

## Common Mistake

> [!warning] Connecting a lambda capturing a loop variable: every slot sees the LAST iteration's value. Use default-arg binding to freeze each iteration's value.

## See Also

- [[Sections/gui-pyqt/signals-slots/qt-qthread-worker|QThread + worker QObject — long-running tasks without freezing the UI (PyQt / PySide)]]
- [[Sections/gui-pyqt/signals-slots/_Index|PyQt / PySide → Signals, slots, threading]]
- [[Sections/gui-pyqt/_Index|PyQt / PySide index]]
- [[_Index|Vault index]]
