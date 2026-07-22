---
type: "entry"
domain: "python"
file: "gui-pyqt"
section: "widgets"
id: "qt-input-widgets"
title: "QLineEdit / QComboBox / QSpinBox / QCheckBox — input widgets"
category: "widgets"
subtitle: "QLineEdit (textChanged, editingFinished, setPlaceholderText, setEchoMode for passwords), QComboBox (addItems, currentTextChanged, setEditable), QSpinBox / QDoubleSpinBox (setRange, valueChanged), QCheckBox / QRadioButton (toggled), QButtonGroup for radio mutual exclusion, QFormLayout"
signature_short: "le = QLineEdit(); le.textChanged.connect(slot); le.text() / le.setText(); QComboBox.addItems(list); QSpinBox.setRange(lo, hi)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "QLineEdit / QComboBox / QSpinBox / QCheckBox — input widgets"
  - "qt-input-widgets"
tags:
  - "python"
  - "python/gui-pyqt"
  - "python/gui-pyqt/widgets"
  - "category/widgets"
  - "tier/tiered"
---

# QLineEdit / QComboBox / QSpinBox / QCheckBox — input widgets

> QLineEdit (textChanged, editingFinished, setPlaceholderText, setEchoMode for passwords), QComboBox (addItems, currentTextChanged, setEditable), QSpinBox / QDoubleSpinBox (setRange, valueChanged), QCheckBox / QRadioButton (toggled), QButtonGroup for radio mutual exclusion, QFormLayout

## Overview

QLineEdit, QComboBox, QSpinBox, QCheckBox cover most form needs. Each emits change signals (`textChanged`/`currentTextChanged`/`valueChanged`/`toggled`) and provides setter pairs. QFormLayout is the right layout for forms — auto-aligns labels right and inputs left. Three depths solve the SAME task — a profile form with name + role + age + active checkbox emitting on every change — at depths: standalone widgets in a QVBoxLayout → QFormLayout with proper labels → class-based form with a single `dataChanged(dict)` signal aggregated from all child widgets.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Profile form: name, role, age, active. Print on any change.
- **Junior** — SAME — profile form — using QFormLayout (right tool).
- **Senior** — SAME — profile form — production: encapsulated form widget, single dataChanged(dict) signal, value()/setValue() pair, debounced.

## Signature

