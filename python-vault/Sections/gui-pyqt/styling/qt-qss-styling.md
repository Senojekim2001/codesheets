---
type: "entry"
domain: "python"
file: "gui-pyqt"
section: "styling"
id: "qt-qss-styling"
title: "Qt Style Sheets (QSS) — CSS-like styling"
category: "styling"
subtitle: "widget.setStyleSheet vs app.setStyleSheet, selectors (QPushButton, QPushButton#myId, .className), pseudo-states (:hover, :pressed, :checked, :disabled), property-based selectors ([flat=\"true\"]), QPalette for non-QSS theming, dynamic property + style().polish() for live restyle"
signature_short: "app.setStyleSheet(qss); widget.setProperty(\"variant\", \"primary\"); widget.style().polish(widget)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Qt Style Sheets (QSS) — CSS-like styling"
  - "qt-qss-styling"
tags:
  - "python"
  - "python/gui-pyqt"
  - "python/gui-pyqt/styling"
  - "category/styling"
  - "tier/tiered"
---

# Qt Style Sheets (QSS) — CSS-like styling

> widget.setStyleSheet vs app.setStyleSheet, selectors (QPushButton, QPushButton#myId, .className), pseudo-states (:hover, :pressed, :checked, :disabled), property-based selectors ([flat="true"]), QPalette for non-QSS theming, dynamic property + style().polish() for live restyle

## Overview

QSS lets you style widgets like a webpage. Selectors target classes, object names, properties, and pseudo-states. Apply globally on the app for consistent theming, or per-widget for one-offs. For dynamic theming (toggling dark mode), set a QSS string on the app or use `setProperty(...)` + `style().polish()`. Three depths solve the SAME task — a button that looks "primary" with a hover/pressed state — at depths: per-widget setStyleSheet → app-wide QSS with object-name selector → property-based variants ("primary" / "danger") with `style().polish()` to repaint when the property changes.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — A button styled blue with a darker hover.
- **Junior** — SAME — primary-styled button with hover/pressed — applied app-wide so any QPushButton with objectName="primary" inherits.
- **Senior** — SAME — variant-styled buttons — production: dynamic property selector ("primary" / "danger" / "ghost"), live theme switch between light/dark via app-wide QSS swap.

## Signature

```python
app.setStyleSheet(qss); widget.setProperty("variant", "primary"); widget.style().polish(widget)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - A button styled blue with a darker hover.
# APPROACH  - widget.setStyleSheet on a single QPushButton.
# STRENGTHS - Two lines.
# WEAKNESSES- Style only applies to that button; not reusable.
import sys
from PySide6.QtWidgets import QApplication, QPushButton

app = QApplication(sys.argv)
btn = QPushButton("Click me")
btn.setStyleSheet("""
    QPushButton {
        background: #2563eb;
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: bold;
    }
    QPushButton:hover { background: #1d4ed8; }
    QPushButton:pressed { background: #1e40af; }
""")
btn.show(); sys.exit(app.exec())
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — primary-styled button with hover/pressed — applied
#             app-wide so any QPushButton with objectName="primary" inherits.
# APPROACH  - app.setStyleSheet with object-name selector.
# STRENGTHS - Reusable; mark any button as primary just by name.
# WEAKNESSES- Object names are fragile; collisions across the app.
import sys
from PySide6.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QPushButton,
)

QSS = """
QPushButton {
    padding: 8px 16px;
    border-radius: 6px;
    border: 1px solid #d1d5db;
    background: white;
    color: #111;
}
QPushButton:hover { border-color: #9ca3af; }
QPushButton#primary {
    background: #2563eb;
    color: white;
    border: none;
    font-weight: bold;
}
QPushButton#primary:hover  { background: #1d4ed8; }
QPushButton#primary:pressed { background: #1e40af; }
QPushButton:disabled { opacity: 0.5; color: #9ca3af; background: #f3f4f6; }
"""

app = QApplication(sys.argv)
app.setStyleSheet(QSS)

w = QWidget(); layout = QVBoxLayout(w)

primary = QPushButton("Save"); primary.setObjectName("primary")
secondary = QPushButton("Cancel")
disabled = QPushButton("Locked"); disabled.setEnabled(False)

for b in (primary, secondary, disabled):
    layout.addWidget(b)

w.show(); sys.exit(app.exec())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — variant-styled buttons — production: dynamic property
#             selector ("primary" / "danger" / "ghost"), live theme switch
#             between light/dark via app-wide QSS swap.
# APPROACH  - QPushButton.setProperty("variant", "primary") + style().polish()
#             to repaint; theme dict mapped to QSS at runtime.
# STRENGTHS - Variants are data, not magic strings; live theme toggle.
# WEAKNESSES- Need to remember polish() after property changes;
#             nested QSS strings get long.
from __future__ import annotations
import sys
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QPushButton, QHBoxLayout,
)


def make_qss(theme: str = "light") -> str:
    if theme == "dark":
        bg, fg, surface, border = "#0f172a", "#e5e7eb", "#1e293b", "#334155"
    else:
        bg, fg, surface, border = "#ffffff", "#111827", "#ffffff", "#d1d5db"

    return f"""
        QMainWindow, QWidget {{
            background: {bg};
            color: {fg};
        }}
        QPushButton {{
            padding: 8px 16px;
            border-radius: 6px;
            border: 1px solid {border};
            background: {surface};
            color: {fg};
        }}
        QPushButton:hover {{ border-color: #9ca3af; }}
        QPushButton:disabled {{ opacity: 0.5; }}

        QPushButton[variant="primary"] {{
            background: #2563eb; color: white; border: none; font-weight: bold;
        }}
        QPushButton[variant="primary"]:hover  {{ background: #1d4ed8; }}
        QPushButton[variant="primary"]:pressed {{ background: #1e40af; }}

        QPushButton[variant="danger"] {{
            background: #dc2626; color: white; border: none;
        }}
        QPushButton[variant="danger"]:hover {{ background: #b91c1c; }}

        QPushButton[variant="ghost"] {{
            background: transparent; border: 1px dashed {border}; color: {fg};
        }}
    """


class MainWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("QSS variants")
        self.resize(420, 200)
        self._theme = "light"

        central = QWidget(); self.setCentralWidget(central)
        layout = QVBoxLayout(central)

        row = QHBoxLayout(); layout.addLayout(row)

        for variant, text in [("primary", "Save"), ("danger", "Delete"), ("ghost", "Help")]:
            b = QPushButton(text)
            b.setProperty("variant", variant)         # CSS attribute selector hook
            row.addWidget(b)

        plain = QPushButton("Plain (no variant)")
        layout.addWidget(plain)

        toggle = QPushButton("Toggle dark mode")
        toggle.clicked.connect(self._toggle_theme)
        layout.addWidget(toggle)

        QApplication.instance().setStyleSheet(make_qss(self._theme))

    def _toggle_theme(self) -> None:
        self._theme = "dark" if self._theme == "light" else "light"
        QApplication.instance().setStyleSheet(make_qss(self._theme))
        # NOTE: changing the app stylesheet repolishes everything automatically.
        # If you change setProperty after a widget is shown, you must call
        # widget.style().unpolish(widget); widget.style().polish(widget)
        # to make the new property selector take effect.


if __name__ == "__main__":
    app = QApplication(sys.argv)
    w = MainWindow(); w.show()
    sys.exit(app.exec())

# Decision rule:
#   One-off styling                       -> widget.setStyleSheet (local).
#   App-wide theme                        -> app.setStyleSheet at startup.
#   Per-widget variants                   -> setProperty("kind", "...") + [kind="..."] selector.
#   After changing a property at runtime  -> widget.style().unpolish/polish(widget).
#   Need true OS-native look              -> use QPalette + style().setStyle("Fusion") -
#                                            QSS overrides native rendering.
#   Need icons + colors theme             -> QSS for color, qrc resource bundle for icons.
#   Need theming on QML                   -> not QSS; QML has its own styling system.

# Anti-pattern:
#   widget.setProperty("kind", "danger")
#   # ...later...
#   # selectors don't update; widget still looks default
# After changing a property used by a stylesheet selector, repolish:
#   widget.style().unpolish(widget); widget.style().polish(widget)
```

## Decision Rule

```text
One-off styling                       -> widget.setStyleSheet (local).
App-wide theme                        -> app.setStyleSheet at startup.
Per-widget variants                   -> setProperty("kind", "...") + [kind="..."] selector.
After changing a property at runtime  -> widget.style().unpolish/polish(widget).
Need true OS-native look              -> use QPalette + style().setStyle("Fusion") -
                                         QSS overrides native rendering.
Need icons + colors theme             -> QSS for color, qrc resource bundle for icons.
Need theming on QML                   -> not QSS; QML has its own styling system.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   widget.setProperty("kind", "danger")
>   # ...later...
>   # selectors don't update; widget still looks default
> After changing a property used by a stylesheet selector, repolish:
>   widget.style().unpolish(widget); widget.style().polish(widget)

## Tips

- QSS supports `:hover`, `:pressed`, `:checked`, `:disabled`, `:focus` pseudo-states — same as CSS.
- Use `setObjectName("foo")` then `QPushButton#foo` for unique selectors; `setProperty("kind", "x")` then `QPushButton[kind="x"]` for variants.
- After changing a property used in a selector, call `widget.style().unpolish(widget); widget.style().polish(widget)` to re-evaluate.
- For palette-level theming (text/background colors that respect platform), use `QPalette` instead of QSS.
- `app.setStyle("Fusion")` gives a consistent cross-platform look; combine with QSS for theming.

## Common Mistake

> [!warning] Changing a widget property at runtime and forgetting to call `style().polish()` — the QSS selector doesn't re-evaluate and the widget keeps the old look.

## See Also

- [[Sections/gui-pyqt/styling/qt-threadpool-runnable|QThreadPool / QRunnable — fire-and-forget tasks (PyQt / PySide)]]
- [[Sections/gui-pyqt/styling/_Index|PyQt / PySide → Styling, dialogs, and threadpools]]
- [[Sections/gui-pyqt/_Index|PyQt / PySide index]]
- [[_Index|Vault index]]