```python
le = QLineEdit(); le.textChanged.connect(slot); le.text() / le.setText(); QComboBox.addItems(list); QSpinBox.setRange(lo, hi)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Profile form: name, role, age, active. Print on any change.
# APPROACH  - Stack widgets in a QVBoxLayout; connect each signal individually.
# STRENGTHS - Direct.
# WEAKNESSES- Labels float separately; ugly alignment; lots of repetition.
import sys
from PySide6.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QLabel,
    QLineEdit, QComboBox, QSpinBox, QCheckBox,
)

app = QApplication(sys.argv)
w = QWidget(); w.setWindowTitle("profile")
layout = QVBoxLayout(w)

layout.addWidget(QLabel("Name"))
name = QLineEdit(); layout.addWidget(name)

layout.addWidget(QLabel("Role"))
role = QComboBox(); role.addItems(["dev", "design", "pm"]); layout.addWidget(role)

layout.addWidget(QLabel("Age"))
age = QSpinBox(); age.setRange(0, 120); layout.addWidget(age)

active = QCheckBox("active"); layout.addWidget(active)

def dump():
    print(name.text(), role.currentText(), age.value(), active.isChecked())

name.textChanged.connect(dump)
role.currentTextChanged.connect(dump)
age.valueChanged.connect(dump)
active.toggled.connect(dump)

w.show(); sys.exit(app.exec())
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — profile form — using QFormLayout (right tool).
# APPROACH  - QFormLayout auto-aligns labels with inputs.
# STRENGTHS - Idiomatic, neat alignment, less code.
# WEAKNESSES- Still procedural; one slot per widget.
import sys
from PySide6.QtWidgets import (
    QApplication, QWidget, QFormLayout,
    QLineEdit, QComboBox, QSpinBox, QCheckBox,
)

app = QApplication(sys.argv)
w = QWidget(); w.setWindowTitle("profile")

form = QFormLayout(w)
name   = QLineEdit(); name.setPlaceholderText("First Last")
role   = QComboBox(); role.addItems(["dev", "design", "pm"])
age    = QSpinBox(); age.setRange(0, 120); age.setSuffix(" yrs")
active = QCheckBox("active")

form.addRow("Name:",   name)
form.addRow("Role:",   role)
form.addRow("Age:",    age)
form.addRow("Status:", active)

def dump():
    print({
        "name":   name.text(),
        "role":   role.currentText(),
        "age":    age.value(),
        "active": active.isChecked(),
    })

name.textChanged.connect(dump)
role.currentTextChanged.connect(dump)
age.valueChanged.connect(dump)
active.toggled.connect(dump)

w.show(); sys.exit(app.exec())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — profile form — production: encapsulated form widget,
#             single dataChanged(dict) signal, value()/setValue() pair, debounced.
# APPROACH  - ProfileForm(QWidget) with one aggregated signal; QTimer debounce.
# STRENGTHS - Reusable form; one signal for parents to connect; debounced
#             so fast typing doesn't spam consumers.
# WEAKNESSES- More setup; debouncing adds a tiny latency.
from __future__ import annotations
import sys
from PySide6.QtCore import QTimer, Signal, Slot
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QFormLayout,
    QLineEdit, QComboBox, QSpinBox, QCheckBox, QVBoxLayout,
)


class ProfileForm(QWidget):
    """Reusable form widget with a single aggregated signal."""
    dataChanged = Signal(dict)

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        layout = QFormLayout(self)

        self.name = QLineEdit(); self.name.setPlaceholderText("First Last")
        self.role = QComboBox(); self.role.addItems(["dev", "design", "pm"])
        self.age  = QSpinBox(); self.age.setRange(0, 120); self.age.setSuffix(" yrs")
        self.active = QCheckBox("active")

        layout.addRow("Name:",   self.name)
        layout.addRow("Role:",   self.role)
        layout.addRow("Age:",    self.age)
        layout.addRow("Status:", self.active)

        # Debounce: collapse rapid changes into one emit per 200ms.
        self._debounce = QTimer(self)
        self._debounce.setSingleShot(True)
        self._debounce.setInterval(200)
        self._debounce.timeout.connect(self._emit_changed)

        for sig in (
            self.name.textChanged,
            self.role.currentTextChanged,
            self.age.valueChanged,
            self.active.toggled,
        ):
            sig.connect(self._debounce.start)

    def value(self) -> dict:
        return {
            "name":   self.name.text(),
            "role":   self.role.currentText(),
            "age":    self.age.value(),
            "active": self.active.isChecked(),
        }

    def setValue(self, data: dict) -> None:
        # Block signals so we don't fire dataChanged during programmatic loads.
        with _block_signals(self.name, self.role, self.age, self.active):
            self.name.setText(data.get("name", ""))
            idx = self.role.findText(data.get("role", ""))
            if idx >= 0: self.role.setCurrentIndex(idx)
            self.age.setValue(int(data.get("age", 0)))
            self.active.setChecked(bool(data.get("active", False)))

    @Slot()
    def _emit_changed(self) -> None:
        self.dataChanged.emit(self.value())


from contextlib import contextmanager
@contextmanager
def _block_signals(*widgets):
    prev = [w.blockSignals(True) for w in widgets]
    try:    yield
    finally:
        for w, p in zip(widgets, prev):
            w.blockSignals(p)


class MainWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        central = QWidget(); self.setCentralWidget(central)
        layout = QVBoxLayout(central)

        self.form = ProfileForm()
        layout.addWidget(self.form)

        # Single connection for the whole form.
        self.form.dataChanged.connect(lambda d: self.statusBar().showMessage(str(d), 5000))


if __name__ == "__main__":
    app = QApplication(sys.argv)
    w = MainWindow(); w.show()
    sys.exit(app.exec())

# Decision rule:
#   Free-text input                                  -> QLineEdit (+ setPlaceholderText).
#   Bounded integer                                  -> QSpinBox (+ setRange).
#   Float / decimal                                  -> QDoubleSpinBox.
#   Pick from fixed list                             -> QComboBox (+ addItems).
#   Pick + free text                                 -> QComboBox(setEditable=True).
#   Multi-line text                                  -> QPlainTextEdit (or QTextEdit for rich).
#   Boolean toggle                                   -> QCheckBox.
#   Mutually-exclusive options                       -> QRadioButton + QButtonGroup.
#   Any form layout                                  -> QFormLayout.addRow(label, input).
#   Want to react only after user finishes typing    -> QLineEdit.editingFinished
#                                                       (NOT textChanged).
#   Want to programmatically set without emitting    -> blockSignals(True) around the call.

# Anti-pattern:
#   le.textChanged.connect(expensive_computation)
# Fires on every keystroke. For typed input use editingFinished, or
# debounce with a QTimer (above).
```

## Decision Rule

```text
Free-text input                                  -> QLineEdit (+ setPlaceholderText).
Bounded integer                                  -> QSpinBox (+ setRange).
Float / decimal                                  -> QDoubleSpinBox.
Pick from fixed list                             -> QComboBox (+ addItems).
Pick + free text                                 -> QComboBox(setEditable=True).
Multi-line text                                  -> QPlainTextEdit (or QTextEdit for rich).
Boolean toggle                                   -> QCheckBox.
Mutually-exclusive options                       -> QRadioButton + QButtonGroup.
Any form layout                                  -> QFormLayout.addRow(label, input).
Want to react only after user finishes typing    -> QLineEdit.editingFinished
                                                    (NOT textChanged).
Want to programmatically set without emitting    -> blockSignals(True) around the call.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   le.textChanged.connect(expensive_computation)
> Fires on every keystroke. For typed input use editingFinished, or
> debounce with a QTimer (above).

## Tips

- `QFormLayout.addRow(label, widget)` is the right way to lay out forms — auto-aligned, idiomatic.
- `textChanged` fires every keystroke; `editingFinished` fires once on focus-out / Enter — pick by use case.
- Use `blockSignals(True)` around programmatic `setValue` calls to avoid firing change signals you didn't mean to.
- Debounce noisy signals with a `QTimer.singleShot`-style or a single QTimer connected to the signal's `.start()`.
- `QComboBox.findText(s)` returns -1 if missing — guard before `setCurrentIndex`.

## Common Mistake

> [!warning] Connecting `textChanged` to expensive logic — fires on every keystroke. Switch to `editingFinished` or debounce with a QTimer.

## See Also

- [[Sections/gui-pyqt/widgets/qt-listview-tableview|QListView / QTableView — model/view for data (PyQt / PySide)]]
- [[Sections/gui-pyqt/widgets/_Index|PyQt / PySide → Widgets, models, views]]
- [[Sections/gui-pyqt/_Index|PyQt / PySide index]]
- [[_Index|Vault index]]
